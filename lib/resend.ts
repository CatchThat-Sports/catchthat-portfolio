import { createHash } from "node:crypto";
import { Resend } from "resend";

export function resendDeliveryEnabled() {
  return process.env.RESEND_DELIVERY_ENABLED === "true";
}

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function resendFailure(action: string, name: string): Error {
  return new Error(`Resend ${action} failed: ${name}`);
}

/** A Resend opt-out always wins over a repeated public signup request. */
export async function syncResendContact(resend: Resend, email: string): Promise<"subscribed" | "suppressed"> {
  const found = await resend.contacts.get({ email });
  if (found.data) return found.data.unsubscribed ? "suppressed" : "subscribed";
  if (found.error?.name !== "not_found") throw resendFailure("contact lookup", found.error?.name || "unknown");

  const created = await resend.contacts.create({ email, unsubscribed: false });
  if (created.error) {
    // A second request may have created the same contact after our lookup.
    if (created.error.statusCode === 409) {
      const retried = await resend.contacts.get({ email });
      if (retried.data) return retried.data.unsubscribed ? "suppressed" : "subscribed";
    }
    throw resendFailure("contact creation", created.error.name);
  }
  return "subscribed";
}

export async function sendWelcomeEmail(resend: Resend, email: string, unsubscribeToken: string) {
  const url = new URL("/unsubscribe", process.env.SITE_PUBLIC_URL || "https://catchthat.io");
  url.searchParams.set("token", unsubscribeToken);
  const unsubscribeUrl = url.toString();
  const oneClickUrl = new URL("/api/unsubscribe", process.env.SITE_PUBLIC_URL || "https://catchthat.io");
  oneClickUrl.searchParams.set("token", unsubscribeToken);
  const from = process.env.RESEND_FROM_EMAIL || "Sam <sause@catchthat.io>";
  const result = await resend.emails.send({
    from,
    replyTo: "sause@catchthat.io",
    to: email,
    subject: "You're on the CatchThat list",
    headers: { "List-Unsubscribe": `<${oneClickUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    text: `Hey — thanks for following CatchThat Football. I'll share occasional updates as the game takes shape.\n\nIf you change your mind, unsubscribe here: ${unsubscribeUrl}\n\n— Sam\nCatchThat LLC\n25452 SE 42nd St, Issaquah, WA 98029, USA`,
    html: `<div style="background:#0d130f;color:#e9d9a8;padding:32px;font-family:Arial,sans-serif"><div style="max-width:480px;margin:auto"><p style="font-size:24px;font-weight:700;margin:0 0 24px">CatchThat Football</p><p>Hey — thanks for following along. I’ll share occasional updates as the game takes shape.</p><p style="margin-top:28px">— Sam</p><p style="margin-top:38px;font-size:12px;color:#9bae9c"><a style="color:#e9b06a" href="${unsubscribeUrl}">Unsubscribe</a> from updates.<br />CatchThat LLC · 25452 SE 42nd St, Issaquah, WA 98029, USA</p></div></div>`,
  }, { idempotencyKey: `catchthat-welcome-${createHash("sha256").update(email).digest("hex")}` });
  if (result.error) throw resendFailure("welcome email", result.error.name);
}

export async function unsubscribeResendContact(resend: Resend, email: string) {
  const result = await resend.contacts.update({ email, unsubscribed: true });
  if (result.error && result.error.name !== "not_found") throw resendFailure("unsubscribe", result.error.name);
}
