"use client";

import { useState } from "react";

interface CreateEscrowFormProps {
  onSubmit: (data: {
    buyer: string;
    fiatAmount: string;
    recipient: string;
    refId: string;
  }) => void;
}

export function CreateEscrowForm({ onSubmit }: CreateEscrowFormProps) {
  const [buyer, setBuyer] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [refId, setRefId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ buyer, fiatAmount, recipient, refId });
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-6 bg-white">
      <h3 className="text-lg font-semibold text-zinc-900 mb-4">
        Create Escrow
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Buyer Address
          </label>
          <input
            type="text"
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Fiat Amount (USD)
          </label>
          <input
            type="text"
            value={fiatAmount}
            onChange={(e) => setFiatAmount(e.target.value)}
            placeholder="100.00"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Recipient (Stripe account / UPI ID)
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="seller@stripe or upi@bank"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Reference ID
          </label>
          <input
            type="text"
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
            placeholder="Invoice or order number"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 text-white text-sm font-medium py-2.5 hover:bg-zinc-800 transition-colors"
        >
          Lock Crypto & Create Escrow
        </button>
      </form>
    </div>
  );
}
