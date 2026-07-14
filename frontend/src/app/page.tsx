"use client";

import { useEffect, useState } from "react";
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
import { EscrowData } from "@/types/escrow";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
      await createEscrow(data.buyer, data.cryptoAmount, data.fiatAmount, data.recipient, data.refId);
    } catch (err) {
      console.error("Create escrow failed:", err);
    }
  }

  async function handleMarkAsPaid(escrowId: number) {
    try {
      await markAsPaid(escrowId);
    } catch (err) {
      console.error("Mark as paid failed:", err);
    }
  }

  async function handleVerify(escrowId: number) {
    try {
      const proof = prompt("Paste ABI-encoded proof (hex):") as `0x${string}`;
      if (proof) {
        await verifyRelease(escrowId, proof);
      }
    } catch (err) {
      console.error("Verify & release failed:", err);
    }
  }

  async function handleRefund(escrowId: number) {
    try {
      await refund(escrowId);
    } catch (err) {
      console.error("Refund failed:", err);
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
    </div>
  );
}
