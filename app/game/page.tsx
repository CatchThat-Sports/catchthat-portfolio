import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EmailSignup } from "@/components/email-signup";
import { SteamLink } from "@/components/release-ui";

const paths = [
  { href: "/game/journal", number: "01 /", title: "Journal", description: "Updates from development." },
  { href: "/game/roadmap", number: "02 /", title: "Roadmap", description: "What is being built." },
  { href: "/game/design", number: "03 /", title: "Design", description: "Choices behind the game." },
  { href: "/game/mechanics", number: "04 /", title: "Mechanics", description: "How it plays." },
  { href: "/game/about", number: "05 /", title: "About", description: "Why this project exists." },
  { href: "/game/support", number: "06 /", title: "Support", description: "Share feedback and issues." },
];

export default function GamePage() {
  return <main className="release-main">
    <section className="release-hero"><div className="page-shell">
      <h1 className="release-title">CatchThat Football.</h1>
      <p className="release-intro">A football simulation from CatchThat.</p>
      <div className="release-actions"><SteamLink /><Link href="/game/journal" className="secondary-link">Read the journal <ArrowUpRight size={16} /></Link></div>
    </div></section>
    <section className="release-section"><div className="page-shell">
      <div className="section-topline"><h2>Explore</h2><span>FIELD GUIDE / 001</span></div>
      <div className="feature-grid">{paths.map((path) => <Link className="feature-card" href={path.href} key={path.href}><ArrowUpRight className="card-arrow" size={18} /><span className="number">{path.number}</span><h3>{path.title}</h3><p>{path.description}</p></Link>)}</div>
    </div></section>
    <section className="release-section" id="updates"><div className="page-shell release-signup"><div><p className="eyebrow">STAY IN THE LOOP</p><h2>Get updates.</h2><p>Occasional notes from development.</p></div><EmailSignup source="release" ready={Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)} /></div></section>
  </main>;
}
