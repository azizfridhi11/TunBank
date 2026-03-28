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
      },
      tn: {
        translation: {
          // Navigation
          "Dashboard": "الصفحة الرئيسية",
          "Accounts": "الحسابات",
          "Transfers": "تحويل فلوس",
          "Cards": "البطاقات",
          "Settings": "الإعدادات",
          "Services": "الخدمات",
          "Loans": "القروض",
          "Assistant": "المساعد",
          "Sign Out": "اخرج",

          // Auth
          "Welcome back": "مرحبا بيك",
          "Secure Access": "ادخل لحسابك",
          "Welcome to your digital vault": "بنك تونس الرقمي",
          "Sign In": "دخول",
          "Register": "تسجيل",
          "Email or Username": "الإيميل ولا الاسم",
          "Password": "كلمة السر",
          "Forgot?": "نسيت؟",
          "Authenticate Securely": "دخول آمن",
          "Full Name": "الاسم الكامل",
          "Email Address": "الإيميل",
          "Secure Password": "كلمة السر",
          "Establish Membership": "سجّل",
          "ID Card Number": "رقم بطاقة الهوية",
          "Bank Card Number": "رقم البطاقة البنكية",
          "Having trouble logging in?": "عندك مشكلة في الدخول؟",
          "Contact Support": "اتصل بالدعم",

          // Dashboard
          "Recent Transactions": "آخر المعاملات",
          "Cash Flow": "حركة الفلوس",
          "New Transfer": "تحويل جديد",
          "Open New Account": "افتح حساب جديد",
          "Manage your bank accounts": "تعامل مع حساباتك وفلوسك.",
          "Add New Account": "زيد حساب جديد",
          "Savings, Checking, or Business": "توفير، جاري ولا تجاري",
          "Total Balance": "الرصيد الكلي",
          "Income": "دخل",
          "Expenses": "مصاريف",
          "No transactions yet": "ما فماش معاملات لحد الآن",

          // Accounts
          "Account Number": "رقم الحساب",
          "Balance": "الرصيد",
          "Currency": "العملة",
          "Active": "نشيط",
          "Inactive": "موقوف",
          "checking": "جاري",
          "savings": "توفير",
          "business": "تجاري",

          // Transfers
          "From Account": "من الحساب",
          "To Account Number": "لرقم الحساب",
          "Amount": "المبلغ",
          "Description": "وصف",
          "Send Money": "ابعث فلوس",
          "Transfer Money": "حوّل فلوس",
          "Choose an account": "اختار حساب",
          "Recipient account number": "رقم حساب المستلم",
          "Optional note": "ملاحظة (اختياري)",
          "Insufficient funds": "ما عندكش فلوس بالقد",

          // Services
          "Nos Services": "خدماتنا",
          "Choisir le service à utiliser": "اختار الخدمة اللي تحتاجها",
          "Recharge Téléphonique": "شحن الهاتف",
          "Smart Facture": "دفع الفواتير",
          "Émission Mandat": "إرسال مانطا",
          "Encaissement Mandat": "استلام مانطا",
          "Inscription Élève": "تسجيل في المدرسة",
          "Micro Crédit": "قرض صغير",
          "Naf9a": "نفقة",
          "Paiement Commerçant": "دفع للتاجر",
          "Compte à débiter": "الحساب اللي تدفع منه",
          "Choisir un compte": "اختار حساب",
          "Choisir votre opérateur": "اختار الشركة",
          "Sélectionner un opérateur": "اختار شركة الهاتف",
          "Numéro de téléphone": "رقم الهاتف",
          "Montant de la recharge (DT)": "قيمة الشحن (دينار)",
          "Confirmer": "أكّد",
          "Organisme": "المؤسسة",
          "Sélectionner un organisme": "اختار المؤسسة",
          "Référence Facture": "رقم الفاتورة",
          "Montant (DT)": "المبلغ (دينار)",
          "Payer la facture": "ادفع الفاتورة",
          "Succès": "نجح",
          "Recharge processed successfully": "الشحن تم بنجاح",
          "Facture payée avec succès": "الفاتورة تدفعت بنجاح",
          "Erreur": "خطأ",

          // Cards
          "Loan Repayment": "دفع القرض",
          "Manage and pay your loan installments securely.": "تعامل مع أقساط قرضك بأمان.",
          "No active loans found.": "ما فماش قروض نشيطة.",
          "Loan Amount": "قيمة القرض",
          "Remaining Balance": "الباقي",
          "Monthly Installment": "القسط الشهري",
          "Interest Rate": "نسبة الفائدة",
          "Total Interest": "مجموع الفائدة",
          "Total Repayment": "مجموع ما تدفعه",
          "Make Repayment": "ادفع قسط",
          "Select Account": "اختار حساب",
          "Repayment Amount": "قيمة الدفع",
          "Confirm Payment": "أكّد الدفع",
          "Please select an account": "اختار حساب من فضلك",
          "Amount must be greater than 0": "المبلغ لازم يكون أكبر من 0",
          "Payment processed successfully": "الدفع تم بنجاح",
          "Repayment failed": "الدفع فشل",
          "Personal Loan": "قرض شخصي",
          "ACTIVE": "نشيط",
          "PAID": "مدفوع",

          // General
          "Language": "اللغة",
          "Theme": "المظهر",
          "Loading...": "يحمّل...",
          "Error": "خطأ",
          "Success": "نجح",
          "ID": "الرقم",
          "Loans": "القروض"
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
