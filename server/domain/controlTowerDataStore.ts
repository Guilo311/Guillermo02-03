import { desc, eq } from "drizzle-orm";
import {
  controlTowerFacts,
  controlTowerIngestions,
  type InsertControlTowerFactRecord,
  type InsertControlTowerIngestion,
} from "../../drizzle/schema";
import type { ControlTowerFact, IngestionParsedRow } from "@shared/types";
import { getDb } from "../db";

export type ControlTowerStoredIngestion = {
  id: number;
  userId: number;
  fileName: string;
  fileType: "pdf" | "csv" | "xlsx" | "api" | "webhook" | "manual" | "crm";
  status: "pending" | "committed" | "failed";
  parsedRows: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

const inMemoryIngestions: ControlTowerStoredIngestion[] = [];
const inMemoryFacts: ControlTowerFact[] = [];
let inMemoryIngestionId = 1;

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toDate(value: string): Date {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toFact(row: IngestionParsedRow, userId: number, ingestionId?: number): ControlTowerFact {
  const entries = toNumber(row.entries);
  const exits = toNumber(row.exits);
  return {
    ...row,
    userId,
    ingestionId,
    entries,
    exits,
    revenueValue: entries - exits,
    sourceType: row.sourceType ?? "upload",
  };
}

export function resetControlTowerDataStore() {
  inMemoryIngestions.length = 0;
  inMemoryFacts.length = 0;
  inMemoryIngestionId = 1;
}

export async function loadControlTowerFacts(userId: number): Promise<ControlTowerFact[]> {
  const db = await getDb();
  if (!db) {
    return inMemoryFacts.filter((fact) => fact.userId === userId);
  }

  const rows = await db.select().from(controlTowerFacts).where(eq(controlTowerFacts.userId, userId)).orderBy(desc(controlTowerFacts.eventAt));
  return rows.map((row) => ({
    id: String(row.id),
    ingestionId: row.ingestionId,
    userId: row.userId,
    timestamp: row.eventAt.toISOString(),
    channel: row.channel,
    professional: row.professional,
    procedure: row.procedureName,
    status: row.status,
    pipeline: row.pipeline ?? undefined,
    unit: row.unit ?? undefined,
    entries: toNumber(row.entries),
    exits: toNumber(row.exits),
    revenueValue: toNumber(row.revenueValue),
    slotsAvailable: row.slotsAvailable,
    slotsEmpty: row.slotsEmpty,
    ticketMedio: toNumber(row.ticketMedio),
    custoVariavel: toNumber(row.custoVariavel),
    durationMinutes: row.durationMinutes,
    materialList: Array.isArray(row.materialList) ? row.materialList.map(String) : [],
    waitMinutes: row.waitMinutes,
    npsScore: row.npsScore,
    baseOldRevenueCurrent: toNumber(row.baseOldRevenueCurrent),
    baseOldRevenuePrevious: toNumber(row.baseOldRevenuePrevious),
    crmLeadId: row.crmLeadId ?? undefined,
    sourceType: (row.sourceType as ControlTowerFact["sourceType"] | null) ?? undefined,
  }));
}

export async function loadControlTowerIngestions(userId: number): Promise<ControlTowerStoredIngestion[]> {
  const db = await getDb();
  if (!db) {
    return inMemoryIngestions
      .filter((ingestion) => ingestion.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const rows = await db
    .select()
    .from(controlTowerIngestions)
    .where(eq(controlTowerIngestions.userId, userId))
    .orderBy(desc(controlTowerIngestions.createdAt));

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    fileName: row.fileName,
    fileType: row.fileType as ControlTowerStoredIngestion["fileType"],
    status: row.status,
    parsedRows: row.parsedRows,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function commitControlTowerIngestionBatch(input: {
  userId: number;
  fileName: string;
  fileType: ControlTowerStoredIngestion["fileType"];
  rows: IngestionParsedRow[];
  metadata?: Record<string, unknown>;
}) {
  const facts = input.rows.map((row) => toFact(row, input.userId));
  const db = await getDb();

  if (!db) {
    const ingestionId = inMemoryIngestionId++;
    inMemoryIngestions.push({
      id: ingestionId,
      userId: input.userId,
      fileName: input.fileName,
      fileType: input.fileType,
      status: "committed",
      parsedRows: input.rows.length,
      metadata: input.metadata ?? null,
      createdAt: new Date().toISOString(),
    });
    facts.forEach((fact) => inMemoryFacts.push({ ...fact, ingestionId }));
    return {
      success: true,
      ingestionId,
      insertedRows: facts.length,
    };
  }

  const ingestionPayload: InsertControlTowerIngestion = {
    userId: input.userId,
    fileName: input.fileName,
    fileType: input.fileType,
    status: "committed",
    parsedRows: input.rows.length,
    metadata: input.metadata ?? null,
  };
  const ingestionResult = await db.insert(controlTowerIngestions).values(ingestionPayload as any);
  const ingestionId = ingestionResult[0]?.insertId as number;

  const factsPayload: InsertControlTowerFactRecord[] = facts.map((fact) => ({
    ingestionId,
    userId: input.userId,
    eventAt: toDate(fact.timestamp),
    channel: fact.channel,
    professional: fact.professional,
    procedureName: fact.procedure,
    status: fact.status,
    pipeline: fact.pipeline,
    unit: fact.unit,
    entries: fact.entries.toString(),
    exits: fact.exits.toString(),
    revenueValue: fact.revenueValue.toString(),
    slotsAvailable: fact.slotsAvailable,
    slotsEmpty: fact.slotsEmpty,
    ticketMedio: fact.ticketMedio.toString(),
    custoVariavel: fact.custoVariavel.toString(),
    durationMinutes: fact.durationMinutes,
    materialList: fact.materialList,
    waitMinutes: fact.waitMinutes,
    npsScore: fact.npsScore,
    baseOldRevenueCurrent: fact.baseOldRevenueCurrent.toString(),
    baseOldRevenuePrevious: fact.baseOldRevenuePrevious.toString(),
    crmLeadId: fact.crmLeadId,
    sourceType: fact.sourceType ?? "upload",
  }));
  await db.insert(controlTowerFacts).values(factsPayload as any);

  return {
    success: true,
    ingestionId,
    insertedRows: facts.length,
  };
}
