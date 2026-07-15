import type { IVerificationService } from "./types";
import { MockVerificationService } from "./mockVerification";

let instance: IVerificationService | null = null;

function getVerificationService(): IVerificationService {
  if (!instance) {
    instance = new MockVerificationService();
  }
  return instance;
}

export function setVerificationService(svc: IVerificationService) {
  instance = svc;
}

export { type IVerificationService };
export const verificationService = getVerificationService();
