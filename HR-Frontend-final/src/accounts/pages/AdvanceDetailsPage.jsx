import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdvance, getAdvanceLedger } from "../api/advanceApi";
import { listExpenses } from "../api/expenseApi";
import ContentCard from "../components/ContentCard";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency } from "../utils/constants";
import { useAuth } from "../utils/session";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-800">{value || "-"}</p>
    </div>
  );
}

export default function AdvanceDetailsPage() {
  const { id } = useParams();
  const { extractErrorMessage } = useAuth();
  const [advance, setAdvance] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadAdvance() {
      try {
        setLoading(true);
        setError("");
        setNotFound(false);
        const [advanceData, ledgerData, expenseData] = await Promise.all([
          getAdvance(id),
          getAdvanceLedger(id),
          listExpenses({ advance: id }),
        ]);
        setAdvance(advanceData);
        setLedgerEntries(ledgerData);
        setExpenses(expenseData);
      } catch (apiError) {
        if (apiError?.response?.status === 404) {
          setNotFound(true);
          setAdvance(null);
        } else {
          setError(extractErrorMessage(apiError, "Unable to load advance details."));
        }
      } finally {
        setLoading(false);
      }
    }

    loadAdvance();
  }, [extractErrorMessage, id]);

  if (loading) {
    return (
      <Layout>
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-sm text-slate-500">
          Loading advance details...
        </div>
      </Layout>
    );
  }

  if (notFound || !advance) {
    return (
      <Layout>
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-2xl font-semibold text-slate-800">Advance not found</h2>
          <Link
            to="/active-advances"
            className="mt-6 inline-block rounded-md bg-blue-500 px-5 py-3 text-sm font-medium text-white hover:bg-blue-600"
          >
            Back to Active Advances
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white px-6 py-5">
          <Link
            to="/active-advances"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-slate-900">{advance.reference}</h1>
            <StatusBadge status={advance.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            View the advance allocation, current balance, ledger movement, and linked expenses.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">Total Advance</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-800">
              {formatCurrency(advance.total_amount)}
            </h3>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">Total Spent</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-800">
              {formatCurrency(advance.spent_amount)}
            </h3>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">Remaining Balance</p>
            <h3 className="mt-3 text-2xl font-semibold text-blue-600">
              {formatCurrency(advance.balance_amount)}
            </h3>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">Linked Expenses</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-800">{expenses.length}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <ContentCard title="Advance Details">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Advance ID" value={advance.reference} />
                <Field label="Created At" value={advance.created_at?.slice(0, 10)} />
                <Field label="Maker" value={advance.maker_details?.full_name} />
                <Field label="Allocated By" value={advance.allocated_by_details?.full_name} />
                <Field label="Status" value={advance.status} />
                <Field label="Maker Username" value={advance.maker_details?.username} />
                <div className="md:col-span-2">
                  <Field label="Remarks" value={advance.remarks} />
                </div>
              </div>
            </ContentCard>

            <ContentCard title="Advance Ledger">
              <div className="space-y-4">
                {ledgerEntries.length ? (
                  ledgerEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{entry.entry_type}</p>
                        <p className="mt-1 text-xs text-slate-500">{entry.created_at?.slice(0, 10)}</p>
                      </div>
                      <div className="text-sm text-slate-700">
                        <span className="font-semibold">{formatCurrency(entry.amount)}</span>
                        {"  "}Balance After:{" "}
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(entry.balance_after)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No ledger entries found.</p>
                )}
              </div>
            </ContentCard>
          </div>

          <ContentCard title="Linked Expenses">
            <div className="space-y-4">
              {expenses.length ? (
                expenses.map((expense) => (
                  <div key={expense.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">{expense.reference}</p>
                      <StatusBadge status={expense.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{expense.payable_to}</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {formatCurrency(expense.amount)}
                    </p>
                    <Link
                      to={`/expenses/${expense.id}`}
                      className="mt-3 inline-block rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View Expense
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No expenses are linked to this advance yet.</p>
              )}
            </div>
          </ContentCard>
        </div>
      </div>
    </Layout>
  );
}
