import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip locale routing for non-storefront paths
  const isNonStorefront = /^\/(admin|auth|dashboard|api|sales|_next|favicon\.ico|robots\.txt|sitemap\.xml)/.test(pathname);
  if (isNonStorefront) {
    return NextResponse.next();
  }

  // Redirect known but unsupported language prefixes to the default locale
  // This prevents /nl/growth from becoming /de/nl/growth (which 404s)
  // and instead cleanly redirects to /de/growth.
  const segments = pathname.split('/');
  const firstSegment = segments[1];
  const unsupportedLocales = ['fr', 'nl', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'tr', 'pl', 'da', 'sv', 'fi', 'no', 'cs', 'hu'];
  
  if (firstSegment && unsupportedLocales.includes(firstSegment.toLowerCase())) {
    segments[1] = routing.defaultLocale;
    const newUrl = new URL(segments.join('/') || '/', request.url);
    newUrl.search = request.nextUrl.search;
    return NextResponse.redirect(newUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!admin|auth|dashboard|api|sales|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot|css|js|map)).*)',
  ],
};
