export interface ProofParams {
  escrowId: number;
  contractAddress: string;
  fiatAmount: string;
  recipient: string;
  refId: string;
  paymentRef: string;
}

export interface IVerificationService {
  generateProof(params: ProofParams): Promise<`0x${string}`>;
  readonly name: string;
}
