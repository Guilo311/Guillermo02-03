import type { Language } from "@/i18n/index";

export type AdminHelpSuggestion = {
  id: string;
  question: string;
  hint: string;
  href: string;
};

export type AdminLayoutUiCopy = {
  profile: string;
  configureProfile: string;
  language: string;
  helpTitle: string;
  helpEmpty: string;
  liveData: string;
  exportCsv: string;
  exportPdf: string;
  closeSession: string;
  profileDialogTitle: string;
  profileDialogDescription: string;
  profileLogoLabel: string;
  profileLogoAlt: string;
  profileLogoPreviewAlt: string;
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  currentPasswordPlaceholder: string;
  newPasswordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  cancel: string;
  saveProfile: string;
  savingProfile: string;
  helpSuggestions: AdminHelpSuggestion[];
};

export type AdminDashboardUiCopy = {
  period: string;
  product: string;
  filterSlice: string;
  filteredBy: string;
  lowerPanel: string;
  records: string;
  alerts: string;
  executiveSemaphore: string;
  drilldown: string;
  formula: string;
  dataSource: string;
  noData: string;
};

export type AdminErrorsUiCopy = {
  title: string;
  subtitle: string;
  errors4xx: string;
  errors5xx: string;
  errorRate: string;
  activeAlerts: string;
  healthy: string;
  withinHealthyRange: string;
  requireImmediateAttention: string;
  errorsRate24h: string;
  errorsRate24hDescription: string;
  smartAlerts: string;
  smartAlertsDescription: string;
  active: string;
  alertMessages: {
    payments5xx: string;
    dbLatency: string;
    workersQueue: string;
    cdnCache: string;
  };
  alertModules: {
    api: string;
    database: string;
    workers: string;
    cdn: string;
  };
};

export type AdminIntegrationCommonCopy = {
  officialDocs: string;
  syncNow: string;
  configuration: string;
  enabled: string;
  disableToPause: string;
  stepByStep: string;
  webhook: string;
  queue: string;
  lastSync: string;
  lastUpdate: string;
  loading: string;
  notConfiguredYet: string;
  saveConfiguration: string;
  replaceIfNeeded: string;
  localConfigSaved: string;
  suggestedInternalEndpoint: string;
  cadence: string;
  authentication: string;
  connectionForm: string;
  connectionFormDescription: string;
  setupStepsDescription: string;
  prerequisitesTitle: string;
  authOptionsTitle: string;
  authOptionsDescription: string;
  freeQuotasTitle: string;
  freeQuotasDescription: string;
  freeRecommendedStack: string;
  ingestionLogic: string;
  dashboardFields: string;
  pythonQuickstart: string;
  pythonQuickstartDescription: string;
  appsScriptBase: string;
  appsScriptBaseDescription: string;
  fastApiRouter: string;
  fastApiRouterDescription: string;
};

