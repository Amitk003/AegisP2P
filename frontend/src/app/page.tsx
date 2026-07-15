"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { Header } from "@/components/layout/Header";
import { CreateEscrowForm } from "@/components/escrow/CreateEscrowForm";
import { EscrowList } from "@/components/escrow/EscrowList";
import { NotConnectedState } from "@/components/home/NotConnectedState";
import { Toast } from "@/components/ui/Toast";
import { useEscrows } from "@/hooks/useEscrows";
import { useCreateEscrow } from "@/hooks/useCreateEscrow";
import { useMarkPaid } from "@/hooks/useMarkPaid";
import { useVerifyRelease } from "@/hooks/useVerifyRelease";
import { useRefund } from "@/hooks/useRefund";

import type { ToastData } from "@/components/ui/Toast";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<ToastData>(null);
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
        {!isConnected && <NotConnectedState />}

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

      <Toast toast={toast} />
    </div>
  );
}
