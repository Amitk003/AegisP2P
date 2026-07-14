# Smart Contracts

## AegisEscrow.sol

The main contract that manages peer-to-peer escrows.

### States

Each escrow goes through these states:

| State | Meaning |
|-------|---------|
| Funded | Seller created escrow and locked crypto in one transaction |
| Verified | Fiat payment proof is verified, crypto released to buyer |
| Refunded | Escrow expired, crypto returned to seller |

### Main Functions

**createEscrow(buyer, expectedHash)**
- Seller creates a new escrow and locks crypto in one transaction
- Function is payable (accepts MON directly)
- `expectedHash` = `keccak256(amount, reference, recipient)` of the expected fiat payment
- Emits `EscrowFunded` event
- No separate `depositCrypto` function needed. One transaction, one gas fee.

**verifyFiatAndRelease(escrowId, proof)**
- Buyer submits a Reclaim zk proof of fiat payment
- Contract extracts the `parametersHash` from the Reclaim proof
- Compares it against `expectedHash` stored during escrow creation
- If hashes match, crypto is released to the buyer
- Uses MIP-4 reserve balance check before verification
- Uses MIP-3 linear memory pricing for efficient proof handling
- No on-chain string or JSON parsing

**refund(escrowId)**
- Seller can claim refund after timeout period (2 hours)
- Only works if buyer did not submit valid proof in time
- No human arbiters, no dispute state. Pure code-governed.

### Events

- `EscrowFunded(escrowId, seller, buyer, amount)`
- `FiatVerified(escrowId, buyer)`
- `EscrowRefunded(escrowId)`

### Security Features

- **ReentrancyGuard** - Prevents reentrancy attacks on release and refund
- **Ownable2Step** - Admin controls for `pauseNewEscrows()` only
- **Pausable** - Only blocks creation of new escrows. Release and refund functions are always unpausable, so existing user funds are never locked by admin.
- **Timeout-based refunds** - 2 hour expiry, no disputes needed

### Why no dispute logic?

Disputes need human arbiters and multisigs, which adds trust back into the system. The design keeps it trustless:
- Buyer submits a valid zk proof = gets crypto
- Buyer fails to submit proof within 2 hours = seller gets refund
- No third party needed

### How proof verification works (no string parsing)

1. When creating escrow, seller passes `keccak256(amount, reference, recipient)`
2. This hash is stored as `expectedHash` in the escrow struct
3. When buyer submits Reclaim proof, the contract reads the `parametersHash` from the proof
4. Contract checks: `parametersHash == expectedHash`
5. If match, crypto is released

No string parsing, no JSON extraction, no regex in Solidity. Just hash comparison.

## MIP-3 and MIP-4

These are Monad-specific features used to optimize the contract:

- **MIP-3 (Linear Memory):** Makes proof verification cheaper by using linear memory pricing instead of quadratic.
- **MIP-4 (Reserve Balance):** Checks if the transaction has enough gas before running the expensive proof verification. Prevents wasted gas on failed transactions.