const layoutCopy: Record<Language, AdminLayoutUiCopy> = {
  pt: {
    profile: "Perfil",
    configureProfile: "Configurar perfil",
    language: "Idioma",
    helpTitle: "Perguntas frequentes",
    helpEmpty: "Nenhuma ajuda encontrada para essa busca.",
    liveData: "Dados ao vivo",
    exportCsv: "Exportar CSV",
    exportPdf: "PDF Executivo",
    closeSession: "Sair",
    profileDialogTitle: "Configurar perfil",
    profileDialogDescription: "Atualize a logo em PNG, o nome exibido e o e-mail do dashboard admin.",
    profileLogoLabel: "Logo em PNG",
    profileLogoAlt: "Logo do perfil",
    profileLogoPreviewAlt: "Preview da logo",
    name: "Nome",
    email: "E-mail",
    currentPassword: "Senha atual",
    newPassword: "Nova senha",
    confirmPassword: "Confirmar nova senha",
    currentPasswordPlaceholder: "Digite sua senha atual",
    newPasswordPlaceholder: "Minimo de 6 caracteres",
    confirmPasswordPlaceholder: "Repita a nova senha",
    cancel: "Cancelar",
    saveProfile: "Salvar perfil",
    savingProfile: "Salvando...",
    helpSuggestions: [
      { id: "pipeline", question: "Onde vejo Pipeline & Funil?", hint: "Abrir a visao executiva de pipeline.", href: "/admin?view=pipeline" },
      { id: "operacao", question: "Onde vejo Operacao Interna?", hint: "Abrir a visao executiva operacional.", href: "/admin?view=operacao" },
      { id: "usuarios", question: "Como gerencio usuarios e planos?", hint: "Abrir Controle de Acessos.", href: "/admin/usuarios" },
      { id: "erros", question: "Onde acompanho erros e alertas?", hint: "Abrir a central de erros e logs.", href: "/admin/erros" },
      { id: "kommo", question: "Como configuro a integracao Kommo?", hint: "Abrir a tela da integracao Kommo.", href: "/admin/kommo" },
      { id: "asaas", question: "Como configuro a integracao Asaas?", hint: "Abrir a tela da integracao Asaas.", href: "/admin/asaas" },
      { id: "google-calendar", question: "Como conecto Google Calendar?", hint: "Abrir a tela de Google Calendar.", href: "/admin/google-calendar" },
      { id: "google-forms", question: "Como conecto Google Forms?", hint: "Abrir a tela de Google Forms.", href: "/admin/google-forms" },
      { id: "contracts-sheet", question: "Como conecto a planilha de contratos?", hint: "Abrir a tela da planilha de contratos.", href: "/admin/planilha-contratos" },
      { id: "dre-sheet", question: "Como conecto a planilha DRE?", hint: "Abrir a tela da planilha DRE.", href: "/admin/planilha-dre" },
      { id: "pdf", question: "Como exporto o PDF executivo?", hint: "Usar o botao PDF Executivo no topo.", href: "/admin" },
    ],
  },
  en: {
    profile: "Profile",
    configureProfile: "Edit profile",
    language: "Language",
    helpTitle: "Frequently asked questions",
    helpEmpty: "No help found for this search.",
    liveData: "Live data",
    exportCsv: "Export CSV",
    exportPdf: "Executive PDF",
    closeSession: "Logout",
    profileDialogTitle: "Edit profile",
    profileDialogDescription: "Update the PNG logo, the display name and the email used in the admin dashboard.",
    profileLogoLabel: "PNG logo",
    profileLogoAlt: "Profile logo",
    profileLogoPreviewAlt: "Logo preview",
    name: "Name",
    email: "Email",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    currentPasswordPlaceholder: "Enter your current password",
    newPasswordPlaceholder: "At least 6 characters",
    confirmPasswordPlaceholder: "Repeat the new password",
    cancel: "Cancel",
    saveProfile: "Save profile",
    savingProfile: "Saving...",
    helpSuggestions: [
      { id: "pipeline", question: "Where can I see Pipeline & Funnel?", hint: "Open the pipeline executive view.", href: "/admin?view=pipeline" },
      { id: "operacao", question: "Where can I see Internal Operations?", hint: "Open the operations executive view.", href: "/admin?view=operacao" },
      { id: "usuarios", question: "How do I manage users and plans?", hint: "Open Access Control.", href: "/admin/usuarios" },
      { id: "erros", question: "Where can I track errors and alerts?", hint: "Open the errors and logs center.", href: "/admin/erros" },
      { id: "kommo", question: "How do I configure the Kommo integration?", hint: "Open the Kommo integration page.", href: "/admin/kommo" },
      { id: "asaas", question: "How do I configure the Asaas integration?", hint: "Open the Asaas integration page.", href: "/admin/asaas" },
      { id: "google-calendar", question: "How do I connect Google Calendar?", hint: "Open the Google Calendar page.", href: "/admin/google-calendar" },
      { id: "google-forms", question: "How do I connect Google Forms?", hint: "Open the Google Forms page.", href: "/admin/google-forms" },
      { id: "contracts-sheet", question: "How do I connect the contracts sheet?", hint: "Open the contracts sheet page.", href: "/admin/planilha-contratos" },
      { id: "dre-sheet", question: "How do I connect the DRE sheet?", hint: "Open the DRE sheet page.", href: "/admin/planilha-dre" },
      { id: "pdf", question: "How do I export the executive PDF?", hint: "Use the Executive PDF button at the top.", href: "/admin" },
    ],
  },
  es: {
    profile: "Perfil",
    configureProfile: "Configurar perfil",
    language: "Idioma",
    helpTitle: "Preguntas frecuentes",
    helpEmpty: "No se encontró ayuda para esta búsqueda.",
    liveData: "Datos en vivo",
    exportCsv: "Exportar CSV",
    exportPdf: "PDF ejecutivo",
    closeSession: "Salir",
    profileDialogTitle: "Configurar perfil",
    profileDialogDescription: "Actualiza el logo en PNG, el nombre visible y el correo del dashboard admin.",
    profileLogoLabel: "Logo en PNG",
    profileLogoAlt: "Logo del perfil",
    profileLogoPreviewAlt: "Vista previa del logo",
    name: "Nombre",
    email: "Correo electrónico",
    currentPassword: "Contraseña actual",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar nueva contraseña",
    currentPasswordPlaceholder: "Ingresa tu contraseña actual",
    newPasswordPlaceholder: "Mínimo de 6 caracteres",
    confirmPasswordPlaceholder: "Repite la nueva contraseña",
    cancel: "Cancelar",
    saveProfile: "Guardar perfil",
    savingProfile: "Guardando...",
    helpSuggestions: [
      { id: "pipeline", question: "¿Dónde veo Pipeline y Embudo?", hint: "Abrir la vista ejecutiva de pipeline.", href: "/admin?view=pipeline" },
      { id: "operacao", question: "¿Dónde veo Operación Interna?", hint: "Abrir la vista executiva operativa.", href: "/admin?view=operacao" },
      { id: "usuarios", question: "¿Cómo gestiono usuarios y planes?", hint: "Abrir Control de Accesos.", href: "/admin/usuarios" },
      { id: "erros", question: "¿Dónde sigo errores y alertas?", hint: "Abrir el centro de errores y logs.", href: "/admin/erros" },
      { id: "kommo", question: "¿Cómo configuro la integración Kommo?", hint: "Abrir la pantalla de integración Kommo.", href: "/admin/kommo" },
      { id: "asaas", question: "¿Cómo configuro la integración Asaas?", hint: "Abrir la pantalla de integración Asaas.", href: "/admin/asaas" },
      { id: "google-calendar", question: "¿Cómo conecto Google Calendar?", hint: "Abrir la pantalla de Google Calendar.", href: "/admin/google-calendar" },
      { id: "google-forms", question: "¿Cómo conecto Google Forms?", hint: "Abrir la pantalla de Google Forms.", href: "/admin/google-forms" },
      { id: "contracts-sheet", question: "¿Cómo conecto la hoja de contratos?", hint: "Abrir la pantalla de la hoja de contratos.", href: "/admin/planilha-contratos" },
      { id: "dre-sheet", question: "¿Cómo conecto la hoja DRE?", hint: "Abrir la pantalla de la hoja DRE.", href: "/admin/planilha-dre" },
      { id: "pdf", question: "¿Cómo exporto el PDF ejecutivo?", hint: "Usa el botón PDF ejecutivo en la parte superior.", href: "/admin" },
    ],
  },
};

