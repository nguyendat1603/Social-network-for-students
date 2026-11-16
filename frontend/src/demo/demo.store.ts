import { create } from 'zustand';

const DEMO_KEY = 'campus_dev_demo';
export const isDemoMode = () => import.meta.env.DEV && sessionStorage.getItem(DEMO_KEY) === 'active';

export const useDemoStore = create<{ active: boolean; enter: (code: string) => boolean; exit: () => void }>((set) => ({
  active: isDemoMode(),
  enter: code => {
    if (!import.meta.env.DEV || code !== '4444') return false;
    sessionStorage.setItem(DEMO_KEY, 'active');
    set({ active: true });
    return true;
  },
  exit: () => {
    sessionStorage.removeItem(DEMO_KEY);
    set({ active: false });
  },
}));
