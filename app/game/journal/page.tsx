import Link from "next/link";
import { SubpageHero } from "@/components/release-ui";
import { publishedEntries } from "@/content/journal";

export default function JournalPage() {
  return <main className="release-main"><SubpageHero label="JOURNAL / 001" title="Development journal." intro="Updates from the build." /><section className="release-section"><div className="page-shell"><p className="feed-link"><Link href="/game/journal/feed.xml">RSS feed ↗</Link></p>{publishedEntries.length ? <div className="content-grid">{publishedEntries.map((entry) => <Link className="content-card" href={`/game/journal/${entry.slug}`} key={entry.slug}><p className="eyebrow">{entry.category.toUpperCase()} / {entry.date}</p><h2>{entry.title}</h2><p>{entry.excerpt}</p></Link>)}</div> : <div className="empty-state"><p className="eyebrow">COMING SOON</p><h2>First entry in progress.</h2><p>Development updates will appear here.</p></div>}</div></section></main>;
}
