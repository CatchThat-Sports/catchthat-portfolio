import { EmailSignup } from "@/components/email-signup";
import { SimPreview } from "@/components/sim-preview";
import { sitePhase } from "@/lib/site-config";
import GamePage from "./game/page";

export default function HomePage() {
  if (sitePhase === "release") return <GamePage />;

  return <main className="teaser-main">
    <section className="teaser-intro page-shell">
      <div className="teaser-copy">
        <h1>Football is in motion.</h1>
        <p className="teaser-lede">A new football simulator where every play is yours to call. Every decision shapes the game.</p>
      </div>
      <div className="teaser-signup" id="updates">
        <h2 className="form-heading">Interested? Leave your email.</h2>
        <EmailSignup source="teaser" ready={Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)} />
      </div>
    </section>
    <section className="preview-section page-shell" aria-label="Interactive game preview">
      <h2 className="preview-title">Game preview</h2>
      <SimPreview />
    </section>
  </main>;
}
