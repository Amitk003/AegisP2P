"use client";

import { useMarkPaid } from "./useMarkPaid";
import { fiatPaymentService } from "@/services";

export function useSimulatePayment() {
  const { markAsPaid, isPending, data, error } = useMarkPaid();

  const simulatePayment = async (escrowId: number, amount: string, recipient: string) => {
    const result = await fiatPaymentService.simulatePayment(escrowId, amount, recipient);

    if (!result.success) {
      throw new Error(result.message);
    }

    await markAsPaid(escrowId);
    return result.transactionId;
  };

  return { simulatePayment, isPending, data, error };
}
