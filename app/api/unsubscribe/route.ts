import { NextResponse } from "next/server";
import { anyApi } from "convex/server";
import { getConvexClient, getConvexSiteSecret } from "@/lib/convex-server";
import { readTextWithLimit } from "@/lib/request-body";
import { getResendClient, resendDeliveryEnabled, unsubscribeResendContact } from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await readTextWithLimit(request, 512);
  if (raw === null) return NextResponse.json({ error: "Invalid link." }, { status: 400 });
  const oneClickToken = new URL(request.url).searchParams.get("token");
  let token: unknown = oneClickToken;
  if (!oneClickToken) {
    let data: unknown;
    try { data = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid link." }, { status: 400 }); }
    token = typeof data === "object" && data !== null && !Array.isArray(data) && "token" in data ? data.token : null;
  }
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) return NextResponse.json({ error: "Invalid link." }, { status: 400 });

  const client = getConvexClient();
  const siteSecret = getConvexSiteSecret();
  if (!client || !siteSecret) return NextResponse.json({ error: "Unsubscribe is temporarily unavailable." }, { status: 503 });
  try {
    const email = await client.query(anyApi.signups.resolveUnsubscribe, { unsubscribeToken: token, siteSecret }) as string | null;
    if (!email) return NextResponse.json({ error: "Invalid link." }, { status: 400 });
    // Suppress the address locally first, even if the provider is temporarily unavailable.
    await client.mutation(anyApi.signups.markUnsubscribed, { email, siteSecret });
    if (resendDeliveryEnabled()) {
      const resend = getResendClient();
      if (!resend) return NextResponse.json({ error: "Unsubscribe is temporarily unavailable." }, { status: 503 });
      await unsubscribeResendContact(resend, email);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unsubscribe provider error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Unsubscribe is temporarily unavailable." }, { status: 503 });
  }
}
