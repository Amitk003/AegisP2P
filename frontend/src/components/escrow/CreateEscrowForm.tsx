"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface CreateEscrowFormProps {
  onSubmit: (data: {
    buyer: string;
    cryptoAmount: string;
    fiatAmount: string;
    recipient: string;
    refId: string;
  }) => void;
  pending?: boolean;
}

function validateAddress(v: string): string | null {
  if (!v) return "Required";
  if (!/^0x[a-fA-F0-9]{40}$/.test(v)) return "Invalid address (must be 0x + 40 hex chars)";
  if (!isAddress(v)) return "Invalid checksum address";
  return null;
}

function validatePositiveNumber(v: string, label: string): string | null {
  if (!v) return "Required";
  if (isNaN(Number(v)) || Number(v) <= 0) return `${label} must be positive`;
  return null;
}

type FieldErrors = {
  buyer?: string | null;
  cryptoAmount?: string | null;
  fiatAmount?: string | null;
  recipient?: string | null;
  refId?: string | null;
};

export function CreateEscrowForm({ onSubmit, pending }: CreateEscrowFormProps) {
  const [buyer, setBuyer] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [refId, setRefId] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validate(): FieldErrors {
    return {
      buyer: validateAddress(buyer),
      cryptoAmount: validatePositiveNumber(cryptoAmount, "Crypto amount"),
      fiatAmount: validatePositiveNumber(fiatAmount, "Fiat amount"),
      recipient: !recipient ? "Required" : null,
      refId: !refId ? "Required" : null,
    };
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allErrors = validate();
    setErrors(allErrors);
    setTouched({ buyer: true, cryptoAmount: true, fiatAmount: true, recipient: true, refId: true });
    const hasError = Object.values(allErrors).some(Boolean);
    if (hasError) return;
    onSubmit({ buyer, cryptoAmount, fiatAmount, recipient, refId });
  }

  function fieldClass(field: string) {
    const hasError = touched[field] && errors[field as keyof FieldErrors];
    return `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      hasError
        ? "border-red-300 focus:border-red-500"
        : "border-zinc-300 focus:border-blue-500"
    }`;
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
            onChange={(e) => { setBuyer(e.target.value); setErrors(validate()); }}
            onBlur={() => handleBlur("buyer")}
            placeholder="0x..."
            className={fieldClass("buyer")}
            required
          />
          {touched.buyer && errors.buyer && (
            <p className="text-xs text-red-500 mt-1">{errors.buyer}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Crypto Amount (MON)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={cryptoAmount}
            onChange={(e) => { setCryptoAmount(e.target.value); setErrors(validate()); }}
            onBlur={() => handleBlur("cryptoAmount")}
            placeholder="1.0"
            className={fieldClass("cryptoAmount")}
            required
          />
          {touched.cryptoAmount && errors.cryptoAmount && (
            <p className="text-xs text-red-500 mt-1">{errors.cryptoAmount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Fiat Amount (USD)
          </label>
          <input
            type="text"
            value={fiatAmount}
            onChange={(e) => { setFiatAmount(e.target.value); setErrors(validate()); }}
            onBlur={() => handleBlur("fiatAmount")}
            placeholder="100.00"
            className={fieldClass("fiatAmount")}
            required
          />
          {touched.fiatAmount && errors.fiatAmount && (
            <p className="text-xs text-red-500 mt-1">{errors.fiatAmount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Recipient (Stripe account / UPI ID)
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => { setRecipient(e.target.value); setErrors(validate()); }}
            onBlur={() => handleBlur("recipient")}
            placeholder="seller@stripe or upi@bank"
            className={fieldClass("recipient")}
            required
          />
          {touched.recipient && errors.recipient && (
            <p className="text-xs text-red-500 mt-1">{errors.recipient}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Reference ID
          </label>
          <input
            type="text"
            value={refId}
            onChange={(e) => { setRefId(e.target.value); setErrors(validate()); }}
            onBlur={() => handleBlur("refId")}
            placeholder="Invoice or order number"
            className={fieldClass("refId")}
            required
          />
          {touched.refId && errors.refId && (
            <p className="text-xs text-red-500 mt-1">{errors.refId}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-zinc-900 text-white text-sm font-medium py-2.5 hover:bg-zinc-800 transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {pending && <LoadingSpinner size={14} />}
          {pending ? "Creating..." : "Lock Crypto & Create Escrow"}
        </button>
      </form>
    </div>
  );
}
