import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import type { AdminDashboardViewData } from "@/features/admin-dashboard/hooks/useAdminDashboardView";
import type { DashboardViewId } from "@/features/admin-dashboard/types";

type DashboardChart = AdminDashboardViewData["topCharts"][number];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatTimestamp(date = new Date()) {
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

function sanitizeFilenamePart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function buildFilename(view: DashboardViewId, ext: "csv" | "pdf") {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  return `glx-${sanitizeFilenamePart(view)}-${stamp}.${ext}`;
}

export function exportAdminDashboardCsv({
  view,
  data,
  period,
}: {
  view: DashboardViewId;
  data: AdminDashboardViewData;
  period: string;
}) {
  const generatedAt = formatTimestamp();
  const tableColumns = Array.from(
    new Set(data.tableRows.flatMap((row) => Object.keys(row))),
  );

  type CsvRow = {
    secao: string;
    grupo: string;
    item: string;
    label: string;
    valor: string;
    status: string;
    fonte: string;
    formula: string;
    threshold_verde: string;
    threshold_amarelo: string;
    threshold_vermelho: string;
    descricao: string;
    acao: string;
    prazo: string;
    tabela: string;
    linha: string;
  } & Record<string, string>;

  const rows: CsvRow[] = [];

  const makeBaseRow = (): CsvRow => ({
    secao: "",
    grupo: "",
    item: "",
    label: "",
    valor: "",
    status: "",
    fonte: "",
    formula: "",
    threshold_verde: "",
    threshold_amarelo: "",
    threshold_vermelho: "",
    descricao: "",
    acao: "",
    prazo: "",
    tabela: "",
    linha: "",
    ...Object.fromEntries(tableColumns.map((column) => [`tabela_${column}`, ""])),
  });

  rows.push({
    ...makeBaseRow(),
    secao: "metadata",
    grupo: "relatorio",
    item: "titulo",
    valor: data.heading,
  });
  rows.push({
    ...makeBaseRow(),
    secao: "metadata",
    grupo: "relatorio",
    item: "gerado_em",
    valor: generatedAt,
  });
  rows.push({
    ...makeBaseRow(),
    secao: "metadata",
    grupo: "relatorio",
    item: "periodo",
    valor: period,
  });
  rows.push({
    ...makeBaseRow(),
    secao: "metadata",
    grupo: "relatorio",
    item: "marca_dagua",
    valor: "GLX Partners | Growth. Lean. Execution.",
  });

  data.metaCards.forEach((item) => {
    rows.push({
      ...makeBaseRow(),
      secao: "meta_cards",
      grupo: "cabecalho",
      item: item.label,
      valor: item.value,
    });
  });

  data.summaryCards.forEach((card) => {
    rows.push({
      ...makeBaseRow(),
      secao: "kpis",
      grupo: "resumo",
      item: card.id,
      label: card.title,
      valor: card.value,
      status: card.status.toUpperCase(),
      fonte: card.source,
      formula: card.formula,
      threshold_verde: card.thresholds.green,
      threshold_amarelo: card.thresholds.yellow,
      threshold_vermelho: card.thresholds.red,
    });
  });

  data.alerts.forEach((alert) => {
    rows.push({
      ...makeBaseRow(),
      secao: "alertas",
      grupo: "semaforo",
      item: alert.id,
      label: alert.title,
      status: alert.level.toUpperCase(),
      descricao: alert.description,
      acao: alert.action,
      prazo: alert.deadline,
    });
  });

  data.tableRows.forEach((row, index) => {
    const expandedColumns = Object.fromEntries(
      tableColumns.map((column) => [`tabela_${column}`, row[column] ?? ""]),
    );

    rows.push({
      ...makeBaseRow(),
      ...expandedColumns,
      secao: "tabela",
      grupo: "dados",
      item: `linha_${index + 1}`,
      tabela: data.tableTitle,
      linha: String(index + 1),
    });
  });

  const csv = Papa.unparse(rows);
  downloadBlob(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }), buildFilename(view, "csv"));
}

