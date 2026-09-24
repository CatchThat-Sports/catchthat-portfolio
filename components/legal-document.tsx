import type { ReactNode } from "react";
import Link from "next/link";

export type LegalSection = { id: string; title: string; body: ReactNode };

type Props = {
  kind: "privacy" | "terms";
  title: string;
  description: string;
  updated: string;
  summary: ReactNode;
  sections: LegalSection[];
};

export function LegalDocument({ kind, title, description, updated, summary, sections }: Props) {
  const other = kind === "privacy" ? { href: "/terms", label: "Terms of use" } : { href: "/privacy", label: "Privacy policy" };

  return <main className="legal-page page-shell">
    <header className="legal-hero">
      <p className="legal-kicker"><span className="legal-status-dot" /> CATCHTHAT LLC <span className="legal-slash">/</span> {kind.toUpperCase()}</p>
      <h1>{title}</h1>
      <p className="legal-deck">{description}</p>
      <div className="legal-meta"><span>LAST UPDATED</span><time>{updated}</time><span>DOC / {kind === "privacy" ? "01" : "02"}</span></div>
    </header>

    <div className="legal-layout">
      <nav className="legal-index" aria-label="On this page">
        <p>ON THIS PAGE</p>
        {sections.map((section, index) => <a key={section.id} href={`#${section.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>)}
        <Link className="legal-index-other" href={other.href}>VIEW {other.label.toUpperCase()} ↗</Link>
      </nav>

      <article className="legal-article">
        <div className="legal-summary"><span>THE SHORT VERSION</span>{summary}</div>
        {sections.map((section, index) => <section className="legal-section" id={section.id} key={section.id}>
          <div className="legal-section-head"><span>{String(index + 1).padStart(2, "0")} /</span><h2>{section.title}</h2></div>
          <div className="legal-body">{section.body}</div>
        </section>)}
        <div className="legal-end"><span>END OF DOCUMENT</span><Link href={other.href}>{other.label} ↗</Link></div>
      </article>
    </div>
  </main>;
}
