export default function PageHero({
  title,
  subtitle,
  badge,
  badgeColor = "blue",
  actions,
}) {
  const badgeStyles = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    cyan: "bg-cyan-50 text-cyan-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {badge ? (
            <div
              className={`rounded-lg px-4 py-3 text-sm font-medium ${
                badgeStyles[badgeColor] || badgeStyles.blue
              }`}
            >
              {badge}
            </div>
          ) : null}

          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}
