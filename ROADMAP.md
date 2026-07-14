# AegisP2P: Implementation Roadmap

This document outlines the step-by-step phases to build and deploy **AegisP2P**, a ZK-Verified Fiat-to-Crypto Settlement Engine on Monad.

---

## Roadmap Overview

```mermaid
gantt
    title AegisP2P Development Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Smart Contracts
    Core Logic, Security, MIP-3/MIP-4 :active, 2026-07-14, 2026-07-15
    section Phase 2: Reclaim zkTLS
    Reclaim SDK & zkTLS Verification : 2026-07-15, 2026-07-16
    section Phase 3: Frontend PWA
    Stripe-Style Light UI & Wagmi : 2026-07-16, 2026-07-17
    section Phase 4: Buffer & Debug
    E2E Integration & Debugging Buffer : 2026-07-17, 2026-07-18
    section Phase 5: Production & Submit
    Mainnet Deploy, Verify & Submission : 2026-07-18, 2026-07-19
```

---

## Phase 1: Smart Contract Foundations & Security (July 14 - July 15)
**Objective:** Architect, secure, and deploy the core escrow engine.

*   [ ] **1.1. Project Setup:** Initialize the codebase repository and configure Foundry or Hardhat.
*   [ ] **1.2. Core Escrow Contract (AegisEscrow.sol):**
    *   `createEscrow(buyer, expectedHash)` - payable function that creates and funds escrow in one transaction. `expectedHash` = `keccak256(amount, reference, recipient)`.
    *   `verifyFiatAndRelease(escrowId, proof)` - accepts Reclaim proof, extracts `parametersHash`, compares against stored `expectedHash`. No on-chain string parsing.
    *   `refund(escrowId)` - simple timeout-based refund (2 hours). No dispute states, no referee logic.
    *   Escrow states: `Funded` -> `Verified` -> `Refunded`. No empty Created state.
*   [ ] **1.3. Define On-Chain Events:**
    *   Events: `EscrowFunded`, `FiatVerified`, `EscrowRefunded` (removed `Disputed`).
*   [ ] **1.4. Security:**
    *   `ReentrancyGuard` on release and refund functions.
    *   `Ownable2Step` for admin controls only.
    *   `Pausable` - only blocks `createEscrow`. Release and refund are always unpausable.
*   [ ] **1.5. Monad Network Integrations (MIP-3 & MIP-4):**
    *   **MIP-3 (Linear Memory):** Structure proof handling using Reclaim Solidity Verifier SDK. No string parsing, just hash comparison.
    *   **MIP-4 (Reserve Balance Introspection):** Check address `0x1001` via `dippedIntoReserve()` before running proof verification.
*   [ ] **1.6. Unit Testing:** Standard flow (fund -> verify -> release), timeout refund, invalid proof, reentrancy, pause only blocks new escrows.
*   [ ] **1.7. Testnet Deployment:** Deploy to Monad Testnet, verify source code.

---

## Phase 2: Reclaim Protocol & zkTLS Configuration (July 15 - July 16)
**Objective:** Configure Web2 data extraction and generate cryptographic proofs.

*   [ ] **2.1. Developer Setup:** Register app on Reclaim Developer Portal, get `APP_ID` and `APP_SECRET`.
*   [ ] **2.2. Configure HTTP Provider (Stripe Focus):**
    *   Target Stripe payment receipt pages for MVP.
    *   Map `parametersHash` from the Reclaim proof output.
*   [ ] **2.3. Signature Verification Tests:** Validate proof construction locally and confirm `parametersHash` matches smart contract expectations.
*   [ ] **2.4. No on-chain string parsing:** Verification uses hash comparison only. No `extractFieldFromContext` on-chain.

---

## Phase 3: Frontend PWA Development (July 16 - July 17)
**Objective:** Design a premium, light-theme mobile web application.

*   [ ] **3.1. Project Initialization:** Next.js App Router with Tailwind CSS and Wagmi.
*   [ ] **3.2. Neo-Banking UI:** Light-mode, high-contrast, mobile-first. No neon gradients or Web3 tropes.
*   [ ] **3.3. Wagmi/RainbowKit Setup:** Monad Network (Chain ID `10143`).
*   [ ] **3.4. Features:**
    *   **Create Escrow:** Single form - seller enters buyer address, payment details, locks crypto in one click.
    *   **Proof Generator:** Reclaim QR code for buyers.
    *   **State Tracker:** Listens to `EscrowFunded`, `FiatVerified`, `EscrowRefunded` events.

---

## Phase 4: Integration & Debugging Buffer (July 17 - July 18)
**Objective:** Bind components, debug, and optimize.

*   [ ] **4.1. E2E Wiring:** Connect frontend to contract methods.
*   [ ] **4.2. Full Flow Tests:** Deposit -> generate proof -> verify -> release.
*   [ ] **4.3. Debugging & Gas Optimization:** Fix async execution errors, RPC issues, edge cases.
*   [ ] **4.4. UI Audit:** No placeholder data, no hardcoded stats, every button triggers real on-chain state changes.

---

## Phase 5: Production Deploy, Verification & Submission (July 18 - July 19)
**Objective:** Deploy to mainnet, publish, and present.

*   [ ] **5.1. Monad Mainnet Deployment:** Deploy finalized contract to Monad Mainnet (Chain ID `10143`).
*   [ ] **5.2. Source Code Verification:** Verify contract bytecode on Monad block explorer.
*   [ ] **5.3. Frontend Deployment:** Host PWA on Vercel or Netlify.
*   [ ] **5.4. Documentation (`README.md`):** Clear instructions to run the app within 3 minutes.
*   [ ] **5.5. Demo Video:** 3-minute walkthrough showing the problem and live transaction.