const dashboardUiCopy: Record<Language, AdminDashboardUiCopy> = {
  pt: { period: "Periodo", product: "Produto", filterSlice: "Recorte", filteredBy: "Filtrado por", lowerPanel: "Painel inferior", records: "registros", alerts: "Alertas", executiveSemaphore: "Semaforo executivo", drilldown: "Drilldown", formula: "Formula", dataSource: "Origem do dado", noData: "Sem dados" },
  en: { period: "Period", product: "Product", filterSlice: "Slice", filteredBy: "Filtered by", lowerPanel: "Lower panel", records: "records", alerts: "Alerts", executiveSemaphore: "Executive semaphore", drilldown: "Drilldown", formula: "Formula", dataSource: "Data source", noData: "No data" },
  es: { period: "Período", product: "Producto", filterSlice: "Recorte", filteredBy: "Filtrado por", lowerPanel: "Panel inferior", records: "registros", alerts: "Alertas", executiveSemaphore: "Semáforo ejecutivo", drilldown: "Drilldown", formula: "Fórmula", dataSource: "Origen del dato", noData: "Sin datos" },
};

const errorsCopy: Record<Language, AdminErrorsUiCopy> = {
  pt: {
    title: "Identificacao de Erros",
    subtitle: "Observabilidade e monitoramento em tempo real",
    errors4xx: "Erros 4xx (24h)",
    errors5xx: "Erros 5xx (24h)",
    errorRate: "Taxa de Erro",
    activeAlerts: "Alertas Ativos",
    healthy: "Saudavel",
    withinHealthyRange: "Dentro do intervalo saudavel",
    requireImmediateAttention: "Requerem atencao imediata",
    errorsRate24h: "Taxa de Erros (24h)",
    errorsRate24hDescription: "Distribuicao de erros 4xx e 5xx ao longo do dia",
    smartAlerts: "Alertas Inteligentes",
    smartAlertsDescription: "Notificacoes automaticas de anomalias",
    active: "Ativo",
    alertMessages: {
      payments5xx: "Taxa de erro 5xx acima de 10% no modulo de pagamentos",
      dbLatency: "Latencia do banco de dados acima de 100ms",
      workersQueue: "Fila de processamento com 500+ itens pendentes",
      cdnCache: "Cache invalidado para /api/v2/*",
    },
    alertModules: { api: "API", database: "Database", workers: "Workers", cdn: "CDN" },
  },
  en: {
    title: "Error Identification",
    subtitle: "Observability and real-time monitoring",
    errors4xx: "4xx Errors (24h)",
    errors5xx: "5xx Errors (24h)",
    errorRate: "Error Rate",
    activeAlerts: "Active Alerts",
    healthy: "Healthy",
    withinHealthyRange: "Within the healthy range",
    requireImmediateAttention: "Require immediate attention",
    errorsRate24h: "Error Rate (24h)",
    errorsRate24hDescription: "Distribution of 4xx and 5xx errors throughout the day",
    smartAlerts: "Smart Alerts",
    smartAlertsDescription: "Automatic anomaly notifications",
    active: "Active",
    alertMessages: {
      payments5xx: "5xx error rate above 10% in the payments module",
      dbLatency: "Database latency above 100ms",
      workersQueue: "Processing queue with 500+ pending items",
      cdnCache: "Cache invalidated for /api/v2/*",
    },
    alertModules: { api: "API", database: "Database", workers: "Workers", cdn: "CDN" },
  },
  es: {
    title: "Identificación de Errores",
    subtitle: "Observabilidad y monitoreo en tiempo real",
    errors4xx: "Errores 4xx (24h)",
    errors5xx: "Errores 5xx (24h)",
    errorRate: "Tasa de Error",
    activeAlerts: "Alertas Activas",
    healthy: "Saludable",
    withinHealthyRange: "Dentro del rango saludable",
    requireImmediateAttention: "Requieren atención inmediata",
    errorsRate24h: "Tasa de Errores (24h)",
    errorsRate24hDescription: "Distribución de errores 4xx y 5xx a lo largo del día",
    smartAlerts: "Alertas Inteligentes",
    smartAlertsDescription: "Notificaciones automáticas de anomalías",
    active: "Activo",
    alertMessages: {
      payments5xx: "Tasa de error 5xx superior al 10% en el módulo de pagos",
      dbLatency: "Latencia de la base de datos superior a 100ms",
      workersQueue: "Cola de procesamiento con más de 500 ítems pendientes",
      cdnCache: "Caché invalidada para /api/v2/*",
    },
    alertModules: { api: "API", database: "Base de datos", workers: "Workers", cdn: "CDN" },
  },
};

