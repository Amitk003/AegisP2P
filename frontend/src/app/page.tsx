"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { CreateEscrowForm } from "@/components/escrow/CreateEscrowForm";
import { EscrowList } from "@/components/escrow/EscrowList";
import { EscrowData } from "@/types/escrow";

const MOCK_ESCOW: EscrowData = {
  escrowId: 0,
  seller: "0x1234567890abcdef1234567890abcdef12345678",
  buyer: "0xabcdef1234567890abcdef1234567890abcdef12",
  amount: BigInt("1000000000000000000"),
  fiatAmount: "100.00",
  recipient: "seller@stripe",
  refId: "INV-001",
  paymentRef: "aegis-0",
  state: 0,
  createdAt: Math.floor(Date.now() / 1000) - 3000,
  paidAt: 0,
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              New Escrow
            </h2>
            <CreateEscrowForm
              onSubmit={(data) => {
                console.log("Create escrow:", data);
              }}
            />
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Active Escrows
            </h2>
            <EscrowList escrows={[MOCK_ESCOW]} />
          </div>
        </div>
      </main>
    </div>
  );
}
