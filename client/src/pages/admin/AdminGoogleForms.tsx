import { AdminIntegrationGuidePage } from "@/features/admin-dashboard/components/AdminIntegrationGuidePage";
import { useLanguage } from "@/contexts/LanguageContext";

const codeSample = `function onFormSubmit(e) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("GLX_SYNC_KEY");
  const url = PropertiesService.getScriptProperties().getProperty("GLX_FORMS_WEBHOOK");
  const answers = e.namedValues || {};

  const payload = {
    source: "google-forms",
    submittedAt: new Date().toISOString(),
    clientName: (answers["Cliente"] || [""])[0],
    score: Number((answers["Nota NPS"] || [0])[0]),
    recommendation: (answers["Voce indicaria a GLX?"] || [""])[0],
    meetingEngagement: (answers["Engajamento nas reunioes"] || [""])[0],
  };

  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { "x-api-key": apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}`;

export default function AdminGoogleForms() {
  const { language } = useLanguage();
  const copy = {
    pt: {
      title: "Google Forms -> NPS e Engajamento",
      subtitle: "Fluxo gratuito para respostas de formulario entrarem no dashboard sem custo de ferramenta adicional.",
      docsLabel: "Docs Google Forms",
      cadence: "Tempo real no envio do formulario ou leitura semanal via planilha de respostas.",
      authModel: "Conexao nativa do Form com Google Sheets e gatilho instalado no Apps Script.",
      freeStack: [
        "Google Forms para coleta de NPS e resposta qualitativa.",
        "Planilha de respostas conectada nativamente pelo Google.",
        "Apps Script onFormSubmit para envio automatico ao backend GLX.",
      ],
      logicSteps: [
        "Conectar o Forms a uma planilha de respostas oficial do Google.",
        "Criar gatilho onFormSubmit para disparar sempre que uma nova resposta entrar.",
        "Normalizar nota NPS, resposta de indicacao e engajamento antes do POST.",
        "No backend, agregar por cliente e periodo para alimentar NPS e health signals.",
      ],
      fieldMapping: [
        "Nota 0-10 -> NPS de clientes GLX.",
        "Pergunta de recomendacao -> apoio para health score e analise de detratores.",
        "Pergunta de engajamento -> engajamento nas reunioes.",
      ],
      formFields: [
        { name: "formId", label: "Form ID", placeholder: "ID do Google Form" },
        { name: "responsesSheetId", label: "Planilha de respostas", placeholder: "Spreadsheet ID conectado ao Forms" },
        { name: "internalEndpoint", label: "Endpoint interno", placeholder: "/workspace/google-forms/webhook", type: "url" as const },
        { name: "npsQuestion", label: "Campo da nota NPS", placeholder: "Nota NPS" },
        { name: "engagementQuestion", label: "Campo de engajamento", placeholder: "Engajamento nas reunioes" },
        { name: "apiKey", label: "Chave interna ou token", placeholder: "x-api-key ou bearer token", type: "password" as const },
      ],
      setupSteps: [
        "No Google Cloud Console, habilite Google Forms API, Google Sheets API e Google Drive API se necessario.",
        "Crie uma Service Account ou use a propria conta do Forms via Apps Script.",
        "Conecte o Google Forms a uma planilha oficial de respostas.",
        "Identifique o Form ID e o Spreadsheet ID da planilha vinculada.",
        "No formulario desta tela, mapeie o nome exato da pergunta de NPS e do campo de engajamento.",
        "Cadastre o endpoint interno e a chave de autenticacao do backend GLX.",
        "Ative um trigger onFormSubmit para que cada resposta seja enviada automaticamente ao backend.",
      ],
    },
    en: {
      title: "Google Forms -> NPS and Engagement",
      subtitle: "Free flow to send form responses into the dashboard without extra tooling cost.",
      docsLabel: "Google Forms docs",
      cadence: "Real-time on form submission or weekly reads from the response sheet.",
      authModel: "Native Form to Google Sheets connection with an Apps Script trigger.",
      freeStack: [
        "Google Forms for NPS collection and qualitative feedback.",
        "Response sheet connected natively by Google.",
        "Apps Script onFormSubmit for automatic delivery to the GLX backend.",
      ],
      logicSteps: [
        "Connect the Form to an official Google response sheet.",
        "Create an onFormSubmit trigger to run whenever a new response arrives.",
        "Normalize the NPS score, referral answer and engagement field before POSTing.",
        "In the backend, aggregate by client and period to power NPS and health signals.",
      ],
      fieldMapping: [
        "0-10 score -> GLX client NPS.",
        "Referral question -> support for health score and detractor analysis.",
        "Engagement question -> meeting engagement.",
      ],
      formFields: [
        { name: "formId", label: "Form ID", placeholder: "Google Form ID" },
        { name: "responsesSheetId", label: "Responses sheet", placeholder: "Spreadsheet ID connected to Forms" },
        { name: "internalEndpoint", label: "Internal endpoint", placeholder: "/workspace/google-forms/webhook", type: "url" as const },
        { name: "npsQuestion", label: "NPS score field", placeholder: "NPS Score" },
        { name: "engagementQuestion", label: "Engagement field", placeholder: "Meeting engagement" },
        { name: "apiKey", label: "Internal key or token", placeholder: "x-api-key or bearer token", type: "password" as const },
      ],
      setupSteps: [
        "In Google Cloud Console, enable Google Forms API, Google Sheets API and Google Drive API if needed.",
        "Create a Service Account or use the Forms owner account through Apps Script.",
        "Connect Google Forms to an official response sheet.",
        "Identify the Form ID and the Spreadsheet ID of the linked sheet.",
        "On this page, map the exact name of the NPS question and the engagement field.",
        "Register the internal endpoint and the GLX backend authentication key.",
        "Enable an onFormSubmit trigger so each response is sent automatically to the backend.",
      ],
    },
    es: {
      title: "Google Forms -> NPS y Engagement",
      subtitle: "Flujo gratuito para que las respuestas del formulario entren al dashboard sin costo adicional de herramienta.",
      docsLabel: "Docs Google Forms",
      cadence: "Tiempo real al enviar el formulario o lectura semanal via hoja de respuestas.",
      authModel: "Conexion nativa del Form con Google Sheets y trigger instalado en Apps Script.",
      freeStack: [
        "Google Forms para recolectar NPS y feedback cualitativo.",
        "Hoja de respuestas conectada de forma nativa por Google.",
        "Apps Script onFormSubmit para envio automatico al backend GLX.",
      ],
      logicSteps: [
        "Conectar el Forms a una hoja de respuestas oficial de Google.",
        "Crear un trigger onFormSubmit para ejecutarse siempre que entre una nueva respuesta.",
        "Normalizar nota NPS, respuesta de recomendacion y engagement antes del POST.",
        "En el backend, agregar por cliente y periodo para alimentar NPS y health signals.",
      ],
      fieldMapping: [
        "Nota 0-10 -> NPS de clientes GLX.",
        "Pregunta de recomendacion -> apoyo para health score y analisis de detractores.",
        "Pregunta de engagement -> engagement en reuniones.",
      ],
      formFields: [
        { name: "formId", label: "Form ID", placeholder: "ID de Google Form" },
        { name: "responsesSheetId", label: "Hoja de respuestas", placeholder: "Spreadsheet ID conectado al Forms" },
        { name: "internalEndpoint", label: "Endpoint interno", placeholder: "/workspace/google-forms/webhook", type: "url" as const },
        { name: "npsQuestion", label: "Campo de nota NPS", placeholder: "Nota NPS" },
        { name: "engagementQuestion", label: "Campo de engagement", placeholder: "Engagement en reuniones" },
        { name: "apiKey", label: "Clave interna o token", placeholder: "x-api-key o bearer token", type: "password" as const },
      ],
      setupSteps: [
        "En Google Cloud Console, habilita Google Forms API, Google Sheets API y Google Drive API si hace falta.",
        "Crea una Service Account o usa la propia cuenta del Forms via Apps Script.",
        "Conecta Google Forms a una hoja oficial de respuestas.",
        "Identifica el Form ID y el Spreadsheet ID de la hoja vinculada.",
        "En esta pantalla, mapea el nombre exacto de la pregunta de NPS y del campo de engagement.",
        "Registra el endpoint interno y la clave de autenticacion del backend GLX.",
        "Activa un trigger onFormSubmit para que cada respuesta se envie automaticamente al backend.",
      ],
    },
  }[language];

  return (
    <AdminIntegrationGuidePage
      title={copy.title}
      subtitle={copy.subtitle}
      docsHref="https://support.google.com/docs/answer/2917686"
      docsLabel={copy.docsLabel}
      endpoint="/workspace/google-forms/webhook"
      cadence={copy.cadence}
      authModel={copy.authModel}
      freeStack={copy.freeStack}
      logicSteps={copy.logicSteps}
      fieldMapping={copy.fieldMapping}
      codeSample={codeSample}
      formStorageKey="glx-google-forms-config"
      formFields={copy.formFields}
      setupSteps={copy.setupSteps}
    />
  );
}
