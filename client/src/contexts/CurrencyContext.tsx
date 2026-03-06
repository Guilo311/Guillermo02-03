import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { MoneyFormatter } from "@/lib/moneyFormatter";
import { trpc } from "@/lib/trpc";
import { BASE_CURRENCY, SUPPORTED_CURRENCIES, type SupportedCurrency } from "@shared/currency";

const STORAGE_KEY = "glx-dashboard-currency";

type CurrencyContextValue = {
  currency: SupportedCurrency;
  baseCurrency: SupportedCurrency;
  supportedCurrencies: readonly SupportedCurrency[];
  lastUpdatedAt: string | null;
  rate: number | null;
  stale: boolean;
  warning: string | null;
  setCurrency: (currency: SupportedCurrency) => Promise<void>;
  convertMoneyValue: (amount: number) => number;
  formatMoney: (amount: number, options?: Intl.NumberFormatOptions) => string;
  formatCompactMoney: (amount: number) => string;
  moneyTitle: (label: string) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStoredCurrency(): SupportedCurrency {
  if (typeof window === "undefined") return BASE_CURRENCY;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_CURRENCIES.includes(stored as SupportedCurrency)) {
    return stored as SupportedCurrency;
  }
  return BASE_CURRENCY;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
  const stateQuery = trpc.currency.getState.useQuery(undefined, {
    enabled: Boolean(meQuery.data),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const setPreferenceMutation = trpc.currency.setPreference.useMutation();
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => readStoredCurrency());

  useEffect(() => {
    if (stateQuery.data?.preferredCurrency) {
      setCurrencyState(stateQuery.data.preferredCurrency);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, stateQuery.data.preferredCurrency);
      }
    }
  }, [stateQuery.data?.preferredCurrency]);

  const setCurrency = useCallback(async (nextCurrency: SupportedCurrency) => {
    setCurrencyState(nextCurrency);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextCurrency);
    }

    if (meQuery.data) {
      await setPreferenceMutation.mutateAsync({ currency: nextCurrency });
      await stateQuery.refetch();
    }
  }, [meQuery.data, setPreferenceMutation, stateQuery]);

  const snapshot = stateQuery.data?.snapshot;
  const baseCurrency = (stateQuery.data?.baseCurrency ?? BASE_CURRENCY) as SupportedCurrency;
  const exchangeRate = snapshot?.rates?.[currency];
  const stale = snapshot?.stale ?? false;
  const warning = snapshot?.warning ?? null;
  const convertMoneyValue = useCallback((amount: number) => {
    if (!Number.isFinite(amount)) return amount;
    if (!snapshot || currency === baseCurrency) return amount;
    if (!Number.isFinite(exchangeRate ?? NaN)) return amount;
    return amount * (exchangeRate as number);
  }, [baseCurrency, currency, exchangeRate, snapshot]);

  const formatMoney = useCallback((amount: number, options?: Intl.NumberFormatOptions) => {
    const converted = convertMoneyValue(amount);
    return MoneyFormatter.format(converted, currency, options);
  }, [convertMoneyValue, currency]);

  const formatCompactMoney = useCallback((amount: number) => {
    const converted = convertMoneyValue(amount);
    return MoneyFormatter.formatCompact(converted, currency);
  }, [convertMoneyValue, currency]);

  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    baseCurrency,
    supportedCurrencies: stateQuery.data?.supportedCurrencies ?? SUPPORTED_CURRENCIES,
    lastUpdatedAt: snapshot?.fetchedAt ?? null,
    rate: Number.isFinite(exchangeRate ?? NaN) ? (exchangeRate as number) : null,
    stale,
    warning,
    setCurrency,
    convertMoneyValue,
    formatMoney,
    formatCompactMoney,
    moneyTitle: (label: string) => `${label} (${currency})`,
  }), [
    baseCurrency,
    convertMoneyValue,
    currency,
    exchangeRate,
    formatCompactMoney,
    formatMoney,
    setCurrency,
    snapshot?.fetchedAt,
    stale,
    stateQuery.data?.supportedCurrencies,
    warning,
  ]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
