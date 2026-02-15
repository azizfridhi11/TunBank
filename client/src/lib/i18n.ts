import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "Dashboard": "Dashboard",
          "Accounts": "Accounts",
          "Transfers": "Transfers",
          "Cards": "Cards",
          "Settings": "Settings",
          "Sign Out": "Sign Out",
          "Welcome back": "Welcome back",
          "Recent Transactions": "Recent Transactions",
          "Cash Flow": "Cash Flow",
          "New Transfer": "New Transfer",
          "Open New Account": "Open New Account",
          "Manage your bank accounts": "Manage your bank accounts and savings.",
          "Add New Account": "Add New Account",
          "Savings, Checking, or Business": "Savings, Checking, or Business",
          "Language": "Language",
          "Theme": "Theme"
        }
      },
      fr: {
        translation: {
          "Dashboard": "Tableau de bord",
          "Accounts": "Comptes",
          "Transfers": "Virements",
          "Cards": "Cartes",
          "Settings": "Paramètres",
          "Sign Out": "Se déconnecter",
          "Welcome back": "Bon retour",
          "Recent Transactions": "Transactions récentes",
          "Cash Flow": "Flux de trésorerie",
          "New Transfer": "Nouveau virement",
          "Open New Account": "Ouvrir un compte",
          "Manage your bank accounts": "Gérez vos comptes bancaires et épargne.",
          "Add New Account": "Ajouter un compte",
          "Savings, Checking, or Business": "Épargne, Courant ou Affaires",
          "Language": "Langue",
          "Theme": "Thème"
        }
      },
      ar: {
        translation: {
          "Dashboard": "لوحة القيادة",
          "Accounts": "الحسابات",
          "Transfers": "التحويلات",
          "Cards": "البطاقات",
          "Settings": "الإعدادات",
          "Sign Out": "تسجيل الخروج",
          "Welcome back": "مرحبًا بعودتك",
          "Recent Transactions": "المعاملات الأخيرة",
          "Cash Flow": "التدفق النقدي",
          "New Transfer": "تحويل جديد",
          "Open New Account": "فتح حساب جديد",
          "Manage your bank accounts": "إدارة حساباتك المصرفية ومدخراتك.",
          "Add New Account": "إضافة حساب جديد",
          "Savings, Checking, or Business": "توفير ، جاري أو أعمال",
          "Language": "اللغة",
          "Theme": "المظهر"
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
