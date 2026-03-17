import { AdminIntegrationGuidePage } from "@/features/admin-dashboard/components/AdminIntegrationGuidePage";
import { useLanguage } from "@/contexts/LanguageContext";

const codeSample = `function syncGoogleCalendar() {
  const apiKey = PropertiesService.getScriptProperties().getProperty("GLX_SYNC_KEY");
  const url = PropertiesService.getScriptProperties().getProperty("GLX_CALENDAR_WEBHOOK");
  const calendarId = "primary";
  const timeMin = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const timeMax = new Date().toISOString();

  const response = Calendar.Events.list(calendarId, {
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  const events = (response.items || [])
    .map((event) => {
      const text = \`\${event.summary || ""} \${event.description || ""}\`.toUpperCase();
      const tag =
        text.includes("CALL-QUAL") ? "CALL-QUAL" :
        text.includes("CALL-FECH") ? "CALL-FECH" :
        text.includes("DIAG-OS") ? "DIAG-OS" : null;

      if (!tag) return null;

      return {
        source: "google-calendar",
        googleEventId: event.id,
        tag,
        summary: event.summary || "",
        startAt: event.start?.dateTime || event.start?.date,
        endAt: event.end?.dateTime || event.end?.date,
        updatedAt: event.updated,
      };
    })
    .filter(Boolean);

  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { "x-api-key": apiKey },
    payload: JSON.stringify({ events }),
    muteHttpExceptions: true,
  });
}`;

