# AegisP2P

A peer-to-peer crypto escrow system that verifies fiat payments before releasing locked crypto assets. Built for the Monad Network.

## Problem

P2P crypto buyers send fiat directly to sellers. If that fiat originates from fraud, the seller's bank account gets frozen — even if the seller is innocent. AegisP2P prevents this by requiring proof of a legitimate fiat payment before releasing escrowed crypto.

## How it works

1. **Seller locks crypto** in the escrow contract, specifying the buyer's address, fiat amount, and recipient identifier
2. **Buyer marks fiat as paid** off-chain (simulated with Stripe/UPI in the mock)
3. **Seller generates a proof** of the fiat payment on-chain using the Reclaim-style verification interface
4. **Contract verifies the proof** via the configured verifier (MockReclaim in demo) and releases crypto to the buyer
5. **Refund** available to the seller if the timeout (2 hours) expires without verification

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Monad Testnet (EVM, chain ID 10143) |
| Smart Contracts | Solidity ^0.8.26, OpenZeppelin |
| ZK Verification | Reclaim Protocol interface (mock in demo) |
| Frontend | Next.js 16, Tailwind CSS v4, Wagmi v2, RainbowKit v2 |
| Wallet Connectors | RainbowKit (MetaMask, OKX, WalletConnect, etc.) |

## Project Structure

```
contracts/
├── contracts/
│   ├── AegisEscrow.sol      # Core escrow contract
│   └── mocks/
│       └── MockReclaim.sol  # Mock verifier for demo
├── scripts/
│   ├── deploy.js            # Production deploy script
│   └── deploy-mock.js       # Demo deploy (includes MockReclaim)
├── test/                    # Contract tests
├── .env.example
└── hardhat.config.js

frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main UI
│   │   ├── layout.tsx         # Root layout + providers
│   │   ├── providers.tsx      # Wagmi + RainbowKit providers
│   │   └── api/reclaim/       # Reclaim webhook endpoint
│   ├── components/
│   │   ├── escrow/            # EscrowCard, EscrowList, CreateEscrowForm, etc.
│   │   ├── layout/            # Header
│   │   └── ui/               # LoadingSpinner, ConfirmModal
│   ├── hooks/                 # useEscrows, useContractActions
│   ├── services/              # Verification + FiatPayment service abstractions
│   ├── lib/                   # Contract ABI, legacy demoProof util
│   ├── config/                # Wagmi config, chain definitions
│   └── types/                 # EscrowData, EscrowState
├── .env.example
└── package.json
```

## Demo Flow (no real APIs needed)

All external services are mocked — no Stripe, no Reclaim oracle, no real API keys required.

1. Connect your wallet (any EVM wallet via RainbowKit)
2. Fill the form: buyer address, crypto amount, fiat amount, recipient, reference ID
3. Click "Lock Crypto & Create Escrow" — sends a tx to the contract
4. As buyer, click "Mark as Paid" — simulates off-chain fiat payment
5. As seller, click "Verify & Release" — auto-generates a proof via `MockVerificationService` and submits it
6. The contract validates the proof against `MockReclaim` (always accepts) and releases crypto

## Service Architecture

```
IVerificationService         IFiatPaymentService
    ↕                              ↕
MockVerificationService      MockFiatPaymentService
(generates fake proofs)      (simulates payment)
```

Swapping to production:
- Replace `MockVerificationService` with a `ReclaimVerificationService` that calls the Reclaim SDK
- Replace `MockFiatPaymentService` with a `StripePaymentService` that creates actual payment intents
- Deploy the real `ReclaimVerifier` contract and call `setReclaimVerifier()`

## Contracts

- **AegisEscrow**: Core escrow logic — create, mark paid, verify & release, refund. Ownable, pausable, reentrancy-guarded.
- **MockReclaim**: Accepts any proof (unless `setShouldFail(true)` is called). Implements the `IReclaim.verifyProof()` interface.

Deployed instances (Monad Testnet):
- AegisEscrow: `0x2CD627423A35E2E8BCE320041Ae0163004Ec0601`
- MockReclaim: `0xa6fEcB7f1Feef414Ff978121e6F7913210BE00ea`

## Environment

See `.env.example` in each directory. Required:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — from https://cloud.walletconnect.com (optional, app works without it)
- `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS` — deployed escrow address
- `PRIVATE_KEY` (contracts/.env) — for running deploy scripts
