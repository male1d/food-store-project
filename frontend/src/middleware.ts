// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

export default createMiddleware(routing);

export const config = {
  // Матчер должен четко определять, какие пути мы локализуем
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};