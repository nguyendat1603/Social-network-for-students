import { create } from 'zustand';
import { AcademicProfile } from '../types/identity.types';

interface AuthState {
  user: AcademicProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (
    user: AcademicProfile,
    accessToken: string,
    refreshToken: string
  ) => void;
  setUser: (user: AcademicProfile) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem('mxh_hssv_access_token');
const storedUserRaw = localStorage.getItem('mxh_hssv_user');
const initialUser: AcademicProfile | null = storedUserRaw
  ? JSON.parse(storedUserRaw)
  : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  accessToken: storedToken,
  isAuthenticated: Boolean(storedToken && initialUser),

  setSession: (user, accessToken, refreshToken) => {
    localStorage.setItem('mxh_hssv_access_token', accessToken);
    localStorage.setItem('mxh_hssv_refresh_token', refreshToken);
    localStorage.setItem('mxh_hssv_user', JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },

  setUser: (user) => {
    localStorage.setItem('mxh_hssv_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('mxh_hssv_access_token');
    localStorage.removeItem('mxh_hssv_refresh_token');
    localStorage.removeItem('mxh_hssv_user');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
