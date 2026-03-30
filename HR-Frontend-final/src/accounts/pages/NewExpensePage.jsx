import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useLoading } from "../components/AppProviders";
import apiClient, {
  EXPENSE_CATEGORIES,
  PAYMENT_MODES,
  ROLES,
  emitDashboardRefresh,
  formatCurrency,
  getListData,
} from "../components/appCore";
import ContentCard from "../components/ContentCard";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";

async function listAdvances(params = {}) {
  const response = await apiClient.get("advances/", { params });
  return getListData(response.data);
}

async function listCheckerOptionsApi() {
  const response = await apiClient.get("auth/checker-options/");
  return response.data;
}

async function createExpense(payload) {
  const response = await apiClient.post("expenses/", payload);
  return response.data;
}

const ONES = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function toTwoDigits(number) {
  if (number < 20) {
    return ONES[number];
  }

  const tens = Math.floor(number / 10);
  const remainder = number % 10;
  return remainder ? `${TENS[tens]} ${ONES[remainder]}` : TENS[tens];
}

function toThreeDigits(number) {
  const hundreds = Math.floor(number / 100);
  const remainder = number % 100;
  const parts = [];

  if (hundreds) {
    parts.push(`${ONES[hundreds]} Hundred`);
  }

  if (remainder) {
    parts.push(toTwoDigits(remainder));
  }

  return parts.join(" ") || ONES[0];
}

function integerToWords(number) {
  if (number === 0) {
    return ONES[0];
  }

  const segments = [
    [10000000, "Crore"],
    [100000, "Lakh"],
    [1000, "Thousand"],
    [1, ""],
  ];

  let remainder = number;
  const parts = [];

  segments.forEach(([divisor, label]) => {
    const chunk = Math.floor(remainder / divisor);
    remainder %= divisor;

    if (!chunk) {
      return;
    }

    const chunkWords = chunk < 1000 ? toThreeDigits(chunk) : integerToWords(chunk);
    parts.push(label ? `${chunkWords} ${label}` : chunkWords);
  });

  return parts.join(" ");
}

function amountToWords(value) {
  const numericValue = Number(value || 0);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "";
  }

  const normalized = numericValue.toFixed(2);
  const [wholePart, decimalPart] = normalized.split(".");
  const whole = Number(wholePart);
  const paise = Number(decimalPart);

  let words = `${integerToWords(whole)} Rupees`;

  if (paise) {
    words += ` and ${integerToWords(paise)} Paise`;
  }

  return `${words} Only`;
}

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

