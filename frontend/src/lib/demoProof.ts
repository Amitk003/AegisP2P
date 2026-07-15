import { verificationService } from "@/services";

export function buildDemoProof(
  escrowId: number,
  contractAddress: string,
  fiatAmount: string,
  recipient: string,
  refId: string,
  paymentRef: string
): Promise<`0x${string}`> {
  return verificationService.generateProof({
    escrowId,
    contractAddress,
    fiatAmount,
    recipient,
    refId,
    paymentRef,
  });
}
