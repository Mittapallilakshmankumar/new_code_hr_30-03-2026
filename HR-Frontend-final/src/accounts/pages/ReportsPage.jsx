import { useEffect, useState } from "react";
import { getReportsSummary } from "../api/dashboardApi";
import { listExpenses } from "../api/expenseApi";
import ContentCard from "../components/ContentCard";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import ExpenseTable from "../components/ExpenseTable";
import SummaryCard from "../components/SummaryCard";
import { ROLES, formatCurrency } from "../utils/constants";
import { useAuth } from "../utils/session";

function MakerBalancesTable({ rows }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Maker</th>
              <th className="px-6 py-4 font-semibold">Total Advance</th>
              <th className="px-6 py-4 font-semibold">Total Spent</th>
              <th className="px-6 py-4 font-semibold">Remaining Balance</th>
              <th className="px-6 py-4 font-semibold">Active Advances</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.maker_id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{row.maker_name}</td>
                <td className="px-6 py-4 font-medium text-gray-800">
                  {formatCurrency(row.total_advance)}
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">
                  {formatCurrency(row.total_spent)}
                </td>
                <td className="px-6 py-4 font-medium text-blue-600">
                  {formatCurrency(row.remaining_balance)}
                </td>
                <td className="px-6 py-4 text-gray-700">{row.active_advances}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { role, extractErrorMessage } = useAuth();
  const [report, setReport] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const [reportData, expenseData] = await Promise.all([
          getReportsSummary(),
          listExpenses(),
        ]);
        setReport(reportData);
        setExpenses(expenseData);
      } catch (apiError) {
        setError(extractErrorMessage(apiError, "Unable to load reports."));
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [extractErrorMessage]);

  const recentExpenses = [...expenses]
    .sort((left, right) => (right.created_at || "").localeCompare(left.created_at || ""))
    .slice(0, 5);

  return (
    <Layout>
      <div className="space-y-6">
        <PageHero
          title="Reports"
          subtitle="View advance allocation, total spend, remaining balance, and recent expense movement without leaving the existing dashboard style."
          badge={role === ROLES.ADMIN ? "Admin Insights" : "Checker Insights"}
          badgeColor={role === ROLES.ADMIN ? "emerald" : "blue"}
        />

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Advance"
            value={formatCurrency(report?.total_advances_allocated)}
          />
          <SummaryCard title="Total Spent" value={formatCurrency(report?.total_spent)} />
          <SummaryCard
            title="Remaining Balance"
            value={formatCurrency(report?.remaining_balances)}
          />
          <SummaryCard title="Closed Expenses" value={report?.closed_expenses_count || 0} />
        </div>

        <ContentCard title="Maker Balances">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading maker balances...</div>
          ) : (
            <MakerBalancesTable rows={report?.balances_by_maker || []} />
          )}
        </ContentCard>

        <ContentCard title="Expenses by Status">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading expense status summary...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Object.entries(report?.expenses_by_status || {}).map(([status, count]) => (
                <div
                  key={status}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-medium text-gray-500">
                    {status.replaceAll("_", " ")}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-gray-800">{count}</p>
                </div>
              ))}
            </div>
          )}
        </ContentCard>

        <ContentCard title="Recent Expenses">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading recent expenses...</div>
          ) : (
            <ExpenseTable
              data={recentExpenses}
              emptyTitle="No expenses available"
              emptySubtitle="Recent expense activity will appear here."
            />
          )}
        </ContentCard>
      </div>
    </Layout>
  );
}
