import axiosInstance, { getListData } from "./axios";

export async function listAdvances(params = {}) {
  const response = await axiosInstance.get("advances/", { params });
  return getListData(response.data);
}

export async function createAdvance(payload) {
  const response = await axiosInstance.post("advances/", payload);
  return response.data;
}

export async function getAdvance(id) {
  const response = await axiosInstance.get(`advances/${id}/`);
  return response.data;
}

export async function getAdvanceLedger(id) {
  const response = await axiosInstance.get(`advances/${id}/ledger/`);
  return response.data;
}

export async function getMakerBalances() {
  const response = await axiosInstance.get("advances/maker-balances/");
  return response.data;
}
