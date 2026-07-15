import type { IFiatPaymentService } from "./types";
import { MockFiatPaymentService } from "./mockFiatPayment";

let instance: IFiatPaymentService | null = null;

function getFiatPaymentService(): IFiatPaymentService {
  if (!instance) {
    instance = new MockFiatPaymentService();
  }
  return instance;
}

export function setFiatPaymentService(svc: IFiatPaymentService) {
  instance = svc;
}

export { type IFiatPaymentService };
export const fiatPaymentService = getFiatPaymentService();
