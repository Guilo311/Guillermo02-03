export type CsvDashboardTable = {
  title: string;
  head: string[];
  body: string[][];
};

export type CsvDashboardSection = {
  title: string;
  cards: Array<{ label: string; value: string }>;
  tables: CsvDashboardTable[];
};

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function row(values: string[]) {
  return `${values.map((value) => escapeCsv(value)).join(",")}\n`;
}

export function extractDashboardSections(root: HTMLElement): CsvDashboardSection[] {
  const sectionNodes = root.querySelectorAll<HTMLElement>(".pdf-export-section");
  const scopedRoots = sectionNodes.length > 0 ? Array.from(sectionNodes) : [root];

  return scopedRoots.map((sectionNode, index) => {
    const title =
      sectionNode.getAttribute("data-title")?.trim() ||
      sectionNode.querySelector(".section-header h2")?.textContent?.trim() ||
      `Aba ${index + 1}`;

    const cards = Array.from(sectionNode.querySelectorAll<HTMLElement>(".overview-card"))
      .map((card) => ({
        label: card.querySelector(".overview-card-label")?.textContent?.trim() || "",
        value: card.querySelector(".overview-card-value")?.textContent?.trim() || "",
      }))
      .filter((item) => item.label || item.value);

    const tables = Array.from(sectionNode.querySelectorAll<HTMLTableElement>(".data-table"))
      .map((table, tableIndex) => {
        const titleNode = table.closest(".chart-card, .detail-section")?.querySelector<HTMLElement>(".chart-card-title, .detail-section-header");
        return {
          title: titleNode?.textContent?.trim() || `Tabela ${tableIndex + 1}`,
          head: Array.from(table.querySelectorAll("thead th")).map((cell) => cell.textContent?.trim() || ""),
          body: Array.from(table.querySelectorAll("tbody tr"))
            .map((tr) => Array.from(tr.querySelectorAll("td")).map((cell) => cell.textContent?.trim() || ""))
            .filter((cells) => cells.length > 0),
        };
      })
      .filter((table) => table.head.length > 0 || table.body.length > 0);

    return { title, cards, tables };
  }).filter((section) => section.cards.length > 0 || section.tables.length > 0);
}

export function buildDashboardCsv(params: {
  reportTitle: string;
  planLabel: string;
  currency: string;
  generatedAt: string;
  filters: Array<{ label: string; value: string }>;
  sections: CsvDashboardSection[];
  labels?: {
    exportTitle?: string;
    report?: string;
    plan?: string;
    currency?: string;
    generatedAt?: string;
    activeFilters?: string;
    tab?: string;
    kpis?: string;
    indicator?: string;
    value?: string;
    table?: string;
  };
}) {
  const labels = {
    exportTitle: "GLX Dashboard Export",
    report: "Relatorio",
    plan: "Plano",
    currency: "Moeda",
    generatedAt: "Gerado em",
    activeFilters: "Filtros ativos",
    tab: "Aba",
    kpis: "KPIs",
    indicator: "Indicador",
    value: "Valor",
    table: "Tabela",
    ...params.labels,
  };
  let csv = "\uFEFF";

  csv += row([labels.exportTitle]);
  csv += row([labels.report, params.reportTitle]);
  csv += row([labels.plan, params.planLabel]);
  csv += row([labels.currency, params.currency]);
  csv += row([labels.generatedAt, params.generatedAt]);

  if (params.filters.length > 0) {
    csv += row([labels.activeFilters]);
    params.filters.forEach((filter) => {
      csv += row([filter.label, filter.value]);
    });
  }

  params.sections.forEach((section) => {
    csv += "\n";
    csv += row([`${labels.tab}: ${section.title}`]);

    if (section.cards.length > 0) {
      csv += row([labels.kpis]);
      csv += row([labels.indicator, labels.value]);
      section.cards.forEach((card) => {
        csv += row([card.label, card.value]);
      });
    }

    section.tables.forEach((table) => {
      csv += "\n";
      csv += row([`${labels.table}: ${table.title}`]);
      if (table.head.length > 0) {
        csv += row(table.head);
      }
      table.body.forEach((bodyRow) => {
        csv += row(bodyRow);
      });
    });
  });

  return csv;
}
