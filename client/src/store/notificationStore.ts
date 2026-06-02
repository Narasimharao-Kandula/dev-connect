import { create } from 'zustand';
import api from '../api/client';
import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/notifications');
      const unread = data.filter((n: Notification) => !n.read).length;
      set({ notifications: data, unreadCount: unread, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    await api.patch(`/notifications/${id}/read`);
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },

  markAllRead: async () => {
    await api.post('/notifications/read-all');
    const notifications = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications, unreadCount: 0 });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
