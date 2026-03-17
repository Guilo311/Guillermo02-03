import { AdminIntegrationGuidePage } from "@/features/admin-dashboard/components/AdminIntegrationGuidePage";

const codeSample = `function syncContratosSheet() {
  const apiKey = PropertiesService.getScriptProperties().getProperty("GLX_SYNC_KEY");
  const url = PropertiesService.getScriptProperties().getProperty("GLX_CONTRATOS_WEBHOOK");
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("GLX_CONTRATOS_SHEET_ID");
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("Contratos");
  const rows = sheet.getDataRange().getValues();
  const header = rows.shift();

  const payload = rows.map((row) => ({
    clientName: row[0],
    mrr: Number(row[1] || 0),
    churnStatus: row[2],
    planType: row[3],
    startDate: row[4],
    setupStatus: row[5],
    mrr12mStatus: row[6],
    advisoryStatus: row[7],
  }));

  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { "x-api-key": apiKey },
    payload: JSON.stringify({ source: "contratos-sheet", rows: payload }),
    muteHttpExceptions: true,
  });
}`;

export default function AdminContratosSheets() {
  return (
    <AdminIntegrationGuidePage
      title="Planilha de Contratos (Google Sheets)"
      subtitle="Leitura automatica da planilha operacional que sustenta clientes ativos, MRR e status de setups."
      docsHref="https://developers.google.com/apps-script/guides/services/quotas"
      docsLabel="Apps Script e quotas"
      endpoint="/workspace/google-sheets/contracts/sync"
      cadence="Semanal ou sob demanda apos atualizacao manual da planilha."
      authModel="Apps Script no proprio Google Sheets ou Sheets API com conta autorizada."
      freeStack={[
        "Google Sheets como fonte principal de contratos.",
        "Apps Script anexado a planilha para ler ranges e publicar no backend.",
        "Gatilho time-driven semanal ou botao manual para sincronizacao gratuita.",
      ]}
      logicSteps={[
        "Ler a aba de contratos e mapear as colunas oficiais da operacao.",
        "Converter MRR para numero e padronizar status textuais antes da ingestao.",
        "Enviar lote consolidado para o backend em um unico payload por sincronizacao.",
        "No backend, recalcular clientes ativos, churn, MRR 12m e setups em andamento.",
      ]}
      fieldMapping={[
        "Cliente ativo -> Clientes ativos e base MRR.",
        "MRR por cliente -> MRR total e crescimento.",
        "Tipo de plano -> distribuicao por plano e receita.",
        "Setups em andamento + status MRR 12m + status Advisory -> blocos OS e Advisory.",
      ]}
      codeSample={codeSample}
      formStorageKey="glx-contracts-sheet-config"
      formFields={[
        { name: "spreadsheetId", label: "Spreadsheet ID", placeholder: "ID da planilha de contratos" },
        { name: "sheetTab", label: "Aba da planilha", placeholder: "Contratos" },
        { name: "readRange", label: "Range da query", placeholder: "Contratos!A:H" },
        { name: "internalEndpoint", label: "Endpoint interno", placeholder: "/workspace/google-sheets/contracts/sync", type: "url" },
        { name: "serviceAccountEmail", label: "Service Account E-mail", placeholder: "glx@project.iam.gserviceaccount.com" },
        { name: "apiKey", label: "Chave interna ou token", placeholder: "x-api-key ou bearer token", type: "password" },
      ]}
      setupSteps={[
        "No Google Cloud Console, habilite a Google Sheets API para o projeto da GLX.",
        "Crie uma Service Account e baixe o JSON da credencial.",
        "Compartilhe a planilha de contratos com o e-mail da Service Account.",
        "Copie o Spreadsheet ID, o nome da aba e o range oficial da leitura.",
        "Preencha nesta tela o endpoint interno que vai receber o snapshot da planilha.",
        "Cadastre a chave interna de autenticacao usada pelo backend GLX.",
        "Execute a sincronizacao semanal via Apps Script ou por job server-side para manter clientes ativos, MRR e churn atualizados.",
      ]}
    />
  );
}
