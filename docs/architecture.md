# Architecture

## Overview

AegisP2P has three main parts:

1. **Smart Contract** - Runs on Monad blockchain. Holds crypto in escrow and releases it when payment is verified.
2. **Reclaim Protocol** - Creates zero-knowledge proofs of fiat payments from bank websites.
3. **Frontend** - Web app that users interact with.

## Flow

```
Seller                    Frontend                    Smart Contract            Buyer
  |                          |                             |                      |
  |-- Lock crypto ---------->|-- deposit() --------------->|                      |
  |                          |                             |-- Escrow Created     |
  |                          |                             |                      |
  |                          |                             |                      |
  |                          |<--- Generate QR code -------|                      |
  |                          |                             |                      |
  |                          |---- QR code for Reclaim ----|--------------------->|
  |                          |                             |                      |
  |                          |                             |    Buyer sends fiat  |
  |<-- Fiat received --------|                             |    to seller's bank  |
  |                          |                             |                      |
  |                          |<---- zk proof of fiat ------|--------------------->|
  |                          |                             |                      |
  |                          |-- verifyProof() ----------->|                      |
  |                          |                             |-- Verify zk proof    |
  |                          |                             |-- Release crypto     |
  |                          |<--- Crypto released --------|--------------------->|
```

## Key Parts

### Smart Contract (AegisEscrow.sol)
- Holds crypto funds safely
- Checks zero-knowledge proofs before releasing funds
- Uses Monad MIP-3 for cheaper proof verification
- Uses Monad MIP-4 to check gas reserve before heavy computation

### Reclaim Protocol
- Captures HTTPS traffic from bank websites
- Creates a zero-knowledge proof that the payment happened
- Does not expose user passwords or bank details

### Frontend
- Seller dashboard to lock crypto
- Buyer dashboard to generate proofs and claim crypto
- Shows real-time status of escrows
