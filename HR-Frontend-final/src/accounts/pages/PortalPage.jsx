import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AppProviders";
import { ROLES, getDefaultRouteForRole, getRoleLabel } from "../components/appCore";

export default function PortalPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isBootstrapping, role } = useAuth();

  if (isBootstrapping) {
    return <div className="p-8 text-sm text-slate-500">Loading session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  const roleCards = [
    {
      role: ROLES.MAKER,
      title: "Maker",
      description: "Create expenses, track balances, upload bills, and move your requests through the workflow.",
    },
    {
      role: ROLES.CHECKER,
      title: "Checker",
      description: "Allocate advances, review submissions, approve requests, and manage verification queues.",
    },
    {
      role: ROLES.ADMIN,
      title: "Admin",
      description: "Control users, monitor all requests, review activity trends, and manage the full internal system.",
    },
  ];

  const handleRoleSelect = (selectedRole) => {
    navigate("/accounts/login", { state: { portalRole: selectedRole } });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe,transparent_35%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_55%,#ecfeff_100%)] p-6">
      <header className="sticky top-4 z-20 mx-auto mb-6 max-w-6xl rounded-3xl border border-white/70 bg-white/80 shadow-sm backdrop-blur">
        <div className="flex w-full items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Petty Cash Management System
            </h1>
            <p className="text-sm text-gray-500">
              Internal role-based access for makers, checkers, and administrators
            </p>
          </div>

          <div className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            Company Portal
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4">
        <div className="w-full max-w-5xl rounded-[2rem] border border-white/70 bg-white/85 p-10 shadow-xl backdrop-blur">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-700">
              Secure Entry
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-gray-900">
              Petty Cash Management System
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
              Choose your internal access role to continue. Public self-registration is disabled,
              and all users are provisioned by an administrator.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {roleCards.map((card, index) => (
              <button
                key={card.role}
                type="button"
                onClick={() => handleRoleSelect(card.role)}
                className="group rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
                  {index + 1}
                </div>
                <p className="mt-6 text-2xl font-semibold text-slate-900">{card.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
                <div className="mt-6 inline-flex items-center rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                  Continue as {card.title}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-4 text-sm text-cyan-900">
            Existing users can sign in from the role they were assigned by the admin team.
            If you need access as a different {getRoleLabel(ROLES.ADMIN).toLowerCase()} role,
            contact the system administrator.
          </div>
        </div>
      </main>
    </div>
  );
}
