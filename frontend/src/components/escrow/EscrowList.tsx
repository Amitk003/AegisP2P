"use client";

import { EscrowData } from "@/types/escrow";
import { EscrowCard } from "./EscrowCard";

interface EscrowListProps {
  escrows: EscrowData[];
  loading?: boolean;
  currentUser?: string;
  onMarkAsPaid?: (escrowId: number) => void;
  onVerify?: (escrowId: number) => void;
  onRefund?: (escrowId: number) => void;
  actionPending?: boolean;
}

export function EscrowList({
  escrows,
  loading,
  currentUser,
  onMarkAsPaid,
  onVerify,
  onRefund,
  actionPending,
}: EscrowListProps) {
  if (loading) {
    return (
      <div className="text-center py-12 text-zinc-400 text-sm">
        Loading escrows...
      </div>
    );
  }

  if (escrows.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 text-sm">
        No escrows yet. Create one to get started.
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
            disabled={actionPending}
          />
        );
      })}
    </div>
  );
}
