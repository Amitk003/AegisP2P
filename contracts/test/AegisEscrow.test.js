const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AegisEscrow", function () {
  let AegisEscrow;
  let escrowContract;
  let MockReclaim;
  let mockReclaimContract;
  let owner;
  let seller;
  let buyer;
  let nonParticipant;

  const fiatAmount = "100.00";
  const recipient = "stripe-seller-acct";
  const refId = "stripe-payment-ref-987";
  const amountToLock = ethers.parseEther("1.0"); // 1 MON/ETH

  beforeEach(async function () {
    [owner, seller, buyer, nonParticipant] = await ethers.getSigners();

    // Deploy MockReclaim
    MockReclaim = await ethers.getContractFactory("MockReclaim");
    mockReclaimContract = await MockReclaim.deploy();
    await mockReclaimContract.waitForDeployment();

    // Deploy AegisEscrow
    AegisEscrow = await ethers.getContractFactory("AegisEscrow");
    escrowContract = await AegisEscrow.deploy();
    await escrowContract.waitForDeployment();

    // Set MockReclaim address in AegisEscrow
    await escrowContract.connect(owner).setReclaimVerifier(await mockReclaimContract.getAddress());
  });

  describe("Deployment & Configuration", function () {
    it("Should set the correct owner", async function () {
      expect(await escrowContract.owner()).to.equal(owner.address);
    });

    it("Should set the correct Reclaim verifier address", async function () {
      const verifierAddr = await mockReclaimContract.getAddress();
      expect(await escrowContract.reclaimVerifier()).to.equal(verifierAddr);
    });

    it("Should allow owner to update Reclaim verifier address", async function () {
      await expect(escrowContract.connect(owner).setReclaimVerifier(nonParticipant.address))
        .to.emit(escrowContract, "ReclaimVerifierUpdated")
        .withArgs(nonParticipant.address);
      expect(await escrowContract.reclaimVerifier()).to.equal(nonParticipant.address);
    });

    it("Should not allow non-owner to update Reclaim verifier address", async function () {
      await expect(
        escrowContract.connect(seller).setReclaimVerifier(nonParticipant.address)
      ).to.be.revertedWithCustomError(escrowContract, "OwnableUnauthorizedAccount");
    });
  });

  describe("Escrow Creation", function () {
    it("Should create and fund escrow in one payable transaction", async function () {
      const tx = await escrowContract.connect(seller).createEscrow(
        buyer.address,
        fiatAmount,
        recipient,
        refId,
        { value: amountToLock }
      );

      const escrowId = 0;
      const expectedPaymentRef = `aegis-${escrowId}`;

      await expect(tx)
        .to.emit(escrowContract, "EscrowFunded")
        .withArgs(
          escrowId,
          seller.address,
          buyer.address,
          amountToLock,
          fiatAmount,
          recipient,
          refId,
          expectedPaymentRef
        );

      const escrow = await escrowContract.escrows(escrowId);
      expect(escrow.seller).to.equal(seller.address);
      expect(escrow.buyer).to.equal(buyer.address);
      expect(escrow.amount).to.equal(amountToLock);
      expect(escrow.fiatAmount).to.equal(fiatAmount);
      expect(escrow.recipient).to.equal(recipient);
      expect(escrow.refId).to.equal(refId);
      expect(escrow.paymentRef).to.equal(expectedPaymentRef);
      expect(escrow.state).to.equal(0); // EscrowState.Funded
      expect(escrow.exists).to.be.true;
    });

    it("Should revert if buyer is zero address", async function () {
      await expect(
        escrowContract.connect(seller).createEscrow(
          ethers.ZeroAddress,
          fiatAmount,
          recipient,
          refId,
          { value: amountToLock }
        )
      ).to.be.revertedWith("Buyer cannot be zero address");
    });

    it("Should revert if amount locked is 0", async function () {
      await expect(
        escrowContract.connect(seller).createEscrow(
          buyer.address,
          fiatAmount,
          recipient,
          refId,
          { value: 0 }
        )
      ).to.be.revertedWith("Must lock some crypto");
    });

    it("Should not allow escrow creation when contract is paused", async function () {
      await escrowContract.connect(owner).pauseNewEscrows();
      await expect(
        escrowContract.connect(seller).createEscrow(
          buyer.address,
          fiatAmount,
          recipient,
          refId,
          { value: amountToLock }
        )
      ).to.be.revertedWithCustomError(escrowContract, "EnforcedPause");
    });
  });

  describe("Mark As Paid", function () {
    let escrowId = 0;

    beforeEach(async function () {
      await escrowContract.connect(seller).createEscrow(
        buyer.address,
        fiatAmount,
        recipient,
        refId,
        { value: amountToLock }
      );
    });

    it("Should allow buyer to mark escrow as paid", async function () {
      const tx = await escrowContract.connect(buyer).markAsPaid(escrowId);

      await expect(tx)
        .to.emit(escrowContract, "PaymentMarked")
        .withArgs(escrowId, buyer.address);

      const escrow = await escrowContract.escrows(escrowId);
      expect(escrow.state).to.equal(1); // EscrowState.AwaitingProof
      expect(escrow.paidAt).to.be.gt(0);
    });

    it("Should revert if non-buyer tries to mark as paid", async function () {
      await expect(
        escrowContract.connect(seller).markAsPaid(escrowId)
      ).to.be.revertedWith("Only buyer can mark as paid");
    });

    it("Should revert if escrow is not in Funded state", async function () {
      await escrowContract.connect(buyer).markAsPaid(escrowId);
      // Try marking as paid again
      await expect(
        escrowContract.connect(buyer).markAsPaid(escrowId)
      ).to.be.revertedWith("Invalid escrow state");
    });
  });

  describe("Refunds", function () {
    let escrowId = 0;

    beforeEach(async function () {
      await escrowContract.connect(seller).createEscrow(
        buyer.address,
        fiatAmount,
        recipient,
        refId,
        { value: amountToLock }
      );
    });

    it("Should allow seller to refund after 2 hours if in Funded state", async function () {
      // Fast forward 2 hours
      await time.increase(2 * 60 * 60 + 1);

      const sellerInitialBal = await ethers.provider.getBalance(seller.address);
      const tx = await escrowContract.connect(seller).refund(escrowId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      await expect(tx)
        .to.emit(escrowContract, "EscrowRefunded")
        .withArgs(escrowId);

      const escrow = await escrowContract.escrows(escrowId);
      expect(escrow.state).to.equal(3); // EscrowState.Refunded

      const sellerFinalBal = await ethers.provider.getBalance(seller.address);
      expect(sellerFinalBal).to.equal(sellerInitialBal + amountToLock - gasUsed);
    });

    it("Should revert refund if 2 hours not passed in Funded state", async function () {
      await time.increase(1 * 60 * 60); // 1 hour passed
      await expect(
        escrowContract.connect(seller).refund(escrowId)
      ).to.be.revertedWith("Refund timeout not met");
    });

    it("Should allow seller to refund after 2 hours from markAsPaid if in AwaitingProof state", async function () {
      // Buyer marks as paid
      await escrowContract.connect(buyer).markAsPaid(escrowId);

      // Fast forward 1 hour (less than 2 hours from paid)
      await time.increase(1 * 60 * 60);
      await expect(
        escrowContract.connect(seller).refund(escrowId)
      ).to.be.revertedWith("Refund timeout not met");

      // Fast forward another 1 hour and 1 second
      await time.increase(1 * 60 * 60 + 1);

      const tx = await escrowContract.connect(seller).refund(escrowId);
      await expect(tx).to.emit(escrowContract, "EscrowRefunded");
    });

    it("Should revert if non-seller tries to refund", async function () {
      await time.increase(2 * 60 * 60 + 1);
      await expect(
        escrowContract.connect(buyer).refund(escrowId)
      ).to.be.revertedWith("Only seller can refund");
    });
  });

  describe("Verify Fiat and Release", function () {
    let escrowId = 0;
    let validEncodedProof;
    let expectedContext;
    let expectedParameters;
    let claimId;

    beforeEach(async function () {
      // Create escrow
      await escrowContract.connect(seller).createEscrow(
        buyer.address,
        fiatAmount,
        recipient,
        refId,
        { value: amountToLock }
      );

      // Mark as paid
      await escrowContract.connect(buyer).markAsPaid(escrowId);

      const contractAddr = (await escrowContract.getAddress()).toLowerCase();

      // Expected values
      expectedContext = `${escrowId}:${contractAddr}`;
      expectedParameters = `{"amount":"${fiatAmount}","recipient":"${recipient}","reference":"${refId}","memo":"aegis-${escrowId}"}`;
      claimId = ethers.keccak256(ethers.toUtf8Bytes("test-claim-id"));

      const rawProof = {
        claimInfo: {
          provider: "stripe-receipt-provider",
          parameters: expectedParameters,
          context: expectedContext
        },
        signedClaim: {
          claim: {
            identifier: claimId,
            owner: seller.address,
            timestampS: Math.floor(Date.now() / 1000),
            epoch: 1
          },
          signatures: [ethers.toUtf8Bytes("sig1")]
        }
      };

      // Encode struct
      validEncodedProof = ethers.AbiCoder.defaultAbiCoder().encode(
        [
          "tuple(tuple(string provider, string parameters, string context) claimInfo, tuple(tuple(bytes32 identifier, address owner, uint32 timestampS, uint32 epoch) claim, bytes[] signatures) signedClaim)"
        ],
        [rawProof]
      );
    });

    it("Should verify proof and release MON to buyer", async function () {
      const buyerInitialBal = await ethers.provider.getBalance(buyer.address);

      const tx = await escrowContract.connect(buyer).verifyFiatAndRelease(escrowId, validEncodedProof);

      await expect(tx)
        .to.emit(escrowContract, "FiatVerified")
        .withArgs(escrowId, buyer.address);

      const escrow = await escrowContract.escrows(escrowId);
      expect(escrow.state).to.equal(2); // EscrowState.Verified

      const buyerFinalBal = await ethers.provider.getBalance(buyer.address);
      // Buyer gets the amount (ignoring gas costs since caller can be anybody, e.g., buyer pays gas but gets amount)
      expect(buyerFinalBal).to.be.gt(buyerInitialBal);
      expect(await escrowContract.usedClaims(claimId)).to.be.true;
    });

    it("Should revert if escrow is not AwaitingProof", async function () {
      // Create a second escrow, but keep it in Funded state (do not mark as paid)
      const nextEscrowId = 1;
      await escrowContract.connect(seller).createEscrow(
        buyer.address,
        fiatAmount,
        recipient,
        refId,
        { value: amountToLock }
      );

      await expect(
        escrowContract.connect(buyer).verifyFiatAndRelease(nextEscrowId, validEncodedProof)
      ).to.be.revertedWith("Escrow not awaiting proof");
    });

    it("Should revert if trying to verify an escrow that is already verified", async function () {
      // First verification succeeds
      await escrowContract.connect(buyer).verifyFiatAndRelease(escrowId, validEncodedProof);

      // Re-verifying the same escrow fails due to state check
      await expect(
        escrowContract.connect(buyer).verifyFiatAndRelease(escrowId, validEncodedProof)
      ).to.be.revertedWith("Escrow not awaiting proof");
    });

    it("Should revert if the same proof is replayed on a different escrow", async function () {
      // First verification succeeds on escrow 0
      await escrowContract.connect(buyer).verifyFiatAndRelease(escrowId, validEncodedProof);

      // Deploy another escrow to test usedClaims check directly
      await escrowContract.connect(seller).createEscrow(
        buyer.address,
        fiatAmount,
        recipient,
        refId,
        { value: amountToLock }
      );
      await escrowContract.connect(buyer).markAsPaid(1);

      // Construct a new proof for escrow 1 but using the same claimId
      const newRawProof = {
        claimInfo: {
          provider: "stripe-receipt-provider",
          parameters: `{"amount":"${fiatAmount}","recipient":"${recipient}","reference":"${refId}","memo":"aegis-1"}`,
          context: `1:${(await escrowContract.getAddress()).toLowerCase()}`
        },
        signedClaim: {
          claim: {
            identifier: claimId, // Same used claimId
            owner: seller.address,
            timestampS: Math.floor(Date.now() / 1000),
            epoch: 1
          },
          signatures: [ethers.toUtf8Bytes("sig1")]
        }
      };

      const replayedClaimProof = ethers.AbiCoder.defaultAbiCoder().encode(
        [
          "tuple(tuple(string provider, string parameters, string context) claimInfo, tuple(tuple(bytes32 identifier, address owner, uint32 timestampS, uint32 epoch) claim, bytes[] signatures) signedClaim)"
        ],
        [newRawProof]
      );

      await expect(
        escrowContract.connect(buyer).verifyFiatAndRelease(1, replayedClaimProof)
      ).to.be.revertedWith("Proof already used");
    });


    it("Should revert if context (escrowId or contractAddress) does not match", async function () {
      const invalidRawProof = {
        claimInfo: {
          provider: "stripe-receipt-provider",
          parameters: expectedParameters,
          context: `999:${await escrowContract.getAddress()}` // Incorrect escrowId
        },
        signedClaim: {
          claim: {
            identifier: claimId,
            owner: seller.address,
            timestampS: Math.floor(Date.now() / 1000),
            epoch: 1
          },
          signatures: [ethers.toUtf8Bytes("sig1")]
        }
      };

      const invalidProof = ethers.AbiCoder.defaultAbiCoder().encode(
        [
          "tuple(tuple(string provider, string parameters, string context) claimInfo, tuple(tuple(bytes32 identifier, address owner, uint32 timestampS, uint32 epoch) claim, bytes[] signatures) signedClaim)"
        ],
        [invalidRawProof]
      );

      await expect(
        escrowContract.connect(buyer).verifyFiatAndRelease(escrowId, invalidProof)
      ).to.be.revertedWith("Invalid context");
    });

    it("Should revert if parameters (fiat amount, recipient, etc) do not match", async function () {
      const invalidRawProof = {
        claimInfo: {
          provider: "stripe-receipt-provider",
          parameters: `{"amount":"99999.00","recipient":"${recipient}","reference":"${refId}","memo":"aegis-${escrowId}"}`, // Incorrect amount
          context: expectedContext
        },
        signedClaim: {
          claim: {
            identifier: claimId,
            owner: seller.address,
            timestampS: Math.floor(Date.now() / 1000),
            epoch: 1
          },
          signatures: [ethers.toUtf8Bytes("sig1")]
        }
      };

      const invalidProof = ethers.AbiCoder.defaultAbiCoder().encode(
        [
          "tuple(tuple(string provider, string parameters, string context) claimInfo, tuple(tuple(bytes32 identifier, address owner, uint32 timestampS, uint32 epoch) claim, bytes[] signatures) signedClaim)"
        ],
        [invalidRawProof]
      );

      await expect(
        escrowContract.connect(buyer).verifyFiatAndRelease(escrowId, invalidProof)
      ).to.be.revertedWith("Invalid parameters");
    });

    it("Should revert if Reclaim verifier rejects proof verification", async function () {
      // Tell MockReclaim to fail
      await mockReclaimContract.connect(owner).setShouldFail(true);

      await expect(
        escrowContract.connect(buyer).verifyFiatAndRelease(escrowId, validEncodedProof)
      ).to.be.revertedWith("MockReclaim: Verification failed");
    });
  });
});
