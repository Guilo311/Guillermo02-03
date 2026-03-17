import { useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCcw, Save, Server } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { MotionPageShell } from "@/animation/components/MotionPageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";

export default function AdminKommo() {
  const utils = trpc.useUtils();
  const configQuery = trpc.admin.getMyIntegrationConfig.useQuery({ provider: "kommo" }, { refetchOnWindowFocus: false });
  const statusQuery = trpc.admin.getIntegrationPipelineStatus.useQuery({ provider: "kommo" }, { refetchOnWindowFocus: false });
  const saveMutation = trpc.admin.saveIntegrationConfig.useMutation({
    onSuccess: async () => {
      await utils.admin.getMyIntegrationConfig.invalidate({ provider: "kommo" });
      await utils.admin.getIntegrationPipelineStatus.invalidate({ provider: "kommo" });
    },
  });
  const syncMutation = trpc.admin.syncIntegrationNow.useMutation({
    onSuccess: async () => {
      await utils.admin.getIntegrationPipelineStatus.invalidate({ provider: "kommo" });
    },
  });

  const [config, setConfig] = useState({
    enabled: true,
    accountDomain: "",
    apiBaseUrl: "",
    accessToken: "",
    refreshToken: "",
    webhookSecret: "",
    hasAccessToken: false,
    hasRefreshToken: false,
    hasWebhookSecret: false,
  });

  useEffect(() => {
    const current = configQuery.data;
    if (!current) return;
    setConfig({
      enabled: current.enabled,
      accountDomain: current.accountDomain || "",
      apiBaseUrl: current.apiBaseUrl || "",
      accessToken: "",
      refreshToken: "",
      webhookSecret: "",
      hasAccessToken: Boolean(current.hasAccessToken),
      hasRefreshToken: Boolean(current.hasRefreshToken),
      hasWebhookSecret: Boolean(current.hasWebhookSecret),
    });
  }, [configQuery.data]);

  const updateField = (field: keyof typeof config, value: string | boolean) => {
    setConfig((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    await saveMutation.mutateAsync({
      provider: "kommo",
      enabled: config.enabled,
      accountDomain: config.accountDomain,
      apiBaseUrl: config.apiBaseUrl || `https://${config.accountDomain}/api/v4`,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      webhookSecret: config.webhookSecret,
      environment: "production",
    });
  };

  const handleSync = async () => {
    await syncMutation.mutateAsync({ provider: "kommo" });
  };

  const panelClassName = "border-[#d7dce5] bg-[#eef1f5] text-[#111827] shadow-[0_12px_30px_rgba(15,23,42,0.08)]";
  const mutedTextClassName = "text-[#4b5563]";
  const helperTextClassName = "text-xs text-[#6b7280]";
  const inputClassName = "border-[#c7ced9] bg-[#f7f8fa] text-[#111827] placeholder:text-[#9ca3af]";
  const setupSteps = [
    "No Kommo Developers, crie ou abra o app da integracao da GLX.",
    "Copie o Account Domain e confirme o redirect URI configurado no app.",
    "Obtenha o Access Token e o Refresh Token do fluxo OAuth usado pela GLX.",
    "Defina um Webhook Secret para validar os eventos recebidos no backend.",
    "Preencha os campos desta tela e salve a configuracao.",
    "No Kommo, aponte os webhooks de etapa do funil para /crm/kommo/webhook.",
    "Use o botao de sincronizacao para validar fila, payload e autenticao.",
  ];

  return (
    <AdminLayout>
      <MotionPageShell className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Kommo OAuth + Webhook</h1>
            <p className={mutedTextClassName}>Configuracao persistida, sincronizacao real e pipeline com retry/DLQ.</p>
          </div>
          <div className="flex gap-2">
            <a href="https://developers.kommo.com/reference/kommo-api-reference" target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2 border-[#cfd6e1] bg-white text-[#111827] hover:bg-[#f7f8fa]">
                <ExternalLink className="h-4 w-4" />
                Documentacao oficial
              </Button>
            </a>
            <Button onClick={handleSync} disabled={syncMutation.isPending} className="gap-2">
              {syncMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Sincronizar agora
            </Button>
          </div>
        </div>

        <Card className={panelClassName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#111827]">
              <Server className="h-5 w-5" />
              Configuracao
            </CardTitle>
            <CardDescription className={mutedTextClassName}>
              Esta tela salva a integracao no backend e alimenta o webhook `/crm/kommo/webhook`.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-[#c7ced9] bg-[#e8ecf1] p-3 md:col-span-2">
              <div>
                <p className="font-medium text-[#111827]">Integracao habilitada</p>
                <p className="text-sm text-[#4b5563]">Desative para pausar ingestao e sync.</p>
              </div>
              <Switch checked={config.enabled} onCheckedChange={(value) => updateField("enabled", value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kommo-subdomain" className="text-[#111827]">Account Domain</Label>
              <Input className={inputClassName} id="kommo-subdomain" value={config.accountDomain} onChange={(e) => updateField("accountDomain", e.target.value)} placeholder="empresa.kommo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kommo-api-base" className="text-[#111827]">API Base URL</Label>
              <Input className={inputClassName} id="kommo-api-base" value={config.apiBaseUrl} onChange={(e) => updateField("apiBaseUrl", e.target.value)} placeholder="https://empresa.kommo.com/api/v4" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kommo-access-token" className="text-[#111827]">Access Token</Label>
              <Input className={inputClassName} id="kommo-access-token" value={config.accessToken} onChange={(e) => updateField("accessToken", e.target.value)} placeholder="access_token" />
              {config.hasAccessToken ? <p className={helperTextClassName}>Token ja configurado. Preencha apenas para substituir.</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kommo-refresh-token" className="text-[#111827]">Refresh Token</Label>
              <Input className={inputClassName} id="kommo-refresh-token" value={config.refreshToken} onChange={(e) => updateField("refreshToken", e.target.value)} placeholder="refresh_token" />
              {config.hasRefreshToken ? <p className={helperTextClassName}>Refresh token ja configurado. Preencha apenas para substituir.</p> : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="kommo-webhook-secret" className="text-[#111827]">Webhook Secret</Label>
              <Input className={inputClassName} id="kommo-webhook-secret" value={config.webhookSecret} onChange={(e) => updateField("webhookSecret", e.target.value)} placeholder="Segredo esperado no header x-signature" />
              {config.hasWebhookSecret ? <p className={helperTextClassName}>Segredo ja configurado. Preencha apenas para substituir.</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card className={panelClassName}>
          <CardHeader>
            <CardTitle className="text-[#111827]">Passo a passo de configuracao</CardTitle>
            <CardDescription className={mutedTextClassName}>
              Sequencia recomendada para ativar Kommo sem alterar a logica atual da integracao.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {setupSteps.map((step, index) => (
              <div key={step} className="rounded-[18px] border border-[#c7ced9] bg-[#f7f8fa] px-4 py-3 text-sm leading-6 text-[#4b5563]">
                <strong className="mr-2 text-[#111827]">{String(index + 1).padStart(2, "0")}.</strong>
                {step}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className={panelClassName}>
            <CardHeader><CardTitle className="text-base text-[#111827]">Webhook</CardTitle></CardHeader>
            <CardContent className="text-sm text-[#4b5563]">{window.location.origin}/crm/kommo/webhook</CardContent>
          </Card>
          <Card className={panelClassName}>
            <CardHeader><CardTitle className="text-base text-[#111827]">Fila</CardTitle></CardHeader>
            <CardContent className="text-sm text-[#4b5563]">
              {statusQuery.isLoading ? "Carregando..." : `queued=${statusQuery.data?.queued ?? 0} processing=${statusQuery.data?.processing ?? 0} dlq=${statusQuery.data?.dlq ?? 0}`}
            </CardContent>
          </Card>
          <Card className={panelClassName}>
            <CardHeader><CardTitle className="text-base text-[#111827]">Ultimo sync</CardTitle></CardHeader>
            <CardContent className="text-sm text-[#4b5563]">{configQuery.data?.updatedAt ?? "Ainda nao configurado"}</CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saveMutation.isPending || configQuery.isLoading} className="gap-2">
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar configuracao
          </Button>
        </div>
      </MotionPageShell>
    </AdminLayout>
  );
}
