export function NotConnectedState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
      <svg className="w-12 h-12 mb-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      <p className="text-sm font-medium">Connect your wallet</p>
      <p className="text-xs text-zinc-400 mt-1">to create and manage escrows</p>
    </div>
  );
}