export default function AdminGoogleCalendar() {
  const { language } = useLanguage();
  const copy = {
    pt: {
      title: "Google Calendar -> Pipeline & Funil",
      subtitle: "Conexao gratuita para contar calls e diagnosticos por tag sem alterar a regra de negocio atual.",
      docsLabel: "Docs Google Calendar",
      cadence: "Diaria ou a cada 15 minutos com gatilho time-driven no Apps Script.",
      authModel: "OAuth do Google Workspace ou conta dedicada; em Workspace avancado, pode evoluir para service account com delegacao.",
      freeStack: [
        "Google Calendar API oficial para listar eventos.",
        "Google Apps Script com gatilho instalado para rodar sem custo recorrente.",
        "UrlFetchApp para enviar o payload pronto ao backend GLX.",
      ],
      logicSteps: [
        "Ler eventos do periodo com Calendar API e ordenar por startTime.",
        "Buscar tags no titulo ou descricao: CALL-QUAL, CALL-FECH e DIAG-OS.",
        "Normalizar horario, id do evento, responsavel e tag antes de enviar ao backend.",
        "No backend, consolidar por semana ou mes conforme o KPI de origem.",
      ],
      fieldMapping: [
        "CALL-QUAL -> Calls de qualificacao realizadas.",
        "CALL-FECH -> Calls de fechamento realizadas.",
        "DIAG-OS -> Diagnosticos OS confirmados.",
        "Eventos com cliente -> reunioes semanais com clientes, quando aplicavel.",
      ],
      formFields: [
        { name: "calendarId", label: "Calendar ID", placeholder: "primary ou seu-calendar@group.calendar.google.com" },
        { name: "serviceAccountEmail", label: "Service Account E-mail", placeholder: "glx@project.iam.gserviceaccount.com" },
        { name: "internalEndpoint", label: "Endpoint interno", placeholder: "/workspace/google-calendar/sync", type: "url" as const },
        { name: "queryTags", label: "Tags para filtro", placeholder: "CALL-QUAL,CALL-FECH,DIAG-OS" },
        { name: "syncWindow", label: "Janela da query", placeholder: "ultimos 7 dias" },
        { name: "apiKey", label: "Chave interna ou token", placeholder: "x-api-key ou bearer token", type: "password" as const },
      ],
      setupSteps: [
        "No Google Cloud Console, crie o projeto da integracao e habilite a Google Calendar API.",
        "Crie uma Service Account e baixe o JSON da credencial.",
        "Compartilhe o calendario com o e-mail da Service Account com permissao de leitura.",
        "Copie o Calendar ID e preencha no formulario desta tela.",
        "Defina as tags de negocio que serao lidas: CALL-QUAL, CALL-FECH e DIAG-OS.",
        "Cadastre o endpoint interno e a chave de autenticacao do backend GLX.",
        "Implemente a leitura periodica via Apps Script ou backend Python e publique no endpoint configurado.",
      ],
    },
    en: {
      title: "Google Calendar -> Pipeline & Funnel",
      subtitle: "Free connection to count calls and diagnostics by tag without changing the current business rule.",
      docsLabel: "Google Calendar docs",
      cadence: "Daily or every 15 minutes with a time-driven Apps Script trigger.",
      authModel: "Google Workspace OAuth or a dedicated account; in advanced Workspace scenarios it can evolve to a service account with delegation.",
      freeStack: [
        "Official Google Calendar API to list events.",
        "Google Apps Script with an installed trigger to run at no recurring cost.",
        "UrlFetchApp to send the prepared payload to the GLX backend.",
      ],
      logicSteps: [
        "Read events from the selected range with the Calendar API and sort by startTime.",
        "Look for tags in the title or description: CALL-QUAL, CALL-FECH and DIAG-OS.",
        "Normalize time, event id, owner and tag before sending to the backend.",
        "In the backend, consolidate by week or month according to the source KPI.",
      ],
      fieldMapping: [
        "CALL-QUAL -> qualification calls completed.",
        "CALL-FECH -> closing calls completed.",
        "DIAG-OS -> confirmed OS diagnostics.",
        "Client-tagged events -> weekly client meetings when applicable.",
      ],
      formFields: [
        { name: "calendarId", label: "Calendar ID", placeholder: "primary or your-calendar@group.calendar.google.com" },
        { name: "serviceAccountEmail", label: "Service Account Email", placeholder: "glx@project.iam.gserviceaccount.com" },
        { name: "internalEndpoint", label: "Internal endpoint", placeholder: "/workspace/google-calendar/sync", type: "url" as const },
        { name: "queryTags", label: "Filter tags", placeholder: "CALL-QUAL,CALL-FECH,DIAG-OS" },
        { name: "syncWindow", label: "Query window", placeholder: "last 7 days" },
        { name: "apiKey", label: "Internal key or token", placeholder: "x-api-key or bearer token", type: "password" as const },
      ],
      setupSteps: [
        "In Google Cloud Console, create the integration project and enable the Google Calendar API.",
        "Create a Service Account and download the credential JSON.",
        "Share the calendar with the Service Account email with read permission.",
        "Copy the Calendar ID and fill it in on this page.",
        "Define the business tags to be read: CALL-QUAL, CALL-FECH and DIAG-OS.",
        "Register the internal endpoint and the GLX backend authentication key.",
        "Implement the periodic read through Apps Script or Python backend and publish to the configured endpoint.",
      ],
    },
    es: {
      title: "Google Calendar -> Pipeline y Embudo",
      subtitle: "Conexion gratuita para contar calls y diagnosticos por etiqueta sin cambiar la regla de negocio actual.",
      docsLabel: "Docs Google Calendar",
      cadence: "Diaria o cada 15 minutos con trigger time-driven en Apps Script.",
      authModel: "OAuth de Google Workspace o cuenta dedicada; en escenarios avanzados puede evolucionar a service account con delegacion.",
      freeStack: [
        "Google Calendar API oficial para listar eventos.",
        "Google Apps Script con trigger instalado para ejecutarse sin costo recurrente.",
        "UrlFetchApp para enviar el payload listo al backend GLX.",
      ],
      logicSteps: [
        "Leer eventos del periodo con Calendar API y ordenar por startTime.",
        "Buscar etiquetas en el titulo o descripcion: CALL-QUAL, CALL-FECH y DIAG-OS.",
        "Normalizar horario, id del evento, responsable y etiqueta antes de enviarlo al backend.",
        "En el backend, consolidar por semana o mes segun el KPI de origen.",
      ],
      fieldMapping: [
        "CALL-QUAL -> calls de calificacion realizadas.",
        "CALL-FECH -> calls de cierre realizadas.",
        "DIAG-OS -> diagnosticos OS confirmados.",
        "Eventos con cliente -> reuniones semanales con clientes cuando aplique.",
      ],
      formFields: [
        { name: "calendarId", label: "Calendar ID", placeholder: "primary o tu-calendar@group.calendar.google.com" },
        { name: "serviceAccountEmail", label: "Correo de Service Account", placeholder: "glx@project.iam.gserviceaccount.com" },
        { name: "internalEndpoint", label: "Endpoint interno", placeholder: "/workspace/google-calendar/sync", type: "url" as const },
        { name: "queryTags", label: "Etiquetas de filtro", placeholder: "CALL-QUAL,CALL-FECH,DIAG-OS" },
        { name: "syncWindow", label: "Ventana de consulta", placeholder: "ultimos 7 dias" },
        { name: "apiKey", label: "Clave interna o token", placeholder: "x-api-key o bearer token", type: "password" as const },
      ],
      setupSteps: [
        "En Google Cloud Console, crea el proyecto de integracion y habilita la Google Calendar API.",
        "Crea una Service Account y descarga el JSON de la credencial.",
        "Comparte el calendario con el correo de la Service Account con permiso de lectura.",
        "Copia el Calendar ID y complentalo en esta pantalla.",
        "Define las etiquetas de negocio que se leeran: CALL-QUAL, CALL-FECH y DIAG-OS.",
        "Registra el endpoint interno y la clave de autenticacion del backend GLX.",
        "Implementa la lectura periodica via Apps Script o backend Python y publica en el endpoint configurado.",
      ],
    },
  }[language];

  return (
    <AdminIntegrationGuidePage
      title={copy.title}
      subtitle={copy.subtitle}
      docsHref="https://developers.google.com/workspace/calendar/api/guides/list-events"
      docsLabel={copy.docsLabel}
      endpoint="/workspace/google-calendar/sync"
      cadence={copy.cadence}
      authModel={copy.authModel}
      freeStack={copy.freeStack}
      logicSteps={copy.logicSteps}
      fieldMapping={copy.fieldMapping}
      codeSample={codeSample}
      formStorageKey="glx-google-calendar-config"
      formFields={copy.formFields}
      setupSteps={copy.setupSteps}
    />
  );
}
