import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publishedEntries } from "@/content/journal";

export function generateStaticParams() { return publishedEntries.map(({ slug }) => ({ slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const entry = publishedEntries.find((item) => item.slug === params.slug);
  return { title: entry?.title || "Journal", description: entry?.excerpt };
}
export default function JournalEntryPage({ params }: { params: { slug: string } }) {
  const entry = publishedEntries.find((item) => item.slug === params.slug);
  if (!entry) notFound();
  return <main className="release-main"><article><header className="subpage-hero"><div className="page-shell"><p className="eyebrow">{entry.category.toUpperCase()} / {entry.date}</p><h1>{entry.title}</h1><p>{entry.excerpt}</p></div></header><div className="release-section"><div className="page-shell prose">{entry.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></div></article></main>;
}
