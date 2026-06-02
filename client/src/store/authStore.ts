import { create } from 'zustand';
import api from '../api/client';
import { socket } from '../api/socket';
import type { User } from '../types';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<void>;
  sendVerification: () => Promise<string>;
  verifyEmail: (token: string) => Promise<void>;
  completeOnboarding: (data: Record<string, unknown>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      socket.auth = { token: data.token };
      socket.connect();
      set({ token: data.token, user: data.user, loading: false });
      toast.success(`Welcome back, ${data.user.name}!`);
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Login failed', loading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      socket.auth = { token: data.token };
      socket.connect();
      set({ token: data.token, user: data.user, loading: false });
      toast.success(`Welcome to DevConnect, ${data.user.name}!`);
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Registration failed', loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    socket.disconnect();
    set({ user: null, token: null });
  },

  loadUser: async () => {
    let token = get().token;
    if (!token) {
      token = localStorage.getItem('token');
      if (token) set({ token });
    }
    if (!token) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, loading: false });
      if (!socket.connected) {
        socket.auth = { token };
        socket.connect();
      }
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),

  forgotPassword: async (email) => {
    set({ error: null });
    const { data } = await api.post('/auth/forgot-password', { email });
    return data.resetToken;
  },

  resetPassword: async (token, password) => {
    set({ error: null });
    await api.post('/auth/reset-password', { token, password });
  },

  sendVerification: async () => {
    set({ error: null });
    const { data } = await api.post('/auth/send-verification');
    return data.verificationToken;
  },

  verifyEmail: async (token) => {
    set({ error: null });
    await api.get(`/auth/verify-email/${token}`);
    const user = get().user;
    if (user) set({ user: { ...user, emailVerified: true } });
  },

  completeOnboarding: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await api.post('/auth/onboarding', data);
      set({ user: updated, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Onboarding failed', loading: false });
      throw err;
    }
  },
}));
