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

export function useMarkAsPaid() {
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

export function useVerifyRelease() {
  const { writeContractAsync, isPending, data, error } = useWriteContract();

  const verifyRelease = async (escrowId: number, proof: `0x${string}`) => {
    return writeContractAsync({
      address: ESCROW_ADDRESS,
      abi: AEGIS_ESCROW_ABI,
      functionName: "verifyFiatAndRelease",
      args: [BigInt(escrowId), proof],
    });
  };

  return { verifyRelease, isPending, data, error };
}

export function useRefundEscrow() {
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
