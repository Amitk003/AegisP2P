export interface FiatPaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

export interface IFiatPaymentService {
  simulatePayment(escrowId: number, amount: string, recipient: string): Promise<FiatPaymentResult>;
  readonly name: string;
}
