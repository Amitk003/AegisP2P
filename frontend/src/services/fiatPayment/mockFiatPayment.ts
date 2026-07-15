import type { FiatPaymentResult, IFiatPaymentService } from "./types";

export class MockFiatPaymentService implements IFiatPaymentService {
  readonly name = "mock-stripe";

  private shouldFail = false;

  setShouldFail(v: boolean) {
    this.shouldFail = v;
  }

  async simulatePayment(
    escrowId: number,
    amount: string,
    recipient: string
  ): Promise<FiatPaymentResult> {
    if (this.shouldFail) {
      return {
        success: false,
        transactionId: "",
        message: `Payment failed for escrow #${escrowId} (mock)`,
      };
    }

    await delay(500);

    return {
      success: true,
      transactionId: `pi_mock_${escrowId}_${Date.now()}`,
      message: `Charged $${amount} to ${recipient}`,
    };
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
