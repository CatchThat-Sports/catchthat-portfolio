import assert from "node:assert/strict";
import test from "node:test";
import { lintDraft, parseDraft, renderEmail, RESEND_UNSUBSCRIBE, SITE_URL, writeMeta } from "./render.mjs";

const SOURCE = `---
subject: The game has a Steam page
preview: Wishlist it today
---

Hey — **big** week. The [roadmap](/game/roadmap) is up & running.

## What's new

- Scouting reports
- *Faster* sims

-> [Wishlist on Steam](https://store.steampowered.com/app/1)

![The field](/og.png)
`;

test("parses front matter and body", () => {
  const { meta, body } = parseDraft(SOURCE);
  assert.equal(meta.subject, "The game has a Steam page");
  assert.equal(meta.preview, "Wishlist it today");
  assert.ok(body.startsWith("Hey"));
});

test("renders blocks, absolute links and the broadcast unsubscribe tag", () => {
  const { html, text } = renderEmail(parseDraft(SOURCE));
  assert.ok(html.includes(`href="${SITE_URL}/game/roadmap"`));
  assert.ok(html.includes("<strong>big</strong>"));
  assert.ok(html.includes("up &amp; running"));
  assert.ok(html.includes("<em>Faster</em>"));
  assert.ok(html.includes(">Wishlist on Steam</a>"));
  assert.ok(html.includes(`src="${SITE_URL}/og.png"`));
  assert.ok(html.includes(RESEND_UNSUBSCRIBE));
  assert.ok(text.includes(`roadmap (${SITE_URL}/game/roadmap)`));
  assert.ok(text.includes("Wishlist on Steam: https://store.steampowered.com/app/1"));
  assert.ok(text.includes("- Faster sims"));
  assert.ok(text.includes("Issaquah"));
});

test("lint blocks placeholders and bad links", () => {
  const { errors } = lintDraft(parseDraft("---\nsubject: Hi\n---\n\nTODO: write it. [x](www.example.com)"));
  assert.equal(errors.length, 2);
  assert.deepEqual(lintDraft(parseDraft(SOURCE)).errors, []);
});

test("writeMeta records and clears send state", () => {
  const sent = writeMeta(SOURCE, { broadcast: "b_1", scheduledFor: "2026-11-17T17:00:00.000Z" });
  assert.equal(parseDraft(sent).meta.scheduledFor, "2026-11-17T17:00:00.000Z");
  const cleared = parseDraft(writeMeta(sent, { broadcast: undefined, scheduledFor: undefined }));
  assert.equal(cleared.meta.broadcast, undefined);
  assert.equal(cleared.meta.subject, "The game has a Steam page");
  assert.equal(cleared.body, parseDraft(SOURCE).body);
});
