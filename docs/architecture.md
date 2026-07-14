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
  |                          |                               |                      |
  |                          |<--- QR for Reclaim -----------|----------------------|
  |                          |                               |                      |
  |                          |                               |<-- markAsPaid() -----|
  |                          |                               |   (before sending)   |
  |                          |                               |-- AwaitingProof      |
  |                          |                               |                      |
  |                          |                               |  Buyer sends fiat    |
  |<-- Fiat received --------|                               |  to seller's bank    |
  |                          |                               |                      |
  |                          |                               |<-- verifyFiatAnd---  |
  |                          |                               |    Release(proof)    |
  |                          |                               |                      |
  |                          |                               |-- Check usedClaims   |
  |                          |                               |-- Check context      |
  |                          |                               |   (escrowId, addr)   |
  |                          |                               |-- Build expected JSON|
  |                          |                               |-- Hash compare       |
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
- Buyer calls `markAsPaid` before sending fiat to prevent front-running
- Constructs expected JSON from stored fields using `abi.encodePacked`
- Compares hash of constructed JSON against Reclaim proof's parametersHash
- Prevents replay attacks with `usedClaims` mapping
- Binds proof to specific escrow via context fields (escrowId, contractAddress)
- Uses Monad MIP-3 for cheaper proof verification
- Uses Monad MIP-4 to check gas reserve before heavy computation

### Reclaim Protocol
- Captures HTTPS traffic from bank/Stripe websites
- Creates a zero-knowledge proof that the payment happened
- Does not expose user passwords or bank details
- Context fields embed escrowId and contractAddress for binding
- Provides a `parametersHash` of the fiat transaction details

### Frontend
- Seller dashboard: create escrow with one click
- Buyer dashboard: mark as paid, generate Reclaim proof, verify and claim crypto
- Shows real-time status of escrows via event listeners
