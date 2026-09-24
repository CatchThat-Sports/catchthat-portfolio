import { SubpageHero } from "@/components/release-ui";

const systems = [
  { number: "01 /", title: "On the field", text: "Movement, matchups, and the ball." },
  { number: "02 /", title: "Around the league", text: "Teams, seasons, and the decisions between games." },
  { number: "03 /", title: "Under the surface", text: "Repeatable simulation and inspectable plays." },
  { number: "04 /", title: "In your hands", text: "More details as the game develops." },
];

export default function MechanicsPage() {
  return <main className="release-main"><SubpageHero label="MECHANICS / 004" title="How it works." intro="A starting point for the systems behind the game." /><section className="release-section"><div className="page-shell content-grid">{systems.map((system) => <article className="content-card" key={system.title}><p className="eyebrow">{system.number}</p><h2>{system.title}</h2><p>{system.text}</p></article>)}</div></section></main>;
}
