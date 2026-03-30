import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/constants";
import StatusBadge from "./StatusBadge";

function getExpenseId(row) {
  return row.reference || row.id;
}

function getAdvanceReference(row) {
  return row.advance_details?.reference || row.advanceId || row.advance?.reference || "-";
}

function getMakerName(row) {
  return row.maker_details?.full_name || row.maker || "-";
}

function getCreatedDate(row) {
  return row.created_at ? row.created_at.slice(0, 10) : row.createdAt || "-";
}

function getAdvanceRowId(row) {
  return row.reference || row.id;
}

function getAdvanceMaker(row) {
  return row.maker_details?.full_name || row.maker || "-";
}

function EmptyState({
  title = "No records found",
  subtitle = "Try changing the filters or search term.",
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
      <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function ExpenseRows({ data }) {
  return data.map((row) => (
    <tr key={row.id} className="border-t border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 font-medium text-gray-800">{getExpenseId(row)}</td>
      <td className="px-6 py-4 text-gray-700">{getAdvanceReference(row)}</td>
      <td className="px-6 py-4 text-gray-700">{row.payable_to || row.payableTo}</td>
      <td className="px-6 py-4 text-gray-700">{getMakerName(row)}</td>
      <td className="px-6 py-4 font-medium text-gray-800">
        {formatCurrency(row.amount)}
      </td>
      <td className="px-6 py-4 text-gray-700">{getCreatedDate(row)}</td>
      <td className="px-6 py-4">
        <StatusBadge status={row.status} />
      </td>
      <td className="px-6 py-4">
        <Link
          to={`/expenses/${row.id}`}
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 hover:shadow-md"
        >
          View
        </Link>
      </td>
    </tr>
  ));
}

function AdvanceRows({ data }) {
  return data.map((row) => (
    <tr key={row.id} className="border-t border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 font-medium text-gray-800">{getAdvanceRowId(row)}</td>
      <td className="px-6 py-4 text-gray-700">{getAdvanceMaker(row)}</td>
      <td className="px-6 py-4 font-medium text-gray-800">
        {formatCurrency(row.total_amount ?? row.totalAmount)}
      </td>
      <td className="px-6 py-4 font-medium text-gray-800">
        {formatCurrency(row.spent_amount ?? row.spentAmount)}
      </td>
      <td className="px-6 py-4 font-medium text-gray-800">
        {formatCurrency(row.balance_amount ?? row.balanceAmount)}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={row.status} />
      </td>
      <td className="px-6 py-4">
        <Link
          to={`/advances/${row.id}`}
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 hover:shadow-md"
        >
          View
        </Link>
      </td>
    </tr>
  ));
}

export default function ExpenseTable({
  data,
  type = "expense",
  emptyTitle,
  emptySubtitle,
}) {
  if (!data.length) {
    return <EmptyState title={emptyTitle} subtitle={emptySubtitle} />;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            {type === "advance" ? (
              <tr>
                <th className="px-6 py-4 font-semibold">Advance ID</th>
                <th className="px-6 py-4 font-semibold">Maker</th>
                <th className="px-6 py-4 font-semibold">Total Advance</th>
                <th className="px-6 py-4 font-semibold">Total Spent</th>
                <th className="px-6 py-4 font-semibold">Remaining Balance</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            ) : (
              <tr>
                <th className="px-6 py-4 font-semibold">Expense ID</th>
                <th className="px-6 py-4 font-semibold">Advance ID</th>
                <th className="px-6 py-4 font-semibold">Payable To</th>
                <th className="px-6 py-4 font-semibold">Maker</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Created On</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            )}
          </thead>
          <tbody>{type === "advance" ? <AdvanceRows data={data} /> : <ExpenseRows data={data} />}</tbody>
        </table>
      </div>
    </div>
  );
}
