import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  toasts: Toast[];
  showAnnouncement: boolean;

  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  setShowAnnouncement: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  showAnnouncement: true,

  showToast: (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set(state => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },

  removeToast: (id: string) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },

  setShowAnnouncement: (show: boolean) => {
    set({ showAnnouncement: show });
  },
}));
