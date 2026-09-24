import type { Metadata } from "next";
import { UnsubscribeForm } from "@/components/unsubscribe-form";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

export default function UnsubscribePage({ searchParams }: { searchParams: { token?: string } }) {
  const token = typeof searchParams.token === "string" ? searchParams.token : null;
  return <main className="unsubscribe-main page-shell">
    <div className="unsubscribe-card">
      <h1>Leave the list.</h1>
      <p>You won&apos;t get CatchThat Football updates.</p>
      <UnsubscribeForm token={token} />
    </div>
  </main>;
}
