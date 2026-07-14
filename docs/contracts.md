# Smart Contracts

## AegisEscrow.sol

The main contract that manages peer-to-peer escrows.

### States

Each escrow goes through these states:

| State | Meaning |
|-------|---------|
| Funded | Seller created escrow and locked crypto in one transaction |
| AwaitingProof | Buyer marked as paid, 2-hour proof window started |
| Verified | Fiat payment proof verified, crypto released to buyer |
| Refunded | Escrow expired, crypto returned to seller |

### Main Functions

**createEscrow(buyer, amount, recipient, reference)**
- Seller creates a new escrow and locks crypto in one transaction
- Function is payable (accepts MON directly)
- Stores raw fields (amount, recipient, reference) in the escrow struct
- No hash pre-computation needed from the seller
- Emits `EscrowFunded` event
- No separate `depositCrypto` function needed. One transaction, one gas fee.

**markAsPaid(escrowId)**
- Buyer calls this BEFORE sending fiat to the seller
- Transitions escrow from `Funded` to `AwaitingProof`
- Starts a 2-hour timer for proof submission
- Seller cannot refund after this point
- Protects buyer from front-running: seller can't call refund while buyer is generating the proof

**verifyFiatAndRelease(escrowId, proof)**
- Buyer submits a Reclaim zk proof of fiat payment
- Steps:
  1. Check proof has not been used before via `usedClaims[proof.claimId]`
  2. Check proof context binds to this escrow: `extractFieldFromContext(proof, "escrowId") == escrowId` and `extractFieldFromContext(proof, "contractAddress") == address(this)`
  3. Construct expected JSON string from stored escrow fields: `abi.encodePacked('{"amount":"', amount, '","recipient":"', recipient, '","reference":"', reference, '"}')`
  4. Check `keccak256(expectedJson) == proof.parametersHash`
  5. Mark `usedClaims[proof.claimId] = true`
  6. Use MIP-4 reserve balance check before proof verification
  7. Verify the zk proof via Reclaim SDK
  8. Release crypto to buyer
- No on-chain JSON parsing. Just templated string construction.

**refund(escrowId)**
- Seller can claim refund if timeout passed
- If escrow is in `Funded` state: refund is available 2 hours after `createEscrow`
- If escrow is in `AwaitingProof` state: refund is available 2 hours after `markAsPaid`
- No human arbiters, no dispute state. Pure code-governed.

### Events

- `EscrowFunded(escrowId, seller, buyer, amount, recipient, reference)`
- `PaymentMarked(escrowId, buyer)`
- `FiatVerified(escrowId, buyer)`
- `EscrowRefunded(escrowId)`

### Security Features

- **Replay Protection:** `mapping(bytes32 => bool) public usedClaims` prevents reusing the same Reclaim claim across multiple escrows
- **Escrow Binding:** Proof context must contain the specific `escrowId` and `contractAddress` so a proof from another platform or escrow cannot be used
- **ReentrancyGuard** - Prevents reentrancy attacks on release and refund
- **Ownable2Step** - Admin controls for `pauseNewEscrows()` only
- **Pausable** - Only blocks creation of new escrows. Release, refund, and markAsPaid are always unpausable, so existing user funds are never locked by admin.
- **Timeout-based refunds** - No disputes needed

### Why no dispute logic?

Disputes need human arbiters and multisigs, which adds trust back into the system. The design keeps it trustless:
- Buyer marks as paid, then submits a valid zk proof = gets crypto
- Buyer marks as paid but fails to submit proof within 2 hours = seller gets refund
- Buyer never marks as paid within 2 hours of escrow creation = seller gets refund
- No third party needed

### How proof verification works

1. Seller calls `createEscrow(buyer, amount, recipient, reference)`. Raw values stored in escrow struct.
2. Buyer calls `markAsPaid(escrowId)`. Timer starts.
3. Buyer sends fiat to seller, gets a Stripe/bank receipt.
4. Buyer generates Reclaim proof of the receipt on their phone.
5. Buyer submits proof to `verifyFiatAndRelease`.
6. Contract checks `usedClaims` to prevent replay.
7. Contract checks proof context contains `escrowId` and `contractAddress`.
8. Contract builds expected JSON string from stored fields using `abi.encodePacked`.
9. Contract compares `keccak256(expectedJson)` against `proof.parametersHash`.
10. Contract calls Reclaim verifier to validate the zk proof.
11. Crypto is released to buyer.

No string parsing, no JSON extraction, no regex in Solidity. Just templated string construction and hash comparison.

## MIP-3 and MIP-4

These are Monad-specific features used to optimize the contract:

- **MIP-3 (Linear Memory):** Makes proof verification cheaper by using linear memory pricing instead of quadratic.
- **MIP-4 (Reserve Balance):** Checks if the transaction has enough gas before running the expensive proof verification. Prevents wasted gas on failed transactions.
