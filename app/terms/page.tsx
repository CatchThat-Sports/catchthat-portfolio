import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for the CatchThat Football website from CatchThat LLC.",
};

const sections: LegalSection[] = [
  {
    id: "agreement", title: "Using this site", body: <>
      <p>These terms are between you and CatchThat LLC and apply to catchthat.io. By using the site, you agree to them. If you do not agree, please do not use the site.</p>
      <p>These terms cover the website. They do not give you an account, a subscription, or a copy of CatchThat Football. The game may have separate terms when it is released.</p>
    </>,
  },
  {
    id: "development", title: "CatchThat Football", body: <>
      <p>CatchThat Football is in development. The interactive scene on this site is a preview. Features, designs, roadmaps, and release plans may change. The game is independent and is not an official product of any professional sports league or team.</p>
    </>,
  },
  {
    id: "ownership", title: "Site content", body: <>
      <p>CatchThat and its licensors own the site, software, text, graphics, names, marks, and other original content. You may browse the site and share links to its public pages for personal, noncommercial use. You may not copy, sell, or use our content or marks to imply endorsement without permission. Visiting the site does not transfer ownership or grant any other license.</p>
    </>,
  },
  {
    id: "conduct", title: "Your use of the site", body: <>
      <p>Do not interfere with the site, attempt unauthorized access, send malware, submit automated or misleading signups or reports, impersonate someone, or use the site unlawfully. We may limit access when needed to protect the site or its users.</p>
    </>,
  },
  {
    id: "feedback", title: "Reports and feedback", body: <>
      <p>If you send a bug report, idea, or other feedback, you give CatchThat a nonexclusive, worldwide, royalty-free right to use and adapt it to investigate issues and to develop, improve, and promote the game. You keep any rights you already have in your submission. Please do not send material you are not allowed to share.</p>
      <p>We handle personal information in submissions as described in the <Link href="/privacy">Privacy Policy</Link>. Sending feedback does not sign you up for email updates.</p>
    </>,
  },
  {
    id: "steam", title: "Other services", body: <>
      <p>This site does not currently sell the game or offer subscriptions or free trials. If the game becomes available through Steam, Steam’s purchase, refund, account, and platform rules will apply to that transaction, along with any game license presented at release. You can read the <a href="https://store.steampowered.com/subscriber_agreement/">Steam Subscriber Agreement</a> on Steam’s site.</p>
    </>,
  },
  {
    id: "availability", title: "Availability and liability", body: <>
      <p>We may change or discontinue the site or its preview features. The site and its content are provided “as is” and “as available” to the extent permitted by law. We do not guarantee uninterrupted access, a release date, or that development information will remain current.</p>
      <p>To the extent permitted by law, CatchThat LLC and its people are not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the site, including lost data or profits. Nothing here limits rights or liability that cannot lawfully be limited.</p>
    </>,
  },
  {
    id: "disputes", title: "Disputes", body: <>
      <p>Washington law governs these terms unless the law where you live must apply. Before filing a formal claim, please contact <a href="mailto:sause@catchthat.io">sause@catchthat.io</a> and give us a reasonable chance to resolve it.</p>
      <p>Except for small claims, intellectual property disputes, and requests for urgent injunctive relief, disputes about these terms or the site will be resolved by binding, individual arbitration under the American Arbitration Association’s applicable consumer rules. Neither side may bring a class or representative claim to the extent permitted by law. If arbitration does not apply, state or federal courts in King County, Washington will have jurisdiction, subject to any mandatory law that gives you another venue.</p>
    </>,
  },
  {
    id: "updates", title: "Changes and contact", body: <>
      <p>We may update these terms as the site changes. The date above shows the latest version. Continued use after an update means you accept it unless applicable law requires another process. If one part cannot be enforced, the rest still applies.</p>
      <p>CatchThat LLC<br /><a href="mailto:sause@catchthat.io">sause@catchthat.io</a><br />25452 SE 42nd St, Issaquah, WA 98029, USA</p>
    </>,
  },
];

export default function TermsPage() {
  return <LegalDocument title="Terms of Use" updated="September 25, 2026" sections={sections} />;
}
