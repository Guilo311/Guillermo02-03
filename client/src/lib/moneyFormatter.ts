import { CURRENCY_LOCALE_MAP, type SupportedCurrency } from "@shared/currency";

export const MoneyFormatter = {
  format(value: number, currency: SupportedCurrency, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(CURRENCY_LOCALE_MAP[currency] ?? "pt-BR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      ...options,
    }).format(value);
  },
  formatCompact(value: number, currency: SupportedCurrency) {
    return new Intl.NumberFormat(CURRENCY_LOCALE_MAP[currency] ?? "pt-BR", {
      style: "currency",
      currency,
      notation: Math.abs(value) >= 1000 ? "compact" : "standard",
      maximumFractionDigits: Math.abs(value) >= 1000 ? 1 : 0,
    }).format(value);
  },
};
