"use client";

import { useWriteContract } from "wagmi";
import { AEGIS_ESCROW_ABI, ESCROW_ADDRESS } from "@/lib/contract";

export function useRefund() {
  const { writeContractAsync, isPending, data, error } = useWriteContract();

  const refund = async (escrowId: number) => {
    return writeContractAsync({
      address: ESCROW_ADDRESS,
      abi: AEGIS_ESCROW_ABI,
      functionName: "refund",
      args: [BigInt(escrowId)],
    });
  };

  return { refund, isPending, data, error };
}
