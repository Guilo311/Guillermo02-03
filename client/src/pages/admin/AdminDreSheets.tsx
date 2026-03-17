import { AdminIntegrationGuidePage } from "@/features/admin-dashboard/components/AdminIntegrationGuidePage";

const codeSample = `function syncDreSheet() {
  const apiKey = PropertiesService.getScriptProperties().getProperty("GLX_SYNC_KEY");
  const url = PropertiesService.getScriptProperties().getProperty("GLX_DRE_WEBHOOK");
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("GLX_DRE_SHEET_ID");
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("DRE");
  const values = sheet.getDataRange().getValues();

  const metrics = values.slice(1).map((row) => ({
    month: row[0],
    receitaTotal: Number(row[1] || 0),
    custosOperacionais: Number(row[2] || 0),
    marketingSales: Number(row[3] || 0),
    novosClientes: Number(row[4] || 0),
    horasTotais: Number(row[5] || 0),
  }));

  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { "x-api-key": apiKey },
    payload: JSON.stringify({ source: "dre-sheet", metrics }),
    muteHttpExceptions: true,
  });
}`;

export default function AdminDreSheets() {
  return (
    <AdminIntegrationGuidePage
      title="Planilha DRE (Google Sheets)"
      subtitle="Conexao gratuita para margem liquida, receita total, CAC e receita por hora trabalhada."
      docsHref="https://developers.google.com/sheets/api/quickstart/js"
      docsLabel="Docs Google Sheets API"
      endpoint="/workspace/google-sheets/dre/sync"
      cadence="Mensal, apos fechamento financeiro da planilha."
      authModel="Sheets API ou Apps Script com acesso controlado apenas a planilha financeira."
      freeStack={[
        "Google Sheets como DRE mestre da operacao.",
        "Apps Script para ler a aba mensal e enviar snapshot consolidado.",
        "Sem custo adicional dentro das quotas padrao do Google Workspace/Apps Script.",
      ]}
      logicSteps={[
        "Ler a aba DRE do mes fechado.",
        "Normalizar receita total, custos operacionais, gasto de marketing e horas.",
        "Calcular no backend margem liquida, CAC e receita por hora mantendo a regra de negocio original.",
        "Persistir uma fotografia mensal para comparacao historica.",
      ]}
      fieldMapping={[
        "Receita total -> Receita Total Mensal.",
        "Custos operacionais -> Margem Liquida.",
        "Marketing + vendas / novos clientes -> CAC.",
        "Receita total / horas totais -> Receita por Hora.",
      ]}
      codeSample={codeSample}
      formStorageKey="glx-dre-sheet-config"
      formFields={[
        { name: "spreadsheetId", label: "Spreadsheet ID", placeholder: "ID da planilha DRE" },
        { name: "sheetTab", label: "Aba da planilha", placeholder: "DRE" },
        { name: "readRange", label: "Range da query", placeholder: "DRE!A:F" },
        { name: "internalEndpoint", label: "Endpoint interno", placeholder: "/workspace/google-sheets/dre/sync", type: "url" },
        { name: "serviceAccountEmail", label: "Service Account E-mail", placeholder: "glx@project.iam.gserviceaccount.com" },
        { name: "apiKey", label: "Chave interna ou token", placeholder: "x-api-key ou bearer token", type: "password" },
      ]}
      setupSteps={[
        "No Google Cloud Console, habilite a Google Sheets API para a integracao financeira.",
        "Crie uma Service Account dedicada ao financeiro e baixe o JSON da chave.",
        "Compartilhe a planilha DRE com o e-mail da Service Account.",
        "Copie o Spreadsheet ID, a aba mensal e o range oficial que contem receita, custos, marketing e horas.",
        "Preencha nesta tela o endpoint interno e a chave de autenticacao do backend GLX.",
        "Mantenha a atualizacao da DRE no fechamento mensal, como ja previsto na regra de negocio.",
        "Rode a sincronizacao apos o fechamento para recalcular margem liquida, CAC e receita por hora.",
      ]}
    />
  );
}
