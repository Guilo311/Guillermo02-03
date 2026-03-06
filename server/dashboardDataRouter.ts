import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getLatestCeoMetrics,
  upsertCeoMetrics,
  getAndonAlerts,
  createAndonAlert,
  resolveAndonAlert,
  deleteAndonAlert,
  getLatestFinancialData,
  upsertFinancialData,
  getLatestOperationsData,
  upsertOperationsData,
  getLatestWasteData,
  upsertWasteData,
  getLatestMarketingData,
  upsertMarketingData,
  getLatestQualityData,
  upsertQualityData,
  getLatestPeopleData,
  upsertPeopleData,
  getLatestDataGovernanceData,
  upsertDataGovernanceData,
  getAllDashboardData,
  getDataImports,
  createDataImport,
  updateDataImportStatus,
} from "./db";
import { TRPCError } from "@trpc/server";
import { syncLocalAiPayloadToClient } from "./domain/localAiDashboardSync";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado. Apenas administradores.' });
  }
  return next({ ctx });
});

const localAiRecordSchema = z.object({
  id: z.string().optional(),
  timestamp: z.string().optional(),
  channel: z.string().optional(),
  professional: z.string().optional(),
  procedure: z.string().optional(),
  status: z.string().optional(),
  pipeline: z.string().optional(),
  unit: z.string().optional(),
  sourceType: z.enum(["upload", "crm", "api", "webhook", "manual"]).optional(),
  leadId: z.string().optional(),
  patientId: z.string().optional(),
  firstContactAt: z.string().optional(),
  confirmedAt: z.string().optional(),
  consultationStartedAt: z.string().optional(),
  arrivalAt: z.string().optional(),
  firstResponseAt: z.string().optional(),
  dueAt: z.string().optional(),
  paidAt: z.string().optional(),
  revenueGross: z.number().optional(),
  revenueNet: z.number().optional(),
  discounts: z.number().optional(),
  glosas: z.number().optional(),
  taxes: z.number().optional(),
  directCost: z.number().optional(),
  variableCost: z.number().optional(),
  fixedCost: z.number().optional(),
  marketingSpend: z.number().optional(),
  repasse: z.number().optional(),
  ticketMedio: z.number().optional(),
  slotsAvailable: z.number().optional(),
  slotsEmpty: z.number().optional(),
  durationMinutes: z.number().optional(),
  waitMinutes: z.number().optional(),
  npsScore: z.number().optional(),
  cancellationReason: z.string().optional(),
  confirmedAttendance: z.boolean().optional(),
  recurringPatient: z.boolean().optional(),
  isNewPatient: z.boolean().optional(),
  checklistCompleted: z.number().optional(),
  checklistTotal: z.number().optional(),
  headcount: z.number().optional(),
  certifications: z.number().optional(),
  trainingHours: z.number().optional(),
  materialList: z.array(z.string()).optional(),
  baseOldRevenueCurrent: z.number().optional(),
  baseOldRevenuePrevious: z.number().optional(),
});

