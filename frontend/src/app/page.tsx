"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { Header } from "@/components/layout/Header";
import { CreateEscrowForm } from "@/components/escrow/CreateEscrowForm";
import { EscrowList } from "@/components/escrow/EscrowList";
import { useEscrows } from "@/hooks/useEscrows";
import { useCreateEscrow } from "@/hooks/useCreateEscrow";
import { useMarkPaid } from "@/hooks/useMarkPaid";
import { useVerifyRelease } from "@/hooks/useVerifyRelease";
import { useRefund } from "@/hooks/useRefund";

type Toast = { message: string; type: "success" | "error" } | null;

const TX_URL = "https://testnet.monadexplorer.com/tx";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [creatingFormData, setCreatingFormData] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  const { address, isConnected } = useAccount();
  const { escrows, loading } = useEscrows();
  const { createEscrow, isPending: isCreating } = useCreateEscrow();
  const { markAsPaid, isPending: isMarking } = useMarkPaid();
  const { verifyRelease, isPending: isVerifying } = useVerifyRelease();
  const { refund, isPending: isRefunding } = useRefund();

  async function handleCreate(data: {
    buyer: string;
    cryptoAmount: string;
    fiatAmount: string;
    recipient: string;
    refId: string;
  }) {
    setCreatingFormData(true);
    try {
      const tx = await createEscrow(data.buyer, data.cryptoAmount, data.fiatAmount, data.recipient, data.refId);
      showToast(`Escrow created!`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Create escrow failed", "error");
    } finally {
      setCreatingFormData(false);
    }
  }

  async function handleMarkAsPaid(escrowId: number) {
    try {
      await markAsPaid(escrowId);
      showToast(`Payment marked!`, "success");
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
      await verifyRelease(escrowId, escrow);
      showToast(`Funds released!`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Verify & release failed", "error");
    }
  }

  async function handleRefund(escrowId: number) {
    try {
      await refund(escrowId);
      showToast(`Escrow refunded!`, "success");
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
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <svg className="w-12 h-12 mb-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="text-sm font-medium">Connect your wallet</p>
            <p className="text-xs text-zinc-400 mt-1">to create and manage escrows</p>
          </div>
        )}

        {isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">
                New Escrow
              </h2>
              <CreateEscrowForm
                onSubmit={handleCreate}
                pending={isCreating || creatingFormData}
              />
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
                markPending={isMarking}
                verifyPending={isVerifying}
                refundPending={isRefunding}
              />
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all z-50 flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
