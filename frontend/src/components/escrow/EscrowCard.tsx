"use client";

import { useEffect, useState } from "react";
import { EscrowData, EscrowState } from "@/types/escrow";
import { StateBadge } from "./StateBadge";
import { TimerDisplay } from "./TimerDisplay";

const TIMEOUT_DURATION = 2 * 60 * 60;

interface EscrowCardProps {
  escrow: EscrowData;
  onMarkAsPaid?: (escrowId: number) => void;
  onVerify?: (escrowId: number) => void;
  onRefund?: (escrowId: number) => void;
  disabled?: boolean;
}

export function EscrowCard({
  escrow,
  onMarkAsPaid,
  onVerify,
  onRefund,
  disabled,
}: EscrowCardProps) {
  const [isRefundable, setIsRefundable] = useState(false);

  useEffect(() => {
    function check() {
      const now = Math.floor(Date.now() / 1000);
      const isFundedExpired =
        escrow.state === EscrowState.Funded &&
        now >= escrow.createdAt + TIMEOUT_DURATION;
      const isAwaitingExpired =
        escrow.state === EscrowState.AwaitingProof &&
        now >= escrow.paidAt + TIMEOUT_DURATION;
      setIsRefundable(isFundedExpired || isAwaitingExpired);
    }
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [escrow]);

  const isBuyerAction =
    escrow.state === EscrowState.Funded && onMarkAsPaid;
  const isVerifyAction =
    escrow.state === EscrowState.AwaitingProof && onVerify;
  const isRefundAction =
    onRefund &&
    (escrow.state === EscrowState.Funded ||
      escrow.state === EscrowState.AwaitingProof);

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
          <span>Crypto Locked</span>
          <span className="text-zinc-900">
            {escrow.amount.toString()} MON
          </span>
        </div>
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
            disabled={disabled}
            className={`flex-1 rounded-lg text-sm font-medium py-2 transition-colors ${
              disabled
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Mark as Paid
          </button>
        )}
        {isVerifyAction && (
          <button
            onClick={() => onVerify(escrow.escrowId)}
            disabled={disabled}
            className={`flex-1 rounded-lg text-sm font-medium py-2 transition-colors ${
              disabled
                ? "bg-emerald-300 text-white cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            Verify & Release
          </button>
        )}
        {isRefundAction && (
          <button
            onClick={() => onRefund(escrow.escrowId)}
            disabled={disabled || !isRefundable}
            className={`flex-1 rounded-lg border text-sm font-medium py-2 transition-colors ${
              disabled || !isRefundable
                ? "border-zinc-200 text-zinc-400 cursor-not-allowed"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Refund
          </button>
        )}
      </div>
    </div>
  );
}
