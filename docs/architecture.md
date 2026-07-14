# Architecture

## Overview

AegisP2P has three main parts:

1. **Smart Contract** - Runs on Monad blockchain. Holds crypto in escrow and releases it when payment is verified.
2. **Reclaim Protocol** - Creates zero-knowledge proofs of fiat payments from bank websites.
3. **Frontend** - Web app that users interact with.

## Flow

```
Seller                    Frontend                      Smart Contract            Buyer
  |                          |                               |                      |
  |-- Create + Lock -------->|-- createEscrow() ------------>|                      |
  |   (payable)              |   (amount,recipient,ref)      |-- Escrow Funded      |
  |                          |                               |   (paymentRef gen)   |
  |                          |                               |                      |
  |                          |<--- paymentRef + QR for  -----|----------------------|
  |                          |     Reclaim                    |                      |
  |                          |                               |                      |
  |                          |                               |<-- markAsPaid() -----|
  |                          |                               |   (before sending)   |
  |                          |                               |-- AwaitingProof      |
  |                          |                               |                      |
  |                          |                               |  Buyer sends fiat    |
  |<-- Fiat received --------|                               |  via Stripe, includes|
  |                          |                               |  paymentRef in memo  |
  |                          |                               |                      |
  |                          |                               |<-- verifyFiatAnd---  |
  |                          |                               |    Release(proof)    |
  |                          |                               |                      |
  |                          |                               |-- Check usedClaims   |
  |                          |                               |   (signedClaim.claim |
  |                          |                               |    .identifier)      |
  |                          |                               |-- Build context hash |
  |                          |                               |   escrowId:contract  |
  |                          |                               |-- Build expected JSON|
  |                          |                               |   (includes memo=    |
  |                          |                               |    paymentRef)       |
  |                          |                               |-- Verify zk proof    |
  |                          |                               |-- Release crypto    |
  |                          |<--- Crypto released ----------|----------------------|
```

## State Machine

```
         createEscrow (payable)
               |
               v
         [ Funded ] ----------------> [ Refunded ]
               |                      (2hr timeout, no markAsPaid)
               |
         markAsPaid()
               |
               v
      [ AwaitingProof ] ------------> [ Refunded ]
               |                      (2hr timeout, no proof submitted)
               |
         verifyFiatAndRelease()
               |
               v
         [ Verified ]
```

4 states. Funded -> AwaitingProof -> Verified | Refunded.

## Key Parts

### Smart Contract (AegisEscrow.sol)
- Holds crypto funds safely
- Generates unique `paymentRef` per escrow for payment binding
- Buyer calls `markAsPaid` before sending fiat to prevent front-running
- Constructs expected context by converting to strings first (`Strings.toString`, `Strings.toHexString`), then compares hash against `proof.claimInfo.context`
- Constructs expected JSON from stored fields including `paymentRef` as memo using `abi.encodePacked`
- Computes hash of `proof.claimInfo.parameters` directly (no pre-computed `parametersHash` in the SDK)
- Prevents replay attacks with `usedClaims` using `proof.signedClaim.claim.identifier`
- Uses Monad MIP-3 for cheaper proof verification
- Uses Monad MIP-4 to check gas reserve before heavy computation

### Reclaim Protocol
- Captures HTTPS traffic from Stripe receipt pages
- Creates a zero-knowledge proof that the payment happened
- Does not expose user passwords or bank details
- Context field contains `escrowId:contractAddress` for binding (compared via hash, converted to strings first)
- Parameters include `amount`, `recipient`, `reference`, and `memo` (the paymentRef)
- No pre-computed `parametersHash` in the SDK - contract hashes `proof.claimInfo.parameters` directly

### Frontend
- Seller dashboard: create escrow with one click
- Buyer dashboard: mark as paid, generate Reclaim proof using provided paymentRef, verify and claim crypto
- Shows real-time status of escrows via event listeners
