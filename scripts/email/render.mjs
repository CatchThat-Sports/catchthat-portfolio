export const SITE_URL = (process.env.SITE_PUBLIC_URL || "https://www.catchthat.io").replace(/\/$/, "");
export const RESEND_UNSUBSCRIBE = "{{{RESEND_UNSUBSCRIBE_URL}}}";
const POSTAL = "CatchThat LLC · 25452 SE 42nd St, Issaquah, WA 98029, USA";

const C = { bg: "#0d130f", card: "#131b15", text: "#e9d9a8", muted: "#9bae9c", accent: "#e9b06a", rule: "#26342a" };
const FONT = "Arial,Helvetica,sans-serif";

export function parseDraft(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("Draft needs a front-matter block between --- lines with at least a subject.");
  const meta = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^"(.*)"$/, "$1");
  }
  return { meta, body: match[2].trim() };
}

export function writeMeta(source, updates) {
  const { meta, body } = parseDraft(source);
  const merged = { ...meta, ...updates };
  const lines = Object.entries(merged).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${/[:#]/.test(v) ? JSON.stringify(v) : v}`);
  return `---\n${lines.join("\n")}\n---\n\n${body}\n`;
}

export function lintDraft({ meta, body }) {
  const errors = [];
  const warnings = [];
  if (!meta.subject) errors.push("Missing subject.");
  else if (meta.subject.length > 70) warnings.push(`Subject is ${meta.subject.length} characters; inboxes cut it near 60.`);
  if (!meta.preview) warnings.push("No preview line; inboxes will show the first sentence instead.");
  if (!body) errors.push("Body is empty.");
  const placeholder = body.match(/\b(TODO|TBD|TK|XXX)\b|\[\[|\]\]|lorem ipsum/i);
  if (placeholder) errors.push(`Placeholder left in the body: "${placeholder[0]}".`);
  for (const [, url] of body.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (url.startsWith("http://")) warnings.push(`Insecure link: ${url}`);
    else if (!/^(https:\/\/|\/|mailto:)/.test(url)) errors.push(`Link is neither https nor a site path: ${url}`);
  }
  return { errors, warnings };
}

function absolute(url) {
  return url.startsWith("/") ? SITE_URL + url : url;
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inlineHtml(text) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => `<a href="${absolute(url)}" style="color:${C.accent};text-decoration:underline">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])[*_]([^*_]+)[*_](?=[^*\w]|$)/g, "$1<em>$2</em>");
}

function inlineText(text) {
  return text
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => `${label} (${absolute(url)})`)
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^*\w])[*_]([^*_]+)[*_](?=[^*\w]|$)/g, "$1$2");
}

/** Blocks are separated by blank lines; see the drafting skill for the supported syntax. */
function blocks(body) {
  return body.split(/\n\s*\n/).map((raw) => raw.trim()).filter(Boolean).map((raw) => {
    const heading = raw.match(/^#{1,3}\s+(.*)$/);
    if (heading) return { kind: "heading", text: heading[1] };
    const image = raw.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (image) return { kind: "image", alt: image[1], url: absolute(image[2]) };
    const button = raw.match(/^->\s*\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (button) return { kind: "button", label: button[1], url: absolute(button[2]) };
    if (raw.split("\n").every((line) => /^[-*]\s+/.test(line))) {
      return { kind: "list", items: raw.split("\n").map((line) => line.replace(/^[-*]\s+/, "")) };
    }
    return { kind: "paragraph", text: raw.replace(/\s*\n\s*/g, " ") };
  });
}

const P = `margin:0 0 18px;font-size:16px;line-height:1.6;color:${C.text}`;

function blockHtml(block) {
  switch (block.kind) {
    case "heading":
      return `<h2 style="margin:30px 0 12px;font-size:19px;line-height:1.3;color:${C.text};font-family:${FONT}">${inlineHtml(block.text)}</h2>`;
    case "image":
      return `<img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt)}" width="496" style="display:block;width:100%;max-width:496px;height:auto;margin:6px 0 22px;border:0;border-radius:6px" />`;
    case "button":
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 26px"><tr><td style="background:${C.accent};border-radius:6px"><a href="${escapeHtml(block.url)}" style="display:inline-block;padding:13px 22px;font-family:${FONT};font-size:16px;font-weight:700;color:${C.bg};text-decoration:none">${escapeHtml(block.label)}</a></td></tr></table>`;
    case "list":
      return `<ul style="margin:0 0 18px;padding-left:22px">${block.items.map((item) => `<li style="margin:0 0 8px;font-size:16px;line-height:1.55;color:${C.text}">${inlineHtml(item)}</li>`).join("")}</ul>`;
    default:
      return `<p style="${P}">${inlineHtml(block.text)}</p>`;
  }
}

function blockText(block) {
  switch (block.kind) {
    case "heading":
      return block.text.toUpperCase();
    case "image":
      return block.alt ? `[${block.alt}]` : "";
    case "button":
      return `${block.label}: ${block.url}`;
    case "list":
      return block.items.map((item) => `- ${inlineText(item)}`).join("\n");
    default:
      return inlineText(block.text);
  }
}

/** `unsubscribeUrl` is Resend's per-recipient merge tag for broadcasts; tests pass a plain page. */
export function renderEmail({ meta, body }, { unsubscribeUrl = RESEND_UNSUBSCRIBE } = {}) {
  const parsed = blocks(body);
  const preview = meta.preview ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(meta.preview)}${"&#847;&zwnj;&nbsp;".repeat(40)}</div>` : "";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${escapeHtml(meta.subject || "")}</title></head>
<body style="margin:0;padding:0;background:${C.bg}">${preview}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:544px"><tr><td style="padding:0 24px 22px;font-family:${FONT}">
<a href="${SITE_URL}" style="font-size:22px;font-weight:700;color:${C.text};text-decoration:none"><img src="${SITE_URL}/logo.png" alt="" width="40" height="40" style="width:40px;height:40px;border:0;vertical-align:middle;margin-right:10px">CatchThat Football</a>
</td></tr><tr><td style="background:${C.card};border:1px solid ${C.rule};border-radius:10px;padding:30px 24px 12px;font-family:${FONT}">
${parsed.map(blockHtml).join("\n")}
</td></tr><tr><td style="padding:24px 24px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted}">
You're getting this because you signed up at <a href="${SITE_URL}" style="color:${C.muted}">catchthat.io</a>. Replies come straight to me.<br>
<a href="${unsubscribeUrl}" style="color:${C.accent}">Unsubscribe</a> from updates.<br>${POSTAL}
</td></tr></table></td></tr></table></body></html>`;
  const text = `${parsed.map(blockText).filter(Boolean).join("\n\n")}\n\n--\nYou're getting this because you signed up at catchthat.io. Replies come straight to me.\nUnsubscribe: ${unsubscribeUrl}\n${POSTAL}\n`;
  return { subject: meta.subject, html, text };
}
