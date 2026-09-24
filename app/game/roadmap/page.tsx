import { SubpageHero } from "@/components/release-ui";

const stages = [
  { label: "NOW", title: "Build the core", text: "The game on the field and the league around it." },
  { label: "NEXT", title: "Test and tune", text: "Playtesting, feedback, and fixes." },
  { label: "LATER", title: "Release", text: "Timing will be shared when it is ready." },
  { label: "FUTURE", title: "Beyond single player", text: "Online leagues are a separate, later build." },
];

export default function RoadmapPage() {
  return <main className="release-main"><SubpageHero label="ROADMAP / 002" title="The road ahead." intro="A direction for the project. Dates will come later." /><section className="release-section"><div className="page-shell"><div className="timeline">{stages.map((stage) => <div className="timeline-item" key={stage.title}><span className="timeline-label">{stage.label}</span><h2>{stage.title}</h2><p>{stage.text}</p></div>)}</div></div></section></main>;
}
