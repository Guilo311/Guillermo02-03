import { BASE_CURRENCY, SUPPORTED_CURRENCIES, type SupportedCurrency } from "@shared/currency";

export interface ExchangeRateProvider {
  readonly providerName: string;
  fetchLatest(base: SupportedCurrency, symbols: SupportedCurrency[]): Promise<{
    base: SupportedCurrency;
    rates: Partial<Record<SupportedCurrency, number>>;
    fetchedAt: string;
  }>;
}

export interface ExchangeRateSnapshot {
  base: SupportedCurrency;
  rates: Record<SupportedCurrency, number>;
  fetchedAt: string;
  provider: string;
  stale: boolean;
  warning?: string;
}

class FrankfurterExchangeRateProvider implements ExchangeRateProvider {
  readonly providerName = "frankfurter";

  constructor(private readonly endpointBase: string) {}

  async fetchLatest(base: SupportedCurrency, symbols: SupportedCurrency[]) {
    const endpoint = new URL(this.endpointBase);
    endpoint.searchParams.set("base", base);
    endpoint.searchParams.set(
      "symbols",
      symbols.filter((symbol) => symbol !== base).join(","),
    );

    const response = await fetch(endpoint.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`[Currency] Frankfurter request failed with ${response.status}`);
    }

    const payload = await response.json() as {
      base?: SupportedCurrency;
      date?: string;
      rates?: Record<string, number>;
    };

    return {
      base,
      fetchedAt: payload.date ?? new Date().toISOString(),
      rates: Object.fromEntries(
        Object.entries(payload.rates ?? {})
          .filter((entry): entry is [SupportedCurrency, number] => Boolean(entry[0] && Number.isFinite(entry[1]))),
      ) as Partial<Record<SupportedCurrency, number>>,
    };
  }
}

type CacheEntry = {
  snapshot: ExchangeRateSnapshot;
  expiresAt: number;
};

export class CurrencyService {
  private readonly cache = new Map<SupportedCurrency, CacheEntry>();
  private readonly refreshTimers = new Map<SupportedCurrency, NodeJS.Timeout>();

  constructor(
    private readonly provider: ExchangeRateProvider,
    private readonly ttlMs = 30 * 60 * 1000,
  ) {}

  private normalizeRates(base: SupportedCurrency, partialRates: Partial<Record<SupportedCurrency, number>>) {
    const rates = Object.fromEntries(
      SUPPORTED_CURRENCIES.map((currency) => [currency, currency === base ? 1 : partialRates[currency] ?? NaN]),
    ) as Record<SupportedCurrency, number>;

    return rates;
  }

  private buildBaseFallback(base: SupportedCurrency, warning: string): ExchangeRateSnapshot {
    const rates = Object.fromEntries(
      SUPPORTED_CURRENCIES.map((currency) => [currency, currency === base ? 1 : NaN]),
    ) as Record<SupportedCurrency, number>;

    return {
      base,
      rates,
      fetchedAt: new Date().toISOString(),
      provider: this.provider.providerName,
      stale: true,
      warning,
    };
  }

  async getSnapshot(base: SupportedCurrency = BASE_CURRENCY) {
    const now = Date.now();
    const cached = this.cache.get(base);

    if (cached && cached.expiresAt > now) {
      return cached.snapshot;
    }

    try {
      const latest = await this.provider.fetchLatest(base, [...SUPPORTED_CURRENCIES]);
      const snapshot: ExchangeRateSnapshot = {
        base,
        rates: this.normalizeRates(base, latest.rates),
        fetchedAt: latest.fetchedAt,
        provider: this.provider.providerName,
        stale: false,
      };

      this.cache.set(base, {
        snapshot,
        expiresAt: now + this.ttlMs,
      });

      return snapshot;
    } catch (error) {
      if (cached?.snapshot) {
        return {
          ...cached.snapshot,
          stale: true,
          warning: "Usando última cotação válida em cache.",
        };
      }

      return this.buildBaseFallback(
        base,
        error instanceof Error
          ? `Sem cotação disponível. Exibindo valores em ${base}.`
          : `Sem cotação disponível. Exibindo valores em ${base}.`,
      );
    }
  }

  convertFromBase(amount: number, targetCurrency: SupportedCurrency, snapshot: ExchangeRateSnapshot) {
    if (!Number.isFinite(amount)) return amount;
    if (targetCurrency === snapshot.base) return amount;

    const rate = snapshot.rates[targetCurrency];
    if (!Number.isFinite(rate) || rate <= 0) {
      return amount;
    }

    return amount * rate;
  }

  startAutoRefresh(base: SupportedCurrency = BASE_CURRENCY) {
    if (this.refreshTimers.has(base)) {
      return;
    }

    const timer = setInterval(() => {
      void this.getSnapshot(base);
    }, this.ttlMs);

    if (typeof timer.unref === "function") {
      timer.unref();
    }

    this.refreshTimers.set(base, timer);
    void this.getSnapshot(base);
  }
}

const exchangeApiBase = process.env.EXCHANGE_RATE_API_BASE_URL?.trim() || "https://api.frankfurter.dev/v1/latest";
const exchangeRateTtlMs = Number(process.env.EXCHANGE_RATE_CACHE_TTL_MS ?? 30 * 60 * 1000);

export const currencyService = new CurrencyService(
  new FrankfurterExchangeRateProvider(exchangeApiBase),
  Number.isFinite(exchangeRateTtlMs) && exchangeRateTtlMs > 0 ? exchangeRateTtlMs : 30 * 60 * 1000,
);
