import { ConvexHttpClient } from "convex/browser";

export function getConvexClient(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  return url ? new ConvexHttpClient(url) : null;
}

export function getConvexSiteSecret(): string | null {
  return process.env.CONVEX_SITE_SECRET || null;
}
