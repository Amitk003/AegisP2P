export type ToastData = { message: string; type: "success" | "error" } | null;

interface ToastProps {
  toast: ToastData;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all z-50 flex items-center gap-3 ${
        toast.type === "success"
          ? "bg-emerald-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      <span>{toast.message}</span>
    </div>
  );
}
