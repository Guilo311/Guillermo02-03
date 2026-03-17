import { useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCcw, Save, Wallet } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { MotionPageShell } from "@/animation/components/MotionPageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";

export default function AdminAsaas() {
  const utils = trpc.useUtils();
  const configQuery = trpc.admin.getMyIntegrationConfig.useQuery({ provider: "asaas" }, { refetchOnWindowFocus: false });
  const statusQuery = trpc.admin.getIntegrationPipelineStatus.useQuery({ provider: "asaas" }, { refetchOnWindowFocus: false });
  const saveMutation = trpc.admin.saveIntegrationConfig.useMutation({
    onSuccess: async () => {
      await utils.admin.getMyIntegrationConfig.invalidate({ provider: "asaas" });
      await utils.admin.getIntegrationPipelineStatus.invalidate({ provider: "asaas" });
    },
  });
  const syncMutation = trpc.admin.syncIntegrationNow.useMutation({
    onSuccess: async () => {
      await utils.admin.getIntegrationPipelineStatus.invalidate({ provider: "asaas" });
    },
  });

  const [config, setConfig] = useState({
    enabled: true,
    apiBaseUrl: "https://api.asaas.com/v3",
    accessToken: "",
    webhookToken: "",
    userAgent: "glx-control-tower/1.0",
    environment: "production" as "sandbox" | "production",
    hasAccessToken: false,
    hasWebhookToken: false,
  });

  useEffect(() => {
    const current = configQuery.data;
    if (!current) return;
    setConfig({
      enabled: current.enabled,
      apiBaseUrl: current.apiBaseUrl || "https://api.asaas.com/v3",
      accessToken: "",
      webhookToken: "",
      userAgent: current.userAgent || "glx-control-tower/1.0",
      environment: (current.environment || "production") as "sandbox" | "production",
      hasAccessToken: Boolean(current.hasAccessToken),
      hasWebhookToken: Boolean(current.hasWebhookToken),
    });
  }, [configQuery.data]);

  const updateField = (field: keyof typeof config, value: string | boolean) => {
    setConfig((current) => ({ ...current, [field]: value }));
  };

  const softCard = "border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]";
  const inputClassName = "border-[#d9e0ea] bg-[#fbfcfe] text-[#111827] placeholder:text-[#9aa4b2]";
  const setupSteps = [
    "No painel do Asaas, gere ou recupere o Access Token da conta usada pela GLX.",
    "Defina um Webhook Token para validar as notificacoes recebidas.",
    "Confirme a API Base URL e o ambiente correto: sandbox ou production.",
    "Preencha nesta tela os campos de token, webhook e user-agent.",
    "Salve a configuracao para persistir a integracao no backend GLX.",
    "Cadastre o webhook financeiro apontando para /billing/asaas/webhook.",
    "Dispare uma sincronizacao manual para validar fila, inadimplencia e recebimentos previstos.",
  ];

  return (
    <AdminLayout>
      <MotionPageShell className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Asaas Billing + Webhook</h1>
            <p className="text-[#6b7280]">Configuracao persistida, webhook validado por token e sync financeiro real.</p>
          </div>
          <div className="flex gap-2">
            <a href="https://docs.asaas.com/reference/lista-de-cobrancas" target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2 rounded-full border-[#111827] bg-white text-[#111827] hover:bg-[#f8fafc]">
                <ExternalLink className="h-4 w-4" />
                Documentacao oficial
              </Button>
            </a>
            <Button onClick={() => syncMutation.mutate({ provider: "asaas" })} disabled={syncMutation.isPending} className="gap-2 rounded-full bg-[#ff6a00] hover:bg-[#f25f00]">
              {syncMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Sincronizar agora
            </Button>
          </div>
        </div>

        <Card className={softCard}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#111827]">
              <Wallet className="h-5 w-5" />
              Configuracao
            </CardTitle>
            <CardDescription className="text-[#6b7280]">
              Esta tela salva a integracao no backend e alimenta o webhook `/billing/asaas/webhook`.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-[18px] border border-[#e5eaf2] bg-[#fbfcfe] p-4 md:col-span-2">
              <div>
                <p className="font-medium text-[#111827]">Integracao habilitada</p>
                <p className="text-sm text-[#6b7280]">Desative para pausar ingestao e sync.</p>
              </div>
              <Switch checked={config.enabled} onCheckedChange={(value) => updateField("enabled", value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asaas-api-base" className="text-[#111827]">API Base URL</Label>
              <Input className={inputClassName} id="asaas-api-base" value={config.apiBaseUrl} onChange={(e) => updateField("apiBaseUrl", e.target.value)} placeholder="https://api.asaas.com/v3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asaas-environment" className="text-[#111827]">Environment</Label>
              <Input className={inputClassName} id="asaas-environment" value={config.environment} onChange={(e) => updateField("environment", e.target.value as "sandbox" | "production")} placeholder="sandbox ou production" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asaas-access-token" className="text-[#111827]">Access Token</Label>
              <Input className={inputClassName} id="asaas-access-token" value={config.accessToken} onChange={(e) => updateField("accessToken", e.target.value)} placeholder="access_token" />
              {config.hasAccessToken ? <p className="text-xs text-[#6b7280]">Token ja configurado. Preencha apenas para substituir.</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="asaas-webhook-token" className="text-[#111827]">Webhook Token</Label>
              <Input className={inputClassName} id="asaas-webhook-token" value={config.webhookToken} onChange={(e) => updateField("webhookToken", e.target.value)} placeholder="asaas-access-token" />
              {config.hasWebhookToken ? <p className="text-xs text-[#6b7280]">Webhook token ja configurado. Preencha apenas para substituir.</p> : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="asaas-user-agent" className="text-[#111827]">User-Agent</Label>
              <Input className={inputClassName} id="asaas-user-agent" value={config.userAgent} onChange={(e) => updateField("userAgent", e.target.value)} placeholder="glx-control-tower/1.0" />
            </div>
          </CardContent>
        </Card>

        <Card className={softCard}>
          <CardHeader>
            <CardTitle className="text-[#111827]">Passo a passo de configuracao</CardTitle>
            <CardDescription className="text-[#6b7280]">
              Sequencia recomendada para ativar o Asaas mantendo a regra atual de cobranca e sync.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {setupSteps.map((step, index) => (
              <div key={step} className="rounded-[18px] border border-[#e8edf5] bg-[#fbfcfe] px-4 py-3 text-sm leading-6 text-[#475467]">
                <strong className="mr-2 text-[#111827]">{String(index + 1).padStart(2, "0")}.</strong>
                {step}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className={softCard}>
            <CardHeader><CardTitle className="text-base text-[#111827]">Webhook</CardTitle></CardHeader>
            <CardContent className="text-sm text-[#6b7280]">{window.location.origin}/billing/asaas/webhook</CardContent>
          </Card>
          <Card className={softCard}>
            <CardHeader><CardTitle className="text-base text-[#111827]">Fila</CardTitle></CardHeader>
            <CardContent className="text-sm text-[#6b7280]">
              {statusQuery.isLoading ? "Carregando..." : `queued=${statusQuery.data?.queued ?? 0} processing=${statusQuery.data?.processing ?? 0} dlq=${statusQuery.data?.dlq ?? 0}`}
            </CardContent>
          </Card>
          <Card className={softCard}>
            <CardHeader><CardTitle className="text-base text-[#111827]">Ultima atualizacao</CardTitle></CardHeader>
            <CardContent className="text-sm text-[#6b7280]">{configQuery.data?.updatedAt ?? "Ainda nao configurado"}</CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => saveMutation.mutate({
              provider: "asaas",
              enabled: config.enabled,
              apiBaseUrl: config.apiBaseUrl,
              accessToken: config.accessToken,
              webhookToken: config.webhookToken,
              userAgent: config.userAgent,
              environment: config.environment,
            })}
            disabled={saveMutation.isPending || configQuery.isLoading}
            className="gap-2 rounded-full bg-[#ff6a00] hover:bg-[#f25f00]"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar configuracao
          </Button>
        </div>
      </MotionPageShell>
    </AdminLayout>
  );
}
