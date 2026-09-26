"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { releaseNavigation, sitePhase } from "@/lib/site-config";

export function SiteHeader() {
  const pathname = usePathname();
  const releaseView = pathname.startsWith("/game") || (pathname === "/" && sitePhase === "release");

  return <header className="site-header">
    <div className="page-shell site-header-inner">
      <Link href="/" aria-label="CatchThat Football home" className="site-brand">
        <Image src="/logo.png" alt="" width={37} height={37} priority />
        <span>CATCHTHAT <b>FOOTBALL</b></span>
      </Link>
    </div>
    {releaseView && <nav className="release-nav page-shell" aria-label="Game navigation">
      {releaseNavigation.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}
    </nav>}
  </header>;
}
