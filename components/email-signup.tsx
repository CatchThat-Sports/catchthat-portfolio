"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Props = { source: "teaser" | "release"; ready?: boolean };

export function EmailSignup({ source, ready = false }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    if (!ready) {
      window.location.href = `mailto:sause@catchthat.io?subject=${encodeURIComponent("CatchThat Football updates")}&body=${encodeURIComponent(`Please add ${email.trim()} to the CatchThat Football updates list.`)}`;
      return;
    }
    setStatus("submitting");
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source, website: new FormData(event.currentTarget).get("website") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Please try again later.");
      setStatus("success");
      setMessage("You’re on the list. See you at kickoff.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Please try again later.");
    }
  }

  return (
    <>
      <form className="signup-form" onSubmit={submit}>
        <input className="signup-honeypot" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <label htmlFor={`email-${source}`} className="sr-only">Email address</label>
        <input id={`email-${source}`} type="email" autoComplete="email" required maxLength={254} placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} />
        <button type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Joining…" : ready ? "Join the list ↗" : "Request updates ↗"}</button>
      </form>
      <p className={`form-note ${status === "error" ? "error" : status === "success" ? "success" : ""}`} role="status">
        {message || (ready ? <>Updates coming soon. <Link href="/privacy">Privacy policy</Link>.</> : "Opens an email draft to request updates.")}
      </p>
    </>
  );
}
