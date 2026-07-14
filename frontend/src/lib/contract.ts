export const AEGIS_ESCROW_ABI = [
  {
    inputs: [
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "string", name: "fiatAmount", type: "string" },
      { internalType: "string", name: "recipient", type: "string" },
      { internalType: "string", name: "refId", type: "string" },
    ],
    name: "createEscrow",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "escrowId", type: "uint256" }],
    name: "markAsPaid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "escrowId", type: "uint256" },
      { internalType: "bytes", name: "proof", type: "bytes" },
    ],
    name: "verifyFiatAndRelease",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "escrowId", type: "uint256" }],
    name: "refund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "nextEscrowId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "escrows",
    outputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "fiatAmount", type: "string" },
      { internalType: "string", name: "recipient", type: "string" },
      { internalType: "string", name: "refId", type: "string" },
      { internalType: "string", name: "paymentRef", type: "string" },
      { internalType: "uint8", name: "state", type: "uint8" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "uint256", name: "paidAt", type: "uint256" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "escrowId", type: "uint256" },
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "string", name: "fiatAmount", type: "string" },
      { indexed: false, internalType: "string", name: "recipient", type: "string" },
      { indexed: false, internalType: "string", name: "refId", type: "string" },
      { indexed: false, internalType: "string", name: "paymentRef", type: "string" },
    ],
    name: "EscrowFunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "escrowId", type: "uint256" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
    ],
    name: "PaymentMarked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "escrowId", type: "uint256" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
    ],
    name: "FiatVerified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "escrowId", type: "uint256" },
    ],
    name: "EscrowRefunded",
    type: "event",
  },
] as const;

export const ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;
