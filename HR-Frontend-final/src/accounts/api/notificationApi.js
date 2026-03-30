import axiosInstance, { getListData } from "./axios";

export async function listNotifications(params = {}) {
  const response = await axiosInstance.get("notifications/", { params });
  return {
    items: getListData(response.data),
    count: response.data?.count || 0,
    next: response.data?.next || null,
    previous: response.data?.previous || null,
  };
}

export async function getUnreadNotificationCount() {
  const response = await axiosInstance.get("notifications/unread-count/");
  return response.data.unread_count || 0;
}

export async function markNotificationRead(id) {
  const response = await axiosInstance.patch(`notifications/${id}/read/`);
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await axiosInstance.patch("notifications/mark-all-read/");
  return response.data;
}
