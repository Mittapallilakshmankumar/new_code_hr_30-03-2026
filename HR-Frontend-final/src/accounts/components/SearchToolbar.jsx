export default function SearchToolbar({
  title,
  subtitle,
  search,
  setSearch,
  placeholder = "Search...",
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 px-6 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          ) : null}
        </div>

        <div className="w-full xl:w-[320px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-900"
          />
        </div>
      </div>
    </div>
  );
}
