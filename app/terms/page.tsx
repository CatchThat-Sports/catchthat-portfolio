import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for the CatchThat Football website from CatchThat LLC.",
};

const sections: LegalSection[] = [
  {
    id: "agreement", title: "Agreement and scope", body: <>
      <p>These terms are an agreement between you and CatchThat LLC (“CatchThat,” “we,” or “us”) for use of catchthat.io and the content and features available on it. By using the site, you agree to these terms. If you do not agree, do not use the site.</p>
      <p>These terms cover the website. A future release of CatchThat Football may have separate game or storefront terms presented when you obtain it. Nothing on this site creates an account, a paid subscription, or a right to a game copy.</p>
    </>,
  },
  {
    id: "development", title: "A game in development", body: <>
      <p>CatchThat Football is an independent football simulation in development. The playable-looking scene on this site is an interactive preview, not a promise that a specific play, feature, or visual will appear in the released game. Journal posts, design notes, roadmaps, screenshots, and possible release timing are plans that may change.</p>
      <p>References to football or its rules do not mean that CatchThat Football is an official product of a professional sports league or team.</p>
    </>,
  },
  {
    id: "ownership", title: "Ownership and permitted use", body: <>
      <p>CatchThat and its licensors own the site, game concepts, software, text, graphics, names, marks, and other content, except material that belongs to its respective owner. You may browse the site and share links to its public pages for personal, noncommercial use. No ownership or other license is transferred to you by visiting the site.</p>
      <p>Do not copy, redistribute, sell, or use our content or marks to suggest endorsement without permission. Rights that cannot lawfully be restricted remain unaffected.</p>
    </>,
  },
  {
    id: "conduct", title: "Using the site responsibly", body: <>
      <p>Do not interfere with the site, attempt unauthorized access, send malware, submit automated or misleading signups and reports, impersonate someone else, or use the site in a way that violates law or another person’s rights. We may limit or block access when reasonably needed to protect the site or other users.</p>
    </>,
  },
  {
    id: "feedback", title: "Feedback and issue reports", body: <>
      <p>If you send a bug report, idea, or other feedback, you give CatchThat a nonexclusive, worldwide, royalty-free permission to use, reproduce, and adapt that submission to investigate issues and develop, improve, and promote CatchThat Football. You keep any rights you already have in your original submission. Do not include material you are not allowed to share or information you do not want us to receive.</p>
      <p>Our handling of personal information in submissions is described in the <Link href="/privacy">Privacy Policy</Link>. Sending feedback does not add you to the email updates list.</p>
    </>,
  },
  {
    id: "steam", title: "Steam and other services", body: <>
      <p>This site may link to a Steam page when one is available. The site does not currently take payment, offer a subscription, or provide a free trial. If you choose to acquire the game through Steam, Steam’s purchase, refund, account, and platform rules govern that transaction, along with any game license presented with the release. We do not control the operation or policies of third-party services.</p>
      <p>You can review the <a href="https://store.steampowered.com/subscriber_agreement/">Steam Subscriber Agreement</a> on Steam’s website.</p>
    </>,
  },
  {
    id: "availability", title: "Availability and disclaimers", body: <>
      <p>We may change, pause, or discontinue the site or any preview feature. We try to keep information accurate, but development content can become out of date. The site and its content are provided “as is” and “as available” to the extent permitted by law, without a guarantee of uninterrupted access, a release date, or fitness for a particular purpose.</p>
      <p>Nothing in these terms limits warranties or consumer rights that cannot lawfully be excluded.</p>
    </>,
  },
  {
    id: "liability", title: "Limits of liability", body: <>
      <p>To the extent permitted by law, CatchThat LLC and its people are not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the site, including loss of data or profits. Nothing here excludes liability that cannot lawfully be excluded or limits your non-waivable rights.</p>
    </>,
  },
  {
    id: "disputes", title: "Law and disputes", body: <>
      <p>Washington law governs these terms, except where the law of your home jurisdiction must apply. Before filing a formal claim, contact us at <a href="mailto:sause@catchthat.io">sause@catchthat.io</a> and give us a reasonable opportunity to resolve the issue informally.</p>
      <p>Except for claims that may be brought in small claims court and disputes about intellectual property rights or requests for urgent injunctive relief, disputes arising from these terms or the site will be resolved by binding arbitration administered by the American Arbitration Association under its applicable consumer rules. Arbitration is individual; neither side may bring a class or representative claim to the extent permitted by law. If arbitration does not apply to a particular dispute, the state or federal courts in King County, Washington will have jurisdiction, subject to mandatory law that gives you another venue.</p>
    </>,
  },
  {
    id: "updates", title: "Changes and contact", body: <>
      <p>We may revise these terms as the site and game evolve. The date above will identify the current version. Continued use after an updated version takes effect means you accept it, unless applicable law requires a different process. If part of these terms cannot be enforced, the remaining parts continue to apply.</p>
      <p>Questions can be sent to CatchThat LLC at <a href="mailto:sause@catchthat.io">sause@catchthat.io</a> or 25452 SE 42nd St, Issaquah, WA 98029, USA.</p>
    </>,
  },
];

export default function TermsPage() {
  return <LegalDocument
    kind="terms"
    title="Terms of use."
    description="The rules for using this site while CatchThat Football takes shape."
    updated="September 24, 2026"
    summary={<p>This is a development site for one football game. Browsing and feedback are welcome. The site does not sell the game or offer subscriptions; a future Steam listing will use Steam’s purchase terms.</p>}
    sections={sections}
  />;
}
