import axios from 'axios';
import Cookies from 'js-cookie';

// Создание экземпляра для работы с сервером
const $api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Интерцептор для автоматической подстановки JWT-токена
$api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default $api;