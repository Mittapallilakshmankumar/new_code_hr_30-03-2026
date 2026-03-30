import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AppProviders";
import apiClient, {
  ROLES,
  STATUS,
  formatCurrency,
  getListData,
  getRoleLabel,
} from "../components/appCore";
import ContentCard from "../components/ContentCard";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import SearchToolbar from "../components/SearchToolbar";
import StatusBadge from "../components/StatusBadge";
import SummaryCard from "../components/SummaryCard";

async function listAdvances(params = {}) {
  const response = await apiClient.get("advances/", { params });
  return getListData(response.data);
}

async function listUsersApi(params = {}) {
  const response = await apiClient.get("auth/users/", { params });
  return response.data;
}

async function createUserApi(payload) {
  const response = await apiClient.post("auth/users/", payload);
  return response.data;
}

async function updateUserApi(userId, payload) {
  const response = await apiClient.patch(`auth/users/${userId}/`, payload);
  return response.data;
}

async function resetUserPasswordApi(userId, payload) {
  const response = await apiClient.post(`auth/users/${userId}/reset-password/`, payload);
  return response.data;
}

async function getAdminDashboard() {
  const response = await apiClient.get("auth/admin/dashboard/");
  return response.data;
}

async function listExpenses(params = {}) {
  const response = await apiClient.get("expenses/", { params });
  return getListData(response.data);
}

async function reviewExpense(id) {
  const response = await apiClient.post(`expenses/${id}/review/`);
  return response.data;
}

async function approveExpense(id) {
  const response = await apiClient.post(`expenses/${id}/approve/`);
  return response.data;
}

async function rejectExpense(id, rejectionReason) {
  const response = await apiClient.post(`expenses/${id}/reject/`, {
    rejection_reason: rejectionReason,
  });
  return response.data;
}

async function closeExpense(id) {
  const response = await apiClient.post(`expenses/${id}/close/`);
  return response.data;
}

const initialUserForm = {
  full_name: "",
  username: "",
  email: "",
  role: ROLES.MAKER,
  password: "",
  confirm_password: "",
};

