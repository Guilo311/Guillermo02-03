# Matriz TDD de KPIs e Destinos

Base documental:
- `e:\Download\GLX_Dados_Origens_API.xlsx`
- `e:\Download\kpidadosorigem (1).pdf`

Objetivo:
- mapear `KPI -> origem -> plano -> modulo -> campo backend -> componente frontend`
- indicar se o KPI esta implementado, parcialmente implementado, desviado de modulo ou ausente

Legenda de status:
- `OK`: existe destino coerente no dashboard
- `PARCIAL`: existe visualizacao, mas com formula simplificada/mock ou sem contrato de dados correto
- `DESVIO`: existe, mas foi parar em modulo diferente do TDD
- `AUSENTE`: nao existe contrato/backend/frontend correspondente
- `NAO_IMPLEMENTADO`: o dashboard interno GLX do TDD nao existe no app cliente revisado

## 1. Mapa de telas por plano

### Essencial
- Menu/tabs: [PlanDashboardApp.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/PlanDashboardApp.tsx#L103)
- Componentes:
  - `0`: Visao CEO em [EssentialDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EssentialDashboard.tsx#L347)
  - `1`: Agenda & No-Show em [EssentialDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EssentialDashboard.tsx#L379)
  - `2`: Financeiro Executivo em [EssentialDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EssentialDashboard.tsx#L470)
  - `3`: Marketing & Captacao em [EssentialDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EssentialDashboard.tsx#L515)
  - `4`: Operacao & Experiencia em [EssentialDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EssentialDashboard.tsx#L551)

### Pro
- Menu/tabs: [PlanDashboardApp.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/PlanDashboardApp.tsx#L104)
- Componentes:
  - `0`: Visao CEO em [ProDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/ProDashboard.tsx#L432)
  - `1`: War Room em [ProDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/ProDashboard.tsx#L466)
  - `2`: Financeiro Avancado em [ProDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/ProDashboard.tsx#L496)
  - `3`: Agenda/Otimizacao em [ProDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/ProDashboard.tsx#L561)
  - `4`: Marketing/Unit Economics em [ProDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/ProDashboard.tsx#L605)
  - `5`: Integracoes em [ProDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/ProDashboard.tsx#L652)
  - `6`: Operacao & Experiencia em [ProDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/ProDashboard.tsx#L671)
  - `7`: Equipe em [ProDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/ProDashboard.tsx#L727)

### Enterprise
- Menu/tabs: [PlanDashboardApp.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/PlanDashboardApp.tsx#L105)
- Componentes:
  - `0`: Visao CEO Enterprise em [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx#L207)
  - `1`: War Room Enterprise em [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx#L241)
  - `2`: Financeiro Investidor em [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx#L266)
  - `3`: Agenda/Otimizacao em [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx#L288)
  - `4`: Marketing/Unit Economics em [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx#L315)
  - `5`: Multi-Unidade em [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx#L342)
  - `6`: Integracoes Enterprise em [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx#L364)
  - `7`: Operacao & Experiencia em [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx#L385)
  - `8`: Equipe Enterprise em [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx#L415)
  - `9`: Governanca & Compliance em [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx#L431)

## 2. Contratos backend existentes

Rotas/modelos de dados disponíveis:
- `ceo`: [dashboardDataRouter.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/server/dashboardDataRouter.ts#L102)
- `financial`: [dashboardDataRouter.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/server/dashboardDataRouter.ts#L175)
- `operations`: [dashboardDataRouter.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/server/dashboardDataRouter.ts#L221)
- `waste`: [dashboardDataRouter.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/server/dashboardDataRouter.ts#L261)
- `marketing`: [dashboardDataRouter.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/server/dashboardDataRouter.ts#L299)
- `quality`: [dashboardDataRouter.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/server/dashboardDataRouter.ts#L349)
- `people`: [dashboardDataRouter.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/server/dashboardDataRouter.ts#L393)
- `dataGovernance`: [dashboardDataRouter.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/server/dashboardDataRouter.ts#L441)

Observacao critica:
- O frontend de planos auditado nao consome essas rotas; ele usa dados simulados de [mockData.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/data/mockData.ts#L61).

## 3. Dashboard externo cliente: matriz resumida

| KPI TDD | Origem esperada | Plano | Modulo TDD | Destino atual | Campo backend atual | Componente frontend atual | Status | Gap |
|---|---|---|---|---|---|---|---|---|
| No-Show (%) | CRM/Agenda | Essencial/Pro/Enterprise | Agenda | Agenda | `waste.noShowRate` existe, mas nao alimenta a tela | Essencial tab 1; Pro tab 3; Enterprise tab 3 | PARCIAL | KPI visivel, mas calculado em mock |
| No-Show segmentado por canal/medico/horario | CRM/Agenda | Pro/Enterprise | Agenda | Agenda | sem contrato detalhado por dimensao | Pro tab 3; Enterprise tab 3 | PARCIAL | existe visual mock, sem origem real |
| Ocupacao agenda (%) | CRM/Agenda | Essencial/Pro/Enterprise | Agenda | Agenda | `operations.taxaOcupacao` | Essencial tab 1; Pro tab 3; Enterprise tab 3 | PARCIAL | formula de tela usa mock |
| Ocupacao por profissional/slot | CRM/Agenda | Pro/Enterprise | Agenda | Agenda | ausente | Pro tab 3; Enterprise tab 3 | PARCIAL | sem persistencia por slot |
| Lead time agendamento | CRM Leads + Agenda | Essencial/Pro/Enterprise | Agenda | Agenda | ausente | Essencial tab 1; Pro tab 3; Enterprise tab 3 | PARCIAL | calculado a partir de `waitMinutes`, nao de datas reais |
| Cancelamentos por motivo (%) | CRM/Agenda | Essencial/Pro/Enterprise | Agenda | Agenda | ausente | Essencial tab 1 parcial; Pro tab 3; Enterprise tab 3 | PARCIAL | sem campo `cancellation_reason` |
| Confirmacao de presenca (%) | CRM + WhatsApp | Essencial/Pro/Enterprise | Agenda | Agenda | ausente | Essencial tab 1 | PARCIAL | sem integracao/contrato WhatsApp |
| Heatmap dia x hora x profissional | CRM/Agenda | Pro/Enterprise | Agenda | Agenda | ausente | Pro tab 3; Enterprise tab 3 | PARCIAL | grafico existe sem backend real |
| Faturamento bruto | ERP/Financeiro | Essencial/Pro/Enterprise | Financeiro | Financeiro | `financial.receitaBruta` | Essencial tab 2; Pro tab 2; Enterprise tab 2 | PARCIAL | existe campo, mas tela usa mock |
| Receita liquida | ERP/Financeiro | Essencial/Pro/Enterprise | Financeiro | Financeiro | `financial.receitaLiquida` | Essencial tab 2; Pro tab 2; Enterprise tab 2 | PARCIAL | existe campo, mas tela usa mock |
| Margem liquida (%) | ERP/Financeiro | Essencial/Pro/Enterprise | Financeiro | Financeiro | `financial.margemLiquida` | Essencial tab 2; Pro tab 2; Enterprise tab 2 | PARCIAL | existe campo, mas tela usa mock |
| Ticket medio | Financeiro + CRM | Essencial/Pro/Enterprise | Financeiro | Financeiro | ausente como campo explicito | Essencial tab 2; Pro tab 2; Enterprise tab 2 | PARCIAL | derivado apenas no mock |
| DRE / EBITDA operacional | ERP + centros de custo | Pro/Enterprise | Financeiro | Financeiro | parcial: margens e caixa; sem DRE semanal completo | Pro tab 2; Enterprise tab 2 | PARCIAL | sem estrutura de centro de custo no contrato |
| Margem por servico | Financeiro + CRM | Pro/Enterprise | Financeiro | Financeiro | ausente | Pro tab 2; Enterprise tab 2 | PARCIAL | visual mock sem persistencia |
| Margem por profissional | Financeiro + RH | Pro/Enterprise | Financeiro | Financeiro | ausente | Pro tab 2; Enterprise tab 2 | PARCIAL | visual mock sem contrato RH |
| Aging de recebiveis | ERP | Pro/Enterprise | Financeiro | Financeiro | ausente | Pro tab 2; Enterprise tab 2 | PARCIAL | grafico/tabela mock |
| Projecao de caixa 8 semanas | ERP | Pro/Enterprise | Financeiro | Financeiro | parcial: `saldoCaixa` e `fluxoCaixaOperacional` | Pro tab 2; Enterprise tab 2 | PARCIAL | sem horizonte 8w estruturado |
| Break-even | ERP | Pro/Enterprise | Financeiro | Financeiro | ausente | Pro tab 2 | PARCIAL | simulador mock |
| Concentracao de receita | Financeiro + CRM | Pro/Enterprise | Financeiro | Financeiro | ausente | Pro tab 2 | PARCIAL | sem campo/serie real |
| Inadimplencia (%) | ERP | Essencial/Pro/Enterprise | Financeiro | Financeiro | ausente explicito | Essencial tab 2; Pro tab 2 | PARCIAL | inferido no mock |
| Leads por canal | CRM Leads | Essencial/Pro/Enterprise | Marketing | Marketing | `marketing.channelPerformanceData` parcial | Essencial tab 3; Pro tab 4; Enterprise tab 4 | PARCIAL | sem ingestao real conectada |
| Conversao Lead->Agenda | CRM Leads + Agenda | Essencial/Pro/Enterprise | Marketing | Marketing | `marketing.funnelData` parcial | Essencial tab 3; Pro tab 4; Enterprise tab 4 | PARCIAL | sem `lead_id`/join real |
| CPL | Ads | Essencial/Pro/Enterprise | Marketing | Marketing | `marketing.costPerLead` | Essencial tab 3; Pro tab 4; Enterprise tab 4 | PARCIAL | existe campo, tela usa mock |
| CAC | Ads + CRM | Pro/Enterprise | Marketing | Marketing | `marketing.acquisitionCost` | Pro tab 4; Enterprise tab 4 | PARCIAL | existe campo, tela usa mock |
| ROI por canal | Ads + Financeiro + CRM | Essencial/Pro/Enterprise | Marketing | Marketing | `marketing.marketingRoi` generico | Essencial tab 3; Pro tab 4; Enterprise tab 4 | PARCIAL | falta granularidade por canal no contrato |
| LTV por paciente | CRM + Financeiro | Pro/Enterprise | Marketing | Marketing | ausente | Pro tab 4; Enterprise tab 4 | PARCIAL | mock only |
| LTV:CAC ratio | CRM + Financeiro + Ads | Pro/Enterprise | Marketing | Marketing | ausente | Pro tab 4; Enterprise tab 4 | PARCIAL | mock only |
| Funil completo Lead->Consulta | CRM Leads + Agenda | Pro/Enterprise | Marketing | Marketing | parcial: `funnelData` | Pro tab 4; Enterprise tab 4 | PARCIAL | sem etapas reais do TDD |
| Velocidade do funil | CRM Leads + Agenda | Pro/Enterprise | Marketing | Marketing | ausente | Pro tab 4; Enterprise tab 4 | PARCIAL | mock only |
| Waterfall variacao de receita | Financeiro + CRM | Pro/Enterprise | Marketing | Marketing | ausente | Pro tab 4; Enterprise tab 4 | PARCIAL | mock only |
| NPS geral | Pesquisa NPS | Essencial/Pro/Enterprise | Experiencia | Operacao/Experiencia | `quality.npsScore` | Essencial tab 4; Pro tab 6; Enterprise tab 7 | PARCIAL | existe campo, tela usa mock |
| NPS por profissional | Pesquisa NPS + CRM | Pro/Enterprise | Experiencia | Operacao/Experiencia | ausente | Pro tab 6; Enterprise tab 7 | PARCIAL | sem relacao `profissional_id` no contrato |
| Tempo medio de espera | CRM/Recepcao | Essencial/Pro/Enterprise | Experiencia | Operacao/Experiencia | `operations.tempoMedioEspera` | Essencial tab 4; Pro tab 6; Enterprise tab 7 | PARCIAL | existe campo, tela usa mock |
| Espera por medico | CRM/Recepcao | Pro/Enterprise | Experiencia | Operacao/Experiencia | ausente | Pro tab 6; Enterprise tab 7 | PARCIAL | mock only |
| Retorno/Fidelizacao 90d | CRM/Agenda | Essencial/Pro/Enterprise | Experiencia | Operacao/Experiencia | ausente | Essencial tab 4; Pro tab 6; Enterprise tab 7 | PARCIAL | nao existe cohort real 90d |
| SLA resposta lead | WhatsApp | Essencial/Pro/Enterprise | Experiencia | Operacao/Experiencia | ausente | Essencial tab 4; Pro tab 6; Enterprise tab 7 | PARCIAL | grafico mock |
| Taxa de recorrencia | CRM/Agenda | Essencial/Pro/Enterprise | Experiencia | Operacao/Experiencia | ausente | Essencial tab 4 parcial; Pro tab 6; Enterprise tab 7 | PARCIAL | derivado de `isReturn` mock |
| Status de checklists/rotinas | Ferramenta interna/manual | Pro/Enterprise | Experiencia | Operacao/Experiencia | ausente | Pro tab 6 | PARCIAL | mock only |
| Consolidacao multi-unidade | ERP multi-unidade | Enterprise | Rede | Multi-Unidade | ausente | Enterprise tab 5 | PARCIAL | visual existe, mas usa mock e considera apenas 2 unidades ativas |
| Score da rede | Calculado sobre KPIs por unidade | Enterprise | Rede | Multi-Unidade | ausente | Enterprise tab 5 | PARCIAL | formula local sobre mock |
| Benchmark interno percentis | Calculado sobre todas as unidades | Enterprise | Rede | Multi-Unidade | ausente | Enterprise tab 5 | PARCIAL | mock only |
| EBITDA normalizado LTM | ERP financeiro | Enterprise | Valuation | Financeiro Investidor | ausente | Enterprise tab 2 | PARCIAL | formula local sem contrato LTM |
| Multiplo EBITDA estimado | Calculado + input risco | Enterprise | Valuation | Financeiro Investidor | ausente | Enterprise tab 2 | PARCIAL | mock only |
| Valuation automatico | Calculado | Enterprise | Valuation | Financeiro Investidor | ausente | Enterprise tab 0/2 | PARCIAL | mock only |
| Score risco estrutural | 6 fatores | Enterprise | Valuation | Multi-Unidade / Governanca | ausente | Enterprise tab 2/5/9 | PARCIAL | mock only |
| Simulador M&A | Input manual + calculado | Enterprise | Valuation | Financeiro Investidor | ausente | Enterprise tab 2 | PARCIAL | mock only |

## 4. Desvios de modulo identificados

| KPI | Modulo TDD | Modulo atual | Evidencia |
|---|---|---|---|
| No-Show por canal de origem (%) | Agenda | Marketing | [EssentialDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EssentialDashboard.tsx#L532) |
| Parte da experiencia do paciente (NPS/espera/SLA/retorno) | Experiencia | Operacao & Experiencia consolidado | [EssentialDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EssentialDashboard.tsx#L551), [ProDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/ProDashboard.tsx#L671) |
| Governance/RBAC/auditoria | Enterprise Governanca | Governanca & Compliance visual estatico | [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx#L431) |

## 5. Dashboard interno GLX do TDD

Status geral:
- `NAO_IMPLEMENTADO`

Evidencia:
- nao ha modulo no app cliente revisado que implemente `WAR ROOM`, `C1 RECEITA`, `C2 FUNIL`, `C3 PROJETOS`, `C4 MRR`, `C5 OPERACIONAL`, `C6 MARKETING` conforme o PDF
- a unica ocorrencia encontrada de `War Room` e no dashboard de cliente Pro/Enterprise, nao no dashboard interno GLX: [ProDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/ProDashboard.tsx#L466) e [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx#L241)

Conclusao:
- os KPIs internos do TDD nao possuem:
  - modelo de dados dedicado
  - rotas backend dedicadas
  - componentes frontend dedicados

## 6. Arquivos que precisariam evoluir para aderir ao TDD

### Backend
- [dashboardDataRouter.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/server/dashboardDataRouter.ts)
  - ampliar contratos por KPI e por granularidade
- [db.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/server/db.ts)
  - persistencia de series, dimensoes e joins reais por origem
- [schema.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/drizzle/schema.ts)
  - tabelas/campos faltantes para funil, checklists, valuation, rede, M&A, SLA, motivos de cancelamento, cohorts e aging

### Frontend
- [mockData.ts](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/data/mockData.ts)
  - substituir por query real da API
- [EssentialDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EssentialDashboard.tsx)
  - corrigir destinos e formulas do Essencial
- [ProDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/ProDashboard.tsx)
  - conectar granularidades reais por canal/profissional/servico
- [EnterpriseDashboard.tsx](/c:/Users/mathe/Review%20Glx/Guillermo02-03/client/src/features/plan-dashboard-replacement/components/EnterpriseDashboard.tsx)
  - consolidacao real de rede, benchmark, valuation e governance

## 7. Prioridade recomendada de implementacao

1. Remover dependencia de mock e ligar dashboards de plano ao backend.
2. Fechar o contrato de dados do dashboard externo, modulo por modulo:
   - Agenda
   - Financeiro
   - Marketing
   - Experiencia
   - Enterprise Rede/Valuation/Governanca
3. Corrigir desvios de destino de KPI.
4. So depois implementar o dashboard interno GLX do PDF, porque hoje ele nem existe na aplicacao revisada.