const integrationCommonCopy: Record<Language, AdminIntegrationCommonCopy> = {
  pt: {
    officialDocs: "Documentacao oficial",
    syncNow: "Sincronizar agora",
    configuration: "Configuracao",
    enabled: "Integracao habilitada",
    disableToPause: "Desative para pausar ingestao e sync.",
    stepByStep: "Passo a passo de configuracao",
    webhook: "Webhook",
    queue: "Fila",
    lastSync: "Ultimo sync",
    lastUpdate: "Ultima atualizacao",
    loading: "Carregando...",
    notConfiguredYet: "Ainda nao configurado",
    saveConfiguration: "Salvar configuracao",
    replaceIfNeeded: "Preencha apenas para substituir.",
    localConfigSaved: "Configuracao da integracao salva localmente.",
    suggestedInternalEndpoint: "Endpoint interno sugerido",
    cadence: "Cadencia",
    authentication: "Autenticacao",
    connectionForm: "Formulario de conexao",
    connectionFormDescription: "Preencha query, endpoint, credenciais ou IDs tecnicos desta integracao. Os dados ficam salvos localmente no admin.",
    setupStepsDescription: "Sequencia recomendada para ligar essa integracao sem mudar a regra de negocio atual.",
    prerequisitesTitle: "1. Pre-requisito unico: Google Cloud Console",
    authOptionsTitle: "2. Autenticacao: dois caminhos",
    authOptionsDescription: "Service Account para backend sem usuario; OAuth 2.0 para acesso delegado do usuario final.",
    freeQuotasTitle: "3. Quotas gratuitas",
    freeQuotasDescription: "Sem necessidade de cartao de credito para habilitar as APIs nos volumes atuais do GLX.",
    freeRecommendedStack: "Stack gratuita recomendada",
    ingestionLogic: "Logica de ingestao",
    dashboardFields: "Campos que entram no dashboard",
    pythonQuickstart: "4. Quick start em Python com Service Account",
    pythonQuickstartDescription: "Base server-side para Sheets e Calendar usando as bibliotecas oficiais do Google.",
    appsScriptBase: "Apps Script base para conectar sem custo",
    appsScriptBaseDescription: "Exemplo inicial para Google Workspace com gatilho automatizado e envio ao backend GLX.",
    fastApiRouter: "Router FastAPI para plugar no app principal",
    fastApiRouterDescription: "Estrutura REST unica para Sheets, Calendar, Forms e Drive, como base de programacao do backend.",
  },
  en: {
    officialDocs: "Official documentation",
    syncNow: "Sync now",
    configuration: "Configuration",
    enabled: "Integration enabled",
    disableToPause: "Disable to pause ingestion and sync.",
    stepByStep: "Setup step by step",
    webhook: "Webhook",
    queue: "Queue",
    lastSync: "Last sync",
    lastUpdate: "Last update",
    loading: "Loading...",
    notConfiguredYet: "Not configured yet",
    saveConfiguration: "Save configuration",
    replaceIfNeeded: "Fill it only if you want to replace the current value.",
    localConfigSaved: "Integration configuration saved locally.",
    suggestedInternalEndpoint: "Suggested internal endpoint",
    cadence: "Cadence",
    authentication: "Authentication",
    connectionForm: "Connection form",
    connectionFormDescription: "Fill in query, endpoint, credentials or technical IDs for this integration. The data is stored locally in the admin.",
    setupStepsDescription: "Recommended sequence to connect this integration without changing the current business rules.",
    prerequisitesTitle: "1. Single prerequisite: Google Cloud Console",
    authOptionsTitle: "2. Authentication: two paths",
    authOptionsDescription: "Service Account for backend without a user; OAuth 2.0 for delegated end-user access.",
    freeQuotasTitle: "3. Free quotas",
    freeQuotasDescription: "No credit card is required to enable the APIs at GLX's current volume.",
    freeRecommendedStack: "Recommended free stack",
    ingestionLogic: "Ingestion logic",
    dashboardFields: "Fields sent to the dashboard",
    pythonQuickstart: "4. Python quick start with Service Account",
    pythonQuickstartDescription: "Server-side baseline for Sheets and Calendar using Google's official libraries.",
    appsScriptBase: "Base Apps Script for zero-cost connection",
    appsScriptBaseDescription: "Starter example for Google Workspace with an automated trigger and delivery to the GLX backend.",
    fastApiRouter: "FastAPI router to plug into the main app",
    fastApiRouterDescription: "Single REST structure for Sheets, Calendar, Forms and Drive as a backend foundation.",
  },
  es: {
    officialDocs: "Documentación oficial",
    syncNow: "Sincronizar ahora",
    configuration: "Configuración",
    enabled: "Integración habilitada",
    disableToPause: "Desactiva para pausar la ingesta y la sincronización.",
    stepByStep: "Configuración paso a paso",
    webhook: "Webhook",
    queue: "Cola",
    lastSync: "Última sync",
    lastUpdate: "Última actualización",
    loading: "Cargando...",
    notConfiguredYet: "Aún no configurado",
    saveConfiguration: "Guardar configuración",
    replaceIfNeeded: "Complétalo solo si quieres reemplazar el valor actual.",
    localConfigSaved: "Configuración de la integración guardada localmente.",
    suggestedInternalEndpoint: "Endpoint interno sugerido",
    cadence: "Cadencia",
    authentication: "Autenticación",
    connectionForm: "Formulario de conexión",
    connectionFormDescription: "Completa query, endpoint, credenciales o IDs técnicos de esta integración. Los datos se guardan localmente en el admin.",
    setupStepsDescription: "Secuencia recomendada para conectar esta integración sin cambiar la regla de negocio actual.",
    prerequisitesTitle: "1. Requisito único: Google Cloud Console",
    authOptionsTitle: "2. Autenticación: dos caminos",
    authOptionsDescription: "Service Account para backend sin usuario; OAuth 2.0 para acceso delegado del usuario final.",
    freeQuotasTitle: "3. Cuotas gratuitas",
    freeQuotasDescription: "No se necesita tarjeta de crédito para habilitar las APIs con el volumen actual de GLX.",
    freeRecommendedStack: "Stack gratuito recomendado",
    ingestionLogic: "Lógica de ingesta",
    dashboardFields: "Campos que entran al dashboard",
    pythonQuickstart: "4. Inicio rápido en Python con Service Account",
    pythonQuickstartDescription: "Base server-side para Sheets y Calendar usando las bibliotecas oficiales de Google.",
    appsScriptBase: "Apps Script base para conectar sin costo",
    appsScriptBaseDescription: "Ejemplo inicial para Google Workspace con trigger automatizado y envío al backend GLX.",
    fastApiRouter: "Router FastAPI para conectar al app principal",
    fastApiRouterDescription: "Estructura REST única para Sheets, Calendar, Forms y Drive como base del backend.",
  },
};

