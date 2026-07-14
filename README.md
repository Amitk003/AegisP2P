# AegisP2P

A peer-to-peer crypto escrow system that uses zero-knowledge proofs to verify fiat payments before releasing locked crypto assets.

## What problem does it solve?

When people buy crypto using P2P platforms, they send fiat money (like USD or INR) directly to the seller's bank account. Sometimes this fiat money comes from scams or fraud. When the victim reports it, the seller's bank account gets frozen by the police - even if the seller is innocent.

AegisP2P prevents this by making sure the fiat payment is verified using a cryptographic proof before the crypto is released from escrow.

## How does it work?

1. A seller locks their crypto in an escrow contract
2. The buyer sends fiat money to the seller's bank account
3. The buyer generates a zero-knowledge proof of the payment using Reclaim Protocol
4. The proof is submitted to the smart contract
5. The contract verifies the proof and releases the crypto to the buyer

## Tech Stack

- **Blockchain:** Monad Network (EVM compatible)
- **Smart Contracts:** Solidity 0.8.26
- **ZK Verification:** Reclaim Protocol (zkTLS)
- **Frontend:** Next.js + Tailwind CSS + Wagmi

## Project Structure

```
contracts/     - Smart contract source files
frontend/      - Web application
docs/          - Project documentation
```

## Getting Started

See [docs/setup.md](docs/setup.md) for setup instructions.
