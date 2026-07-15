"use client";

import { useWriteContract } from "wagmi";
import { AEGIS_ESCROW_ABI, ESCROW_ADDRESS } from "@/lib/contract";

export function useMarkPaid() {
  const { writeContractAsync, isPending, data, error } = useWriteContract();

  const markAsPaid = async (escrowId: number) => {
    return writeContractAsync({
      address: ESCROW_ADDRESS,
      abi: AEGIS_ESCROW_ABI,
      functionName: "markAsPaid",
      args: [BigInt(escrowId)],
    });
  };

  return { markAsPaid, isPending, data, error };
}
