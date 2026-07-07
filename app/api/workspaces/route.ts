import { NextResponse } from "next/server";

import { getCurrentUserStorageKey } from "@/lib/auth/current-user";
import {
  loadProductWorkspaces,
  saveProductWorkspaces,
} from "@/lib/db/product-workspaces";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserStorageKey();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const products = await loadProductWorkspaces(userId);

  return NextResponse.json({ products });
}

export async function PUT(request: Request) {
  const userId = await getCurrentUserStorageKey();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    products?: unknown[];
  } | null;

  if (!body || !Array.isArray(body.products)) {
    return NextResponse.json({ error: "Expected products array." }, { status: 400 });
  }

  await saveProductWorkspaces(userId, body.products);

  return NextResponse.json({ ok: true });
}
