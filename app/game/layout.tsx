import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { releasePreviewEnabled, sitePhase } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: sitePhase === "release" ? { index: true, follow: true } : { index: false, follow: false } };

export default function GameLayout({ children }: { children: React.ReactNode }) {
  if (!releasePreviewEnabled && sitePhase !== "release") notFound();
  return children;
}
