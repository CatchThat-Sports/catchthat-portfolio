import { publishedEntries } from "@/content/journal";
import { releasePreviewEnabled, sitePhase } from "@/lib/site-config";

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[char] as string));
}

export function GET() {
  if (!releasePreviewEnabled && sitePhase !== "release") return new Response("Not found", { status: 404 });
  const items = publishedEntries.map((entry) => `<item><title>${escapeXml(entry.title)}</title><link>https://catchthat.io/game/journal/${encodeURIComponent(entry.slug)}</link><guid>https://catchthat.io/game/journal/${encodeURIComponent(entry.slug)}</guid><pubDate>${new Date(`${entry.date}T12:00:00Z`).toUTCString()}</pubDate><description>${escapeXml(entry.excerpt)}</description></item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>CatchThat Football Journal</title><link>https://catchthat.io/game/journal</link><description>Development notes from CatchThat Football.</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
