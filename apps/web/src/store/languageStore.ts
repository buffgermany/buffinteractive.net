import { create } from 'zustand';

interface LanguageState {
  locale: string;
  setLocale: (locale: string) => void;
  hasDismissedLanguagePopup: boolean;
  dismissLanguagePopup: (currentLocale?: string) => void;
}

// Function to safely read initial values
const getInitialLocale = (): string => {
    if (typeof document === 'undefined') return 'en';
    const match = document.cookie.match(new RegExp('(^| )buff_locale=([^;]+)'));
    if (match && match[2]) return match[2];
    return 'en';
};

const getInitialDismissed = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('buff_lang_preference') === 'true';
};

export const useLanguageStore = create<LanguageState>((set) => ({
  locale: getInitialLocale(),
  hasDismissedLanguagePopup: getInitialDismissed(),

  setLocale: (newLocale) => {
    if (typeof document !== 'undefined') {
        // Expire in 365 days
        const date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `buff_locale=${newLocale};expires=${date.toUTCString()};path=/`;
    }
    if (typeof window !== 'undefined') {
        localStorage.setItem('buff_lang_preference', 'true');
    }
    set({ locale: newLocale, hasDismissedLanguagePopup: true });
  },

  dismissLanguagePopup: (currentLocale) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('buff_lang_preference', 'true');
    }
    if (currentLocale && typeof document !== 'undefined') {
        const date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `buff_locale=${currentLocale};expires=${date.toUTCString()};path=/`;
    }
    set((state) => ({ 
      hasDismissedLanguagePopup: true,
      locale: currentLocale || state.locale 
    }));
  }
}));
