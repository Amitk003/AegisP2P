"use client";

import { EscrowData } from "@/types/escrow";
import { EscrowCard } from "./EscrowCard";

interface EscrowListProps {
  escrows: EscrowData[];
  onMarkAsPaid?: (escrowId: number) => void;
  onVerify?: (escrowId: number) => void;
  onRefund?: (escrowId: number) => void;
}

export function EscrowList({
  escrows,
  onMarkAsPaid,
  onVerify,
  onRefund,
}: EscrowListProps) {
  if (escrows.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 text-sm">
        No escrows yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {escrows.map((escrow) => (
        <EscrowCard
          key={escrow.escrowId}
          escrow={escrow}
          onMarkAsPaid={onMarkAsPaid}
          onVerify={onVerify}
          onRefund={onRefund}
        />
      ))}
    </div>
  );
}
