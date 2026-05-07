import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'ko', 'ja'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Already has locale prefix - let through
  if (locales.some(l => pathname.startsWith(/+l+/) || pathname === /+l)) {
    return NextResponse.next();
  }

  // Static, API, internal - skip
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Detect locale from Accept-Language
  const acceptLang = request.headers.get('accept-language') || '';
  let locale = defaultLocale;
  if (acceptLang.toLowerCase().includes('ko')) locale = 'ko';
  else if (acceptLang.toLowerCase().includes('ja')) locale = 'ja';
  else if (acceptLang.toLowerCase().includes('en')) locale = 'en';

  // Redirect root to /[locale]
  const newUrl = new URL(/+locale+(pathname === '/' ? '' : pathname), request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};