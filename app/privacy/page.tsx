import type { Metadata } from "next";
import { LegalDocument, type LegalSection } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CatchThat LLC handles information for CatchThat Football.",
};

const sections: LegalSection[] = [
  {
    id: "scope", title: "About this policy", body: <>
      <p>CatchThat LLC runs catchthat.io and makes CatchThat Football. This policy covers the website, email updates, and game reports or session records sent to the site. Linked services, including Steam, have their own privacy policies.</p>
      <p>Features such as accounts and online leagues are still being planned. We will update this policy when those features are ready to collect information.</p>
    </>,
  },
  {
    id: "information", title: "Information we collect", body: <>
      <p>If you join the updates list, we store your email address, signup source and time, subscription status, welcome email status, and an unsubscribe token. We also use a keyed hash of your IP address to limit automated signups.</p>
      <p>A game report may include what you write, technical diagnostics, installation and report identifiers, and game and engine build identifiers. Session records include session, installation, and build identifiers. The current desktop build does not automatically upload queued reports.</p>
      <p>Our host, Vercel, processes basic request information such as IP address, browser information, pages requested, and request time. If you email us, we receive your message and reply address. The site does not currently offer accounts, checkout, or advertising trackers.</p>
    </>,
  },
  {
    id: "use", title: "How we use it", body: <>
      <p>We use this information to send requested updates, handle unsubscribes, investigate game issues, answer messages, and run and protect the site. Sending a game report does not add you to the updates list.</p>
      <p>Vercel hosts the site, Convex stores signup and report data, and Resend manages email contacts and sends updates. These providers process information for us. We do not sell personal information. They may process data outside your jurisdiction.</p>
    </>,
  },
  {
    id: "choices", title: "Your choices", body: <>
      <p>Update emails include an unsubscribe option. After you unsubscribe, we keep a limited record so you are not signed up again by mistake. You can also email us to leave the list.</p>
      <p>Depending on where you live, you may have rights to access, correct, delete, or receive a copy of your information, or object to some uses of it. Email <a href="mailto:sause@catchthat.io">sause@catchthat.io</a> with a request. We may need to verify your identity first.</p>
    </>,
  },
  {
    id: "retention", title: "Retention and security", body: <>
      <p>We keep information as long as needed for the purposes above, to honor an unsubscribe, or to meet legal obligations. You can ask us to review or delete information associated with you.</p>
      <p>We take reasonable steps to protect information, but no online service can guarantee complete security.</p>
    </>,
  },
  {
    id: "children", title: "Children", body: <>
      <p>The site and updates list are not intended for children under 13. If you believe a child has sent us information, please contact us.</p>
    </>,
  },
  {
    id: "changes", title: "Changes and contact", body: <>
      <p>We may update this policy as the site changes. The date above shows the latest version.</p>
      <p>CatchThat LLC<br /><a href="mailto:sause@catchthat.io">sause@catchthat.io</a><br />25452 SE 42nd St, Issaquah, WA 98029, USA</p>
    </>,
  },
];

export default function PrivacyPage() {
  return <LegalDocument title="Privacy Policy" updated="September 25, 2026" sections={sections} />;
}
