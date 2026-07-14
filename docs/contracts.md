# Smart Contracts

## AegisEscrow.sol

The main contract that manages peer-to-peer escrows.

### States

Each escrow goes through these states:

| State | Meaning |
|-------|---------|
| Created | Escrow is created but crypto not yet deposited |
| Deposited | Seller has locked crypto in the contract |
| Verified | Fiat payment proof is verified, crypto released to buyer |
| Refunded | Escrow expired, crypto returned to seller |

### Main Functions

**createEscrow(buyer, terms)**
- Seller creates a new escrow for a buyer
- Sets the payment terms (amount, currency, reference ID)

**depositCrypto(escrowId)**
- Seller locks crypto into the escrow
- Only callable by the seller who created it

**verifyFiatAndRelease(escrowId, proof)**
- Buyer submits a Reclaim zk proof of fiat payment
- Contract verifies the proof
- If valid, crypto is released to the buyer
- Uses MIP-4 reserve balance check before verification
- Uses MIP-3 linear memory pricing for efficient proof handling

**refund(escrowId)**
- Seller can claim refund after timeout period
- Only works if buyer did not submit proof in time

### Events

- `EscrowCreated(escrowId, seller, buyer, amount)`
- `CryptoDeposited(escrowId)`
- `FiatVerified(escrowId, buyer)`
- `EscrowRefunded(escrowId)`

### Security Features

- ReentrancyGuard to prevent reentrancy attacks
- Ownable2Step for admin controls
- Pausable for emergency stops
- Timeout-based refunds for stuck escrows

## MIP-3 and MIP-4

These are Monad-specific features used to optimize the contract:

- **MIP-3 (Linear Memory):** Makes proof verification cheaper by using linear memory pricing instead of quadratic.
- **MIP-4 (Reserve Balance):** Checks if the transaction has enough gas before running the expensive proof verification. Prevents wasted gas on failed transactions.
