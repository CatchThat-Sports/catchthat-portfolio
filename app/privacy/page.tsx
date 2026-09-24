import type { Metadata } from "next";
import { LegalDocument, type LegalSection } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CatchThat LLC handles information for CatchThat Football.",
};

const sections: LegalSection[] = [
  {
    id: "scope", title: "Who we are and what this covers", body: <>
      <p>CatchThat LLC (“CatchThat,” “we,” or “us”) makes CatchThat Football and operates catchthat.io. This policy covers the website, its updates list, and game reports or session records sent to this site. It does not cover Steam or other services that have their own privacy policies.</p>
      <p>CatchThat Football is in development. If we add accounts, online leagues, purchases on this site, or other new data features, we will update this policy before those features launch.</p>
    </>,
  },
  {
    id: "information", title: "Information we collect", body: <>
      <h3>Updates list</h3>
      <p>When you enter an email address, we record the address, where the signup came from, when it was submitted, subscription status, and whether a welcome email was sent. We also keep an unsubscribe token so the link in an email can identify the subscription. To limit automated signups, we count attempts using a keyed hash derived from the visitor’s IP address.</p>
      <h3>Game reports and sessions</h3>
      <p>If the game sends a report, we receive the report text and notes you provide, its technical context, installation and report identifiers, and game and engine build identifiers. The report may include other diagnostic information in its submitted data. Session records contain a session identifier, installation identifier, and build identifiers. These reporting connections are being prepared; the current desktop build does not automatically upload its queued reports.</p>
      <h3>Website requests</h3>
      <p>Our hosting provider processes information needed to deliver and protect the site, such as IP address, browser and device information, requested pages, and request time. If you email us, we receive the contents of your message and your reply address.</p>
      <p>This site does not currently offer accounts, social sign-in, direct checkout, or advertising trackers.</p>
    </>,
  },
  {
    id: "use", title: "How we use it", body: <>
      <ul>
        <li>Send CatchThat Football news to people who request updates.</li>
        <li>Process unsubscribe requests and avoid sending to opted-out addresses.</li>
        <li>Investigate game issues, understand which builds are affected, and improve the game.</li>
        <li>Run and secure the site, prevent abuse, respond to requests, and meet applicable obligations.</li>
      </ul>
      <p>We do not use a game report as permission to add someone to the updates list.</p>
    </>,
  },
  {
    id: "providers", title: "Where information goes", body: <>
      <p>We use Vercel to host the website, Convex to store signup and game-report data, and Resend to manage email contacts and send updates. These providers process information for us to perform those functions. We do not sell personal information.</p>
      <p>Links to Steam and other external websites take you to services we do not control. Their own terms and privacy policies apply when you use them.</p>
    </>,
  },
  {
    id: "choices", title: "Your choices", body: <>
      <p>Every update email will offer an unsubscribe method. The link in our welcome email updates your status in Convex and Resend. We keep a limited suppression record after an opt-out so a repeated signup does not silently turn mail back on. You can also email us to request an unsubscribe.</p>
      <p>Depending on where you live, you may have rights to access, correct, delete, or receive a copy of information about you, or to object to certain processing. Email <a href="mailto:sause@catchthat.io">sause@catchthat.io</a> to make a request. We may need to verify that the request concerns your information.</p>
    </>,
  },
  {
    id: "retention", title: "Retention and security", body: <>
      <p>We keep information while it is needed for the purposes above, to maintain an opt-out record, or to meet applicable obligations. Unsubscribing stops updates; it does not automatically remove the minimal record used to honor that choice. Contact us if you want us to review or delete other information associated with you.</p>
      <p>We use reasonable technical and organizational measures to protect information. No internet service or storage system can be guaranteed completely secure. Our providers may process information in locations outside your own jurisdiction.</p>
    </>,
  },
  {
    id: "children", title: "Children", body: <>
      <p>The website and updates list are not directed to children under 13. Please do not submit an email address or game report if you are under 13. If you believe a child has given us information, contact us so we can review it.</p>
    </>,
  },
  {
    id: "changes", title: "Changes and contact", body: <>
      <p>We may revise this policy as the game and site change. The date at the top will show when it was last updated. Material changes may also be announced on the site or by email where appropriate.</p>
      <p>CatchThat LLC · <a href="mailto:sause@catchthat.io">sause@catchthat.io</a><br />25452 SE 42nd St, Issaquah, WA 98029, USA</p>
    </>,
  },
];

export default function PrivacyPage() {
  return <LegalDocument
    kind="privacy"
    title="Privacy policy."
    description="A clear account of what this site collects and why."
    updated="September 24, 2026"
    summary={<p>We use your email for requested game updates, technical reports to improve CatchThat Football, and basic request data to run the site. You can leave the email list at any time.</p>}
    sections={sections}
  />;
}