export const dashboardDataRouter = router({
  // ==================== CLIENTS ====================
  getClients: adminProcedure.query(async () => {
    return await getAllClients();
  }),

  getClient: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getClientById(input.id);
    }),

  createClient: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      logo: z.string().optional(),
      industry: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await createClient({
        name: input.name,
        slug: input.slug,
        logo: input.logo,
        industry: input.industry,
      });
      return { success: true };
    }),

  updateClient: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      slug: z.string().optional(),
      logo: z.string().optional(),
      industry: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await updateClient(id, updates);
      return { success: true };
    }),

  deleteClient: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteClient(input.id);
      return { success: true };
    }),

  // ==================== ALL DATA ====================
  getAllData: adminProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return await getAllDashboardData(input.clientId);
    }),

  // ==================== CEO METRICS ====================
  getCeoMetrics: adminProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return await getLatestCeoMetrics(input.clientId);
    }),

  upsertCeoMetrics: adminProcedure
    .input(z.object({
      clientId: z.number(),
      period: z.string(),
      faturamento: z.number().optional(),
      faturamentoVariacao: z.number().optional(),
      ebitda: z.number().optional(),
      ebitdaVariacao: z.number().optional(),
      npsScore: z.number().optional(),
      npsVariacao: z.number().optional(),
      ocupacao: z.number().optional(),
      ocupacaoVariacao: z.number().optional(),
      forecastData: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      await upsertCeoMetrics({
        clientId: input.clientId,
        period: input.period,
        faturamento: input.faturamento?.toString(),
        faturamentoVariacao: input.faturamentoVariacao?.toString(),
        ebitda: input.ebitda?.toString(),
        ebitdaVariacao: input.ebitdaVariacao?.toString(),
        npsScore: input.npsScore,
        npsVariacao: input.npsVariacao?.toString(),
        ocupacao: input.ocupacao?.toString(),
        ocupacaoVariacao: input.ocupacaoVariacao?.toString(),
        forecastData: input.forecastData,
      });
      return { success: true };
    }),

  // ==================== ANDON ALERTS ====================
  getAndonAlerts: adminProcedure
    .input(z.object({ clientId: z.number(), includeResolved: z.boolean().optional() }))
    .query(async ({ input }) => {
      return await getAndonAlerts(input.clientId, input.includeResolved);
    }),

  createAndonAlert: adminProcedure
    .input(z.object({
      clientId: z.number(),
      severity: z.enum(['critical', 'warning', 'info', 'success']),
      title: z.string(),
      description: z.string().optional(),
      actionLabel: z.string().optional(),
      actionUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await createAndonAlert(input);
      return { success: true };
    }),

  resolveAndonAlert: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await resolveAndonAlert(input.id);
      return { success: true };
    }),

  deleteAndonAlert: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteAndonAlert(input.id);
      return { success: true };
    }),

  // ==================== FINANCIAL DATA ====================
  getFinancialData: adminProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return await getLatestFinancialData(input.clientId);
    }),

  upsertFinancialData: adminProcedure
    .input(z.object({
      clientId: z.number(),
      period: z.string(),
      receitaBruta: z.number().optional(),
      impostos: z.number().optional(),
      receitaLiquida: z.number().optional(),
      custosPessoal: z.number().optional(),
      custosInsumos: z.number().optional(),
      custosOperacionais: z.number().optional(),
      custosMarketing: z.number().optional(),
      margemBruta: z.number().optional(),
      margemOperacional: z.number().optional(),
      margemLiquida: z.number().optional(),
      saldoCaixa: z.number().optional(),
      fluxoCaixaOperacional: z.number().optional(),
      margemPorHoraData: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      await upsertFinancialData({
        clientId: input.clientId,
        period: input.period,
        receitaBruta: input.receitaBruta?.toString(),
        impostos: input.impostos?.toString(),
        receitaLiquida: input.receitaLiquida?.toString(),
        custosPessoal: input.custosPessoal?.toString(),
        custosInsumos: input.custosInsumos?.toString(),
        custosOperacionais: input.custosOperacionais?.toString(),
        custosMarketing: input.custosMarketing?.toString(),
        margemBruta: input.margemBruta?.toString(),
        margemOperacional: input.margemOperacional?.toString(),
        margemLiquida: input.margemLiquida?.toString(),
        saldoCaixa: input.saldoCaixa?.toString(),
        fluxoCaixaOperacional: input.fluxoCaixaOperacional?.toString(),
        margemPorHoraData: input.margemPorHoraData,
      });
      return { success: true };
    }),

  // ==================== OPERATIONS DATA ====================
  getOperationsData: adminProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return await getLatestOperationsData(input.clientId);
    }),

  upsertOperationsData: adminProcedure
    .input(z.object({
      clientId: z.number(),
      period: z.string(),
      oeeGeral: z.number().optional(),
      disponibilidade: z.number().optional(),
      performance: z.number().optional(),
      qualidade: z.number().optional(),
      taxaOcupacao: z.number().optional(),
      tempoMedioEspera: z.number().optional(),
      atendimentosDia: z.number().optional(),
      taktCycleData: z.any().optional(),
      ocupacaoSalasData: z.any().optional(),
      gargalosData: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      await upsertOperationsData({
        clientId: input.clientId,
        period: input.period,
        oeeGeral: input.oeeGeral?.toString(),
        disponibilidade: input.disponibilidade?.toString(),
        performance: input.performance?.toString(),
        qualidade: input.qualidade?.toString(),
        taxaOcupacao: input.taxaOcupacao?.toString(),
        tempoMedioEspera: input.tempoMedioEspera,
        atendimentosDia: input.atendimentosDia,
        taktCycleData: input.taktCycleData,
        ocupacaoSalasData: input.ocupacaoSalasData,
        gargalosData: input.gargalosData,
      });
      return { success: true };
    }),

  // ==================== WASTE DATA ====================
  getWasteData: adminProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return await getLatestWasteData(input.clientId);
    }),

  upsertWasteData: adminProcedure
    .input(z.object({
      clientId: z.number(),
      period: z.string(),
      noShowRate: z.number().optional(),
      noShowVariacao: z.number().optional(),
      financialLoss: z.number().optional(),
      idleCapacityHours: z.number().optional(),
      efficiencyScore: z.number().optional(),
      heatmapData: z.any().optional(),
      wasteBreakdownData: z.any().optional(),
      departmentImpactData: z.any().optional(),
      recoveryActionsData: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      await upsertWasteData({
        clientId: input.clientId,
        period: input.period,
        noShowRate: input.noShowRate?.toString(),
        noShowVariacao: input.noShowVariacao?.toString(),
        financialLoss: input.financialLoss?.toString(),
        idleCapacityHours: input.idleCapacityHours,
        efficiencyScore: input.efficiencyScore,
        heatmapData: input.heatmapData,
        wasteBreakdownData: input.wasteBreakdownData,
        departmentImpactData: input.departmentImpactData,
        recoveryActionsData: input.recoveryActionsData,
      });
      return { success: true };
    }),

  // ==================== MARKETING DATA ====================
  getMarketingData: adminProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return await getLatestMarketingData(input.clientId);
    }),

  upsertMarketingData: adminProcedure
    .input(z.object({
      clientId: z.number(),
      period: z.string(),
      totalSpend: z.number().optional(),
      spendVariacao: z.number().optional(),
      costPerLead: z.number().optional(),
      cplVariacao: z.number().optional(),
      acquisitionCost: z.number().optional(),
      cacVariacao: z.number().optional(),
      marketingRoi: z.number().optional(),
      roiVariacao: z.number().optional(),
      funnelData: z.any().optional(),
      roiForecastData: z.any().optional(),
      channelPerformanceData: z.any().optional(),
      bestChannel: z.string().optional(),
      bestChannelRoi: z.number().optional(),
      channelToOptimize: z.string().optional(),
      optimizeReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await upsertMarketingData({
        clientId: input.clientId,
        period: input.period,
        totalSpend: input.totalSpend?.toString(),
        spendVariacao: input.spendVariacao?.toString(),
        costPerLead: input.costPerLead?.toString(),
        cplVariacao: input.cplVariacao?.toString(),
        acquisitionCost: input.acquisitionCost?.toString(),
        cacVariacao: input.cacVariacao?.toString(),
        marketingRoi: input.marketingRoi?.toString(),
        roiVariacao: input.roiVariacao?.toString(),
        funnelData: input.funnelData,
        roiForecastData: input.roiForecastData,
        channelPerformanceData: input.channelPerformanceData,
        bestChannel: input.bestChannel,
        bestChannelRoi: input.bestChannelRoi?.toString(),
        channelToOptimize: input.channelToOptimize,
        optimizeReason: input.optimizeReason,
      });
      return { success: true };
    }),

  // ==================== QUALITY DATA ====================
  getQualityData: adminProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return await getLatestQualityData(input.clientId);
    }),

  upsertQualityData: adminProcedure
    .input(z.object({
      clientId: z.number(),
      period: z.string(),
      npsScore: z.number().optional(),
      npsRespostas: z.number().optional(),
      promotores: z.number().optional(),
      passivos: z.number().optional(),
      detratores: z.number().optional(),
      dpmo: z.number().optional(),
      sigmaLevel: z.number().optional(),
      cp: z.number().optional(),
      cpk: z.number().optional(),
      firstPassYield: z.number().optional(),
      controlChartData: z.any().optional(),
      feedbackData: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      await upsertQualityData({
        clientId: input.clientId,
        period: input.period,
        npsScore: input.npsScore,
        npsRespostas: input.npsRespostas,
        promotores: input.promotores?.toString(),
        passivos: input.passivos?.toString(),
        detratores: input.detratores?.toString(),
        dpmo: input.dpmo,
        sigmaLevel: input.sigmaLevel?.toString(),
        cp: input.cp?.toString(),
        cpk: input.cpk?.toString(),
        firstPassYield: input.firstPassYield?.toString(),
        controlChartData: input.controlChartData,
        feedbackData: input.feedbackData,
      });
      return { success: true };
    }),

  // ==================== PEOPLE DATA ====================
  getPeopleData: adminProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return await getLatestPeopleData(input.clientId);
    }),

  upsertPeopleData: adminProcedure
    .input(z.object({
      clientId: z.number(),
      period: z.string(),
      headcount: z.number().optional(),
      headcountVariacao: z.number().optional(),
      turnover: z.number().optional(),
      turnoverVariacao: z.number().optional(),
      absenteismo: z.number().optional(),
      absenteismoVariacao: z.number().optional(),
      revenuePerFte: z.number().optional(),
      revenueFteVariacao: z.number().optional(),
      produtividadeData: z.any().optional(),
      turnoverAbsenteismoData: z.any().optional(),
      teamPerformanceData: z.any().optional(),
      certificacoes: z.number().optional(),
      horasTreinamento: z.number().optional(),
      metaAtingida: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      await upsertPeopleData({
        clientId: input.clientId,
        period: input.period,
        headcount: input.headcount,
        headcountVariacao: input.headcountVariacao?.toString(),
        turnover: input.turnover?.toString(),
        turnoverVariacao: input.turnoverVariacao?.toString(),
        absenteismo: input.absenteismo?.toString(),
        absenteismoVariacao: input.absenteismoVariacao?.toString(),
        revenuePerFte: input.revenuePerFte?.toString(),
        revenueFteVariacao: input.revenueFteVariacao?.toString(),
        produtividadeData: input.produtividadeData,
        turnoverAbsenteismoData: input.turnoverAbsenteismoData,
        teamPerformanceData: input.teamPerformanceData,
        certificacoes: input.certificacoes,
        horasTreinamento: input.horasTreinamento,
        metaAtingida: input.metaAtingida?.toString(),
      });
      return { success: true };
    }),

  // ==================== DATA GOVERNANCE ====================
  getDataGovernanceData: adminProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return await getLatestDataGovernanceData(input.clientId);
    }),

  upsertDataGovernanceData: adminProcedure
    .input(z.object({
      clientId: z.number(),
      period: z.string(),
      registrosTotais: z.number().optional(),
      dataQualityScore: z.number().optional(),
      lgpdCompliance: z.number().optional(),
      issuesPendentes: z.number().optional(),
      completude: z.number().optional(),
      precisao: z.number().optional(),
      consistencia: z.number().optional(),
      atualidade: z.number().optional(),
      validade: z.number().optional(),
      integracoesData: z.any().optional(),
      problemasData: z.any().optional(),
      criptografia: z.number().optional(),
      auditTrailEvents: z.number().optional(),
      backupStatus: z.string().optional(),
      lastBackup: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      await upsertDataGovernanceData({
        clientId: input.clientId,
        period: input.period,
        registrosTotais: input.registrosTotais,
        dataQualityScore: input.dataQualityScore,
        lgpdCompliance: input.lgpdCompliance,
        issuesPendentes: input.issuesPendentes,
        completude: input.completude,
        precisao: input.precisao,
        consistencia: input.consistencia,
        atualidade: input.atualidade,
        validade: input.validade,
        integracoesData: input.integracoesData,
        problemasData: input.problemasData,
        criptografia: input.criptografia,
        auditTrailEvents: input.auditTrailEvents,
        backupStatus: input.backupStatus,
        lastBackup: input.lastBackup,
      });
      return { success: true };
    }),

  // ==================== DATA IMPORTS ====================
  getDataImports: adminProcedure
    .input(z.object({ clientId: z.number().optional(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await getDataImports(input.clientId, input.limit);
    }),

  createDataImport: adminProcedure
    .input(z.object({
      clientId: z.number(),
      fileName: z.string(),
      fileType: z.enum(['excel', 'csv', 'json', 'manual', 'ai']),
      fileUrl: z.string().optional(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const importId = await createDataImport({
        clientId: input.clientId,
        userId: ctx.user!.id,
        fileName: input.fileName,
        fileType: input.fileType,
        fileUrl: input.fileUrl,
        metadata: input.metadata,
      });
      return { success: true, importId };
    }),

  updateDataImportStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['pending', 'processing', 'completed', 'failed']),
      recordsImported: z.number().optional(),
      errorMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await updateDataImportStatus(input.id, input.status, input.recordsImported, input.errorMessage);
      return { success: true };
    }),

  ingestWithLocalAi: adminProcedure
    .input(z.object({
      clientId: z.number(),
      fileName: z.string().optional(),
      source: z.enum(["api", "webhook", "manual", "crm", "csv", "xlsx", "pdf"]).default("api"),
      propagateToPlanDashboards: z.boolean().default(true),
      records: z.array(localAiRecordSchema).min(1).max(5000),
    }))
    .mutation(async ({ input, ctx }) => {
      const importId = await createDataImport({
        clientId: input.clientId,
        userId: ctx.user!.id,
        fileName: input.fileName || `local-ai-${Date.now()}.json`,
        fileType:
          input.source === "csv" ? "csv" :
          input.source === "xlsx" ? "excel" :
          input.source === "manual" ? "manual" :
          "ai",
        metadata: {
          source: input.source,
          recordsCount: input.records.length,
          propagateToPlanDashboards: input.propagateToPlanDashboards,
        },
      });

      await updateDataImportStatus(importId, "processing");

      try {
        const synced = await syncLocalAiPayloadToClient({
          clientId: input.clientId,
          records: input.records,
          fileName: input.fileName || `local-ai-${Date.now()}.json`,
          fileType: input.source,
          metadata: {
            importedByAdminId: ctx.user!.id,
          },
          propagateToPlanDashboards: input.propagateToPlanDashboards,
        });

        await updateDataImportStatus(importId, "completed", synced.result.facts.length);

        return {
          success: true,
          importId,
          warnings: synced.result.warnings,
          coverage: synced.result.coverage,
          routing: synced.result.routing,
          propagatedUserIds: synced.propagatedUserIds,
          factsImported: synced.result.facts.length,
          adminPreview: synced.result.adminData,
        };
      } catch (error: any) {
        await updateDataImportStatus(importId, "failed", undefined, error?.message || "Local AI sync failed");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao sincronizar com IA local: " + (error?.message || "Erro desconhecido"),
        });
      }
    }),

  // ==================== AI PROCESSING ====================
  processWithAI: adminProcedure
    .input(z.object({
      clientId: z.number(),
      text: z.string().min(1),
      category: z.enum(['all', 'ceo', 'financial', 'operations', 'waste', 'marketing', 'quality', 'people', 'governance']),
    }))
    .mutation(async ({ input, ctx }) => {
      const { invokeLLM } = await import("./_core/llm");
      
      const systemPrompt = `Você é um assistente especializado em Lean Six Sigma (Master Black Belt) que extrai métricas de negócios de textos.

Extrai as seguintes métricas do texto fornecido e retorne em formato JSON:

${input.category === 'all' || input.category === 'ceo' ? `
**CEO Scorecard:**
- faturamento: valor em reais (ex: 2400000)
- faturamentoVariacao: percentual de variação (ex: 12.5)
- ebitda: valor em reais
- ebitdaVariacao: percentual
- npsScore: valor de 0 a 100
- npsVariacao: percentual
- ocupacao: percentual (ex: 87)
- ocupacaoVariacao: percentual
` : ''}

${input.category === 'all' || input.category === 'waste' ? `
**No-show & Waste:**
- noShowRate: percentual (ex: 12.5)
- noShowVariacao: percentual
- financialLoss: valor em reais
- idleCapacity: horas
- efficiencyScore: valor de 0 a 100
` : ''}

${input.category === 'all' || input.category === 'marketing' ? `
**Marketing:**
- totalSpend: valor em reais
- costPerLead: valor em reais
- acquisitionCost: valor em reais
- marketingRoi: percentual (ex: 428)
` : ''}

Retorne APENAS um objeto JSON válido com as métricas encontradas. Se uma métrica não for encontrada, não inclua no JSON.
Não inclua explicações, apenas o JSON.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.text },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "extracted_metrics",
              strict: false,
              schema: {
                type: "object",
                properties: {
                  ceo: {
                    type: "object",
                    properties: {
                      faturamento: { type: "number" },
                      faturamentoVariacao: { type: "number" },
                      ebitda: { type: "number" },
                      ebitdaVariacao: { type: "number" },
                      npsScore: { type: "number" },
                      npsVariacao: { type: "number" },
                      ocupacao: { type: "number" },
                      ocupacaoVariacao: { type: "number" },
                    },
                  },
                  waste: {
                    type: "object",
                    properties: {
                      noShowRate: { type: "number" },
                      noShowVariacao: { type: "number" },
                      financialLoss: { type: "number" },
                      idleCapacity: { type: "number" },
                      efficiencyScore: { type: "number" },
                    },
                  },
                  marketing: {
                    type: "object",
                    properties: {
                      totalSpend: { type: "number" },
                      costPerLead: { type: "number" },
                      acquisitionCost: { type: "number" },
                      marketingRoi: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== 'string') {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'IA não retornou resposta válida' });
        }

        const extractedData = JSON.parse(content);
        
        // Log the import
        await createDataImport({
          clientId: input.clientId,
          userId: ctx.user!.id,
          fileName: 'AI Processing',
          fileType: 'ai',
          metadata: { originalText: input.text.substring(0, 500), extractedData },
        });

        return { 
          success: true, 
          extractedData,
          message: 'Dados extraídos com sucesso pela IA'
        };
      } catch (error: any) {
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'Erro ao processar com IA: ' + (error.message || 'Erro desconhecido')
        });
      }
    }),
});
