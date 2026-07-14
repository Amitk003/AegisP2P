# Setup Guide

## Prerequisites

- Node.js 18 or higher
- Git
- A wallet with some test MON (Monad testnet tokens)
- A Reclaim Protocol developer account (free)

## Step 1: Clone the Repository

```
git clone https://github.com/Amitk003/AegisP2P.git
cd AegisP2P
```

## Step 2: Smart Contracts

```
cd contracts
npm install
```

Create a `.env` file in the `contracts` folder:

```
PRIVATE_KEY=your_wallet_private_key
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
RECLAIM_VERIFIER_ADDRESS=deployed_verifier_contract_address
BLOCK_EXPLORER_API_KEY=your_block_explorer_api_key
```

Compile the contracts:

```
npx hardhat compile
```

Run tests:

```
npx hardhat test
```

## Step 3: Frontend

```
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` folder:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=deployed_contract_address_here
```

Run the dev server:

```
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 4: Environment Variables

Copy `.env.example` files to their respective folders and remove the `.example` extension. Fill in the values.

## Important Notes

- Never commit your `.env` files
- Make sure your wallet has enough MON for gas fees
- The Reclaim proof generation works on mobile devices only
