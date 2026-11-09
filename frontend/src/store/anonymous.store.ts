import { create } from 'zustand';

interface AnonymousModeState {
  isAnonymousActive: boolean;
  toggleAnonymousMode: () => void;
  setAnonymousMode: (active: boolean) => void;
}

export const useAnonymousStore = create<AnonymousModeState>((set) => ({
  isAnonymousActive: false,
  toggleAnonymousMode: () =>
    set((state) => ({ isAnonymousActive: !state.isAnonymousActive })),
  setAnonymousMode: (active) => set({ isAnonymousActive: active }),
}));
