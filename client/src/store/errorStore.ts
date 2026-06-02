import { create } from 'zustand';

interface ErrorModalState {
  open: boolean;
  title: string;
  message: string;
  showModal: (title: string, message: string) => void;
  closeModal: () => void;
}

export const useErrorModalStore = create<ErrorModalState>((set) => ({
  open: false,
  title: '',
  message: '',
  showModal: (title, message) => set({ open: true, title, message }),
  closeModal: () => set({ open: false, title: '', message: '' }),
}));
