'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import $api from '@/api/axios';
import { Link } from '@/navigation'

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await $api.post('/auth/login', { email, password });
      
      // Вызываем метод из Zustand (он сохранит токен в куки и юзера в стейт)
      login(data.user, data.access_token);
      
      router.push('/profile'); // Перенаправляем на главную
    } catch (error: any) {
      alert('Неверный логин или пароль');
    }
  };

  return (
    <div className="mt-[150px] flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[20px] shadow-sm w-full max-w-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-[#1565C0] mb-4">Вход</h1>
        
        <input 
          type="email" placeholder="Email" required
          className="border p-3 rounded-xl outline-none focus:border-[#1565C0]"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Пароль" required
          className="border p-3 rounded-xl outline-none focus:border-[#1565C0]"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        
        <button type="submit" className="bg-[#1565C0] text-white py-3 rounded-xl font-bold hover:bg-[#0D47A1] transition-colors">
          Войти
        </button>

        <p className="text-center text-sm text-gray-500">
          Нет аккаунта? <Link href="/register" className="text-[#1565C0] underline">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
}