export default function SummaryCard({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="mt-3 text-3xl font-semibold text-gray-800">{value}</h3>
    </div>
  );
}
