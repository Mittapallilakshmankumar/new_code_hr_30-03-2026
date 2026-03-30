import axiosInstance, { getListData } from "./axios";

export async function listExpenses(params = {}) {
  const response = await axiosInstance.get("expenses/", { params });
  return getListData(response.data);
}

export async function createExpense(payload) {
  const response = await axiosInstance.post("expenses/", payload);
  return response.data;
}

export async function getExpense(id) {
  const response = await axiosInstance.get(`expenses/${id}/`);
  return response.data;
}

export async function updateExpense(id, payload) {
  const response = await axiosInstance.patch(`expenses/${id}/`, payload);
  return response.data;
}

export async function submitExpense(id) {
  const response = await axiosInstance.post(`expenses/${id}/submit/`);
  return response.data;
}

export async function reviewExpense(id) {
  const response = await axiosInstance.post(`expenses/${id}/review/`);
  return response.data;
}

export async function approveExpense(id) {
  const response = await axiosInstance.post(`expenses/${id}/approve/`);
  return response.data;
}

export async function rejectExpense(id, rejectionReason) {
  const response = await axiosInstance.post(`expenses/${id}/reject/`, {
    rejection_reason: rejectionReason,
  });
  return response.data;
}

export async function uploadBill(id, billFile) {
  const formData = new FormData();
  formData.append("bill_file", billFile);

  const response = await axiosInstance.post(`expenses/${id}/upload-bill/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function closeExpense(id) {
  const response = await axiosInstance.post(`expenses/${id}/close/`);
  return response.data;
}
