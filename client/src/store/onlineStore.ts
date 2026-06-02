import { create } from 'zustand';

interface OnlineStore {
  onlineUsers: Set<string>;
  setOnline: (userId: string) => void;
  setOffline: (userId: string) => void;
}

export const useOnlineStore = create<OnlineStore>((set) => ({
  onlineUsers: new Set(),
  setOnline: (userId) => set((s) => { const next = new Set(s.onlineUsers); next.add(userId); return { onlineUsers: next }; }),
  setOffline: (userId) => set((s) => { const next = new Set(s.onlineUsers); next.delete(userId); return { onlineUsers: next }; }),
}));
