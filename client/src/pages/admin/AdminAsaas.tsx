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

  return (
    <AdminLayout>
      <MotionPageShell className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Asaas Billing + Webhook</h1>
            <p className="text-muted-foreground">Configuração persistida, webhook validado por token e sync financeiro real.</p>
          </div>
          <div className="flex gap-2">
            <a href="https://docs.asaas.com/reference/lista-de-cobrancas" target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Documentação oficial
              </Button>
            </a>
            <Button onClick={() => syncMutation.mutate({ provider: "asaas" })} disabled={syncMutation.isPending} className="gap-2">
              {syncMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Sincronizar agora
            </Button>
          </div>
        </div>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Configuração
            </CardTitle>
            <CardDescription>Esta tela salva a integração no backend e alimenta o webhook `/billing/asaas/webhook`.</CardDescription>
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
              <Label htmlFor="asaas-api-base">API Base URL</Label>
              <Input id="asaas-api-base" value={config.apiBaseUrl} onChange={(e) => updateField("apiBaseUrl", e.target.value)} placeholder="https://api.asaas.com/v3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asaas-environment">Environment</Label>
              <Input id="asaas-environment" value={config.environment} onChange={(e) => updateField("environment", e.target.value as "sandbox" | "production")} placeholder="sandbox ou production" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asaas-access-token">Access Token</Label>
              <Input id="asaas-access-token" value={config.accessToken} onChange={(e) => updateField("accessToken", e.target.value)} placeholder="access_token" />
              {config.hasAccessToken ? <p className="text-xs text-muted-foreground">Token já configurado. Preencha apenas para substituir.</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="asaas-webhook-token">Webhook Token</Label>
              <Input id="asaas-webhook-token" value={config.webhookToken} onChange={(e) => updateField("webhookToken", e.target.value)} placeholder="asaas-access-token" />
              {config.hasWebhookToken ? <p className="text-xs text-muted-foreground">Webhook token já configurado. Preencha apenas para substituir.</p> : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="asaas-user-agent">User-Agent</Label>
              <Input id="asaas-user-agent" value={config.userAgent} onChange={(e) => updateField("userAgent", e.target.value)} placeholder="glx-control-tower/1.0" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="border-border/50 bg-card/50">
            <CardHeader><CardTitle className="text-base">Webhook</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{window.location.origin}/billing/asaas/webhook</CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader><CardTitle className="text-base">Fila</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {statusQuery.isLoading ? "Carregando..." : `queued=${statusQuery.data?.queued ?? 0} processing=${statusQuery.data?.processing ?? 0} dlq=${statusQuery.data?.dlq ?? 0}`}
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader><CardTitle className="text-base">Última atualização</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{configQuery.data?.updatedAt ?? "Ainda não configurado"}</CardContent>
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
            className="gap-2"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar configuração
          </Button>
        </div>
      </MotionPageShell>
    </AdminLayout>
  );
}
