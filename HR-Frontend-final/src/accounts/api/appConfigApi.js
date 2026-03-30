import axiosInstance from "./axios";

export async function getAppConfigApi() {
  const response = await axiosInstance.get("auth/app-config/");
  return response.data;
}
