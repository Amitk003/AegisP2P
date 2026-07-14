import { EscrowState } from "@/types/escrow";

const stateConfig: Record<EscrowState, { label: string; classes: string }> = {
  [EscrowState.Funded]: {
    label: "Funded",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },
  [EscrowState.AwaitingProof]: {
    label: "Awaiting Proof",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  [EscrowState.Verified]: {
    label: "Verified",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  [EscrowState.Refunded]: {
    label: "Refunded",
    classes: "bg-zinc-50 text-zinc-500 border-zinc-200",
  },
};

export function StateBadge({ state }: { state: EscrowState }) {
  const config = stateConfig[state];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