const replacementsByLanguage: Record<Exclude<Language, "pt">, Array<[string, string]>> = {
  en: [
    ["Pipeline & Funil", "Pipeline & Funnel"],
    ["Operação Interna", "Internal Operations"],
    ["Operacao Interna", "Internal Operations"],
    ["O crescimento futuro esta garantido?", "Is future growth guaranteed?"],
    ["A empresa esta saudavel agora?", "Is the company healthy right now?"],
    ["Visao de futuro. Esta camada continua separada da operacao e responde apenas pela garantia de crescimento dos proximos 30 a 60 dias.", "Future view. This layer remains separate from operations and focuses only on guaranteeing growth over the next 30 to 60 days."],
    ["Visao de presente e passado recente. Esta rota mostra a saude atual do negocio usando apenas fontes operacionais e financeiras do briefing.", "Present and recent-past view. This route shows the current health of the business using only operational and financial sources from the briefing."],
    ["Cadencia", "Cadence"],
    ["Produtos", "Products"],
    ["Fontes", "Sources"],
    ["Escopo", "Scope"],
    ["Leads Totais Gerados", "Total Leads Generated"],
    ["Leads Quentes", "Warm Leads"],
    ["Calls de Qualificacao", "Qualification Calls"],
    ["Calls de Fechamento", "Closing Calls"],
    ["Taxa Fechamento -> Contrato (%)", "Close-to-Contract Rate (%)"],
    ["MRR Total (R$)", "Total MRR (R$)"],
    ["Crescimento MRR (%)", "MRR Growth (%)"],
    ["Margem Liquida (%)", "Net Margin (%)"],
    ["Fluxo de Caixa Projetado (R$)", "Projected Cash Flow (R$)"],
    ["Utilizacao de Capacidade (%)", "Capacity Utilization (%)"],
    ["Planilha de Contratos", "Contracts Sheet"],
    ["Planilha DRE", "P&L Sheet"],
    ["Planilha de Capacidade", "Capacity Sheet"],
    ["Oportunidades e Gargalos", "Opportunities and Bottlenecks"],
    ["Health Score por cliente", "Health Score by client"],
    ["Semanal e, quando prospectando ativamente, diario", "Weekly and, when prospecting actively, daily"],
    ["Operation System (OS) - Start e Pro + Advisory - Board e Scale", "Operation System (OS) - Start and Pro + Advisory - Board and Scale"],
    ["Pipedrive, Google Calendar e Contratos", "Pipedrive, Google Calendar and Contracts"],
    ["Contratos, ASAAS, DRE, Forms e Tempo", "Contracts, ASAAS, P&L, Forms and Time"],
    ["Receita, retencao, margem e capacidade", "Revenue, retention, margin and capacity"],
    ["Funil Executivo", "Executive Funnel"],
    ["Blocos 1 e 2: entrada de leads, aquecimento comercial, calls e contratos.", "Blocks 1 and 2: lead intake, commercial warming, calls and contracts."],
    ["Pipeline Ponderado", "Weighted Pipeline"],
    ["Bloco 5: serie semanal respeitando as probabilidades do briefing e o alvo de 3x meta.", "Block 5: weekly series respecting the briefing probabilities and the 3x target line."],
    ["Leads por Origem", "Leads by Source"],
    ["Bloco 1: leitura visual do topo do funil por canal dominante.", "Block 1: visual read of the top of the funnel by dominant channel."],
    ["Conversao por Etapa", "Conversion by Stage"],
    ["Blocos 1 e 2: atual vs meta nas conversoes criticas do funil.", "Blocks 1 and 2: current vs target in the funnel's critical conversions."],
    ["Ciclo Medio Lead > Contrato", "Average Lead > Contract Cycle"],
    ["Bloco 2: comparar OS x Advisory para localizar gargalo comercial.", "Block 2: compare OS vs Advisory to locate the commercial bottleneck."],
    ["Blocos 3 e 4: recorrencia do OS versus renovacao e base ativa do Advisory.", "Blocks 3 and 4: OS recurrence versus Advisory renewal and active base."],
    ["Indicacao", "Referral"],
    ["Atual", "Current"],
    ["Meta", "Target"],
    ["Painel", "Panel"],
    ["Painel superior", "Top panel"],
    ["Painel inferior", "Lower panel"],
    ["Detalhe", "Detail"],
    ["Volume atual", "Current volume"],
    ["ACV medio", "Average ACV"],
    ["Pipeline ponderado", "Weighted pipeline"],
    ["Leads quentes", "Warm leads"],
    ["Calls qualif.", "Qualification calls"],
    ["Calls fech.", "Closing calls"],
    ["Qualif. -> Fech.", "Qualif. -> Closing"],
    ["Fech. -> Contrato", "Closing -> Contract"],
    ["Cliente", "Client"],
    ["Saudavel", "Healthy"],
    ["Risco moderado", "Moderate risk"],
    ["Plano de resgate", "Recovery plan"],
    ["Atencao", "Attention"],
  ],
  es: [
    ["Pipeline & Funil", "Pipeline y Embudo"],
    ["Operação Interna", "Operación Interna"],
    ["Operacao Interna", "Operación Interna"],
    ["O crescimento futuro esta garantido?", "¿El crecimiento futuro está garantizado?"],
    ["A empresa esta saudavel agora?", "¿La empresa está saludable ahora?"],
    ["Visao de futuro. Esta camada continua separada da operacao e responde apenas pela garantia de crescimento dos proximos 30 a 60 dias.", "Visión de futuro. Esta capa sigue separada de la operación y responde solo por la garantía de crecimiento de los próximos 30 a 60 días."],
    ["Visao de presente e passado recente. Esta rota mostra a saude atual do negocio usando apenas fontes operacionais e financeiras do briefing.", "Visión del presente y del pasado reciente. Esta ruta muestra la salud actual del negocio usando solo fuentes operativas y financieras del briefing."],
    ["Cadencia", "Cadencia"],
    ["Produtos", "Productos"],
    ["Fontes", "Fuentes"],
    ["Escopo", "Alcance"],
    ["Leads Totais Gerados", "Leads Totales Generados"],
    ["Leads Quentes", "Leads Calificados"],
    ["Calls de Qualificacao", "Calls de Calificación"],
    ["Calls de Fechamento", "Calls de Cierre"],
    ["Taxa Fechamento -> Contrato (%)", "Tasa Cierre -> Contrato (%)"],
    ["MRR Total (R$)", "MRR Total (R$)"],
    ["Crescimento MRR (%)", "Crecimiento MRR (%)"],
    ["Margem Liquida (%)", "Margen Neto (%)"],
    ["Fluxo de Caixa Projetado (R$)", "Flujo de Caja Proyectado (R$)"],
    ["Utilizacao de Capacidade (%)", "Utilización de Capacidad (%)"],
    ["Planilha de Contratos", "Hoja de Contratos"],
    ["Planilha DRE", "Hoja DRE"],
    ["Planilha de Capacidade", "Hoja de Capacidad"],
    ["Oportunidades e Gargalos", "Oportunidades y Cuellos de Botella"],
    ["Health Score por cliente", "Health Score por cliente"],
    ["Semanal e, quando prospectando ativamente, diario", "Semanal y, cuando se prospecta activamente, diario"],
    ["Operation System (OS) - Start e Pro + Advisory - Board e Scale", "Operation System (OS) - Start y Pro + Advisory - Board y Scale"],
    ["Pipedrive, Google Calendar e Contratos", "Pipedrive, Google Calendar y Contratos"],
    ["Contratos, ASAAS, DRE, Forms e Tempo", "Contratos, ASAAS, DRE, Forms y Tiempo"],
    ["Receita, retencao, margem e capacidade", "Ingresos, retención, margen y capacidad"],
    ["Funil Executivo", "Embudo Ejecutivo"],
    ["Blocos 1 e 2: entrada de leads, aquecimento comercial, calls e contratos.", "Bloques 1 y 2: entrada de leads, calentamiento comercial, calls y contratos."],
    ["Pipeline Ponderado", "Pipeline Ponderado"],
    ["Bloco 5: serie semanal respeitando as probabilidades do briefing e o alvo de 3x meta.", "Bloque 5: serie semanal respetando las probabilidades del briefing y la meta 3x."],
    ["Leads por Origem", "Leads por Origen"],
    ["Bloco 1: leitura visual do topo do funil por canal dominante.", "Bloque 1: lectura visual de la parte superior del embudo por canal dominante."],
    ["Conversao por Etapa", "Conversión por Etapa"],
    ["Blocos 1 e 2: atual vs meta nas conversoes criticas do funil.", "Bloques 1 y 2: actual vs meta en las conversiones críticas del embudo."],
    ["Ciclo Medio Lead > Contrato", "Ciclo Medio Lead > Contrato"],
    ["Bloco 2: comparar OS x Advisory para localizar gargalo comercial.", "Bloque 2: comparar OS y Advisory para localizar el cuello comercial."],
    ["Blocos 3 e 4: recorrencia do OS versus renovacao e base ativa do Advisory.", "Bloques 3 y 4: recurrencia de OS frente a renovación y base activa de Advisory."],
    ["Indicacao", "Indicación"],
    ["Atual", "Actual"],
    ["Meta", "Meta"],
    ["Painel", "Panel"],
    ["Painel superior", "Panel superior"],
    ["Painel inferior", "Panel inferior"],
    ["Detalhe", "Detalle"],
    ["Volume atual", "Volumen actual"],
    ["ACV medio", "ACV medio"],
    ["Pipeline ponderado", "Pipeline ponderado"],
    ["Leads quentes", "Leads calientes"],
    ["Calls qualif.", "Calls calif."],
    ["Calls fech.", "Calls cierre"],
    ["Qualif. -> Fech.", "Calif. -> Cierre"],
    ["Fech. -> Contrato", "Cierre -> Contrato"],
    ["Cliente", "Cliente"],
    ["Saudavel", "Saludable"],
    ["Risco moderado", "Riesgo moderado"],
    ["Plano de resgate", "Plan de rescate"],
    ["Atencao", "Atención"],
  ],
};

export function getAdminLayoutUiCopy(language: Language) {
  return layoutCopy[language];
}

export function getAdminDashboardUiCopy(language: Language) {
  return dashboardUiCopy[language];
}

export function getAdminErrorsUiCopy(language: Language) {
  return errorsCopy[language];
}

export function getAdminIntegrationCommonCopy(language: Language) {
  return integrationCommonCopy[language];
}

export function translateAdminDashboardText(text: string, language: Language) {
  if (language === "pt" || !text) return text;
  const replacements = [...replacementsByLanguage[language]].sort((a, b) => b[0].length - a[0].length);
  return replacements.reduce((acc, [search, replacement]) => acc.split(search).join(replacement), text);
}
