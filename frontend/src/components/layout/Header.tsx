"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
      <h1 className="text-xl font-semibold text-zinc-900">AegisP2P</h1>
      <ConnectButton />
    </header>
  );
}
