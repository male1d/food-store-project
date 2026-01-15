'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore'; // Импортируем наш стор
import $api from '@/api/axios';
import { Link } from '@/navigation'

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login); // Метод для сохранения сессии
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Регистрируем пользователя
      await $api.post('/auth/register', formData);

      // 2. Сразу выполняем вход (автологин), чтобы получить токен
      const loginResponse = await $api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      // 3. Сохраняем данные в Zustand и куки через наш метод login
      const { user, access_token } = loginResponse.data;
      login(user, access_token);

      // 4. Перенаправляем в профиль или на главную
      router.push('/profile');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-[50px] flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[20px] shadow-sm w-full max-w-md flex flex-col gap-4 border border-gray-100">
        <h1 className="text-2xl font-bold text-[#1565C0] mb-2">Создать аккаунт</h1>
        
        {/* Вместо алертов выводим ошибку текстом в форме */}
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <input 
            type="text" placeholder="Имя" required
            className="border p-3 rounded-xl outline-none focus:border-[#1565C0] transition-all"
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
          />
          <input 
            type="text" placeholder="Фамилия" required
            className="border p-3 rounded-xl outline-none focus:border-[#1565C0] transition-all"
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
          />
        </div>

        <input 
          type="email" placeholder="Email" required
          className="border p-3 rounded-xl outline-none focus:border-[#1565C0] transition-all"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <input 
          type="tel" placeholder="Телефон" required
          className="border p-3 rounded-xl outline-none focus:border-[#1565C0] transition-all"
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
        <input 
          type="password" placeholder="Пароль" required
          className="border p-3 rounded-xl outline-none focus:border-[#1565C0] transition-all"
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
        
        <button 
          type="submit" 
          disabled={isLoading}
          className={`bg-[#1565C0] text-white py-3 rounded-xl font-bold hover:bg-[#0D47A1] transition-all mt-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
        
        <p className="text-center text-sm text-gray-500 mt-2">
          Уже есть аккаунт? <Link href="/login" className="text-[#1565C0] font-semibold hover:underline">Войти</Link>
        </p>
      </form>
    </div>
  );
}