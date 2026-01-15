'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Как только сайт загрузился в браузере, проверяем, жива ли сессия
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}