import type { ReactNode } from "react";

export type LegalSection = { id: string; title: string; body: ReactNode };

type Props = {
  title: string;
  updated: string;
  sections: LegalSection[];
};

export function LegalDocument({ title, updated, sections }: Props) {
  return <main className="legal-page page-shell">
    <header className="legal-header">
      <h1>{title}</h1>
      <p>Last updated {updated}</p>
    </header>

    <article className="legal-content">
      {sections.map((section) => <section className="legal-section" id={section.id} key={section.id}>
        <h2>{section.title}</h2>
        <div className="legal-body">{section.body}</div>
      </section>)}
    </article>
  </main>;
}
