export type SemaforoStatus = "GREEN" | "YELLOW" | "RED";
export type DashboardScope = "PIPELINE" | "OPERATION";
export type ReviewFrequency = "DAILY" | "WEEKLY" | "MONTHLY";
export type SectionKind = "MODULE" | "BLOCK";

export type BriefingThreshold = {
  green: string;
  yellow: string;
  red: string;
};

export type BriefingKpiSpec = {
  code: string;
  name: string;
  scope: DashboardScope;
  sectionId: string;
  formula: string;
  thresholds: BriefingThreshold;
  frequency: ReviewFrequency;
  source: string;
  notes?: string;
};

export type BriefingSectionSpec = {
  id: string;
  scope: DashboardScope;
  kind: SectionKind;
  title: string;
  description: string;
  kpis: BriefingKpiSpec[];
};

export type BriefingViewSpec = {
  id: DashboardScope;
  title: string;
  questionAnswered: string;
  timeHorizon: string;
  reviewCadence: string;
  products: string[];
  funnelOs: string[];
  funnelAdvisory: string[];
  sections: BriefingSectionSpec[];
};

export type BriefingIntegrationSource = {
  id: string;
  name: string;
  dataFed: string[];
  integrationType: string;
  cadence: string;
};

export type BriefingAlertRule = {
  status: SemaforoStatus;
  trigger: string;
  requiredAction: string;
  deadline: string;
};

export type DeliveryPhase = {
  phase: number;
  title: string;
  includes: string[];
  suggestedWindow: string;
};

export type LayoutMappingSpec = {
  route: string;
  topPanel: string;
  bottomPanel: string;
};

export type AdminBriefingSpec = {
  objective: string;
  primaryUser: string;
  whyTwoViews: string;
  views: BriefingViewSpec[];
  integrations: BriefingIntegrationSource[];
  alerts: BriefingAlertRule[];
  cadence: {
    daily: string[];
    weekly: string[];
    monthly: string[];
  };
  deliveryPriority: DeliveryPhase[];
  layoutMapping: LayoutMappingSpec[];
};
