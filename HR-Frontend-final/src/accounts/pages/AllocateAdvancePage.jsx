import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createAdvance } from "../api/advanceApi";
import { listUsersApi } from "../api/authApi";
import ContentCard from "../components/ContentCard";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import { useLoading } from "../context/LoadingContext";
import { formatCurrency } from "../utils/constants";
import { emitDashboardRefresh } from "../utils/realtime";
import { useAuth } from "../utils/session";

function FormField({ label, children, required = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function Input({ type = "text", value, onChange, placeholder = "" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-900"
    />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-900"
    >
      {children}
    </select>
  );
}

function Textarea({ value, onChange, rows = 4, placeholder = "" }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-900"
    />
  );
}

function PreviewCard({ maker, amount }) {
  return (
    <ContentCard title="Allocation Preview">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-700">
          The selected maker will start with the full allocated amount as the current balance.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Maker</p>
            <p className="mt-2 text-sm font-semibold text-gray-800">
              {maker?.full_name || maker?.maker_name || "Not selected"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Allocated Amount</p>
            <p className="mt-2 text-sm font-semibold text-gray-800">
              {amount ? formatCurrency(amount) : "-"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Current Balance</p>
            <p className="mt-2 text-sm font-semibold text-gray-800">
              {amount ? formatCurrency(amount) : "-"}
            </p>
          </div>
        </div>
      </div>
    </ContentCard>
  );
}

export default function AllocateAdvancePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { extractErrorMessage } = useAuth();
  const { setLoading: setGlobalLoading } = useLoading();
  const [makers, setMakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    maker: "",
    totalAmount: "",
    remarks: "",
  });

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    async function loadMakers() {
      try {
        setLoading(true);
        const nextMakers = await listUsersApi({ role: "MAKER" });
        setMakers(nextMakers);
        setFormData((prev) => ({
          ...prev,
          maker: prev.maker || String(nextMakers[0]?.id || ""),
          totalAmount: prev.totalAmount || "20000",
        }));
      } catch (apiError) {
        setError(extractErrorMessage(apiError, "Unable to load makers."));
      } finally {
        setLoading(false);
      }
    }

    loadMakers();
  }, [extractErrorMessage, setGlobalLoading]);

  const allocationAmount = useMemo(() => Number(formData.totalAmount || 0), [formData.totalAmount]);
  const selectedMaker = useMemo(
    () => makers.find((maker) => String(maker.id) === String(formData.maker)),
    [makers, formData.maker]
  );

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.maker || !formData.totalAmount) {
      setError("Maker and total advance amount are required.");
      return;
    }

    try {
      setSubmitting(true);
      setGlobalLoading(true);
      setError("");
      setSuccess("");
      const createdAdvance = await createAdvance({
        maker: Number(formData.maker),
        total_amount: formData.totalAmount,
        remarks: formData.remarks,
      });
      emitDashboardRefresh({ source: "advance-created", advanceId: createdAdvance.id });
      navigate("/active-advances", {
        replace: true,
        state: {
          successMessage: `Advance ${createdAdvance.reference} allocated successfully.`,
        },
      });
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Unable to allocate advance."));
    } finally {
      setSubmitting(false);
      setGlobalLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHero
          title="Allocate Advance"
          subtitle="Assign advance amounts to makers and start their running balance from the same allocated value."
          badge="Checker Allocation"
          badgeColor="blue"
        />

        <ContentCard
          title="Allocate Advance"
          rightContent={
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loading || !formData.maker}
              className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Allocating..." : "Allocate"}
            </button>
          }
        >
          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label="Maker" required>
              <Select value={formData.maker} onChange={handleChange("maker")}>
                <option value="">{loading ? "Loading makers..." : "Select maker"}</option>
                {makers.map((maker) => (
                  <option key={maker.id} value={maker.id}>
                    {maker.full_name || maker.username}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Total Advance Amount" required>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={formData.totalAmount}
                onChange={handleChange("totalAmount")}
                placeholder="Enter advance amount"
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Remarks">
                <Textarea
                  value={formData.remarks}
                  onChange={handleChange("remarks")}
                  placeholder="Add allocation note, business purpose, or control comment"
                />
              </FormField>
            </div>
          </div>
        </ContentCard>

        <PreviewCard maker={selectedMaker} amount={allocationAmount} />
      </div>
    </Layout>
  );
}
