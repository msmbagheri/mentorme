import type { AppLocale } from "@/types/locale";

/**
 * Picks the correct localized value from a paired `*_en` / `*_fa` object.
 * Falls back to EN if the requested locale value is empty.
 */
export function pick<
  T extends Record<string, unknown>,
  K extends string,
>(obj: T, base: K, locale: AppLocale): string {
  const key = `${base}_${locale}` as keyof T;
  const fallback = `${base}_en` as keyof T;
  const value = obj[key];
  if (typeof value === "string" && value.length > 0) return value;
  const fb = obj[fallback];
  return typeof fb === "string" ? fb : "";
}

/** Static UI strings (chrome only — all business content is DB-driven). */
export const dictionary = {
  en: {
    skipToContent: "Skip to main content",
    menu: "Menu",
    close: "Close",
    openMenu: "Open menu",
    switchLanguage: "تغییر زبان به فارسی",
    home: "Home",
    readMore: "Read more",
    viewDetails: "View Details",
    viewProfile: "View Profile",
    register: "Register",
    loading: "Loading…",
    backToHome: "Back to home",
    notFoundTitle: "Page not found",
    notFoundBody: "The page you are looking for doesn’t exist or has moved.",
    errorTitle: "Something went wrong",
    errorBody: "An unexpected error occurred. Please try again.",
    tryAgain: "Try again",
    relatedServices: "Related Services",
    relatedStories: "Related Stories",
    contactForm: {
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      grade: "Grade",
      country: "Country",
      notes: "How can we help?",
      submit: "Send message",
      submitting: "Sending…",
      success: "Thank you! We’ll be in touch shortly.",
      error: "Something went wrong. Please try again.",
      selectGrade: "Select grade",
    },
    contact: {
      title: "Book a Consultation",
      info: "Contact information",
      hours: "Business hours",
    },
  },
  fa: {
    skipToContent: "رفتن به محتوای اصلی",
    menu: "منو",
    close: "بستن",
    openMenu: "باز کردن منو",
    switchLanguage: "Switch language to English",
    home: "خانه",
    readMore: "بیشتر بخوانید",
    viewDetails: "جزئیات",
    viewProfile: "مشاهده پروفایل",
    register: "ثبت‌نام",
    loading: "در حال بارگذاری…",
    backToHome: "بازگشت به خانه",
    notFoundTitle: "صفحه یافت نشد",
    notFoundBody: "صفحه‌ای که دنبال آن هستید وجود ندارد یا منتقل شده است.",
    errorTitle: "خطایی رخ داد",
    errorBody: "خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.",
    tryAgain: "تلاش مجدد",
    relatedServices: "خدمات مرتبط",
    relatedStories: "داستان‌های مرتبط",
    contactForm: {
      firstName: "نام",
      lastName: "نام خانوادگی",
      email: "ایمیل",
      phone: "تلفن",
      grade: "پایه تحصیلی",
      country: "کشور",
      notes: "چطور می‌توانیم کمک کنیم؟",
      submit: "ارسال پیام",
      submitting: "در حال ارسال…",
      success: "سپاسگزاریم! به‌زودی با شما تماس می‌گیریم.",
      error: "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
      selectGrade: "انتخاب پایه",
    },
    contact: {
      title: "رزرو مشاوره",
      info: "اطلاعات تماس",
      hours: "ساعات کاری",
    },
  },
} as const;

export function t(locale: AppLocale) {
  return dictionary[locale];
}
