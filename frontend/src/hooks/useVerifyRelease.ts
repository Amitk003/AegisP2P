"use client";

import { useWriteContract } from "wagmi";
import { AEGIS_ESCROW_ABI, ESCROW_ADDRESS } from "@/lib/contract";
import { verificationService } from "@/services";

export function useVerifyRelease() {
  const { writeContractAsync, isPending, data, error } = useWriteContract();

  const verifyRelease = async (
    escrowId: number,
    escrow: {
      fiatAmount: string;
      recipient: string;
      refId: string;
      paymentRef: string;
    }
  ) => {
    const proof = await verificationService.generateProof({
      escrowId,
      contractAddress: ESCROW_ADDRESS,
      fiatAmount: escrow.fiatAmount,
      recipient: escrow.recipient,
      refId: escrow.refId,
      paymentRef: escrow.paymentRef,
    });

    return writeContractAsync({
      address: ESCROW_ADDRESS,
      abi: AEGIS_ESCROW_ABI,
      functionName: "verifyFiatAndRelease",
      args: [BigInt(escrowId), proof],
    });
  };

  return { verifyRelease, isPending, data, error };
}
