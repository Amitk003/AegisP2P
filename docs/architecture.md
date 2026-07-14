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
  |-- Create + Lock -------->|-- createEscrow() ---------->|                      |
  |   (payable)              |   (crypto + hash)           |-- Escrow Funded     |
  |                          |                             |                      |
  |                          |<--- Generate QR code -------|                      |
  |                          |                             |                      |
  |                          |       QR code for Reclaim --|--------------------->|
  |                          |                             |                      |
  |                          |                             |   Buyer sends fiat   |
  |<-- Fiat received --------|                             |   to seller's bank   |
  |                          |                             |                      |
  |                          |<--- zk proof of fiat -------|----------------------|
  |                          |                             |                      |
  |                          |-- verifyFiatAndRelease() -->|                      |
  |                          |                             |-- Check keccak256   |
  |                          |                             |   hash match        |
  |                          |                             |-- Verify zk proof   |
  |                          |                             |-- Release crypto    |
  |                          |<--- Crypto released --------|--------------------->|
```

## State Machine

```
         createEscrow (payable)
              |
              v
        [ Funded ] ------> [ Verified ]  (buyer submits valid proof)
              |                   
              |  (2hr timeout)     
              v                    
        [ Refunded ]              
```

Only 3 states. No empty Created state, no dispute state.

## Key Parts

### Smart Contract (AegisEscrow.sol)
- Holds crypto funds safely
- Checks zero-knowledge proofs before releasing funds
- Uses keccak256 hash comparison instead of on-chain string parsing
- Uses Monad MIP-3 for cheaper proof verification
- Uses Monad MIP-4 to check gas reserve before heavy computation

### Reclaim Protocol
- Captures HTTPS traffic from bank websites
- Creates a zero-knowledge proof that the payment happened
- Does not expose user passwords or bank details
- Provides a `parametersHash` that the contract compares against expected values

### Frontend
- Seller dashboard: create escrow with one click
- Buyer dashboard: generate proof, verify, and claim crypto
- Shows real-time status of escrows via event listeners
