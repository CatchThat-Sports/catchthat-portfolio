---
name: email-broadcast
description: Draft a CatchThat Football list email from a devlog entry or milestone, show Sam the preview and a test copy, and send or schedule it to the mailing list once Sam approves. Use when asked to write, preview, test, schedule, send or cancel a list email or broadcast.
---

# Email broadcasts

Every list email is a Markdown file in `content/emails/<slug>.md`, sent through
`npm run email`. Run commands from the site repo root.

## Draft

1. `npm run email -- new <slug>` (slug like `steam-page`, `demo-live`).
2. Read the source: the devlog entry in `content/journal.ts`, or the milestone
   Sam names. Pull facts from it; never invent features, dates or numbers.
3. Fill the front matter and body:

   ```
   ---
   subject: CatchThat Football has a Steam page
   preview: One line the inbox shows beside the subject.
   ---

   Hey —

   Short paragraphs. **Bold**, *italic*, [links](/game/journal).

   ## A heading

   - list items

   -> [One button](https://store.steampowered.com/app/...)

   ![Alt text](/og.png)

   — Sam
   ```

   Blocks are separated by blank lines. Site paths (`/game/journal`, `/og.png`)
   become absolute `https://www.catchthat.io` links; images must exist in `public/`
   or be absolute https URLs.

Voice: Sam writing to people who asked to hear about the game. First person,
plain, warm, specific; 150 to 300 words; one ask per email (wishlist, play the
demo, reply with an answer) and at most one button. No hype words, no countdown
pressure, no emoji strings. The subject says what happened, under 60 characters.

## Approve

1. `npm run email -- preview <slug>` opens the rendered email and prints the
   plain-text version. Show Sam the subject, preview line and text.
2. `npm run email -- test <slug>` sends one `[Test]` copy to sause@catchthat.io
   (`--to` for another address) so Sam can read it in a real inbox, phone included.
3. Revise until Sam approves. Approval is Sam's explicit yes in this session.

## Send

1. `npm run email -- send <slug>` is a dry run: it syncs production opt-ins into
   the "CatchThat Football" Resend segment and prints the subject, the recipient
   count and the time.
2. After Sam approves that summary: `npm run email -- send <slug> --yes`, or
   `--at "2026-11-17T09:00"` (local time) to schedule. Never pass `--yes`
   without that approval.
3. The command writes the broadcast id into the draft's front matter, which
   blocks a second send. Commit the draft and push.
4. `npm run email -- cancel <slug>` cancels a scheduled send and returns the
   file to a draft. `npm run email -- status` lists every draft and its state.

The sync step needs the Convex CLI logged in (it reads production opt-ins with
`npx convex run --prod`) and `RESEND_API_KEY` in `.env.local`.
