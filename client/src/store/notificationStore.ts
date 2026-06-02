import { create } from 'zustand';
import api from '../api/client';
import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  fetchNotifications: (reset?: boolean) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  nextCursor: null,
  hasMore: false,

  fetchNotifications: async (reset = false) => {
    const { nextCursor, loading } = get();
    if (loading || (!reset && !nextCursor && get().notifications.length > 0)) return;
    set({ loading: true });
    try {
      const cursor = reset ? '' : nextCursor || '';
      const { data } = await api.get(`/notifications?${cursor ? `cursor=${cursor}` : ''}`);
      const items = data.notifications || data;
      const newCursor = data.nextCursor || null;
      set((state) => ({
        notifications: reset ? items : [...state.notifications, ...items],
        unreadCount: reset ? items.filter((n: Notification) => !n.read).length : state.unreadCount,
        nextCursor: newCursor,
        hasMore: newCursor !== null,
        loading: false,
      }));
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

  deleteNotification: async (id) => {
    await api.delete(`/notifications/${id}`);
    const notifications = get().notifications.filter((n) => n.id !== id);
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
