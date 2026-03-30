import axios from "axios";

function buildDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "/api/";
  }

  return new URL("/api/", window.location.origin).toString();
}

function normalizeApiBaseUrl(value) {
  if (!value) {
    return buildDefaultApiBaseUrl();
  }

  const normalizedValue = value.endsWith("/") ? value : `${value}/`;

  if (typeof window === "undefined") {
    return normalizedValue;
  }

  return new URL(normalizedValue, window.location.origin).toString();
}

export const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL || buildDefaultApiBaseUrl()
);
export const APP_BASE_PATH = import.meta.env.BASE_URL || "/";
export const ACCESS_TOKEN_KEY = "petty-cash-access";
export const REFRESH_TOKEN_KEY = "petty-cash-refresh";
export const AUTH_LOGOUT_EVENT = "petty-cash-auth-logout";
export const DASHBOARD_REFRESH_EVENT = "petty-cash-dashboard-refresh";

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
      { label: "Dashboard", path: "/dashboard" },
      { label: "New Expense", path: "/new-expense" },
      { label: "My Expenses", path: "/my-expenses" },
      { label: "Upload Bill", path: "/upload-bill" },
    ],
  },
  {
    title: "Checker View",
    roles: [ROLES.CHECKER, ROLES.ADMIN],
    items: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Allocate Advance", path: "/allocate-advance" },
      { label: "Pending Verification", path: "/pending-verification" },
      { label: "Pending Approval", path: "/pending-approval" },
      { label: "Active Advances", path: "/active-advances" },
      {
        label: "Final Bill Verification",
        path: "/final-bill-verification",
      },
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

const authStorage = window.sessionStorage;
const legacySharedStorage = window.localStorage;

export function buildAbsoluteUrl(path = "") {
  if (!path) {
    return "";
  }

  return new URL(String(path), API_BASE_URL).toString();
}

export function getAccessToken() {
  return authStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return authStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens({ access, refresh }) {
  if (access) {
    authStorage.setItem(ACCESS_TOKEN_KEY, access);
    legacySharedStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (refresh) {
    authStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    legacySharedStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearAuthTokens() {
  authStorage.removeItem(ACCESS_TOKEN_KEY);
  authStorage.removeItem(REFRESH_TOKEN_KEY);
  legacySharedStorage.removeItem(ACCESS_TOKEN_KEY);
  legacySharedStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getListData(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
}

export function getDefaultRouteForRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin-dashboard";
    case ROLES.CHECKER:
    case ROLES.MAKER:
      return "/dashboard";
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

export function emitDashboardRefresh(detail = {}) {
  window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT, { detail }));
}

function shouldSkipAuthRedirect(url = "") {
  const path = String(url);
  return (
    path.includes("/auth/login/") ||
    path.includes("/auth/refresh/") ||
    path.includes("/auth/me/")
  );
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refresh = getRefreshToken();
    const requestUrl = String(originalRequest?.url || "");

    if (
      error.response?.status === 401 &&
      refresh &&
      !originalRequest?._retry &&
      !requestUrl.includes("/auth/refresh/") &&
      !requestUrl.includes("/auth/login/")
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}auth/refresh/`, {
          refresh,
        });

        setAuthTokens({
          access: refreshResponse.data.access,
          refresh: refreshResponse.data.refresh || refresh,
        });

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuthTokens();
        window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
        if (!shouldSkipAuthRedirect(requestUrl)) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401 && !shouldSkipAuthRedirect(requestUrl)) {
      clearAuthTokens();
      window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiClient;
