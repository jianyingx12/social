import "server-only";

import type {
  ChatMessage,
  ContentIdea,
  Draft,
  Opportunity,
  ProductResource,
  ProductType,
  ProductWorkspace,
  ResearchTarget,
} from "@/lib/types";

import { getSql } from "./client";

type WorkspaceRow = {
  workspace: unknown;
};

type IdRow = {
  id: string;
};

const DEFAULT_PRODUCT_TYPE: ProductType = "Other";

let setupPromise: Promise<void> | null = null;

export async function loadProductWorkspaces(userId: string) {
  await ensureProductWorkspaceTable();

  const sql = getSql();
  const rows = (await sql`
    select workspace
    from product_workspaces
    where user_id = ${userId}
    order by sort_order asc, updated_at desc
  `) as WorkspaceRow[];

  return rows
    .map((row) => normalizeWorkspace(row.workspace))
    .filter((workspace): workspace is ProductWorkspace => Boolean(workspace));
}

export async function saveProductWorkspaces(userId: string, products: unknown[]) {
  await ensureProductWorkspaceTable();

  const sql = getSql();
  const normalizedProducts = products
    .map((product) => normalizeWorkspace(product))
    .filter((product): product is ProductWorkspace => Boolean(product));
  const nextIds = new Set(normalizedProducts.map((product) => product.id));

  for (const [index, product] of normalizedProducts.entries()) {
    await sql`
      insert into product_workspaces (id, user_id, workspace, sort_order, updated_at)
      values (${product.id}, ${userId}, ${JSON.stringify(product)}::jsonb, ${index}, now())
      on conflict (user_id, id)
      do update set
        workspace = excluded.workspace,
        sort_order = excluded.sort_order,
        updated_at = now()
    `;
  }

  const existingRows = (await sql`
    select id
    from product_workspaces
    where user_id = ${userId}
  `) as IdRow[];

  for (const row of existingRows) {
    if (!nextIds.has(row.id)) {
      await sql`
        delete from product_workspaces
        where user_id = ${userId} and id = ${row.id}
      `;
    }
  }
}

function ensureProductWorkspaceTable() {
  setupPromise ??= createProductWorkspaceTable();

  return setupPromise;
}

async function createProductWorkspaceTable() {
  const sql = getSql();

  await sql`
    create table if not exists product_workspaces (
      id text not null,
      user_id text not null,
      workspace jsonb not null,
      sort_order integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (user_id, id)
    )
  `;

  await sql`
    create index if not exists product_workspaces_user_id_updated_at_idx
    on product_workspaces (user_id, updated_at desc)
  `;
}

function normalizeWorkspace(value: unknown): ProductWorkspace | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<ProductWorkspace>;
  const id = stringOrEmpty(record.id);

  if (!id) {
    return null;
  }

  return {
    id,
    name: stringOrDefault(record.name, "Untitled"),
    productType: record.productType ?? DEFAULT_PRODUCT_TYPE,
    productUrl: stringOrEmpty(record.productUrl),
    oneLine: stringOrEmpty(record.oneLine),
    audience: stringOrEmpty(record.audience),
    problem: stringOrEmpty(record.problem),
    outcome: stringOrEmpty(record.outcome),
    differentiator: stringOrEmpty(record.differentiator),
    proof: stringOrEmpty(record.proof),
    voice: stringOrEmpty(record.voice),
    channels: stringOrEmpty(record.channels),
    keywords: stringOrEmpty(record.keywords),
    avoid: stringOrEmpty(record.avoid),
    brief: stringOrEmpty(record.brief),
    resources: arrayOrEmpty<ProductResource>(record.resources),
    researchTargets: arrayOrEmpty<ResearchTarget>(record.researchTargets),
    chatMessages: arrayOrEmpty<ChatMessage>(record.chatMessages),
    drafts: arrayOrEmpty<Draft>(record.drafts),
    opportunities: arrayOrEmpty<Opportunity>(record.opportunities),
    contentIdeas: arrayOrEmpty<ContentIdea>(record.contentIdeas),
  };
}

function stringOrEmpty(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringOrDefault(value: unknown, fallback: string) {
  const text = stringOrEmpty(value).trim();

  return text || fallback;
}

function arrayOrEmpty<T>(value: unknown) {
  return Array.isArray(value) ? (value as T[]) : [];
}
