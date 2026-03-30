import { useEffect, useState } from "react";
import { listAdvances } from "../api/advanceApi";
import { listExpenses } from "../api/expenseApi";
import ContentCard from "../components/ContentCard";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import ExpenseTable from "../components/ExpenseTable";
import SearchToolbar from "../components/SearchToolbar";
import SummaryCard from "../components/SummaryCard";
import { STATUS } from "../utils/constants";
import { useAuth } from "../utils/session";

function ReviewActionGuide() {
  return (
    <ContentCard title="Checker Actions">
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-800">Verify Expense</h4>
          <p className="mt-1 text-sm text-gray-500">
            Validate the maker expense against the available advance balance and move it to approval.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-800">Reject</h4>
          <p className="mt-1 text-sm text-gray-500">
            Stop the expense if the amount, purpose, or linked advance usage is not valid.
          </p>
        </div>
      </div>
    </ContentCard>
  );
}

export default function PendingVerificationPage() {
  const { extractErrorMessage } = useAuth();
  const [search, setSearch] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [activeAdvances, setActiveAdvances] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQueue() {
      try {
        setLoading(true);
        const [expenseData, advanceData] = await Promise.all([
          listExpenses({ status: STATUS.SUBMITTED }),
          listAdvances(),
        ]);
        setExpenses(expenseData);
        setActiveAdvances(
          advanceData.filter((item) => Number(item.balance_amount) > 0).length
        );
      } catch (apiError) {
        setError(extractErrorMessage(apiError, "Unable to load review queue."));
      } finally {
        setLoading(false);
      }
    }

    loadQueue();
  }, [extractErrorMessage]);

  const filteredExpenses = search.trim()
    ? expenses.filter((item) => {
        const query = search.toLowerCase();
        return (
          item.reference.toLowerCase().includes(query) ||
          item.advance_details?.reference?.toLowerCase().includes(query) ||
          item.payable_to.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      })
    : expenses;

  return (
    <Layout>
      <div className="space-y-6">
        <PageHero
          title="Pending Verification"
          subtitle="Review submitted expenses raised from active advances and keep the running balance under control."
          badge="Checker Review Stage"
          badgeColor="amber"
        />

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SummaryCard title="Submitted Expenses" value={expenses.length} />
          <SummaryCard title="Ready to Review" value={filteredExpenses.length} />
          <SummaryCard title="Open Advances" value={activeAdvances} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <SearchToolbar
              title="Submitted Expense Queue"
              subtitle={`Showing ${filteredExpenses.length} expense(s) waiting for checker verification.`}
              search={search}
              setSearch={setSearch}
              placeholder="Search by expense ID, advance ID, payable to, or category"
            />

            <ContentCard title="Verification List">
              {loading ? (
                <div className="p-6 text-sm text-gray-500">Loading submitted expenses...</div>
              ) : (
                <ExpenseTable
                  data={filteredExpenses}
                  emptyTitle="No submitted expenses found"
                  emptySubtitle="Submitted expenses will appear here for checker review."
                />
              )}
            </ContentCard>
          </div>

          <div>
            <ReviewActionGuide />
          </div>
        </div>
      </div>
    </Layout>
  );
}
