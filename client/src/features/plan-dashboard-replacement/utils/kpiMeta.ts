export type KpiSourceMode = 'integrated' | 'fallback';

export type KpiMeta = {
  label: string;
  formula: string;
  howToCalculate: string;
  sources: string[];
  fields: string[];
  note?: string;
};

function normalizeLabel(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function sourceSet(mode: KpiSourceMode, preferred: string[]): string[] {
  if (mode === 'integrated') return preferred;
  return ['Fallback interno do dashboard (dados simulados de desenvolvimento)', ...preferred];
}

function makeMeta(label: string, mode: KpiSourceMode): KpiMeta {
  const key = normalizeLabel(label);

  if (key.includes('nps')) {
    return {
      label,
      formula: 'NPS = (% promotores - % detratores) x 100',
      howToCalculate: 'Separe respostas 9-10 como promotores, 0-6 como detratores e 7-8 como neutros. Divida promotores e detratores pelo total de respostas válidas e aplique a diferença.',
      sources: sourceSet(mode, ['Pesquisa NPS / WhatsApp / formulário de satisfação', 'Tabela de respostas NPS consolidada']),
      fields: ['score', 'professionalId', 'responseAt', 'unit'],
      note: 'Quando o card for por profissional, o cálculo deve ser filtrado por professionalId antes da média/consolidação.',
    };
  }

  if (key.includes('ocupacao') || key.includes('ociosidade')) {
    return {
      label,
      formula: key.includes('ociosidade') ? 'Ociosidade = 100 - Ocupação' : 'Ocupação = Realizadas / Capacidade x 100',
      howToCalculate: key.includes('ociosidade')
        ? 'Calcule primeiro a ocupação do período e subtraia de 100%.'
        : 'Some consultas realizadas no período filtrado, some a capacidade disponível dos slots/profissionais/unidades equivalentes e divida realizadas por capacidade.',
      sources: sourceSet(mode, ['Agenda / CRM de agenda', 'Cadastro de capacidade por profissional/slot/unidade']),
      fields: ['status', 'scheduledAt', 'professionalId', 'unit', 'slotCapacity'],
    };
  }

  if (key.includes('no show')) {
    return {
      label,
      formula: 'No-Show = Faltadas / Agendadas x 100',
      howToCalculate: 'Conte agendamentos com status de falta no período e divida pelo total de agendamentos do mesmo recorte. Para segmentado, aplique o filtro antes da divisão.',
      sources: sourceSet(mode, ['Agenda / recepção / CRM', 'Histórico de status da consulta']),
      fields: ['status', 'scheduledAt', 'channel', 'professionalId', 'unit'],
    };
  }

  if (key.includes('receita') || key.includes('faturamento') || key === 'mrr' || key.includes('mrr atual') || key.includes('mrr vs meta')) {
    return {
      label,
      formula: key.includes('liquida')
        ? 'Receita Líquida = Bruto - descontos - glosas - estornos'
        : key.includes('mrr')
          ? 'MRR = soma dos contratos ativos recorrentes no mês'
          : 'Faturamento/Receita = soma dos valores financeiros confirmados no período',
      howToCalculate: key.includes('mrr')
        ? 'Filtre contratos ativos e recorrentes no período de competência e some o valor mensal vigente de cada contrato.'
        : 'Some os lançamentos financeiros válidos no período. Se o indicador for líquido, desconte glosas, descontos, chargebacks e estornos antes de exibir.',
      sources: sourceSet(mode, ['Asaas / ERP / financeiro principal', 'Contratos e cobranças consolidadas']),
      fields: ['amount', 'netAmount', 'status', 'confirmedAt', 'contractStatus', 'billingPeriod'],
    };
  }

  if (key.includes('ebitda')) {
    return {
      label,
      formula: 'EBITDA = Receita Líquida - CMV - despesas variáveis - despesas fixas pró-rata',
      howToCalculate: 'Parta da receita líquida do período, subtraia custos diretamente ligados à entrega, depois variáveis operacionais e a parcela fixa apropriada ao período.',
      sources: sourceSet(mode, ['Asaas / ERP / DRE gerencial', 'Centro de custos / despesas operacionais']),
      fields: ['netRevenue', 'cmv', 'variableCosts', 'fixedCosts', 'competenceDate'],
    };
  }

  if (key.includes('margem')) {
    return {
      label,
      formula: 'Margem = (Receita - Custos e despesas aplicáveis) / Receita x 100',
      howToCalculate: 'Defina a base de receita do indicador, subtraia os custos/despesas correspondentes e divida o resultado pela própria receita.',
      sources: sourceSet(mode, ['Asaas / ERP / centro de custos', 'Cadastro de repasse, custo direto e custo hora']),
      fields: ['revenue', 'directCost', 'repasse', 'hourCost', 'expenseType'],
    };
  }

  if (key.includes('ticket')) {
    return {
      label,
      formula: 'Ticket Médio = Receita Líquida / Quantidade de atendimentos ou vendas realizadas',
      howToCalculate: 'Some a receita líquida do período e divida pelo total de consultas/vendas concluídas no mesmo recorte.',
      sources: sourceSet(mode, ['Asaas / ERP / financeiro', 'Agenda / pedidos / consultas realizadas']),
      fields: ['netRevenue', 'realizedCount', 'procedureId', 'professionalId'],
    };
  }

  if (key.includes('cac')) {
    return {
      label,
      formula: 'CAC = Investimento comercial e marketing / Novos clientes ou pacientes convertidos',
      howToCalculate: 'Some o investimento de mídia e operação comercial do período e divida pela quantidade de novos clientes efetivamente convertidos.',
      sources: sourceSet(mode, ['Meta Ads / Google Ads / CRM', 'Kommo / funil comercial / conversões']),
      fields: ['adSpend', 'salesCost', 'leadId', 'customerId', 'convertedAt', 'channel'],
    };
  }

  if (key.includes('ltv')) {
    return {
      label,
      formula: 'LTV = Ticket médio x Frequência anual x (Meses de retenção / 12)',
      howToCalculate: 'Calcule o ticket médio da base, estime quantas compras/consultas por ano o cliente faz e multiplique pelo tempo médio de retenção anualizado.',
      sources: sourceSet(mode, ['Financeiro / contratos / histórico de recorrência', 'CRM / agenda / renovações']),
      fields: ['avgTicket', 'annualFrequency', 'retentionMonths', 'customerId'],
    };
  }

  if (key.includes('roi')) {
    return {
      label,
      formula: 'ROI = (Receita atribuída - Investimento) / Investimento x 100',
      howToCalculate: 'Atribua a receita ao canal correto, subtraia o investimento daquele canal e divida pelo investimento.',
      sources: sourceSet(mode, ['Meta Ads / Google Ads / Analytics', 'CRM / financeiro com atribuição por canal']),
      fields: ['attributedRevenue', 'investment', 'utmSource', 'channel'],
    };
  }

  if (key.includes('lead')) {
    return {
      label,
      formula: key.includes('sla')
        ? 'SLA Lead = Hora da 1ª resposta - Hora do 1º contato'
        : key.includes('time')
          ? 'Lead Time = Data do agendamento ou assinatura - Data do 1º contato'
          : 'Leads = contagem de registros qualificados no período',
      howToCalculate: key.includes('sla')
        ? 'Pegue a primeira mensagem ou contato do lead e subtraia da primeira resposta válida registrada pela equipe.'
        : key.includes('time')
          ? 'Subtraia a data do primeiro contato da data do agendamento/fechamento e consolide a média no recorte.'
          : 'Conte leads válidos no recorte aplicando filtros de qualificação, canal e status.',
      sources: sourceSet(mode, ['Kommo / CRM / WhatsApp / recepção', 'Histórico de interações']),
      fields: ['leadId', 'createdAt', 'firstResponseAt', 'bookedAt', 'qualified', 'channel'],
    };
  }

  if (key.includes('retorno') || key.includes('fidelizacao') || key.includes('recorrencia') || key.includes('renovacao')) {
    return {
      label,
      formula: key.includes('renovacao')
        ? 'Taxa de Renovação = Renovados / Total vencido x 100'
        : 'Retorno/Recorrência = Clientes ou pacientes que voltaram / Base elegível x 100',
      howToCalculate: key.includes('renovacao')
        ? 'Conte contratos vencidos no período e divida quantos foram renovados pelo total vencido.'
        : 'Defina a base elegível do período e divida os clientes/pacientes que retornaram dentro da janela pelo total elegível.',
      sources: sourceSet(mode, ['Contratos / financeiro / agenda', 'CRM / histórico do cliente']),
      fields: ['customerId', 'appointmentDate', 'renewalDate', 'dueAt', 'confirmed'],
    };
  }

  if (key.includes('espera') || key.includes('sla')) {
    return {
      label,
      formula: key.includes('sla')
        ? 'SLA = Hora da resposta - Hora da entrada'
        : 'Tempo de Espera = Hora início da consulta - Hora chegada do paciente',
      howToCalculate: 'Use timestamps reais do fluxo operacional. Agrupe por profissional, unidade ou fila conforme o recorte do card.',
      sources: sourceSet(mode, ['Agenda / recepção / WhatsApp / atendimento', 'Logs operacionais com timestamp']),
      fields: ['arrivedAt', 'startedAt', 'messageReceivedAt', 'answeredAt', 'professionalId'],
    };
  }

  if (key.includes('alerta') || key.includes('risco') || key.includes('health')) {
    return {
      label,
      formula: key.includes('health')
        ? 'Health Score = NPS x peso + Aderência x peso + Marcos x peso + Decisões x peso + Engajamento x peso'
        : 'Indicador derivado por regras de negócio e thresholds configurados',
      howToCalculate: key.includes('health')
        ? 'Normalize cada insumo para a mesma escala, aplique os pesos definidos pela regra de negócio e some o score final.'
        : 'Conte ocorrências ou aplique thresholds sobre KPIs base para classificar itens em risco/alerta.',
      sources: sourceSet(mode, ['Control Tower / regras internas / projetos', 'NPS, marcos, reuniões, backlog e engajamento']),
      fields: ['nps', 'adherence', 'milestoneRate', 'decisionLag', 'engagement', 'threshold'],
    };
  }

  if (key.includes('valuation') || key.includes('multiplo') || key.includes('payback') || key.includes('m a')) {
    return {
      label,
      formula: key.includes('valuation')
        ? 'Valuation = EBITDA normalizado x múltiplo ajustado'
        : key.includes('payback')
          ? 'Payback = Investimento / EBITDA alvo'
          : 'Múltiplo estimado = múltiplo base + ajustes dinâmicos',
      howToCalculate: 'Normalize o EBITDA LTM, aplique os ajustes de risco, crescimento e qualidade de receita, depois calcule valuation e cenários de payback/ROI.',
      sources: sourceSet(mode, ['Financeiro consolidado / DRE / rede multi-unidade', 'Camada analítica de valuation do Control Tower']),
      fields: ['ebitdaLtm', 'normalizedEbitda', 'adjustedMultiple', 'targetInvestment', 'synergy'],
    };
  }

  return {
    label,
    formula: 'Indicador calculado a partir do recorte atual do dashboard',
    howToCalculate: 'Aplique os filtros ativos do dashboard, identifique a base do indicador e consolide o valor segundo a regra de negócio definida para o módulo.',
    sources: sourceSet(mode, ['Control Tower / integrações conectadas ao cliente']),
    fields: ['period', 'unit', 'channel', 'professionalId'],
    note: 'Esse KPI ainda não possui regra específica mapeada no catálogo visual. O card continua exibindo a origem operacional ativa do dashboard.',
  };
}

export function resolveKpiMeta(label: string, mode: KpiSourceMode): KpiMeta {
  return makeMeta(label, mode);
}
