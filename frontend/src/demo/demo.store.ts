import { create } from 'zustand';

const DEMO_KEY = 'campus_dev_demo';
export const isDemoMode = () => sessionStorage.getItem(DEMO_KEY) === 'active';

export const useDemoStore = create<{ active: boolean; enter: (username: string, password: string) => boolean; exit: () => void }>((set) => ({
  active: isDemoMode(),
  enter: (username, password) => {
    if (username.trim() !== 'gakusei' || password !== '4444') return false;
    sessionStorage.setItem(DEMO_KEY, 'active');
    set({ active: true });
    return true;
  },
  exit: () => {
    sessionStorage.removeItem(DEMO_KEY);
    set({ active: false });
  },
}));
