"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { Header } from "@/components/layout/Header";
import { CreateEscrowForm } from "@/components/escrow/CreateEscrowForm";
import { EscrowList } from "@/components/escrow/EscrowList";
import { useEscrows } from "@/hooks/useEscrows";
import {
  useCreateEscrow,
  useMarkAsPaid,
  useVerifyRelease,
  useRefundEscrow,
} from "@/hooks/useContractActions";
import { ESCROW_ADDRESS } from "@/lib/contract";
import { buildDemoProof } from "@/lib/demoProof";
import { EscrowData } from "@/types/escrow";

type Toast = { message: string; type: "success" | "error" } | null;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  const { address, isConnected } = useAccount();
  const { escrows, loading } = useEscrows();
  const { createEscrow, isPending: isCreating } = useCreateEscrow();
  const { markAsPaid, isPending: isMarking } = useMarkAsPaid();
  const { verifyRelease, isPending: isVerifying } = useVerifyRelease();
  const { refund, isPending: isRefunding } = useRefundEscrow();

  async function handleCreate(data: {
    buyer: string;
    cryptoAmount: string;
    fiatAmount: string;
    recipient: string;
    refId: string;
  }) {
    try {
      const tx = await createEscrow(data.buyer, data.cryptoAmount, data.fiatAmount, data.recipient, data.refId);
      showToast(`Escrow created! Tx: ${tx.slice(0, 10)}...`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Create escrow failed", "error");
    }
  }

  async function handleMarkAsPaid(escrowId: number) {
    try {
      const tx = await markAsPaid(escrowId);
      showToast(`Payment marked! Tx: ${tx.slice(0, 10)}...`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Mark as paid failed", "error");
    }
  }

  async function handleVerify(escrowId: number) {
    try {
      const escrow = escrows.find((e) => e.escrowId === escrowId);
      if (!escrow) {
        showToast("Escrow data not found", "error");
        return;
      }
      const proof = buildDemoProof(
        escrowId,
        ESCROW_ADDRESS,
        escrow.fiatAmount,
        escrow.recipient,
        escrow.refId,
        escrow.paymentRef
      );
      const tx = await verifyRelease(escrowId, proof);
      showToast(`Funds released! Tx: ${tx.slice(0, 10)}...`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Verify & release failed", "error");
    }
  }

  async function handleRefund(escrowId: number) {
    try {
      const tx = await refund(escrowId);
      showToast(`Escrow refunded! Tx: ${tx.slice(0, 10)}...`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Refund failed", "error");
    }
  }

  if (!mounted) {
    return (
      <div className="flex flex-col flex-1 items-center bg-white min-h-screen">
        <Header />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 min-h-screen">
      <Header />

      <main className="w-full max-w-5xl px-6 py-8">
        {!isConnected && (
          <div className="text-center py-12 text-zinc-500">
            Connect your wallet to create and manage escrows
          </div>
        )}

        {isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">
                New Escrow
              </h2>
              <CreateEscrowForm onSubmit={handleCreate} />
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">
                Active Escrows
              </h2>
              <EscrowList
                escrows={escrows}
                loading={loading}
                currentUser={address}
                onMarkAsPaid={handleMarkAsPaid}
                onVerify={handleVerify}
                onRefund={handleRefund}
                actionPending={isCreating || isMarking || isVerifying || isRefunding}
              />
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all z-50 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
