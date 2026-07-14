"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex flex-col flex-1 items-center bg-white min-h-screen">
        <header className="w-full flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <h1 className="text-xl font-semibold text-zinc-900">AegisP2P</h1>
          <div className="h-10 w-32 rounded-full bg-zinc-100 animate-pulse" />
        </header>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-white min-h-screen">
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-zinc-200">
        <h1 className="text-xl font-semibold text-zinc-900">AegisP2P</h1>
        <ConnectButton />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center w-full max-w-2xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-zinc-900 mb-3">
            Secure P2P Escrow
          </h2>
          <p className="text-zinc-600 text-lg">
            ZK-verified fiat payments on Monad
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <div className="rounded-xl border border-zinc-200 p-6 text-center">
            <h3 className="font-medium text-zinc-900 mb-2">Sell Crypto</h3>
            <p className="text-sm text-zinc-500 mb-4">
              Lock your crypto in escrow and receive fiat safely
            </p>
            <span className="text-xs text-zinc-400">Connect wallet to start</span>
          </div>

          <div className="rounded-xl border border-zinc-200 p-6 text-center">
            <h3 className="font-medium text-zinc-900 mb-2">Buy Crypto</h3>
            <p className="text-sm text-zinc-500 mb-4">
              Pay with fiat and get your crypto released instantly
            </p>
            <span className="text-xs text-zinc-400">Connect wallet to start</span>
          </div>
        </div>
      </main>
    </div>
  );
}
