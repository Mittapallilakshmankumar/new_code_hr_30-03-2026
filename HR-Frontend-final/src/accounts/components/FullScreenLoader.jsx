export default function FullScreenLoader({ text = "Processing..." }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 px-4 backdrop-blur-[1px] transition-opacity duration-200"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="flex min-w-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-6 py-5 text-center shadow-xl">
        <div
          className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"
          aria-label="Loading"
        />
        <p className="text-sm font-medium text-slate-700">{text}</p>
      </div>
    </div>
  );
}
