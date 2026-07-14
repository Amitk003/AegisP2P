export enum EscrowState {
  Funded = 0,
  AwaitingProof = 1,
  Verified = 2,
  Refunded = 3,
}

export interface EscrowData {
  escrowId: number;
  seller: string;
  buyer: string;
  amount: bigint;
  fiatAmount: string;
  recipient: string;
  refId: string;
  paymentRef: string;
  state: EscrowState;
  createdAt: number;
  paidAt: number;
}
