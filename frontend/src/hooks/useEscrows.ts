"use client";

import { useEffect, useState, useCallback } from "react";
import { useReadContracts, useWatchContractEvent } from "wagmi";
import { AEGIS_ESCROW_ABI, ESCROW_ADDRESS } from "@/lib/contract";
import { EscrowData, EscrowState } from "@/types/escrow";

function parseEscrow(raw: unknown, escrowId: number): EscrowData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const exists = r.exists as boolean;
  if (!exists) return null;

  const stateValue = Number(r.state);
  const state = stateValue >= 0 && stateValue <= 3 ? (stateValue as EscrowState) : EscrowState.Funded;

  return {
    escrowId,
    seller: r.seller as string,
    buyer: r.buyer as string,
    amount: BigInt(r.amount as string),
    fiatAmount: r.fiatAmount as string,
    recipient: r.recipient as string,
    refId: r.refId as string,
    paymentRef: r.paymentRef as string,
    state,
    createdAt: Number(r.createdAt),
    paidAt: Number(r.paidAt),
  };
}

export function useEscrows() {
  const [escrows, setEscrows] = useState<EscrowData[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: nextEscrowIdResult } = useReadContracts({
    contracts: [
      {
        address: ESCROW_ADDRESS,
        abi: AEGIS_ESCROW_ABI,
        functionName: "nextEscrowId",
      },
    ],
  });

  const nextEscrowId = nextEscrowIdResult?.[0]?.result
    ? Number(nextEscrowIdResult[0].result)
    : 0;

  const escrowReads = Array.from({ length: nextEscrowId }, (_, i) => ({
    address: ESCROW_ADDRESS,
    abi: AEGIS_ESCROW_ABI,
    functionName: "escrows" as const,
    args: [BigInt(i)] as const,
  }));

  const { data: escrowResults } = useReadContracts({
    contracts: escrowReads.length > 0 ? escrowReads : undefined,
  });

  useEffect(() => {
    if (!escrowResults) return;
    const parsed: EscrowData[] = [];
    for (let i = 0; i < escrowResults.length; i++) {
      const result = escrowResults[i].result;
      const e = parseEscrow(result, i);
      if (e) parsed.push(e);
    }
    setEscrows(parsed);
    setLoading(false);
  }, [escrowResults]);

  const updateEscrow = useCallback((escrowId: number, updater: (e: EscrowData) => EscrowData) => {
    setEscrows((prev) => prev.map((e) => (e.escrowId === escrowId ? updater(e) : e)));
  }, []);

  const addEscrow = useCallback((escrow: EscrowData) => {
    setEscrows((prev) => {
      if (prev.some((e) => e.escrowId === escrow.escrowId)) return prev;
      return [...prev, escrow];
    });
  }, []);

  useWatchContractEvent({
    address: ESCROW_ADDRESS,
    abi: AEGIS_ESCROW_ABI,
    eventName: "EscrowFunded",
    onLogs(logs) {
      for (const log of logs) {
        const args = log.args;
        if (!args || !args.escrowId) continue;
        const escrowId = Number(args.escrowId);
        const seller = args.seller as string;
        const buyer = args.buyer as string;
        const amount = (args.amount as bigint) ?? BigInt(0);
        const fiatAmount = (args.fiatAmount as string) ?? "";
        const recipient = (args.recipient as string) ?? "";
        const refId = (args.refId as string) ?? "";
        const paymentRef = (args.paymentRef as string) ?? "";

        addEscrow({
          escrowId,
          seller,
          buyer,
          amount,
          fiatAmount,
          recipient,
          refId,
          paymentRef,
          state: EscrowState.Funded,
          createdAt: Math.floor(Date.now() / 1000),
          paidAt: 0,
        });
      }
    },
  });

  useWatchContractEvent({
    address: ESCROW_ADDRESS,
    abi: AEGIS_ESCROW_ABI,
    eventName: "PaymentMarked",
    onLogs(logs) {
      for (const log of logs) {
        const args = log.args;
        if (!args || !args.escrowId) continue;
        updateEscrow(Number(args.escrowId), (e) => ({
          ...e,
          state: EscrowState.AwaitingProof,
          paidAt: Math.floor(Date.now() / 1000),
        }));
      }
    },
  });

  useWatchContractEvent({
    address: ESCROW_ADDRESS,
    abi: AEGIS_ESCROW_ABI,
    eventName: "FiatVerified",
    onLogs(logs) {
      for (const log of logs) {
        const args = log.args;
        if (!args || !args.escrowId) continue;
        updateEscrow(Number(args.escrowId), (e) => ({
          ...e,
          state: EscrowState.Verified,
        }));
      }
    },
  });

  useWatchContractEvent({
    address: ESCROW_ADDRESS,
    abi: AEGIS_ESCROW_ABI,
    eventName: "EscrowRefunded",
    onLogs(logs) {
      for (const log of logs) {
        const args = log.args;
        if (!args || !args.escrowId) continue;
        updateEscrow(Number(args.escrowId), (e) => ({
          ...e,
          state: EscrowState.Refunded,
        }));
      }
    },
  });

  return { escrows, loading, refetch: () => setLoading(true) };
}
