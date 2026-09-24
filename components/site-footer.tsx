"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sitePhase } from "@/lib/site-config";

export function SiteFooter() {
  const pathname = usePathname();
  const releaseView = pathname.startsWith("/game") || sitePhase === "release";
  return <footer className="site-footer">
    <div className="page-shell footer-inner">
      <span>© {new Date().getFullYear()} CatchThat LLC</span>
      <div>
        {releaseView && <Link href="/game/support">REPORT AN ISSUE</Link>}
        <Link href="/privacy">PRIVACY</Link>
        <Link href="/terms">TERMS</Link>
        <Link href="mailto:sause@catchthat.io">CONTACT</Link>
      </div>
    </div>
  </footer>;
}
