import axiosInstance from "./axios";
import { getAdminDashboardApi } from "./authApi";

export async function getMakerDashboard() {
  const response = await axiosInstance.get("dashboard/maker/");
  return response.data;
}

export async function getCheckerDashboard() {
  const response = await axiosInstance.get("dashboard/checker/");
  return response.data;
}

export async function getReportsSummary() {
  const response = await axiosInstance.get("dashboard/reports/");
  return response.data;
}

export async function getAdminDashboard() {
  return getAdminDashboardApi();
}
