// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

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

    constructor() Ownable(msg.sender) {}

    function createEscrow(
        address buyer,
        string calldata fiatAmount,
        string calldata recipient,
        string calldata refId
    ) external payable whenNotPaused {
        // TODO: implement in escrow-logic branch
    }

    function markAsPaid(uint256 escrowId) external {
        // TODO: implement in escrow-logic branch
    }

    function verifyFiatAndRelease(
        uint256 escrowId,
        bytes calldata proof
    ) external nonReentrant {
        // TODO: implement in escrow-logic branch
        // Steps:
        // 1. Check usedClaims
        // 2. Check context hash
        // 3. Build expected JSON, check parameters hash
        // 4. MIP-4 reserve balance check
        // 5. Reclaim SDK proof verification
        // 6. Release funds
    }

    function refund(uint256 escrowId) external nonReentrant {
        // TODO: implement in escrow-logic branch
    }

    function pauseNewEscrows() external onlyOwner {
        _pause();
    }

    function unpauseNewEscrows() external onlyOwner {
        _unpause();
    }
}
