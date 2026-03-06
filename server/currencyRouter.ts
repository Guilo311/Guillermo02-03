import { z } from "zod";

import { BASE_CURRENCY, SUPPORTED_CURRENCIES, type SupportedCurrency } from "@shared/currency";
import { protectedProcedure, router } from "./_core/trpc";
import { currencyService } from "./domain/currencyService";
import { updateUserPreferredCurrency } from "./db";

const currencyEnum = z.enum(SUPPORTED_CURRENCIES);

export const currencyRouter = router({
  getState: protectedProcedure.query(async ({ ctx }) => {
    const snapshot = await currencyService.getSnapshot(BASE_CURRENCY);
    const preferredCurrency = (ctx.user?.preferredCurrency as SupportedCurrency | undefined) ?? BASE_CURRENCY;

    return {
      baseCurrency: BASE_CURRENCY,
      preferredCurrency,
      supportedCurrencies: SUPPORTED_CURRENCIES,
      snapshot,
    };
  }),
  setPreference: protectedProcedure
    .input(z.object({ currency: currencyEnum }))
    .mutation(async ({ ctx, input }) => {
      await updateUserPreferredCurrency(ctx.user!.id, input.currency);

      return {
        success: true,
        preferredCurrency: input.currency,
      };
    }),
});

export type CurrencyRouter = typeof currencyRouter;
