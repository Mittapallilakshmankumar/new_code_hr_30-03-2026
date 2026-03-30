import { useEffect, useState } from "react";
import { useAuth } from "../components/AppProviders";
import apiClient, { STATUS, getListData } from "../components/appCore";
import ContentCard from "../components/ContentCard";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import ExpenseTable from "../components/ExpenseTable";
import SearchToolbar from "../components/SearchToolbar";
import SummaryCard from "../components/SummaryCard";

async function listExpenses(params = {}) {
  const response = await apiClient.get("expenses/", { params });
  return getListData(response.data);
}

function ApprovalGuide() {
  return (
    <ContentCard title="Approval Actions">
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-800">Approve Expense</h4>
          <p className="mt-1 text-sm text-gray-500">
            Confirm the reviewed expense and allow the maker to proceed with bill upload after spend completion.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-800">Reject</h4>
          <p className="mt-1 text-sm text-gray-500">
            Reject the expense when the reviewed spend is outside policy or needs resubmission.
          </p>
        </div>
      </div>
    </ContentCard>
  );
}

export default function PendingApprovalPage() {
  const { extractErrorMessage } = useAuth();
  const [search, setSearch] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQueue() {
      try {
        setLoading(true);
        const data = await listExpenses({ status: STATUS.REVIEWED });
        setExpenses(data);
      } catch (apiError) {
        setError(extractErrorMessage(apiError, "Unable to load approval queue."));
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
          title="Pending Approval"
          subtitle="Approve reviewed expenses before makers upload the supporting bills."
          badge="Checker Approval Stage"
          badgeColor="indigo"
        />

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SummaryCard title="Reviewed Expenses" value={expenses.length} />
          <SummaryCard title="Ready to Approve" value={filteredExpenses.length} />
          <SummaryCard title="Approval Role" value="CHECKER" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <SearchToolbar
              title="Reviewed Expense Queue"
              subtitle={`Showing ${filteredExpenses.length} expense(s) waiting for checker approval.`}
              search={search}
              setSearch={setSearch}
              placeholder="Search by expense ID, advance ID, payable to, or category"
            />

            <ContentCard title="Approval List">
              {loading ? (
                <div className="p-6 text-sm text-gray-500">Loading reviewed expenses...</div>
              ) : (
                <ExpenseTable
                  data={filteredExpenses}
                  emptyTitle="No reviewed expenses found"
                  emptySubtitle="Reviewed expenses will appear here for final approval."
                />
              )}
            </ContentCard>
          </div>

          <div>
            <ApprovalGuide />
          </div>
        </div>
      </div>
    </Layout>
  );
}
