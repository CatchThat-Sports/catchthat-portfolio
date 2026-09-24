import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { steamUrl } from "@/lib/site-config";

export function SubpageHero({ label, title, intro }: { label: string; title: string; intro: string }) {
  return <section className="subpage-hero"><div className="page-shell"><p className="eyebrow">{label}</p><h1>{title}</h1><p>{intro}</p></div></section>;
}

export function SteamLink() {
  if (!steamUrl) return <span className="coming-tag">Steam page coming soon</span>;
  return <Link className="primary-link" href={steamUrl} target="_blank" rel="noopener noreferrer">Wishlist on Steam <ArrowUpRight size={17} /></Link>;
}
