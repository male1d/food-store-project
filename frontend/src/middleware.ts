import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(ru|en|de)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};