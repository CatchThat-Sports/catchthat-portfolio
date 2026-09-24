import { NextResponse } from "next/server";
import { createHmac, randomBytes } from "node:crypto";
import { anyApi } from "convex/server";
import { getConvexClient, getConvexSiteSecret } from "@/lib/convex-server";
import { readTextWithLimit } from "@/lib/request-body";
import { getResendClient, resendDeliveryEnabled, sendWelcomeEmail, syncResendContact } from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const client = getConvexClient();
  const siteSecret = getConvexSiteSecret();
  if (!client || !siteSecret) return NextResponse.json({ error: "The email list is not connected yet." }, { status: 503 });
  const resend = resendDeliveryEnabled() ? getResendClient() : null;
  if (resendDeliveryEnabled() && !resend) return NextResponse.json({ error: "The email list is temporarily unavailable." }, { status: 503 });
  const raw = await readTextWithLimit(request, 2048);
  if (raw === null) return NextResponse.json({ error: "Request too large." }, { status: 413 });
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof data !== "object" || data === null || Array.isArray(data)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const body = data as { email?: unknown; source?: unknown; website?: unknown };
  if (body.website) return NextResponse.json({ ok: true }); // Bot trap.
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const source = body.source === "release" ? "release" : "teaser";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  // Vercel supplies the client's IP in these headers. Only a keyed hash leaves this process.
  const ip = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for");
  const actorHash = ip ? createHmac("sha256", siteSecret).update(ip.split(",")[0].trim()).digest("hex") : undefined;
  try {
    const result = await client.mutation(anyApi.signups.join, {
      email, source, unsubscribeToken: randomBytes(32).toString("base64url"), actorHash, siteSecret,
    }) as { ok: boolean; suppressed: boolean; rateLimited?: boolean; unsubscribeToken?: string; welcomeSentAt?: number };
    if (result.rateLimited) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    if (!result.ok) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (result.suppressed || !resend) return NextResponse.json({ ok: true });

    const contact = await syncResendContact(resend, email);
    if (contact === "suppressed") {
      await client.mutation(anyApi.signups.markUnsubscribed, { email, siteSecret });
      return NextResponse.json({ ok: true });
    }
    if (!result.welcomeSentAt && result.unsubscribeToken) {
      await sendWelcomeEmail(resend, email, result.unsubscribeToken);
      await client.mutation(anyApi.signups.markWelcomeSent, { email, siteSecret });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Signup provider error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Signup is temporarily unavailable." }, { status: 503 });
  }
}
