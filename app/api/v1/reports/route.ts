import { NextResponse } from "next/server";
import { anyApi } from "convex/server";
import { getConvexClient, getConvexSiteSecret } from "@/lib/convex-server";
import { readTextWithLimit } from "@/lib/request-body";

export const runtime = "nodejs";
const MAX_BYTES = 750 * 1024;
const ID_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{3}Z-[0-9a-f]{8}$/;
const KINDS = new Set(["bug", "idea", "feels_wrong"]);

function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }

export async function POST(request: Request) {
  const client = getConvexClient();
  const siteSecret = getConvexSiteSecret();
  if (!client || !siteSecret) return NextResponse.json({ error: "Report intake is not connected yet." }, { status: 503 });
  const raw = await readTextWithLimit(request, MAX_BYTES);
  if (raw === null) return NextResponse.json({ error: "Report exceeds the 750 KiB intake limit." }, { status: 413 });
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (!record(data) || !record(data.build) || !record(data.context) || !record(data.attachments)
    || data.schema_version !== 1 || typeof data.id !== "string" || !ID_PATTERN.test(data.id)
    || typeof data.install_id !== "string" || data.install_id.length > 100 || data.install_id.length < 8
    || typeof data.created_at !== "string" || Number.isNaN(Date.parse(data.created_at))
    || typeof data.summary !== "string" || data.summary.length < 1 || data.summary.length > 120
    || typeof data.notes !== "string" || data.notes.length > 4000
    || typeof data.kind !== "string" || !KINDS.has(data.kind)
    || typeof data.build.app_sha !== "string" || data.build.app_sha.length > 100
    || !["menu", "exhibition", "career", "watch"].includes(String(data.context.mode))) {
    return NextResponse.json({ error: "Invalid report envelope." }, { status: 400 });
  }
  const key = request.headers.get("idempotency-key");
  if (key && key !== data.id) return NextResponse.json({ error: "Idempotency key does not match report id." }, { status: 400 });
  try {
    const result = await client.mutation(anyApi.reports.ingest, { raw, siteSecret }) as { status: "stored" | "duplicate" | "rate_limited" | "too_large" | "invalid" };
    if (result.status === "invalid") return NextResponse.json({ error: "Invalid report envelope." }, { status: 400 });
    if (result.status === "rate_limited") return NextResponse.json({ error: "Report rate limit reached. Retry later." }, { status: 429 });
    if (result.status === "too_large") return NextResponse.json({ error: "Report too large." }, { status: 413 });
    return NextResponse.json({ status: result.status }, { status: result.status === "stored" ? 201 : 200 });
  } catch {
    return NextResponse.json({ error: "Report intake is temporarily unavailable." }, { status: 503 });
  }
}
