import apiClient from "../../api/client";

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationReadResponse {
  message: string;
}

export async function getNotifications(
  unreadOnly = false,
): Promise<Notification[]> {
  const response = await apiClient.get<Notification[]>(
    "/notifications",
    {
      params: {
        unread_only: unreadOnly,
      },
    },
  );

  return response.data;
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<Notification> {
  const response = await apiClient.patch<Notification>(
    `/notifications/${notificationId}/read`,
  );

  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<NotificationReadResponse> {
  const response =
    await apiClient.patch<NotificationReadResponse>(
      "/notifications/read-all",
    );

  return response.data;
}