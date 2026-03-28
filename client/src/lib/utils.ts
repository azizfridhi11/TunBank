import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currency: string = "TND") {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(value)) return "0.000 DT";
  if (currency === "TND") {
    return `${value.toFixed(3)} DT`;
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  TND: { TND: 1, USD: 0.34, EUR: 0.31, GBP: 0.27 },
  USD: { TND: 2.94, USD: 1, EUR: 0.91, GBP: 0.79 },
  EUR: { TND: 3.22, USD: 1.10, EUR: 1, GBP: 0.87 },
  GBP: { TND: 3.70, USD: 1.27, EUR: 1.15, GBP: 1 },
};

export const CURRENCY_FLAGS: Record<string, string> = {
  TND: "🇹🇳",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
};

export const CURRENCY_NAMES: Record<string, string> = {
  TND: "Dinar Tunisien",
  USD: "Dollar Américain",
  EUR: "Euro",
  GBP: "Livre Sterling",
};
