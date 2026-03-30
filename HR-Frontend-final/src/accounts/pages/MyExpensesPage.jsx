import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listExpenses } from "../api/expenseApi";
import ContentCard from "../components/ContentCard";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import ExpenseTable from "../components/ExpenseTable";
import SummaryCard from "../components/SummaryCard";
import { STATUS } from "../utils/constants";
import { useAuth } from "../utils/session";

const FILTERS = [
  { key: "ALL", label: "All Expenses" },
  { key: STATUS.DRAFT, label: "Draft" },
  { key: STATUS.SUBMITTED, label: "Submitted" },
  { key: STATUS.REVIEWED, label: "Reviewed" },
  { key: STATUS.APPROVED, label: "Approved" },
  { key: STATUS.BILL_SUBMITTED, label: "Bill Submitted" },
  { key: STATUS.REJECTED, label: "Rejected" },
  { key: STATUS.CLOSED, label: "Closed" },
];

export default function MyExpensesPage() {
  const { extractErrorMessage } = useAuth();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExpenses() {
      try {
        setLoading(true);
        const data = await listExpenses();
        setExpenses(data);
      } catch (apiError) {
        setError(extractErrorMessage(apiError, "Unable to load expenses."));
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, [extractErrorMessage]);

  const summary = useMemo(() => {
    return {
      total: expenses.length,
      awaitingDecision: expenses.filter((item) =>
        [STATUS.SUBMITTED, STATUS.REVIEWED].includes(item.status)
      ).length,
      approved: expenses.filter((item) => item.status === STATUS.APPROVED).length,
      closed: expenses.filter((item) => item.status === STATUS.CLOSED).length,
    };
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    let data = [...expenses];

    if (activeFilter !== "ALL") {
      data = data.filter((item) => item.status === activeFilter);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.reference.toLowerCase().includes(query) ||
          item.advance_details?.reference?.toLowerCase().includes(query) ||
          item.payable_to.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    return data;
  }, [activeFilter, expenses, search]);

  return (
    <Layout>
      <div className="space-y-6">
        <PageHero
          title="My Expenses"
          subtitle="Track all expense entries raised from your allocated advances and open any expense for full balance context."
          actions={[
            <Link
              key="new"
              to="/new-expense"
              className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 hover:shadow-md"
            >
              + New Expense
            </Link>,
          ]}
        />

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Total Expenses" value={summary.total} />
          <SummaryCard title="Awaiting Review" value={summary.awaitingDecision} />
          <SummaryCard title="Approved" value={summary.approved} />
          <SummaryCard title="Closed" value={summary.closed} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((filter) => {
                  const active = activeFilter === filter.key;

                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-blue-900 text-white"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              <div className="w-full xl:w-[320px]">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by expense ID, advance ID, payable to, or category"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-900"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-6 py-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
            <p>
              Showing <span className="font-semibold text-gray-800">{filteredExpenses.length}</span> expense(s)
            </p>
          </div>
        </div>

        <ContentCard title="Expense List">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading expenses...</div>
          ) : (
            <ExpenseTable
              data={filteredExpenses}
              emptyTitle="No expenses found"
              emptySubtitle="Try changing the filters or create a new expense."
            />
          )}
        </ContentCard>
      </div>
    </Layout>
  );
}
