import axiosInstance from "./axios";

export async function loginApi(payload) {
  const response = await axiosInstance.post("auth/login/", payload);
  return response.data;
}

export async function logoutApi(payload) {
  const response = await axiosInstance.post("auth/logout/", payload);
  return response.data;
}

export async function registerApi(payload) {
  const response = await axiosInstance.post("auth/register/", payload);
  return response.data;
}

export async function getCurrentUserApi() {
  const response = await axiosInstance.get("auth/me/");
  return response.data;
}

export async function listUsersApi(params = {}) {
  const response = await axiosInstance.get("auth/users/", { params });
  return response.data;
}

export async function createUserApi(payload) {
  const response = await axiosInstance.post("auth/users/", payload);
  return response.data;
}

export async function updateUserApi(userId, payload) {
  const response = await axiosInstance.patch(`auth/users/${userId}/`, payload);
  return response.data;
}

export async function resetUserPasswordApi(userId, payload) {
  const response = await axiosInstance.post(`auth/users/${userId}/reset-password/`, payload);
  return response.data;
}

export async function getAdminDashboardApi() {
  const response = await axiosInstance.get("auth/admin/dashboard/");
  return response.data;
}

export async function listCheckerOptionsApi() {
  const response = await axiosInstance.get("auth/checker-options/");
  return response.data;
}
