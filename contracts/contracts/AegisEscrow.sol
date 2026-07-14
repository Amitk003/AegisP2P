// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IReclaim {
    struct ClaimInfo {
        string provider;
        string parameters;
        string context;
    }

    struct Claim {
        bytes32 identifier;
        address owner;
        uint32 timestampS;
        uint32 epoch;
    }

    struct SignedClaim {
        Claim claim;
        bytes[] signatures;
    }

    struct Proof {
        ClaimInfo claimInfo;
        SignedClaim signedClaim;
    }

    function verifyProof(Proof calldata proof) external view;
}

contract AegisEscrow is ReentrancyGuard, Pausable, Ownable2Step {
    using Strings for uint256;
    using Strings for address;

    enum EscrowState {
        Funded,
        AwaitingProof,
        Verified,
        Refunded
    }

    struct Escrow {
        address seller;
        address buyer;
        uint256 amount;
        string fiatAmount;
        string recipient;
        string refId;
        string paymentRef;
        EscrowState state;
        uint256 createdAt;
        uint256 paidAt;
        bool exists;
    }

    uint256 public nextEscrowId;
    address public reclaimVerifier;
    mapping(uint256 => Escrow) public escrows;
    mapping(bytes32 => bool) public usedClaims;

    event EscrowFunded(
        uint256 indexed escrowId,
        address indexed seller,
        address indexed buyer,
        uint256 amount,
        string fiatAmount,
        string recipient,
        string refId,
        string paymentRef
    );
    event PaymentMarked(uint256 indexed escrowId, address indexed buyer);
    event FiatVerified(uint256 indexed escrowId, address indexed buyer);
    event EscrowRefunded(uint256 indexed escrowId);
    event ReclaimVerifierUpdated(address indexed verifier);

    constructor() Ownable(msg.sender) {}

    function setReclaimVerifier(address _reclaimVerifier) external onlyOwner {
        require(_reclaimVerifier != address(0), "Invalid verifier address");
        reclaimVerifier = _reclaimVerifier;
        emit ReclaimVerifierUpdated(_reclaimVerifier);
    }

    function createEscrow(
        address buyer,
        string calldata fiatAmount,
        string calldata recipient,
        string calldata refId
    ) external payable whenNotPaused {
        require(buyer != address(0), "Buyer cannot be zero address");
        require(msg.value > 0, "Must lock some crypto");

        uint256 escrowId = nextEscrowId++;
        string memory paymentRef = string(abi.encodePacked("aegis-", escrowId.toString()));

        escrows[escrowId] = Escrow({
            seller: msg.sender,
            buyer: buyer,
            amount: msg.value,
            fiatAmount: fiatAmount,
            recipient: recipient,
            refId: refId,
            paymentRef: paymentRef,
            state: EscrowState.Funded,
            createdAt: block.timestamp,
            paidAt: 0,
            exists: true
        });

        emit EscrowFunded(
            escrowId,
            msg.sender,
            buyer,
            msg.value,
            fiatAmount,
            recipient,
            refId,
            paymentRef
        );
    }

    function markAsPaid(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.exists, "Escrow does not exist");
        require(msg.sender == escrow.buyer, "Only buyer can mark as paid");
        require(escrow.state == EscrowState.Funded, "Invalid escrow state");

        escrow.state = EscrowState.AwaitingProof;
        escrow.paidAt = block.timestamp;

        emit PaymentMarked(escrowId, msg.sender);
    }

    function verifyFiatAndRelease(
        uint256 escrowId,
        bytes calldata proof
    ) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.exists, "Escrow does not exist");
        require(escrow.state == EscrowState.AwaitingProof, "Escrow not awaiting proof");

        IReclaim.Proof memory reclaimProof = abi.decode(proof, (IReclaim.Proof));
        bytes32 claimIdentifier = reclaimProof.signedClaim.claim.identifier;

        // 1. Check usedClaims
        require(!usedClaims[claimIdentifier], "Proof already used");

        // 2. Check context hash
        string memory expectedContext = string(
            abi.encodePacked(
                escrowId.toString(),
                ":",
                address(this).toHexString()
            )
        );
        require(
            keccak256(abi.encodePacked(reclaimProof.claimInfo.context)) == keccak256(abi.encodePacked(expectedContext)),
            "Invalid context"
        );

        // 3. Construct expected JSON string from stored escrow fields
        string memory expectedJson = string(
            abi.encodePacked(
                '{"amount":"',
                escrow.fiatAmount,
                '","recipient":"',
                escrow.recipient,
                '","reference":"',
                escrow.refId,
                '","memo":"',
                escrow.paymentRef,
                '"}'
            )
        );

        // 4. Check expectedJson hash matches claimInfo.parameters hash
        require(
            keccak256(abi.encodePacked(reclaimProof.claimInfo.parameters)) == keccak256(abi.encodePacked(expectedJson)),
            "Invalid parameters"
        );

        // 5. Mark usedClaims
        usedClaims[claimIdentifier] = true;

        // 6. MIP-4 reserve balance check
        (bool success, bytes memory data) = address(0x1001).staticcall(
            abi.encodeWithSelector(0x3a61584e)
        );
        if (success && data.length >= 32) {
            bool dipped = abi.decode(data, (bool));
            require(!dipped, "Transaction dipped into gas reserve");
        }

        // 7. Reclaim SDK proof verification
        if (reclaimVerifier != address(0)) {
            IReclaim(reclaimVerifier).verifyProof(reclaimProof);
        }

        // 8. Release funds
        escrow.state = EscrowState.Verified;
        address buyer = escrow.buyer;
        uint256 amount = escrow.amount;

        emit FiatVerified(escrowId, buyer);

        (bool sent, ) = payable(buyer).call{value: amount}("");
        require(sent, "Failed to send MON");
    }

    function refund(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.exists, "Escrow does not exist");
        require(msg.sender == escrow.seller, "Only seller can refund");

        if (escrow.state == EscrowState.Funded) {
            require(block.timestamp >= escrow.createdAt + 2 hours, "Refund timeout not met");
        } else if (escrow.state == EscrowState.AwaitingProof) {
            require(block.timestamp >= escrow.paidAt + 2 hours, "Refund timeout not met");
        } else {
            revert("Invalid state for refund");
        }

        escrow.state = EscrowState.Refunded;
        uint256 amount = escrow.amount;

        emit EscrowRefunded(escrowId);

        (bool sent, ) = payable(escrow.seller).call{value: amount}("");
        require(sent, "Failed to send MON");
    }

    function pauseNewEscrows() external onlyOwner {
        _pause();
    }

    function unpauseNewEscrows() external onlyOwner {
        _unpause();
    }
}
