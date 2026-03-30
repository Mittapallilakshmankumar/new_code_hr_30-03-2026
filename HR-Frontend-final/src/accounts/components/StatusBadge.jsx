const badgeStyles = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PARTIALLY_USED: "bg-amber-100 text-amber-700",
  EXHAUSTED: "bg-rose-100 text-rose-700",
  CLOSED: "bg-slate-200 text-slate-700",
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-amber-100 text-amber-700",
  REVIEWED: "bg-indigo-100 text-indigo-700",
  APPROVED: "bg-blue-100 text-blue-700",
  BILL_SUBMITTED: "bg-cyan-100 text-cyan-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        badgeStyles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
