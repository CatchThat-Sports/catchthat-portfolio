import { NextResponse } from "next/server";
import { anyApi } from "convex/server";
import { getConvexClient, getConvexSiteSecret } from "@/lib/convex-server";
import { readTextWithLimit } from "@/lib/request-body";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const client = getConvexClient();
  const siteSecret = getConvexSiteSecret();
  if (!client || !siteSecret) return NextResponse.json({ error: "Session intake is not connected yet." }, { status: 503 });
  const raw = await readTextWithLimit(request, 2048);
  if (raw === null) return NextResponse.json({ error: "Request too large." }, { status: 413 });
  let data: Record<string, unknown>;
  try { data = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (!data || typeof data !== "object" || ![data.session_id, data.install_id, data.app_sha, data.engine_sha].every((item) => typeof item === "string" && item.length > 0 && item.length <= 100)) {
    return NextResponse.json({ error: "Invalid heartbeat." }, { status: 400 });
  }
  try {
    const result = await client.mutation(anyApi.sessions.heartbeat, {
      sessionId: data.session_id, installId: data.install_id, appSha: data.app_sha, engineSha: data.engine_sha,
      siteSecret,
    });
    return NextResponse.json(result, { status: 202 });
  } catch { return NextResponse.json({ error: "Session intake is temporarily unavailable." }, { status: 503 }); }
}