function ErrorText({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-600">{message}</p>;
}

function getFieldInputClass(hasError) {
  return `w-full rounded-xl px-4 py-3 outline-none transition ${
    hasError
      ? "border border-rose-300 bg-rose-50/40 focus:border-rose-500"
      : "border border-slate-300 focus:border-slate-900"
  }`;
}

function normalizeFieldError(value) {
  if (Array.isArray(value)) {
    return value.find((item) => typeof item === "string") || "";
  }
  return typeof value === "string" ? value : "";
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function MiniBarChart({ title, rows, palette = "cyan" }) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const gradients = {
    cyan: "from-cyan-500 to-sky-600",
    emerald: "from-emerald-500 to-teal-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h4>
      <div className="mt-5 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700">{row.label}</span>
              <span className="text-slate-500">{row.value}</span>
            </div>
            <div className="h-2.5 rounded-full bg-white">
              <div
                className={`h-2.5 rounded-full bg-gradient-to-r ${gradients[palette]}`}
                style={{ width: `${Math.max((row.value / maxValue) * 100, 8)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { extractErrorMessage } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingUser, setSavingUser] = useState(false);
  const [actingOnRequestId, setActingOnRequestId] = useState(null);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [userFormErrors, setUserFormErrors] = useState({});
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState("ALL");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [dashboardData, usersData, expensesData, advancesData] = await Promise.all([
        getAdminDashboard(),
        listUsersApi(),
        listExpenses(),
        listAdvances(),
      ]);
      setDashboard(dashboardData);
      setUsers(usersData);
      setExpenses(expensesData);
      setAdvances(advancesData);
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Unable to load the admin dashboard."));
    } finally {
      setLoading(false);
    }
  }, [extractErrorMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = userRoleFilter === "ALL" || user.role === userRoleFilter;
      const needle = userSearch.trim().toLowerCase();
      const matchesSearch =
        !needle ||
        [user.full_name, user.username, user.email]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle));
      return matchesRole && matchesSearch;
    });
  }, [userRoleFilter, userSearch, users]);

  const filteredRequests = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesStatus =
        requestStatusFilter === "ALL" || expense.status === requestStatusFilter;
      const needle = requestSearch.trim().toLowerCase();
      const matchesSearch =
        !needle ||
        [
          expense.reference,
          expense.payable_to,
          expense.maker_details?.full_name,
          expense.maker_details?.username,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle));
      return matchesStatus && matchesSearch;
    });
  }, [expenses, requestSearch, requestStatusFilter]);

  const activeAdvances = useMemo(
    () => advances.filter((advance) => advance.status !== STATUS.CLOSED).slice(0, 6),
    [advances]
  );

  const userRoleChartRows = useMemo(
    () =>
      Object.entries(dashboard?.charts?.user_roles || {}).map(([label, value]) => ({
        label,
        value,
      })),
    [dashboard]
  );

  const requestChartRows = useMemo(
    () =>
      Object.entries(dashboard?.charts?.request_statuses || {}).map(([label, value]) => ({
        label: label.replaceAll("_", " "),
        value,
      })),
    [dashboard]
  );

  const setUserField = (field) => (event) => {
    setUserForm((current) => ({ ...current, [field]: event.target.value }));
    setUserFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateCreateUserForm = useCallback(() => {
    const nextErrors = {};
    const fullName = userForm.full_name.trim();
    const username = userForm.username.trim();
    const email = userForm.email.trim();
    const password = userForm.password;
    const confirmPassword = userForm.confirm_password;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName) {
      nextErrors.full_name = "Full name is required.";
    } else if (fullName.length < 3) {
      nextErrors.full_name = "Full name must be at least 3 characters.";
    }

    if (!username) {
      nextErrors.username = "Username is required.";
    } else if (username.length < 3) {
      nextErrors.username = "Username must be at least 3 characters.";
    } else if (!/^[A-Za-z0-9._-]+$/.test(username)) {
      nextErrors.username = "Use only letters, numbers, dot, underscore, or hyphen.";
    }

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!userForm.role) {
      nextErrors.role = "Role selection is required.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirm_password = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      nextErrors.confirm_password = "Password confirmation does not match.";
    }

    return nextErrors;
  }, [userForm]);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const clientErrors = validateCreateUserForm();
    setUserFormErrors(clientErrors);

    if (Object.keys(clientErrors).length > 0) {
      setError("Please fix the highlighted fields before creating the user.");
      setSuccess("");
      return;
    }

    try {
      setSavingUser(true);
      setError("");
      setSuccess("");
      setUserFormErrors({});
      await createUserApi({
        ...userForm,
        full_name: userForm.full_name.trim(),
        username: userForm.username.trim(),
        email: userForm.email.trim(),
      });
      setUserForm(initialUserForm);
      setSuccess("User created successfully.");
      await loadData();
    } catch (apiError) {
      const responseData = apiError?.response?.data;
      if (responseData && typeof responseData === "object") {
        setUserFormErrors({
          full_name: normalizeFieldError(responseData.full_name),
          username: normalizeFieldError(responseData.username),
          email: normalizeFieldError(responseData.email),
          role: normalizeFieldError(responseData.role),
          password: normalizeFieldError(responseData.password),
          confirm_password: normalizeFieldError(responseData.confirm_password),
        });
      }
      setError(extractErrorMessage(apiError, "Unable to create the user."));
    } finally {
      setSavingUser(false);
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditForm({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    });
  };

  const saveEdit = async () => {
    try {
      setSavingUser(true);
      setError("");
      setSuccess("");
      await updateUserApi(editingUserId, editForm);
      setEditingUserId(null);
      setEditForm(null);
      setSuccess("User updated successfully.");
      await loadData();
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Unable to update the user."));
    } finally {
      setSavingUser(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      setError("");
      setSuccess("");
      await updateUserApi(user.id, { is_active: !user.is_active });
      setSuccess(`User ${user.is_active ? "deactivated" : "activated"} successfully.`);
      await loadData();
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Unable to update user status."));
    }
  };

  const resetPassword = async (user) => {
    const nextPassword = window.prompt(
      `Enter a temporary password for ${user.username}:`,
      "TempPass@123"
    );
    if (!nextPassword) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await resetUserPasswordApi(user.id, {
        new_password: nextPassword,
        confirm_password: nextPassword,
      });
      setSuccess(`Temporary password updated for ${user.username}.`);
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Unable to reset the password."));
    }
  };

  const runRequestAction = async (expense, action) => {
    try {
      setActingOnRequestId(expense.id);
      setError("");
      setSuccess("");

      if (action === "review") {
        await reviewExpense(expense.id);
      } else if (action === "approve") {
        await approveExpense(expense.id);
      } else if (action === "close") {
        await closeExpense(expense.id);
      } else if (action === "reject") {
        const reason = window.prompt(
          `Enter a rejection reason for ${expense.reference}:`,
          "Please review and resubmit with the correct details."
        );
        if (!reason) {
          return;
        }
        await rejectExpense(expense.id, reason);
      }

      setSuccess(`Request ${expense.reference} updated successfully.`);
      await loadData();
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Unable to process the request."));
    } finally {
      setActingOnRequestId(null);
    }
  };

  const requestAction = (expense) => {
    if (expense.status === STATUS.SUBMITTED) {
      return { label: "Review", run: () => runRequestAction(expense, "review") };
    }
    if (expense.status === STATUS.REVIEWED) {
      return { label: "Approve", run: () => runRequestAction(expense, "approve") };
    }
    if (expense.status === STATUS.BILL_SUBMITTED) {
      return { label: "Close", run: () => runRequestAction(expense, "close") };
    }
    return null;
  };

  return (
    <Layout
      headerContent={
        <button
          type="button"
          onClick={loadData}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Refresh Admin Data
        </button>
      }
    >
      <div className="space-y-6">
        <PageHero
          title="Admin Dashboard"
          subtitle="Provision users, supervise requests, and control the internal petty cash workflow without affecting the maker/checker screens."
          badge="Internal Control Center"
          badgeColor="emerald"
          actions={
            <Link
              to="/reports"
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open Reports
            </Link>
          }
        />

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        {loading && !dashboard ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-sm text-slate-500 shadow-sm">
            Loading admin dashboard...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
              <SummaryCard title="Total Users" value={dashboard?.summary?.total_users || 0} />
              <SummaryCard title="Active Users" value={dashboard?.summary?.active_users || 0} />
              <SummaryCard title="Open Requests" value={dashboard?.summary?.open_requests || 0} />
              <SummaryCard title="Active Advances" value={dashboard?.summary?.active_advances || 0} />
              <SummaryCard title="Remaining Balance" value={formatCurrency(dashboard?.summary?.remaining_balance)} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <MiniBarChart title="Users by Role" rows={userRoleChartRows} palette="emerald" />
              <MiniBarChart title="Requests by Status" rows={requestChartRows} />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Control Snapshot
                </h4>
                <div className="mt-5 space-y-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3"><span>Makers</span><strong>{dashboard?.summary?.makers || 0}</strong></div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3"><span>Checkers</span><strong>{dashboard?.summary?.checkers || 0}</strong></div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3"><span>Admins</span><strong>{dashboard?.summary?.admins || 0}</strong></div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3"><span>Inactive Users</span><strong>{dashboard?.summary?.inactive_users || 0}</strong></div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <ContentCard title="Create User">
              <form className="space-y-4" onSubmit={handleCreateUser} noValidate>
                <div>
                  <input type="text" value={userForm.full_name} onChange={setUserField("full_name")} placeholder="Full name" className={getFieldInputClass(Boolean(userFormErrors.full_name))} />
                  <ErrorText message={userFormErrors.full_name} />
                </div>
                <div>
                  <input type="text" value={userForm.username} onChange={setUserField("username")} placeholder="Username" className={getFieldInputClass(Boolean(userFormErrors.username))} />
                  <ErrorText message={userFormErrors.username} />
                </div>
                <div>
                  <input type="email" value={userForm.email} onChange={setUserField("email")} placeholder="Email" className={getFieldInputClass(Boolean(userFormErrors.email))} />
                  <ErrorText message={userFormErrors.email} />
                </div>
                <div>
                <select value={userForm.role} onChange={setUserField("role")} className={getFieldInputClass(Boolean(userFormErrors.role))}>
                  <option value={ROLES.MAKER}>Maker</option>
                  <option value={ROLES.CHECKER}>Checker</option>
                  <option value={ROLES.ADMIN}>Admin</option>
                </select>
                  <ErrorText message={userFormErrors.role} />
                </div>
                <div>
                  <input type="password" value={userForm.password} onChange={setUserField("password")} placeholder="Temporary password" className={getFieldInputClass(Boolean(userFormErrors.password))} />
                  <ErrorText message={userFormErrors.password} />
                </div>
                <div>
                  <input type="password" value={userForm.confirm_password} onChange={setUserField("confirm_password")} placeholder="Confirm password" className={getFieldInputClass(Boolean(userFormErrors.confirm_password))} />
                  <ErrorText message={userFormErrors.confirm_password} />
                </div>
                <button type="submit" disabled={savingUser} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {savingUser ? "Creating User..." : "Create User"}
                </button>
              </form>
            </ContentCard>
          </div>

          <div className="xl:col-span-3">
            <ContentCard title="Operations Snapshot">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-800">Recent Requests</p>
                  <div className="mt-4 space-y-3">
                    {(dashboard?.recent_requests || []).map((request) => (
                      <div key={request.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-800">{request.reference}</p>
                            <p className="text-xs text-slate-500">{request.maker_name}</p>
                          </div>
                          <StatusBadge status={request.status} />
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{formatCurrency(request.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-800">Advance Oversight</p>
                  <div className="mt-4 space-y-3">
                    {activeAdvances.map((advance) => (
                      <div key={advance.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-800">{advance.reference}</p>
                            <p className="text-xs text-slate-500">{advance.maker_details?.full_name || advance.maker_details?.username}</p>
                          </div>
                          <StatusBadge status={advance.status} />
                        </div>
                        <p className="mt-2 text-sm text-slate-600">Balance {formatCurrency(advance.balance_amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ContentCard>
          </div>
        </div>

        <ContentCard title="View Users">
          <div className="space-y-5">
            <SearchToolbar
              title="User Directory"
              subtitle="Search users, switch between maker/checker/admin views, and manage account access."
              search={userSearch}
              setSearch={setUserSearch}
              placeholder="Search by name, username, or email"
            />

            <div className="flex flex-wrap gap-3">
              <FilterPill active={userRoleFilter === "ALL"} onClick={() => setUserRoleFilter("ALL")}>All Users</FilterPill>
              <FilterPill active={userRoleFilter === ROLES.MAKER} onClick={() => setUserRoleFilter(ROLES.MAKER)}>View Makers</FilterPill>
              <FilterPill active={userRoleFilter === ROLES.CHECKER} onClick={() => setUserRoleFilter(ROLES.CHECKER)}>View Checkers</FilterPill>
              <FilterPill active={userRoleFilter === ROLES.ADMIN} onClick={() => setUserRoleFilter(ROLES.ADMIN)}>View Admins</FilterPill>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Name</th>
                    <th className="px-5 py-4 font-semibold">Username</th>
                    <th className="px-5 py-4 font-semibold">Email</th>
                    <th className="px-5 py-4 font-semibold">Role</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isEditing = editingUserId === user.id;
                    return (
                      <tr key={user.id} className="border-t border-slate-200 align-top">
                        <td className="px-5 py-4">
                          {isEditing ? <input type="text" value={editForm.full_name} onChange={(event) => setEditForm((current) => ({ ...current, full_name: event.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" /> : <span className="font-medium text-slate-800">{user.full_name}</span>}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? <input type="text" value={editForm.username} onChange={(event) => setEditForm((current) => ({ ...current, username: event.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" /> : user.username}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? <input type="email" value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" /> : user.email}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <select value={editForm.role} onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2">
                              <option value={ROLES.MAKER}>Maker</option>
                              <option value={ROLES.CHECKER}>Checker</option>
                              <option value={ROLES.ADMIN}>Admin</option>
                            </select>
                          ) : getRoleLabel(user.role)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.is_active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            {isEditing ? (
                              <>
                                <button type="button" onClick={saveEdit} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Save</button>
                                <button type="button" onClick={() => { setEditingUserId(null); setEditForm(null); }} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button type="button" onClick={() => startEdit(user)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Edit User</button>
                                <button type="button" onClick={() => toggleUserStatus(user)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">{user.is_active ? "Deactivate" : "Activate"}</button>
                                <button type="button" onClick={() => resetPassword(user)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Reset Password</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </ContentCard>

        <ContentCard title="View All Requests">
          <div className="space-y-5">
            <SearchToolbar
              title="Request Control"
              subtitle="Search all requests, filter by workflow stage, and approve, reject, review, or close where needed."
              search={requestSearch}
              setSearch={setRequestSearch}
              placeholder="Search by request, maker, or payable to"
            />

            <div className="flex flex-wrap gap-3">
              {["ALL", STATUS.SUBMITTED, STATUS.REVIEWED, STATUS.APPROVED, STATUS.BILL_SUBMITTED, STATUS.CLOSED, STATUS.REJECTED].map((status) => (
                <FilterPill key={status} active={requestStatusFilter === status} onClick={() => setRequestStatusFilter(status)}>
                  {status === "ALL" ? "All Requests" : status.replaceAll("_", " ")}
                </FilterPill>
              ))}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Request</th>
                    <th className="px-5 py-4 font-semibold">Maker</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Reviewer / Approver</th>
                    <th className="px-5 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((expense) => {
                    const primaryAction = requestAction(expense);
                    return (
                      <tr key={expense.id} className="border-t border-slate-200">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-slate-800">{expense.reference}</p>
                            <p className="text-xs text-slate-500">{expense.payable_to}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {expense.maker_details?.full_name || expense.maker_details?.username}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-800">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={expense.status} />
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600">
                          <p>Reviewer: {expense.reviewed_by_details?.full_name || expense.reviewed_by_details?.username || "-"}</p>
                          <p className="mt-1">Approver: {expense.approved_by_details?.full_name || expense.approved_by_details?.username || "-"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link to={`/expenses/${expense.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                              View
                            </Link>
                            {primaryAction ? (
                              <button type="button" disabled={actingOnRequestId === expense.id} onClick={primaryAction.run} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
                                {primaryAction.label}
                              </button>
                            ) : null}
                            {[STATUS.SUBMITTED, STATUS.REVIEWED].includes(expense.status) ? (
                              <button type="button" disabled={actingOnRequestId === expense.id} onClick={() => runRequestAction(expense, "reject")} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-60">
                                Reject
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </ContentCard>
      </div>
    </Layout>
  );
}
