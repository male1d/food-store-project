import { create } from 'zustand';
import Cookies from 'js-cookie';
import $api from '@/api/axios';


interface AuthState {
  user: any | null;
  isAuth: boolean;
  token: string | null;
  userAddress: string;
  login: (userData: any, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUserAddress: (addr: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuth: false,
  token: Cookies.get('access_token') || null,
  userAddress: '',

  login: (userData, token) => {
    Cookies.set('access_token', token, { expires: 7 });
    set({ user: userData, isAuth: true, token: token });
  },

  logout: () => {
    Cookies.remove('access_token');
    set({ user: null, isAuth: false, token: null, userAddress: '' });
  },

  setUserAddress: (addr) => {
    set({ userAddress: addr });
  },

  checkAuth: async () => {
    try {
      const { data } = await $api.get('/users/me');
      const token = Cookies.get('access_token');
      set({ user: data, isAuth: true, token: token || null });
    } catch (e) {
      set({ user: null, isAuth: false, token: null, userAddress: '' });
    }
  }
}));