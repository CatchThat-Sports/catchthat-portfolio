import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

const MAX_REPORT_BYTES = 750 * 1024;
const DAY_MS = 24 * 60 * 60 * 1000;
const ID_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{3}Z-[0-9a-f]{8}$/;
const KINDS = new Set(["bug", "idea", "feels_wrong"]);
const MODES = new Set(["menu", "exhibition", "career", "watch"]);
function object(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }

/** Raw JSON is stored unchanged; classification and clustering run later. */
export const ingest = mutationGeneric({
  args: { raw: v.string(), siteSecret: v.string() },
  returns: v.object({ status: v.union(v.literal("stored"), v.literal("duplicate"), v.literal("rate_limited"), v.literal("too_large"), v.literal("invalid")) }),
  handler: async (ctx, { raw, siteSecret }) => {
    if (!process.env.CONVEX_SITE_SECRET || siteSecret !== process.env.CONVEX_SITE_SECRET) throw new Error("Unauthorized");
    if (new TextEncoder().encode(raw).length > MAX_REPORT_BYTES) return { status: "too_large" as const };
    let data: unknown;
    try { data = JSON.parse(raw); } catch { return { status: "invalid" as const }; }
    if (!object(data) || !object(data.build) || !object(data.context) || !object(data.attachments)
      || data.schema_version !== 1 || typeof data.id !== "string" || !ID_PATTERN.test(data.id)
      || typeof data.install_id !== "string" || data.install_id.length < 8 || data.install_id.length > 100
      || typeof data.created_at !== "string" || Number.isNaN(Date.parse(data.created_at))
      || typeof data.summary !== "string" || data.summary.length < 1 || data.summary.length > 120
      || typeof data.notes !== "string" || data.notes.length > 4000
      || typeof data.kind !== "string" || !KINDS.has(data.kind)
      || typeof data.build.app_sha !== "string" || data.build.app_sha.length > 100
      || !MODES.has(String(data.context.mode))) return { status: "invalid" as const };
    const existing = await ctx.db.query("reports").withIndex("by_report_id", (q) => q.eq("reportId", data.id as string)).first();
    if (existing) return { status: "duplicate" as const };
    const now = Date.now();
    const lastTen = await ctx.db.query("reports").withIndex("by_install_received", (q) => q.eq("installId", data.install_id as string)).order("desc").take(10);
    if (lastTen.length >= 10 && lastTen[9].receivedAt >= now - DAY_MS) return { status: "rate_limited" as const };
    const engine = object(data.build.engine) ? data.build.engine : null;
    await ctx.db.insert("reports", {
      reportId: data.id, installId: data.install_id, raw, appSha: data.build.app_sha,
      engineSha: engine && typeof engine.engine_sha === "string" ? engine.engine_sha : undefined,
      kind: data.kind, receivedAt: now,
    });
    return { status: "stored" as const };
  },
});
