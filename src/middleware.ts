import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'ko', 'ja'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle the bare root path - everything else passes through
  // (so /about/, /blog/ in public/ are served directly as static)
  if (pathname !== '/') {
    return NextResponse.next();
  }

  // Detect locale
  const acceptLang = request.headers.get('accept-language') || '';
  let locale = defaultLocale;
  if (acceptLang.toLowerCase().includes('ko')) locale = 'ko';
  else if (acceptLang.toLowerCase().includes('ja')) locale = 'ja';
  else if (acceptLang.toLowerCase().includes('en')) locale = 'en';

  return NextResponse.redirect(new URL('/' + locale, request.url));
}

export const config = {
  matcher: ['/'],
};