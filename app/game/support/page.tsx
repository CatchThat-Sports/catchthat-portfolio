import Link from "next/link";
import { SubpageHero } from "@/components/release-ui";

export default function SupportPage() {
  return <main className="release-main"><SubpageHero label="SUPPORT / 006" title="Report an issue." intro="Feedback and bug reports help improve the game." /><section className="release-section"><div className="page-shell content-grid"><div className="content-card"><p className="eyebrow">IN THE GAME</p><h2>Use Report</h2><p>Reports are queued in the desktop game until the intake connection is live.</p></div><div className="content-card"><p className="eyebrow">ON THE WEB</p><h2>Email Sam</h2><p>Send the build number and what happened to <Link className="secondary-link" href="mailto:sause@catchthat.io?subject=CatchThat%20Football%20feedback">sause@catchthat.io</Link>.</p></div></div></section></main>;
}
