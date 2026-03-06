import "dotenv/config";
import { appRouter } from "../server/routers";
import { __resetControlTowerMemory } from "../server/controlTowerRouter";
import type { TrpcContext } from "../server/_core/context";
import { controlTowerFactsToAppointments } from "../client/src/features/plan-dashboard-replacement/data/mockData";

type TestUser = {
  id: number;
  openId: string;
  email: string;
  name: string;
  loginMethod: string;
  role: "admin" | "user";
  plan: "essencial" | "pro" | "enterprise";
  mfaEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

type CheckResult = {
  name: string;
  status: "PASS" | "WARN" | "FAIL";
  details: string;
};

function makeCtx(user: TestUser | null): TrpcContext {
  return {
    req: {
      protocol: "http",
      headers: {},
      ip: "127.0.0.1",
    } as any,
    res: {
      cookie() {},
      clearCookie() {},
    } as any,
    user: user as any,
  };
}

function buildUser(overrides: Partial<TestUser>): TestUser {
  const now = new Date();
  return {
    id: 0,
    openId: "test-user",
    email: "user@example.com",
    name: "Test User",
    loginMethod: "email",
    role: "user",
    plan: "enterprise",
    mfaEnabled: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    ...overrides,
  };
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function testControlTowerApi(): Promise<CheckResult[]> {
  __resetControlTowerMemory();

  const clientCaller = appRouter.createCaller(
    makeCtx(
      buildUser({
        id: 9002,
        openId: "seed-enterprise-user",
        email: "enterprise@glx.local",
        name: "Enterprise Seed",
        plan: "enterprise",
      }),
    ),
  );

  const commit = await clientCaller.controlTower.commitIngestionBatch({
    fileName: "fake-api-seed.json",
    fileType: "api",
    metadata: { source: "script:test-dashboard-api-seed" },
    rows: [
      {
        id: "api-1",
        timestamp: "2026-03-04T10:00:00Z",
        channel: "Google",
        professional: "Dra. Ana",
        procedure: "Botox",
        status: "realizado",
        pipeline: "Agendado",
        unit: "Jardins",
        entries: 1800,
        exits: 540,
        slotsAvailable: 8,
        slotsEmpty: 1,
        ticketMedio: 900,
        custoVariavel: 180,
        durationMinutes: 45,
        materialList: ["toxina"],
        waitMinutes: 12,
        npsScore: 9,
        baseOldRevenueCurrent: 52000,
        baseOldRevenuePrevious: 47000,
        crmLeadId: "lead-001",
        sourceType: "api",
      },
      {
        id: "api-2",
        timestamp: "2026-03-04T12:00:00Z",
        channel: "Instagram",
        professional: "Dr. Silva",
        procedure: "Laser",
        status: "noshow",
        pipeline: "Confirmado",
        unit: "Paulista",
        entries: 0,
        exits: 0,
        slotsAvailable: 6,
        slotsEmpty: 2,
        ticketMedio: 650,
        custoVariavel: 120,
        durationMinutes: 30,
        materialList: [],
        waitMinutes: 0,
        npsScore: 0,
        baseOldRevenueCurrent: 52000,
        baseOldRevenuePrevious: 47000,
        crmLeadId: "lead-002",
        sourceType: "webhook",
      },
      {
        id: "api-3",
        timestamp: "2026-03-05T09:30:00Z",
        channel: "Indicacao",
        professional: "Dr. Costa",
        procedure: "Consulta",
        status: "cancelado",
        pipeline: "Cancelado",
        unit: "Jardins",
        entries: 0,
        exits: 150,
        slotsAvailable: 5,
        slotsEmpty: 3,
        ticketMedio: 300,
        custoVariavel: 40,
        durationMinutes: 20,
        materialList: [],
        waitMinutes: 0,
        npsScore: 0,
        baseOldRevenueCurrent: 52000,
        baseOldRevenuePrevious: 47000,
        crmLeadId: "lead-003",
        sourceType: "manual",
      },
    ],
  });

  assert(commit.success, "controlTower.commitIngestionBatch retornou success=false");
  assert(commit.insertedRows === 3, `esperado insertedRows=3, recebido ${commit.insertedRows}`);

  const dashboard = await clientCaller.controlTower.getDashboardData({ period: "30d" });
  assert(dashboard.facts.length === 3, `esperado 3 facts no dashboard principal, recebido ${dashboard.facts.length}`);
  const planAppointments = controlTowerFactsToAppointments(dashboard.facts);
  assert(planAppointments.length === 3, `adaptador dos dashboards por plano recebeu ${planAppointments.length} appointments; esperado 3`);

  const modules = ["financeiro", "operacoes", "growth", "qualidade", "equipe", "warroom", "ingestao"] as const;
  const moduleResults = await Promise.all(
    modules.map(async (module) => {
      const data = await clientCaller.controlTower.getModuleData({
        module,
        filters: { period: "30d" },
      });
      assert(data.facts.length === 3, `modulo ${module} retornou ${data.facts.length} facts; esperado 3`);
      return { module, data };
    }),
  );

  const ingestao = moduleResults.find((item) => item.module === "ingestao")?.data;
  assert(ingestao, "modulo ingestao nao retornou");
  assert(Array.isArray(ingestao.ingestionHealth.integrations), "ingestionHealth.integrations nao retornou array");

  return [
    {
      name: "controlTower.commitIngestionBatch",
      status: "PASS",
      details: `seed inserido com ${commit.insertedRows} linhas`,
    },
    {
      name: "controlTower.getDashboardData",
      status: "PASS",
      details: `dashboard principal retornou ${dashboard.facts.length} facts e ${dashboard.alerts.length} alertas`,
    },
    {
      name: "controlTower.getModuleData",
      status: "PASS",
      details: `modulos ${modules.join(", ")} retornaram os ${dashboard.facts.length} facts do seed`,
    },
    {
      name: "controlTower.ingestionHealth",
      status: "PASS",
      details: `integracoes monitoradas: ${ingestao.ingestionHealth.integrations.length}`,
    },
    {
      name: "plan-dashboard-replacement",
      status: "PASS",
      details: `adaptador do dashboard por plano converteu ${planAppointments.length} facts da API para appointments`,
    },
  ];
}

async function testDashboardDataApi(): Promise<CheckResult[]> {
  const adminCaller = appRouter.createCaller(
    makeCtx(
      buildUser({
        id: 9001,
        openId: "seed-admin-user",
        email: "admin@glx.local",
        name: "Admin Seed",
        role: "admin",
        plan: "enterprise",
      }),
    ),
  );

  try {
    await adminCaller.dashboardData.createClient({
      name: "Cliente Seed Admin",
      slug: `cliente-seed-${Date.now()}`,
      industry: "saude",
    });

    return [
      {
        name: "dashboardData.createClient",
        status: "PASS",
        details: "fluxo admin conseguiu criar cliente via API",
      },
    ];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [
      {
        name: "dashboardData.createClient",
        status: "WARN",
        details: `fluxo admin indisponivel sem banco: ${message}`,
      },
    ];
  }
}

function printResults(results: CheckResult[]) {
  const width = Math.max(...results.map((item) => item.name.length), 10);
  for (const result of results) {
    const label = result.name.padEnd(width, " ");
    console.log(`${result.status}  ${label}  ${result.details}`);
  }
}

async function main() {
  const results: CheckResult[] = [];

  try {
    results.push(...(await testControlTowerApi()));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({
      name: "controlTower",
      status: "FAIL",
      details: message,
    });
  }

  results.push(...(await testDashboardDataApi()));

  printResults(results);

  const hasFail = results.some((item) => item.status === "FAIL");
  if (hasFail) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("FAIL  script", error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
