import Image from "next/image";
import { HeroFootball } from "@/components/hero-football";
import { EmailSignup } from "@/components/email-signup";
import { SimPreview } from "@/components/sim-preview";
import { sitePhase } from "@/lib/site-config";
import GamePage from "./game/page";

export default function HomePage() {
  if (sitePhase === "release") return <GamePage />;

  return <main className="teaser-main">
    <section className="teaser-intro page-shell">
      <div className="teaser-copy">
        <span className="eyebrow"><span className="status-light" aria-hidden="true" />IN DEVELOPMENT · COMING TO STEAM</span>
        <h1>Run the franchise. Call every snap.</h1>
        <p className="teaser-lede">CatchThat Football is a football management sim built on a real play-by-play engine, with all 22 players simulated on every snap. Draft, trade and build a dynasty across decades, or take the headset and call the plays yourself.</p>
      </div>
      <div className="teaser-signup" id="updates">
        <h2 className="form-heading">Get dev updates and launch news.</h2>
        <EmailSignup source="teaser" ready={Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)} />
      </div>
      <div className="teaser-ball"><HeroFootball /></div>
    </section>
    <section className="preview-section page-shell" aria-label="Interactive game preview">
      <div className="preview-head">
        <h2 className="preview-title">Game preview</h2>
        <p className="preview-hint">A real play from the engine. Then it&apos;s your call.</p>
      </div>
      <SimPreview />
      <div className="builder-line">
        <Image src="/sam-headshot.png" alt="" width={44} height={44} />
        <p>Built by Sam Sausville in Seattle. Follow along on X at <a href="https://x.com/sausyville" target="_blank" rel="noopener noreferrer">@sausyville</a>.</p>
      </div>
    </section>
  </main>;
}