function drawWatermark(doc: jsPDF) {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  doc.setTextColor(230, 234, 240);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.text("GLX", width / 2, height / 2, {
    align: "center",
    angle: 28,
  });
}

function drawPdfHeader(doc: jsPDF, title: string, generatedAt: string, period: string) {
  const width = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(18);
  doc.text(title, 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(102, 112, 133);
  doc.setFontSize(10);
  doc.text(`Gerado em ${generatedAt}`, 14, 25);
  doc.text(`Periodo: ${period}`, width - 14, 25, { align: "right" });
  doc.text("GLX Partners | Growth. Lean. Execution. | Documento confidencial", width / 2, 287, {
    align: "center",
  });
}

type ChartSnapshot = {
  title: string;
  subtitle: string;
  imageDataUrl: string;
  width: number;
  height: number;
};

const SVG_STYLE_PROPS_TO_INLINE = [
  "fill",
  "stroke",
  "strokeWidth",
  "strokeLinecap",
  "strokeLinejoin",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "letterSpacing",
  "opacity",
  "color",
] as const;

function inlineSvgStyles(originalSvg: SVGSVGElement, clonedSvg: SVGSVGElement) {
  const originalNodes = [originalSvg, ...Array.from(originalSvg.querySelectorAll<SVGElement>("*"))];
  const clonedNodes = [clonedSvg, ...Array.from(clonedSvg.querySelectorAll<SVGElement>("*"))];

  clonedNodes.forEach((clonedNode, index) => {
    const originalNode = originalNodes[index];
    if (!originalNode) return;

    const computed = window.getComputedStyle(originalNode);
    SVG_STYLE_PROPS_TO_INLINE.forEach((prop) => {
      const value = computed[prop];
      if (value) {
        clonedNode.style[prop] = value;
      }
    });
  });
}

async function svgToPngDataUrl(svgElement: SVGSVGElement) {
  const bounds = svgElement.getBoundingClientRect();
  const viewBox = svgElement.viewBox.baseVal;
  const width = Math.max(Math.round(bounds.width || viewBox.width || 640), 320);
  const height = Math.max(Math.round(bounds.height || viewBox.height || 280), 180);
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

  inlineSvgStyles(svgElement, clonedSvg);
  clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clonedSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clonedSvg.setAttribute("width", String(width));
  clonedSvg.setAttribute("height", String(height));
  if (!clonedSvg.getAttribute("viewBox")) {
    clonedSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  background.setAttribute("x", "0");
  background.setAttribute("y", "0");
  background.setAttribute("width", "100%");
  background.setAttribute("height", "100%");
  background.setAttribute("fill", "#ffffff");
  clonedSvg.insertBefore(background, clonedSvg.firstChild);

  const serialized = new XMLSerializer().serializeToString(clonedSvg);
  const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Nao foi possivel renderizar o SVG do grafico."));
      nextImage.src = url;
    });

    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Nao foi possivel preparar o canvas do grafico.");
    }

    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    return {
      imageDataUrl: canvas.toDataURL("image/png"),
      width,
      height,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function normalizeNumber(value: number | string | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const sanitized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const parsed = Number.parseFloat(sanitized || "0");
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getCategoryKey(chart: DashboardChart) {
  return Object.keys(chart.data[0] ?? {}).find((key) => !chart.dataKeys.includes(key)) ?? "categoria";
}

function formatAxisValue(value: number) {
  if (Math.abs(value) >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }
  return `${Math.round(value)}`;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawBaseChartFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  chart: DashboardChart,
) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 12px Arial";
  ctx.fillText("PAINEL", 24, 28);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 24px Arial";
  ctx.fillText(chart.title, 24, 56);

  if (chart.subtitle) {
    ctx.fillStyle = "#667085";
    ctx.font = "14px Arial";
    ctx.fillText(chart.subtitle, 24, 80);
  }

  return {
    plotX: 56,
    plotY: 120,
    plotWidth: width - 92,
    plotHeight: height - 168,
  };
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  plotX: number,
  plotY: number,
  plotWidth: number,
  plotHeight: number,
  maxValue: number,
) {
  const steps = 4;
  ctx.strokeStyle = "#e8edf5";
  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px Arial";
  for (let index = 0; index <= steps; index += 1) {
    const y = plotY + (plotHeight / steps) * index;
    ctx.beginPath();
    ctx.moveTo(plotX, y);
    ctx.lineTo(plotX + plotWidth, y);
    ctx.stroke();

    const value = maxValue - (maxValue / steps) * index;
    ctx.fillText(formatAxisValue(value), 12, y + 4);
  }
}

function drawBarLikeChart(
  ctx: CanvasRenderingContext2D,
  chart: DashboardChart,
  areaFill = false,
) {
  const { plotX, plotY, plotWidth, plotHeight } = drawBaseChartFrame(ctx, ctx.canvas.width, ctx.canvas.height, chart);
  const categoryKey = getCategoryKey(chart);
  const values = chart.data.flatMap((row) => chart.dataKeys.map((key) => normalizeNumber(row[key])));
  const maxValue = Math.max(...values, 1) * 1.15;
  drawGrid(ctx, plotX, plotY, plotWidth, plotHeight, maxValue);

  const groupWidth = plotWidth / Math.max(chart.data.length, 1);
  const barWidth = chart.type === "bar"
    ? Math.min(42, (groupWidth - 18) / Math.max(chart.dataKeys.length, 1))
    : Math.min(52, groupWidth - 18);

  chart.data.forEach((row, index) => {
    const groupStart = plotX + groupWidth * index;
    const label = String(row[categoryKey] ?? "");

    if (chart.type === "bar") {
      chart.dataKeys.forEach((key, keyIndex) => {
        const value = normalizeNumber(row[key]);
        const barHeight = (value / maxValue) * plotHeight;
        const x = groupStart + 10 + keyIndex * (barWidth + 10);
        const y = plotY + plotHeight - barHeight;
        ctx.fillStyle = chart.colors[keyIndex % chart.colors.length] || "#ff7a1a";
        roundedRect(ctx, x, y, barWidth, barHeight, 8);
        ctx.fill();
      });
    } else {
      chart.dataKeys.forEach((key, keyIndex) => {
        const points = chart.data.map((point, pointIndex) => {
          const pointValue = normalizeNumber(point[key]);
          const x = plotX + groupWidth * pointIndex + groupWidth / 2;
          const y = plotY + plotHeight - (pointValue / maxValue) * plotHeight;
          return { x, y, value: pointValue };
        });

        if (areaFill && keyIndex === 0) {
          ctx.beginPath();
          points.forEach((point, pointIndex) => {
            if (pointIndex === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.lineTo(points[points.length - 1].x, plotY + plotHeight);
          ctx.lineTo(points[0].x, plotY + plotHeight);
          ctx.closePath();
          ctx.fillStyle = `${chart.colors[keyIndex % chart.colors.length] || "#2563eb"}22`;
          ctx.fill();
        }

        ctx.beginPath();
        points.forEach((point, pointIndex) => {
          if (pointIndex === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = chart.colors[keyIndex % chart.colors.length] || "#2563eb";
        ctx.lineWidth = keyIndex === 0 ? 4 : 3;
        ctx.stroke();

        points.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = chart.colors[keyIndex % chart.colors.length] || "#2563eb";
          ctx.stroke();
        });
      });
    }

    ctx.fillStyle = "#64748b";
    ctx.font = "12px Arial";
    ctx.fillText(label, groupStart + 8, plotY + plotHeight + 24);
  });

  ctx.fillStyle = "#0f172a";
  ctx.font = "12px Arial";
  chart.dataKeys.forEach((key, index) => {
    const legendX = plotX + index * 140;
    const legendY = ctx.canvas.height - 26;
    ctx.fillStyle = chart.colors[index % chart.colors.length] || "#2563eb";
    ctx.fillRect(legendX, legendY - 9, 14, 14);
    ctx.fillStyle = "#475467";
    ctx.fillText(key, legendX + 22, legendY + 2);
  });
}

function drawPieChart(ctx: CanvasRenderingContext2D, chart: DashboardChart) {
  drawBaseChartFrame(ctx, ctx.canvas.width, ctx.canvas.height, chart);
  const total = Math.max(
    chart.data.reduce((sum, row) => sum + normalizeNumber(row[chart.dataKeys[0]]), 0),
    1,
  );
  const centerX = ctx.canvas.width * 0.36;
  const centerY = ctx.canvas.height * 0.58;
  const outerRadius = 82;
  const innerRadius = 44;
  const categoryKey = getCategoryKey(chart);
  let startAngle = -Math.PI / 2;

  chart.data.forEach((row, index) => {
    const value = normalizeNumber(row[chart.dataKeys[0]]);
    const angle = (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = chart.colors[index % chart.colors.length] || "#ff7a1a";
    ctx.fill();
    startAngle += angle;
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 14px Arial";
  ctx.fillText("Origens", centerX - 24, centerY + 4);

  chart.data.forEach((row, index) => {
    const y = 128 + index * 28;
    const x = ctx.canvas.width * 0.68;
    ctx.fillStyle = chart.colors[index % chart.colors.length] || "#ff7a1a";
    ctx.fillRect(x, y - 10, 14, 14);
    ctx.fillStyle = "#475467";
    ctx.font = "13px Arial";
    const label = String(row[categoryKey] ?? "");
    const value = normalizeNumber(row[chart.dataKeys[0]]);
    ctx.fillText(`${label}: ${formatAxisValue(value)}`, x + 22, y + 1);
  });
}

async function createChartSnapshot(chart: DashboardChart): Promise<ChartSnapshot> {
  const width = 1200;
  const height = 640;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Nao foi possivel criar o canvas do grafico.");
  }

  if (chart.type === "pie") {
    drawPieChart(ctx, chart);
  } else if (chart.type === "area") {
    drawBarLikeChart(ctx, chart, true);
  } else {
    drawBarLikeChart(ctx, chart, false);
  }

  return {
    title: chart.title,
    subtitle: chart.subtitle,
    imageDataUrl: canvas.toDataURL("image/png"),
    width,
    height,
  };
}

async function collectChartSnapshots(rootElement: HTMLElement, data: AdminDashboardViewData) {
  const snapshots: ChartSnapshot[] = [];
  const charts = [...data.topCharts, ...data.bottomCharts];

  if (charts.length > 0) {
    for (const chart of charts) {
      snapshots.push(await createChartSnapshot(chart));
    }
    return snapshots;
  }

  const chartCards = Array.from(rootElement.querySelectorAll<HTMLElement>("[data-glx-chart-card=\"true\"]"));
  for (const card of chartCards) {
    const svg = card.querySelector<SVGSVGElement>("svg");
    if (!svg) continue;

    const { imageDataUrl, width, height } = await svgToPngDataUrl(svg);
    snapshots.push({
      title: card.dataset.glxChartTitle || "Grafico",
      subtitle: card.dataset.glxChartSubtitle || "",
      imageDataUrl,
      width,
      height,
    });
  }

  return snapshots;
}

function appendChartSnapshots(doc: jsPDF, snapshots: ChartSnapshot[], generatedAt: string, period: string, heading: string) {
  if (snapshots.length === 0) return false;

  const marginX = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - 20;

  let cursorY = 34;

  const startNewPage = () => {
    doc.addPage();
    drawWatermark(doc);
    drawPdfHeader(doc, `${heading} | Graficos executivos`, generatedAt, period);
    cursorY = 34;
  };

  snapshots.forEach((snapshot, index) => {
    if (index > 0) {
      const estimatedHeight = Math.min(92, usableWidth * (snapshot.height / snapshot.width)) + 24;
      if (cursorY + estimatedHeight > bottomLimit) {
        startNewPage();
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(13);
    doc.text(snapshot.title, marginX, cursorY);
    cursorY += 6;

    if (snapshot.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(102, 112, 133);
      doc.setFontSize(9);
      doc.text(snapshot.subtitle, marginX, cursorY, { maxWidth: usableWidth });
      cursorY += 8;
    }

    const renderedHeight = Math.min(92, usableWidth * (snapshot.height / snapshot.width));
    doc.addImage(snapshot.imageDataUrl, "PNG", marginX, cursorY, usableWidth, renderedHeight, undefined, "FAST");
    cursorY += renderedHeight + 10;
  });

  return true;
}

export async function exportAdminDashboardPdf({
  view,
  data,
  period,
  rootElement,
}: {
  view: DashboardViewId;
  data: AdminDashboardViewData;
  period: string;
  rootElement: HTMLElement;
}) {
  const generatedAt = formatTimestamp();
  const doc = new jsPDF("p", "mm", "a4");

  drawWatermark(doc);
  drawPdfHeader(doc, data.heading, generatedAt, period);

  autoTable(doc, {
    startY: 34,
    head: [["Campo", "Valor"]],
    body: [
      ["Pergunta executiva", data.question],
      ["Gerado em", generatedAt],
      ["Periodo", period],
      ...data.metaCards.map((item) => [item.label, item.value]),
    ],
    styles: {
      fontSize: 9,
      textColor: [17, 24, 39],
      cellPadding: 2.6,
    },
    headStyles: {
      fillColor: [255, 122, 26],
      textColor: [255, 255, 255],
    },
    theme: "grid",
    margin: { left: 14, right: 14 },
  });

  try {
    const chartSnapshots = await collectChartSnapshots(rootElement, data);
    doc.addPage();
    drawWatermark(doc);
    drawPdfHeader(doc, `${data.heading} | Graficos executivos`, generatedAt, period);
    const appended = appendChartSnapshots(doc, chartSnapshots, generatedAt, period, data.heading);
    if (!appended) {
      throw new Error("Nenhum grafico visual foi encontrado para exportacao.");
    }
  } catch {
    doc.addPage();
    drawWatermark(doc);
    drawPdfHeader(doc, `${data.heading} | Graficos executivos`, generatedAt, period);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(15);
    doc.text("Snapshot visual indisponivel", 14, 40);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(102, 112, 133);
    doc.setFontSize(10);
    doc.text(
      "O PDF foi gerado em modo de seguranca, com os dados tabulares preservados, porque a captura visual da tela nao foi suportada pelo navegador atual.",
      14,
      48,
      { maxWidth: 180 },
    );
  }

  const tableStart = 34;
  doc.addPage();
  drawWatermark(doc);
  drawPdfHeader(doc, `${data.heading} | Relatorio tabular`, generatedAt, period);

  autoTable(doc, {
    startY: tableStart,
    head: [["KPI", "Valor", "Status", "Fonte", "Formula"]],
    body: data.summaryCards.map((card) => [
      card.title,
      card.value,
      card.status.toUpperCase(),
      card.source,
      card.formula,
    ]),
    styles: { fontSize: 8.2, cellPadding: 2.1 },
    headStyles: { fillColor: [17, 24, 39] },
    margin: { left: 10, right: 10 },
  });

  autoTable(doc, {
    startY: ((doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? tableStart) + 8,
    head: [Object.keys(data.tableRows[0] ?? { detalhe: "Sem dados" })],
    body: data.tableRows.length > 0
      ? data.tableRows.map((row) => Object.values(row))
      : [["Sem dados"]],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 122, 26] },
    margin: { left: 10, right: 10 },
  });

  if (data.alerts.length > 0) {
    autoTable(doc, {
      startY: ((doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? tableStart) + 8,
      head: [["Alerta", "Nivel", "Descricao", "Prazo"]],
      body: data.alerts.map((alert) => [
        alert.title,
        alert.level.toUpperCase(),
        alert.description,
        alert.deadline,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [245, 158, 11] },
      margin: { left: 10, right: 10 },
    });
  }

  const pdfBlob = doc.output("blob");
  downloadBlob(pdfBlob, buildFilename(view, "pdf"));
}
