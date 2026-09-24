import { SubpageHero } from "@/components/release-ui";

const decisions = [
  { number: "01 /", title: "Simulation first", text: "The engine leads the experience." },
  { number: "02 /", title: "Explainable outcomes", text: "Plays should have a story you can inspect." },
  { number: "03 /", title: "An original league", text: "Clubs and players built for this world." },
  { number: "04 /", title: "Single player first", text: "A strong core game comes before online leagues." },
];

export default function DesignPage() {
  return <main className="release-main"><SubpageHero label="DESIGN / 003" title="Design decisions." intro="The choices shaping CatchThat Football." /><section className="release-section"><div className="page-shell content-grid">{decisions.map((decision) => <article className="content-card" key={decision.title}><p className="eyebrow">{decision.number}</p><h2>{decision.title}</h2><p>{decision.text}</p></article>)}</div></section></main>;
}
