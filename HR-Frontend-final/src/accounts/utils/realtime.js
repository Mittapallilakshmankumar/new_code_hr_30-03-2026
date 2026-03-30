export const DASHBOARD_REFRESH_EVENT = "petty-cash-dashboard-refresh";

export function emitDashboardRefresh(detail = {}) {
  window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT, { detail }));
}
