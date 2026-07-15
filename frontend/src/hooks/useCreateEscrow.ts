"use client";

import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { AEGIS_ESCROW_ABI, ESCROW_ADDRESS } from "@/lib/contract";

export function useCreateEscrow() {
  const { writeContractAsync, isPending, data, error } = useWriteContract();

  const createEscrow = async (
    buyer: string,
    cryptoAmount: string,
    fiatAmount: string,
    recipient: string,
    refId: string
  ) => {
    return writeContractAsync({
      address: ESCROW_ADDRESS,
      abi: AEGIS_ESCROW_ABI,
      functionName: "createEscrow",
      args: [buyer as `0x${string}`, fiatAmount, recipient, refId],
      value: parseEther(cryptoAmount),
    });
  };

  return { createEscrow, isPending, data, error };
}
