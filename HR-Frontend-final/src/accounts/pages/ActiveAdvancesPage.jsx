import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient, { ROLES, formatCurrency, getListData } from "../components/appCore";
import { useAuth } from "../components/AppProviders";
import ContentCard from "../components/ContentCard";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import ExpenseTable from "../components/ExpenseTable";
import SummaryCard from "../components/SummaryCard";

async function listAdvances(params = {}) {
  const response = await apiClient.get("advances/", { params });
  return getListData(response.data);
}

export default function ActiveAdvancesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, extractErrorMessage } = useAuth();
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    async function loadAdvances() {
      try {
        setLoading(true);
        const data = await listAdvances();
        setAdvances(data);
      } catch (apiError) {
        setError(extractErrorMessage(apiError, "Unable to load advances."));
      } finally {
        setLoading(false);
      }
    }

    loadAdvances();
  }, [extractErrorMessage]);

  const totalAdvance = advances.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
  const totalSpent = advances.reduce((sum, item) => sum + Number(item.spent_amount || 0), 0);
  const totalBalance = advances.reduce((sum, item) => sum + Number(item.balance_amount || 0), 0);

  return (
    <Layout>
      <div className="space-y-6">
        <PageHero
          title="Active Advances"
          subtitle={
            role === ROLES.MAKER
              ? "View your allocated advances, running spend, and remaining balance in one place."
              : "Monitor maker-wise advance allocations, running spend, and remaining balances from a single checker view."
          }
          badge="Balance Control"
          badgeColor="emerald"
        />

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SummaryCard title="Total Advance" value={formatCurrency(totalAdvance)} />
          <SummaryCard title="Total Spent" value={formatCurrency(totalSpent)} />
          <SummaryCard title="Remaining Balance" value={formatCurrency(totalBalance)} />
        </div>

        <ContentCard title="Maker Balances">
          {role === ROLES.MAKER ? (
            <p className="mb-4 text-sm text-slate-500">
              Showing only the advances allocated to your account.
            </p>
          ) : null}
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading advances...</div>
          ) : (
            <ExpenseTable
              data={advances}
              type="advance"
              emptyTitle="No advances found"
              emptySubtitle="Allocated advances will appear here."
            />
          )}
        </ContentCard>
      </div>
    </Layout>
  );
}
