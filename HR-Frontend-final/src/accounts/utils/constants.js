// export const ROLES = {
//   ADMIN: "ADMIN",
//   MAKER: "MAKER",
//   CHECKER: "CHECKER",
// };

// export const SIDEBAR_SECTIONS = [
//   {
//     title: "Admin View",
//     roles: [ROLES.ADMIN],
//     items: [
//       { label: "Admin Dashboard", path: "/admin-dashboard" },
//       { label: "Reports", path: "/reports" },
//     ],
//   },
//   {
//     title: "Maker View",
//     roles: [ROLES.MAKER],
//     items: [
//       { label: "Dashboard", path: "/dashboard" },
//       { label: "New Expense", path: "/new-expense" },
//       { label: "My Expenses", path: "/my-expenses" },
//       { label: "Upload Bill", path: "/upload-bill" },
//     ],
//   },
//   {
//     title: "Checker View",
//     roles: [ROLES.CHECKER, ROLES.ADMIN],
//     items: [
//       { label: "Dashboard", path: "/dashboard" },
//       { label: "Allocate Advance", path: "/allocate-advance" },
//       { label: "Pending Verification", path: "/pending-verification" },
//       { label: "Pending Approval", path: "/pending-approval" },
//       { label: "Active Advances", path: "/active-advances" },
//       {
//         label: "Final Bill Verification",
//         path: "/final-bill-verification",
//       },
//       { label: "Reports", path: "/reports" },
//     ],
//   },
// ];

// export const STATUS = {
//   ACTIVE: "ACTIVE",
//   PARTIALLY_USED: "PARTIALLY_USED",
//   EXHAUSTED: "EXHAUSTED",
//   CLOSED: "CLOSED",
//   DRAFT: "DRAFT",
//   SUBMITTED: "SUBMITTED",
//   REVIEWED: "REVIEWED",
//   APPROVED: "APPROVED",
//   BILL_SUBMITTED: "BILL_SUBMITTED",
//   REJECTED: "REJECTED",
// };

// export const EXPENSE_CATEGORIES = [
//   "Stationery",
//   "Travel",
//   "Maintenance",
//   "Utilities",
//   "Office Supplies",
//   "Administrative Expenses",
// ];

// export const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Card"];
// export const DEFAULT_MAX_BILL_UPLOAD_BYTES = 5 * 1024 * 1024;

// export function getDefaultRouteForRole(role) {
//   switch (role) {
//     case ROLES.ADMIN:
//       return "/admin-dashboard";
//     case ROLES.CHECKER:
//     case ROLES.MAKER:
//       return "/dashboard";
//     default:
//       return "/login";
//   }
// }

// export function getRoleLabel(role) {
//   switch (role) {
//     case ROLES.ADMIN:
//       return "Admin";
//     case ROLES.CHECKER:
//       return "Checker";
//     case ROLES.MAKER:
//       return "Maker";
//     default:
//       return "User";
//   }
// }

// export function formatCurrency(amount) {
//   return `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;
// }


export const ROLES = {
  ADMIN: "ADMIN",
  MAKER: "MAKER",
  CHECKER: "CHECKER",
};

export const SIDEBAR_SECTIONS = [
  {
    title: "Admin View",
    roles: [ROLES.ADMIN],
    items: [
      { label: "Admin Dashboard", path: "/admin-dashboard" },
      { label: "Reports", path: "/reports" },
    ],
  },

  {
    title: "Maker View",
    roles: [ROLES.MAKER],
    items: [
      { label: "Dashboard", path: "/home/leave" },   // ✅ FIXED
      { label: "New Expense", path: "/new-expense" },
      { label: "My Expenses", path: "/my-expenses" },
      { label: "Upload Bill", path: "/upload-bill" },
    ],
  },

  {
    title: "Checker View",
    roles: [ROLES.CHECKER, ROLES.ADMIN],
    items: [
      { label: "Dashboard", path: "/checker-dashboard" }, // ✅ FIXED
      { label: "Allocate Advance", path: "/allocate-advance" },
      { label: "Pending Verification", path: "/pending-verification" },
      { label: "Pending Approval", path: "/pending-approval" },
      { label: "Active Advances", path: "/active-advances" },
      { label: "Final Bill Verification", path: "/final-bill-verification" },
      { label: "Reports", path: "/reports" },
    ],
  },
];

export const STATUS = {
  ACTIVE: "ACTIVE",
  PARTIALLY_USED: "PARTIALLY_USED",
  EXHAUSTED: "EXHAUSTED",
  CLOSED: "CLOSED",
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  REVIEWED: "REVIEWED",
  APPROVED: "APPROVED",
  BILL_SUBMITTED: "BILL_SUBMITTED",
  REJECTED: "REJECTED",
};

export const EXPENSE_CATEGORIES = [
  "Stationery",
  "Travel",
  "Maintenance",
  "Utilities",
  "Office Supplies",
  "Administrative Expenses",
];

export const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Card"];

export const DEFAULT_MAX_BILL_UPLOAD_BYTES = 5 * 1024 * 1024;



// ✅ FIXED FUNCTION (ONLY ONE — no duplicate)
export function getDefaultRouteForRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin-dashboard";

    case ROLES.CHECKER:
      return "/checker-dashboard";   // ✅ FIXED

    case ROLES.MAKER:
      return "/home/leave";          // ✅ FIXED

    default:
      return "/login";
  }
}



export function getRoleLabel(role) {
  switch (role) {
    case ROLES.ADMIN:
      return "Admin";
    case ROLES.CHECKER:
      return "Checker";
    case ROLES.MAKER:
      return "Maker";
    default:
      return "User";
  }
}



export function formatCurrency(amount) {
  return `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;
}