import { useCallback, useSyncExternalStore } from "react";
import { createStore } from "zustand/vanilla";

export type AdminPeriod = "7d" | "30d" | "90d" | "mtd" | "qtd" | "ytd" | "monthly" | "quarterly" | "semiannual";
export type AdminProduct = "ALL" | "OS" | "ADVISORY";
export type AdminSemaforo = "ALL" | "green" | "yellow" | "red";

type DrilldownPayload = {
  type: "kpi" | "chart" | "alert";
  title: string;
  description?: string;
  formula?: string;
  source?: string;
  thresholds?: {
    green: string;
    yellow: string;
    red: string;
  };
};

export type AdminChartFilter = {
  dimension: "stage" | "source" | "product" | "month" | "client" | "capacityBand";
  value: string;
  label: string;
};

type AdminDashboardState = {
  period: AdminPeriod;
  product: AdminProduct;
  semaforo: AdminSemaforo;
  chartFilter: AdminChartFilter | null;
  activeDrilldown: DrilldownPayload | null;
  setPeriod: (period: AdminPeriod) => void;
  setProduct: (product: AdminProduct) => void;
  setSemaforo: (semaforo: AdminSemaforo) => void;
  setChartFilter: (chartFilter: AdminChartFilter | null) => void;
  clearChartFilter: () => void;
  openDrilldown: (payload: DrilldownPayload) => void;
  closeDrilldown: () => void;
  syncFromQuery: (params: URLSearchParams) => void;
};

const adminDashboardStore = createStore<AdminDashboardState>((set) => ({
  period: "30d",
  product: "ALL",
  semaforo: "ALL",
  chartFilter: null,
  activeDrilldown: null,
  setPeriod: (period) => set({ period }),
  setProduct: (product) => set({ product }),
  setSemaforo: (semaforo) => set({ semaforo }),
  setChartFilter: (chartFilter) => set({ chartFilter }),
  clearChartFilter: () => set({ chartFilter: null }),
  openDrilldown: (activeDrilldown) => set({ activeDrilldown }),
  closeDrilldown: () => set({ activeDrilldown: null }),
  syncFromQuery: (params) =>
    set({
      period: (params.get("period") as AdminPeriod) || "30d",
      product: (params.get("product") as AdminProduct) || "ALL",
      semaforo: (params.get("semaforo") as AdminSemaforo) || "ALL",
      chartFilter: null,
    }),
}));

export function useAdminDashboardStore(): AdminDashboardState;
export function useAdminDashboardStore<T>(selector: (state: AdminDashboardState) => T): T;
export function useAdminDashboardStore<T>(selector?: (state: AdminDashboardState) => T) {
  const select = useCallback(
    (state: AdminDashboardState) => (selector ? selector(state) : (state as unknown as T)),
    [selector],
  );

  return useSyncExternalStore(
    adminDashboardStore.subscribe,
    () => select(adminDashboardStore.getState()),
    () => select(adminDashboardStore.getInitialState()),
  );
}
