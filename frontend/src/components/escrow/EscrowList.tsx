"use client";

import { EscrowData } from "@/types/escrow";
import { EscrowCard } from "./EscrowCard";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface EscrowListProps {
  escrows: EscrowData[];
  loading?: boolean;
  currentUser?: string;
  onMarkAsPaid?: (escrowId: number) => void;
  onVerify?: (escrowId: number) => void;
  onRefund?: (escrowId: number) => void;
  markPending?: boolean;
  verifyPending?: boolean;
  refundPending?: boolean;
}

export function EscrowList({
  escrows,
  loading,
  currentUser,
  onMarkAsPaid,
  onVerify,
  onRefund,
  markPending,
  verifyPending,
  refundPending,
}: EscrowListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
        <LoadingSpinner size={24} className="mb-3 text-zinc-300" />
        <span className="text-sm">Loading escrows...</span>
      </div>
    );
  }

  if (escrows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
        <svg className="w-10 h-10 mb-3 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
        <span className="text-sm">No escrows yet. Create one to get started.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {escrows.map((escrow) => {
        const isBuyer =
          currentUser?.toLowerCase() === escrow.buyer.toLowerCase();
        const isSeller =
          currentUser?.toLowerCase() === escrow.seller.toLowerCase();

        return (
          <EscrowCard
            key={escrow.escrowId}
            escrow={escrow}
            onMarkAsPaid={isBuyer ? onMarkAsPaid : undefined}
            onVerify={isSeller ? onVerify : undefined}
            onRefund={isSeller ? onRefund : undefined}
            markPending={markPending}
            verifyPending={verifyPending}
            refundPending={refundPending}
          />
        );
      })}
    </div>
  );
}
