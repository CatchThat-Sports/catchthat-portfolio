"use client";

import { useState } from "react";

export function UnsubscribeForm({ token }: { token: string | null }) {
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function unsubscribe() {
    if (!token) return;
    setStatus("working");
    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Please try again.");
      setStatus("done");
      setMessage("You're unsubscribed.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  if (!token) return <p className="unsubscribe-status">This unsubscribe link is invalid.</p>;
  return <div className="unsubscribe-action">
    {status !== "done" && <button type="button" onClick={unsubscribe} disabled={status === "working"}>{status === "working" ? "Working…" : "Unsubscribe"}</button>}
    <p className="unsubscribe-status" role="status">{message}</p>
  </div>;
}