function ErrorText({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

function Input({
  type = "text",
  placeholder = "",
  value,
  onChange,
  error = false,
  ...props
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
      className={`w-full rounded-lg bg-white px-4 py-3 text-sm text-gray-800 outline-none transition ${
        error
          ? "border border-red-300 focus:border-red-500"
          : "border border-gray-300 focus:border-blue-900"
      }`}
    />
  );
}

function Select({ children, value, onChange, error = false }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full rounded-lg bg-white px-4 py-3 text-sm text-gray-800 outline-none transition ${
        error
          ? "border border-red-300 focus:border-red-500"
          : "border border-gray-300 focus:border-blue-900"
      }`}
    >
      {children}
    </select>
  );
}

function ReadOnlyField({ value, placeholder = "-" }) {
  return (
    <div className="min-h-[50px] w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800">
      {value || <span className="text-gray-400">{placeholder}</span>}
    </div>
  );
}

function Textarea({ rows = 4, placeholder = "", value, onChange, error = false }) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full rounded-lg bg-white px-4 py-3 text-sm text-gray-800 outline-none transition ${
        error
          ? "border border-red-300 focus:border-red-500"
          : "border border-gray-300 focus:border-blue-900"
      }`}
    />
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
      <div className="border-b border-gray-200 px-6 py-5">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function BalanceCard({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-lg font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function ExpensePreviewCard({
  advance,
  amount,
  reviewedBy,
  approvedBy,
  sameCheckerSelected,
}) {
  const advanceTotal = Number(advance?.total_amount || 0);
  const advanceSpent = Number(advance?.spent_amount || 0);
  const spentAmount = advance ? advanceSpent + Number(amount || 0) : 0;
  const remainingBalance = advance ? Math.max(advanceTotal - spentAmount, 0) : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
      <h4 className="text-sm font-semibold text-gray-800">Expense Preview</h4>
      <p className="mt-2 text-sm text-gray-500">
        Maker spends from the selected advance balance, then uploads the bill after checker approval.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <BalanceCard
          title="Allocated Amount"
          value={advance ? formatCurrency(advance.total_amount) : "Select advance"}
        />
        <BalanceCard
          title="Spent After This Entry"
          value={advance ? formatCurrency(spentAmount) : "-"}
        />
        <BalanceCard
          title="Remaining Balance"
          value={advance ? formatCurrency(remainingBalance) : "-"}
        />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500">Reviewed By</p>
          <p className="mt-2 text-sm font-semibold text-gray-800">
            {reviewedBy?.full_name || reviewedBy?.username || "Not selected"}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500">Approved By</p>
          <p className="mt-2 text-sm font-semibold text-gray-800">
            {approvedBy?.full_name || approvedBy?.username || "Not selected"}
          </p>
        </div>
      </div>
      {sameCheckerSelected ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-700">
            Same checker selected for review and approval.
          </p>
          <p className="mt-1 text-xs text-amber-600">This is allowed only if needed.</p>
        </div>
      ) : null}
    </div>
  );
}

function formatDateValue(value) {
  return value.toISOString().slice(0, 10);
}

function getExpenseDateRange() {
  const today = new Date();
  const minDate = new Date(today);
  const maxDate = new Date(today);
  minDate.setDate(today.getDate() - 2);
  maxDate.setDate(today.getDate() + 7);

  return {
    defaultDate: formatDateValue(today),
    minDate: formatDateValue(minDate),
    maxDate: formatDateValue(maxDate),
  };
}

function PaymentModeOption({ label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[50px] items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
        active
          ? "border-blue-900 bg-blue-50 text-blue-900"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
          active ? "border-blue-900 bg-blue-900" : "border-gray-400 bg-white"
        }`}
      >
        {active ? <span className="h-2 w-2 rounded-[2px] bg-white" /> : null}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function stripTransactionReference(text = "") {
  return text.replace(/\s*-\s*UTR ID:\s*[^-]+$/i, "").replace(/\s*UTR ID:\s*[^-]+$/i, "").trim();
}

function buildRemarks(baseRemarks, paymentMode, transactionReference) {
  const cleanRemarks = stripTransactionReference(baseRemarks);
  const cleanReference = String(transactionReference || "").trim();

  if (paymentMode !== "UPI" || !cleanReference) {
    return cleanRemarks;
  }

  return cleanRemarks ? `${cleanRemarks} - UTR ID: ${cleanReference}` : `UTR ID: ${cleanReference}`;
}

export default function NewExpensePage() {
  const navigate = useNavigate();
  const { role, user, extractErrorMessage } = useAuth();
  const { setLoading: setGlobalLoading } = useLoading();
  const { defaultDate, minDate, maxDate } = useMemo(() => getExpenseDateRange(), []);

  const [advances, setAdvances] = useState([]);
  const [checkerUsers, setCheckerUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    advanceId: "",
    payableTo: "",
    expenseDate: defaultDate,
    amount: "",
    amountInWords: "",
    category: "",
    purpose: "",
    paymentMode: "",
    transactionReference: "",
    remarks: "",
    reviewedBy: "",
    approvedBy: "",
  });

  useEffect(() => {
    async function loadFormOptions() {
      try {
        setLoading(true);
        const [advanceList, checkers] = await Promise.all([
          listAdvances(),
          listCheckerOptionsApi(),
        ]);
        const availableAdvances = advanceList.filter((item) => Number(item.balance_amount) > 0);
        setAdvances(availableAdvances);
        setCheckerUsers(checkers);
        setFormData((prev) => ({
          ...prev,
          advanceId: prev.advanceId || String(availableAdvances[0]?.id || ""),
          reviewedBy: prev.reviewedBy || String(checkers[0]?.id || ""),
          approvedBy: prev.approvedBy || String(checkers[1]?.id || checkers[0]?.id || ""),
        }));
      } catch (apiError) {
        setError(extractErrorMessage(apiError, "Unable to load expense form data."));
      } finally {
        setLoading(false);
      }
    }

    loadFormOptions();
  }, [extractErrorMessage, setGlobalLoading]);

  const selectedAdvance = useMemo(
    () => advances.find((item) => String(item.id) === String(formData.advanceId)),
    [advances, formData.advanceId]
  );
  const reviewedByUser = useMemo(
    () => checkerUsers.find((item) => String(item.id) === String(formData.reviewedBy)),
    [checkerUsers, formData.reviewedBy]
  );
  const approvedByUser = useMemo(
    () => checkerUsers.find((item) => String(item.id) === String(formData.approvedBy)),
    [checkerUsers, formData.approvedBy]
  );
  const sameCheckerSelected = useMemo(
    () => formData.reviewedBy && formData.approvedBy && formData.reviewedBy === formData.approvedBy,
    [formData.approvedBy, formData.reviewedBy]
  );
  const computedRemarks = useMemo(
    () => buildRemarks(formData.remarks, formData.paymentMode, formData.transactionReference),
    [formData.paymentMode, formData.remarks, formData.transactionReference]
  );

  const preparedByName = user?.full_name || user?.username || "Current maker";
  const receivedByName = formData.payableTo?.trim();
  const isCashPayment = formData.paymentMode === "Cash";
  const isUpiPayment = formData.paymentMode === "UPI";
  const isOtherPayment = Boolean(formData.paymentMode) && !isCashPayment && !isUpiPayment;

  const validateForm = useCallback(() => {
    const nextErrors = {};
    const numericAmount = Number(formData.amount);

    if (!formData.advanceId) nextErrors.advanceId = "Please select an active advance.";
    if (!formData.payableTo.trim()) nextErrors.payableTo = "Payable To is required.";
    if (!formData.expenseDate) {
      nextErrors.expenseDate = "Expense date is required.";
    } else if (formData.expenseDate < minDate || formData.expenseDate > maxDate) {
      nextErrors.expenseDate = `Date must be between ${minDate} and ${maxDate}.`;
    }
    if (!formData.amount) {
      nextErrors.amount = "Amount is required.";
    } else if (!/^\d+(\.\d{0,2})?$/.test(formData.amount)) {
      nextErrors.amount = "Enter a valid numeric amount with up to 2 decimals.";
    } else if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = "Amount must be greater than zero.";
    }
    if (!formData.category) nextErrors.category = "Expense account is required.";
    if (!formData.paymentMode) nextErrors.paymentMode = "Payment mode is required.";
    if (isUpiPayment && !formData.transactionReference.trim()) {
      nextErrors.transactionReference = "UTR / TR ID is required for UPI payments.";
    }
    if (!formData.purpose.trim()) nextErrors.purpose = "Purpose is required.";
    if (!formData.reviewedBy) nextErrors.reviewedBy = "Reviewed By is required.";
    if (!formData.approvedBy) nextErrors.approvedBy = "Approved By is required.";

    return nextErrors;
  }, [formData, isUpiPayment, maxDate, minDate]);

  const handleChange = (field) => (event) => {
    let nextValue = event.target.value;
    if (field === "amount") {
      nextValue = nextValue.replace(/[^\d.]/g, "");
      const parts = nextValue.split(".");
      if (parts.length > 2) {
        nextValue = `${parts[0]}.${parts.slice(1).join("")}`;
      }
      if (parts[1]?.length > 2) {
        nextValue = `${parts[0]}.${parts[1].slice(0, 2)}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [field]: field === "remarks" ? stripTransactionReference(nextValue) : nextValue,
      ...(field === "amount" ? { amountInWords: amountToWords(nextValue) } : {}),
      ...(field === "paymentMode" && nextValue !== "UPI" ? { transactionReference: "" } : {}),
    }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePaymentModeSelect = (nextMode) => {
    setFormData((prev) => ({
      ...prev,
      paymentMode: nextMode,
      ...(nextMode !== "UPI" ? { transactionReference: "" } : {}),
    }));
    setFieldErrors((prev) => ({
      ...prev,
      paymentMode: "",
      transactionReference: nextMode === "UPI" ? prev.transactionReference : "",
    }));
  };

  const handleReset = () => {
    setFieldErrors({});
    setError("");
    setFormData({
      advanceId: String(advances[0]?.id || ""),
      payableTo: "",
      expenseDate: defaultDate,
      amount: "",
      amountInWords: "",
      category: "",
      purpose: "",
      paymentMode: "",
      transactionReference: "",
      remarks: "",
      reviewedBy: String(checkerUsers[0]?.id || ""),
      approvedBy: String(checkerUsers[1]?.id || checkerUsers[0]?.id || ""),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (role !== ROLES.MAKER) {
      setError("Only maker users can create expenses.");
      return;
    }

    const nextErrors = validateForm();
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted fields before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setGlobalLoading(true);
      setError("");
      const created = await createExpense({
        advance: Number(formData.advanceId),
        payable_to: formData.payableTo,
        expense_date: formData.expenseDate,
        amount: formData.amount,
        amount_in_words: formData.amountInWords,
        category: formData.category,
        purpose: formData.purpose,
        payment_mode: formData.paymentMode,
        transaction_reference: formData.transactionReference,
        remarks: computedRemarks,
        reviewed_by: Number(formData.reviewedBy),
        approved_by: Number(formData.approvedBy),
      });

      emitDashboardRefresh({ source: "expense-created", expenseId: created.id });
      navigate(`/expenses/${created.id}`, {
        state: {
          successMessage: `Expense ${created.reference} created as draft. Submit it from the details page when ready.`,
        },
      });
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Unable to create expense."));
    } finally {
      setSubmitting(false);
      setGlobalLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHero
          title="New Expense"
          subtitle="Create a new expense from an existing advance balance. The entry is saved as a draft first, then submitted for checker review."
        />

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!loading && !advances.length ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              No active advance is available for this maker right now.
            </div>
          ) : null}

          {!loading && advances.length > 0 && !checkerUsers.length ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              No active checker users are available right now. Register or activate at least one checker account.
            </div>
          ) : null}

          <Section
            title="Advance Balance Summary"
            subtitle="Create the expense from an existing advance and keep the balance visible before submission."
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <BalanceCard title="Total Advance" value={selectedAdvance ? formatCurrency(selectedAdvance.total_amount) : "-"} />
              <BalanceCard title="Total Spent" value={selectedAdvance ? formatCurrency(selectedAdvance.spent_amount) : "-"} />
              <BalanceCard title="Remaining Balance" value={selectedAdvance ? formatCurrency(selectedAdvance.balance_amount) : "-"} />
            </div>
          </Section>

          <Section
            title="Expense Voucher"
            subtitle="Voucher-style maker entry aligned to the shared image while preserving the existing expense flow."
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Linked Advance" required>
                <Select value={formData.advanceId} onChange={handleChange("advanceId")} error={Boolean(fieldErrors.advanceId)}>
                  <option value="">{loading ? "Loading advances..." : "Select active advance"}</option>
                  {advances.map((advance) => (
                    <option key={advance.id} value={advance.id}>
                      {advance.reference} - {advance.maker_details?.full_name} ({formatCurrency(advance.balance_amount)} balance)
                    </option>
                  ))}
                </Select>
                <ErrorText message={fieldErrors.advanceId} />
              </FormField>

              <FormField label="PAYABLE TO" required>
                <Input placeholder="Enter vendor, employee, or beneficiary" value={formData.payableTo} onChange={handleChange("payableTo")} error={Boolean(fieldErrors.payableTo)} />
                <ErrorText message={fieldErrors.payableTo} />
              </FormField>

              <FormField label="Date" required>
                <Input type="date" min={minDate} max={maxDate} value={formData.expenseDate} onChange={handleChange("expenseDate")} error={Boolean(fieldErrors.expenseDate)} />
                <ErrorText message={fieldErrors.expenseDate} />
              </FormField>

              <FormField label="AMOUNT IN Rs." required>
                <Input type="text" inputMode="decimal" placeholder="Enter expense amount" value={formData.amount} onChange={handleChange("amount")} error={Boolean(fieldErrors.amount)} />
                <ErrorText message={fieldErrors.amount} />
              </FormField>

              <FormField label="Amount In Words">
                <Input value={formData.amountInWords} readOnly placeholder="Auto-generated from amount" />
              </FormField>

              <FormField label="Expenses account" required>
                <Select value={formData.category} onChange={handleChange("category")} error={Boolean(fieldErrors.category)}>
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
                <ErrorText message={fieldErrors.category} />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Mode of Payment" required>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <PaymentModeOption
                      label="CASH"
                      active={isCashPayment}
                      onClick={() => handlePaymentModeSelect("Cash")}
                    />
                    <PaymentModeOption
                      label="PhonePe / GPay"
                      active={isUpiPayment}
                      onClick={() => handlePaymentModeSelect("UPI")}
                    />
                    <PaymentModeOption
                      label="Others"
                      active={isOtherPayment}
                      onClick={() =>
                        handlePaymentModeSelect(
                          formData.paymentMode && formData.paymentMode !== "Cash" && formData.paymentMode !== "UPI"
                            ? formData.paymentMode
                            : "Bank Transfer"
                        )
                      }
                    />
                  </div>
                  <ErrorText message={fieldErrors.paymentMode} />
                </FormField>
              </div>

              {isOtherPayment ? (
                <FormField label="Other payment type" required>
                  <Select value={formData.paymentMode} onChange={handleChange("paymentMode")} error={Boolean(fieldErrors.paymentMode)}>
                    {PAYMENT_MODES.filter((mode) => mode !== "Cash" && mode !== "UPI").map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </Select>
                </FormField>
              ) : null}

              {isUpiPayment ? (
                <FormField label="Transaction / UTR ID" required>
                  <Input placeholder="Enter UTR / TR ID" value={formData.transactionReference} onChange={handleChange("transactionReference")} error={Boolean(fieldErrors.transactionReference)} />
                  <ErrorText message={fieldErrors.transactionReference} />
                </FormField>
              ) : null}

              <div className="md:col-span-2">
                <FormField label="Details and Purpose of expenditure" required>
                  <Textarea rows={4} placeholder="Describe why this advance balance was used" value={formData.purpose} onChange={handleChange("purpose")} error={Boolean(fieldErrors.purpose)} />
                  <ErrorText message={fieldErrors.purpose} />
                </FormField>
              </div>

              <FormField label="Prepared by">
                <ReadOnlyField value={preparedByName} />
              </FormField>

              <FormField label="Reviewed by">
                <Select value={formData.reviewedBy} onChange={handleChange("reviewedBy")} error={Boolean(fieldErrors.reviewedBy)}>
                  <option value="">Select checker</option>
                  {checkerUsers.map((checkerUser) => (
                    <option key={checkerUser.id} value={checkerUser.id}>
                      {checkerUser.full_name || checkerUser.username}
                    </option>
                  ))}
                </Select>
                <ErrorText message={fieldErrors.reviewedBy} />
              </FormField>

              <FormField label="Approved by">
                <Select value={formData.approvedBy} onChange={handleChange("approvedBy")} error={Boolean(fieldErrors.approvedBy)}>
                  <option value="">Select checker</option>
                  {checkerUsers.map((checkerUser) => (
                    <option key={checkerUser.id} value={checkerUser.id}>
                      {checkerUser.full_name || checkerUser.username}
                    </option>
                  ))}
                </Select>
                <ErrorText message={fieldErrors.approvedBy} />
              </FormField>

              <FormField label="Received by">
                <ReadOnlyField value={receivedByName} placeholder="Auto-filled from Payable To" />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Remarks">
                  <Input placeholder="Any transactions ID / number / UTR details etc." value={computedRemarks} onChange={handleChange("remarks")} />
                </FormField>
              </div>
            </div>

            {sameCheckerSelected ? (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-medium text-amber-700">Reviewed By and Approved By are the same checker.</p>
                <p className="mt-1 text-xs text-amber-600">This is allowed only if needed.</p>
              </div>
            ) : null}
          </Section>

          <ExpensePreviewCard advance={selectedAdvance} amount={formData.amount} reviewedBy={reviewedByUser} approvedBy={approvedByUser} sameCheckerSelected={sameCheckerSelected} />

          <ContentCard title="Voucher Actions">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Ready to continue?</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Create the expense as a draft first, then submit it from the details page.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={submitting || loading || !advances.length}
                  className="inline-flex min-w-[140px] items-center justify-center rounded-lg bg-blue-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create Draft"}
                </button>
              </div>
            </div>
          </ContentCard>
        </form>
      </div>
    </Layout>
  );
}
