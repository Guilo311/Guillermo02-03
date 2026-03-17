import AdminLayout, { useAdminTheme } from "@/components/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminErrorsUiCopy } from "@/lib/adminUiLocale";
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  Bell,
  BellOff,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Line } from "react-chartjs-2";
import { MotionPageShell } from "@/animation/components/MotionPageShell";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const errorRateData = {
  labels: ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"],
  datasets: [
    {
      label: "Erros 4xx",
      data: [12, 8, 5, 3, 15, 28, 45, 38, 52, 35, 22, 18],
      borderColor: "#eab308",
      backgroundColor: "rgba(234, 179, 8, 0.1)",
      tension: 0.4,
    },
    {
      label: "Erros 5xx",
      data: [2, 1, 0, 1, 3, 8, 12, 15, 18, 10, 5, 3],
      borderColor: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      tension: 0.4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        usePointStyle: true,
        boxWidth: 10,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(148, 163, 184, 0.18)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

const alerts = [
  { id: 1, type: "critical", module: "API", message: "Taxa de erro 5xx acima de 10% no modulo de pagamentos", time: "5 min atras", active: true },
  { id: 2, type: "warning", module: "Database", message: "Latencia do banco de dados acima de 100ms", time: "15 min atras", active: true },
  { id: 3, type: "warning", module: "Workers", message: "Fila de processamento com 500+ itens pendentes", time: "30 min atras", active: false },
  { id: 4, type: "info", module: "CDN", message: "Cache invalidado para /api/v2/*", time: "1h atras", active: false },
];

function StatCard({
  title,
  value,
  helper,
  icon,
  valueClassName,
  extra,
}: {
  title: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  valueClassName?: string;
  extra?: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <CardTitle className="pr-3 text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={valueClassName ?? "text-3xl font-semibold tracking-[-0.04em] text-[#0f172a]"}>{value}</div>
        {extra}
        <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminErros() {
  const { theme } = useAdminTheme();
  const { language } = useLanguage();
  const copy = getAdminErrorsUiCopy(language);

  const alerts = [
    { id: 1, type: "critical", module: copy.alertModules.api, message: copy.alertMessages.payments5xx, time: language === "en" ? "5 min ago" : language === "es" ? "hace 5 min" : "5 min atras", active: true },
    { id: 2, type: "warning", module: copy.alertModules.database, message: copy.alertMessages.dbLatency, time: language === "en" ? "15 min ago" : language === "es" ? "hace 15 min" : "15 min atras", active: true },
    { id: 3, type: "warning", module: copy.alertModules.workers, message: copy.alertMessages.workersQueue, time: language === "en" ? "30 min ago" : language === "es" ? "hace 30 min" : "30 min atras", active: false },
    { id: 4, type: "info", module: copy.alertModules.cdn, message: copy.alertMessages.cdnCache, time: language === "en" ? "1h ago" : language === "es" ? "hace 1h" : "1h atras", active: false },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <MotionPageShell className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className={theme === "dark" ? "text-[1.9rem] font-semibold tracking-[-0.04em] text-white" : "text-[1.9rem] font-semibold tracking-[-0.04em] text-[#0f172a]"}>
              {copy.title}
            </h1>
            <p className={theme === "dark" ? "text-white/70" : "text-[#64748b]"}>{copy.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            title={copy.errors4xx}
            value="287"
            helper={language === "en" ? "+12% vs yesterday" : language === "es" ? "+12% vs ayer" : "+12% vs ontem"}
            icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
            valueClassName="text-3xl font-semibold tracking-[-0.04em] text-yellow-500"
          />
          <StatCard
            title={copy.errors5xx}
            value="78"
            helper={language === "en" ? "-5% vs yesterday" : language === "es" ? "-5% vs ayer" : "-5% vs ontem"}
            icon={<XCircle className="h-4 w-4 text-red-500" />}
            valueClassName="text-3xl font-semibold tracking-[-0.04em] text-red-500"
          />
          <StatCard
            title={copy.errorRate}
            value="0.8%"
            helper={copy.withinHealthyRange}
            icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
            extra={<Badge className="mt-2 bg-green-500/15 text-green-700 hover:bg-green-500/15">{copy.healthy}</Badge>}
          />
          <StatCard
            title={copy.activeAlerts}
            value={String(alerts.filter((alert) => alert.active).length)}
            helper={copy.requireImmediateAttention}
            icon={<Bell className="h-4 w-4 text-primary" />}
          />
        </div>

        <Card className="border-[#e3e8ef] bg-white shadow-[0_16px_38px_rgba(15,23,42,0.05)]">
          <CardHeader>
            <CardTitle className="text-[#111827]">{copy.errorsRate24h}</CardTitle>
            <CardDescription className="text-[#6b7280]">{copy.errorsRate24hDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] sm:h-[340px] xl:h-[380px] 2xl:h-[420px]">
              <Line data={errorRateData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e3e8ef] bg-white shadow-[0_16px_38px_rgba(15,23,42,0.05)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#111827]">
              <Bell className="h-5 w-5 text-[#ff6a00]" />
              {copy.smartAlerts}
            </CardTitle>
            <CardDescription className="text-[#6b7280]">{copy.smartAlertsDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-4 rounded-[22px] border p-4 ${
                  alert.active
                    ? "border-[#d7dee8] bg-[#f3f6fa]"
                    : "border-[#e5eaf1] bg-[#fafbfd]"
                }`}
              >
                {getAlertIcon(alert.type)}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-[#9aa4b2] bg-white text-[#374151]">{alert.module}</Badge>
                    {alert.active ? <Badge className="bg-red-500/15 text-red-700 hover:bg-red-500/15">{copy.active}</Badge> : null}
                  </div>
                  <p className="mt-2 break-words text-sm leading-6 text-[#111827]">{alert.message}</p>
                  <p className="mt-1 text-xs text-[#6b7280]">{alert.time}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0 text-[#6b7280] hover:bg-white hover:text-[#111827]">
                  {alert.active ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </MotionPageShell>
    </AdminLayout>
  );
}
