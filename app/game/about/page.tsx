import Image from "next/image";
import Link from "next/link";
import { SubpageHero } from "@/components/release-ui";

export default function AboutPage() {
  return <main className="release-main"><SubpageHero label="ABOUT / 005" title="About the project." intro="CatchThat Football is an independent game by Sam Sausville." /><section className="release-section"><div className="page-shell about-layout"><Image className="about-image" src="/sam-headshot.png" alt="Sam Sausville" width={963} height={916} /><div className="prose"><p>I&apos;m building a football simulation I want to spend time with. I&apos;ll share more about the game and why I started it as development continues.</p><p>Follow the <Link href="/game/journal">journal</Link> for updates, or <Link href="mailto:sause@catchthat.io">get in touch</Link>.</p></div></div></section></main>;
}
