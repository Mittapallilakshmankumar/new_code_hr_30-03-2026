import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ROLES, SIDEBAR_SECTIONS, getDefaultRouteForRole } from "../utils/constants";
import { useAuth } from "../utils/session";

function HomeIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 3v18h18" />
      <path d="M7 14v3M12 10v7M17 6v11" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 7a2 2 0 0 1 2-2h14v14H5a2 2 0 0 1-2-2V7Z" />
      <path d="M16 12h.01" />
      <path d="M19 9h2v6h-2" />
    </svg>
  );
}

function getIcon(label) {
  switch (label) {
    case "Dashboard":
    case "Admin Dashboard":
      return <HomeIcon />;
    case "New Expense":
    case "Allocate Advance":
      return <PlusIcon />;
    case "My Expenses":
    case "Active Advances":
      return <ListIcon />;
    case "Upload Bill":
      return <UploadIcon />;
    case "Pending Verification":
    case "Pending Approval":
    case "Final Bill Verification":
      return <CheckIcon />;
    case "Reports":
      return <ReportIcon />;
    default:
      return <WalletIcon />;
  }
}

function MenuItem({ item }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:shadow-md ${
          isActive
            ? "bg-blue-900 text-white shadow-sm"
            : "border border-transparent text-gray-700 hover:border-gray-200 hover:bg-white"
        }`
      }
    >
      <span className="shrink-0">{getIcon(item.label)}</span>
      <span>{item.label}</span>
    </NavLink>
  );
}

function SidebarSection({ title, items, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 pb-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mb-3 flex w-full items-center justify-between px-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <span
          className={`text-gray-500 transition-transform ${
            open ? "rotate-90" : ""
          }`}
        >
          ›
        </span>
      </button>

      {open ? (
        <div className="space-y-1">
          {items.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { role: currentRole, user, logout } = useAuth();

  const visibleSections = SIDEBAR_SECTIONS.filter((section) =>
    section.roles.includes(currentRole)
  );
  const currentRoleLabel =
    currentRole === ROLES.ADMIN
      ? "ADMIN"
      : currentRole === ROLES.CHECKER
        ? "CHECKER"
        : "MAKER";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true, state: { fromLogout: getDefaultRouteForRole(currentRole) } });
  };

  return (
    <aside className="h-full w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm">
      <div className="mb-6 px-3">
        <h2 className="text-2xl font-semibold text-gray-800">Accounts</h2>
        <p className="mt-1 text-xs font-medium text-gray-500">
          {user?.full_name || user?.username || "Authenticated User"}
        </p>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-2 shadow-sm">
          <button
            type="button"
            disabled
            className="w-full rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white"
          >
            {currentRoleLabel}
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 hover:shadow-md"
        >
          Logout
        </button>
      </div>

      <div className="space-y-5">
        {visibleSections.map((section, index) => (
          <SidebarSection
            key={section.title}
            title={section.title}
            items={section.items}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </aside>
  );
}
