import { useAnonymousStore } from '../store/anonymous.store';
import { useAuthStore } from '../store/auth.store';

export function useAnonymousMode() {
  const { isAnonymousActive, toggleAnonymousMode, setAnonymousMode } =
    useAnonymousStore();
  const user = useAuthStore((s) => s.user);

  return {
    isAnonymousActive,
    toggleAnonymousMode,
    setAnonymousMode,
    anonymousHandle: user?.anonymousHandle || 'SinhVienAnDanh',
  };
}
