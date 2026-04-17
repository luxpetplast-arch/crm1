import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        // Darhol localStorage ga yozish (persist middleware kutishdan oldin)
        localStorage.setItem('auth-storage', JSON.stringify({ state: { token, user } }));
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem('auth-storage');
        set({ token: null, user: null });
      },
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        return user.role === permission || user.role === 'admin';
      },
    }),
    { name: 'auth-storage' }
  )
);
