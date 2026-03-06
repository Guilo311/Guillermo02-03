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

  return (
    <AdminLayout>
      <MotionPageShell className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kommo OAuth + Webhook</h1>
            <p className="text-muted-foreground">Configuração persistida, sincronização real e pipeline com retry/DLQ.</p>
          </div>
          <div className="flex gap-2">
            <a href="https://developers.kommo.com/reference/kommo-api-reference" target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Documentação oficial
              </Button>
            </a>
            <Button onClick={handleSync} disabled={syncMutation.isPending} className="gap-2">
              {syncMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Sincronizar agora
            </Button>
          </div>
        </div>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Configuração
            </CardTitle>
            <CardDescription>Esta tela salva a integração no backend e alimenta o webhook `/crm/kommo/webhook`.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 md:col-span-2">
              <div>
                <p className="font-medium">Integração habilitada</p>
                <p className="text-sm text-muted-foreground">Desative para pausar ingestão e sync.</p>
              </div>
              <Switch checked={config.enabled} onCheckedChange={(value) => updateField("enabled", value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kommo-subdomain">Account Domain</Label>
              <Input id="kommo-subdomain" value={config.accountDomain} onChange={(e) => updateField("accountDomain", e.target.value)} placeholder="empresa.kommo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kommo-api-base">API Base URL</Label>
              <Input id="kommo-api-base" value={config.apiBaseUrl} onChange={(e) => updateField("apiBaseUrl", e.target.value)} placeholder="https://empresa.kommo.com/api/v4" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kommo-access-token">Access Token</Label>
              <Input id="kommo-access-token" value={config.accessToken} onChange={(e) => updateField("accessToken", e.target.value)} placeholder="access_token" />
              {config.hasAccessToken ? <p className="text-xs text-muted-foreground">Token já configurado. Preencha apenas para substituir.</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kommo-refresh-token">Refresh Token</Label>
              <Input id="kommo-refresh-token" value={config.refreshToken} onChange={(e) => updateField("refreshToken", e.target.value)} placeholder="refresh_token" />
              {config.hasRefreshToken ? <p className="text-xs text-muted-foreground">Refresh token já configurado. Preencha apenas para substituir.</p> : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="kommo-webhook-secret">Webhook Secret</Label>
              <Input id="kommo-webhook-secret" value={config.webhookSecret} onChange={(e) => updateField("webhookSecret", e.target.value)} placeholder="Segredo esperado no header x-signature" />
              {config.hasWebhookSecret ? <p className="text-xs text-muted-foreground">Segredo já configurado. Preencha apenas para substituir.</p> : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="border-border/50 bg-card/50">
            <CardHeader><CardTitle className="text-base">Webhook</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{window.location.origin}/crm/kommo/webhook</CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader><CardTitle className="text-base">Fila</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {statusQuery.isLoading ? "Carregando..." : `queued=${statusQuery.data?.queued ?? 0} processing=${statusQuery.data?.processing ?? 0} dlq=${statusQuery.data?.dlq ?? 0}`}
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader><CardTitle className="text-base">Último sync</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{configQuery.data?.updatedAt ?? "Ainda não configurado"}</CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saveMutation.isPending || configQuery.isLoading} className="gap-2">
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar configuração
          </Button>
        </div>
      </MotionPageShell>
    </AdminLayout>
  );
}
