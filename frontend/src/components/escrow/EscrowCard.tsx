"use client";

import { EscrowData, EscrowState } from "@/types/escrow";
import { StateBadge } from "./StateBadge";
import { TimerDisplay } from "./TimerDisplay";

interface EscrowCardProps {
  escrow: EscrowData;
  onMarkAsPaid?: (escrowId: number) => void;
  onVerify?: (escrowId: number) => void;
  onRefund?: (escrowId: number) => void;
}

export function EscrowCard({
  escrow,
  onMarkAsPaid,
  onVerify,
  onRefund,
}: EscrowCardProps) {
  const isBuyerAction =
    escrow.state === EscrowState.Funded && onMarkAsPaid;
  const isVerifyAction =
    escrow.state === EscrowState.AwaitingProof && onVerify;
  const isRefundAction = onRefund;

  return (
    <div className="rounded-xl border border-zinc-200 p-5 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-zinc-500">Escrow #{escrow.escrowId}</p>
          <p className="text-lg font-semibold text-zinc-900 mt-0.5">
            {escrow.fiatAmount} USD
          </p>
        </div>
        <StateBadge state={escrow.state} />
      </div>

      <div className="space-y-2 text-sm text-zinc-600 mb-4">
        <div className="flex justify-between">
          <span>Recipient</span>
          <span className="text-zinc-900 font-mono text-xs">
            {escrow.recipient}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Reference</span>
          <span className="text-zinc-900">{escrow.refId}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment Ref</span>
          <span className="text-zinc-900 font-mono text-xs">
            {escrow.paymentRef}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Buyer</span>
          <span className="text-zinc-900 font-mono text-xs">
            {escrow.buyer.slice(0, 6)}...{escrow.buyer.slice(-4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Seller</span>
          <span className="text-zinc-900 font-mono text-xs">
            {escrow.seller.slice(0, 6)}...{escrow.seller.slice(-4)}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <TimerDisplay
          state={escrow.state}
          createdAt={escrow.createdAt}
          paidAt={escrow.paidAt}
        />
      </div>

      <div className="flex gap-2">
        {isBuyerAction && (
          <button
            onClick={() => onMarkAsPaid(escrow.escrowId)}
            className="flex-1 rounded-lg bg-blue-600 text-white text-sm font-medium py-2 hover:bg-blue-700 transition-colors"
          >
            Mark as Paid
          </button>
        )}
        {isVerifyAction && (
          <button
            onClick={() => onVerify(escrow.escrowId)}
            className="flex-1 rounded-lg bg-emerald-600 text-white text-sm font-medium py-2 hover:bg-emerald-700 transition-colors"
          >
            Verify & Release
          </button>
        )}
        {isRefundAction && (
          <button
            onClick={() => onRefund(escrow.escrowId)}
            className="flex-1 rounded-lg border border-zinc-300 text-zinc-700 text-sm font-medium py-2 hover:bg-zinc-50 transition-colors"
          >
            Refund
          </button>
        )}
      </div>
    </div>
  );
}
