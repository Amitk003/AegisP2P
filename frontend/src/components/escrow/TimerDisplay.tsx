"use client";

import { useEffect, useState } from "react";
import { EscrowState } from "@/types/escrow";

interface TimerDisplayProps {
  state: EscrowState;
  createdAt: number;
  paidAt: number;
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return "Ready for refund";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

const TIMEOUT_DURATION = 2 * 60 * 60;

export function TimerDisplay({ state, createdAt, paidAt }: TimerDisplayProps) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    function calculate() {
      if (state === EscrowState.Funded) {
        const deadline = createdAt + TIMEOUT_DURATION;
        setRemaining(Math.max(0, deadline - Math.floor(Date.now() / 1000)));
      } else if (state === EscrowState.AwaitingProof) {
        const deadline = paidAt + TIMEOUT_DURATION;
        setRemaining(Math.max(0, deadline - Math.floor(Date.now() / 1000)));
      } else {
        setRemaining(0);
      }
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [state, createdAt, paidAt]);

  if (state !== EscrowState.Funded && state !== EscrowState.AwaitingProof) {
    return null;
  }

  return (
    <span className="text-xs text-zinc-500 tabular-nums">
      {remaining > 0
        ? `Refund in ${formatTime(remaining)}`
        : "Refund available now"}
    </span>
  );
}
