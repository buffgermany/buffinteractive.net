import {getRequestConfig} from 'next-intl/server';
import {cookies, headers} from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  let locale = cookieStore.get('buff_locale')?.value;

  if (!locale) {
    try {
      const headersList = await headers();
      const acceptLanguage = headersList.get('accept-language');
      if (acceptLanguage) {
        // Parse Accept-Language header, e.g., "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7"
        const preferredLocales = acceptLanguage
          .split(',')
          .map((lang) => {
            const parts = lang.trim().split(';');
            const code = parts[0] || '';
            return code.split('-')[0]?.toLowerCase() || '';
          })
          .filter(Boolean);

        const supportedLocales = ['de', 'es', 'en'];
        locale = preferredLocales.find((lang) => supportedLocales.includes(lang));
      }
    } catch (e) {
      // Fail-safe in case headers reading fails in a static/pre-render context
    }
  }

  // Default fallback
  locale = locale || 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
