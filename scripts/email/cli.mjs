import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";
import { lintDraft, parseDraft, renderEmail, SITE_URL, writeMeta } from "./render.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DRAFTS = join(ROOT, "content/emails");
const PREVIEWS = join(ROOT, ".email-preview");
const SEGMENT = "CatchThat Football";
const FROM = process.env.RESEND_FROM_EMAIL || "Sam <sause@catchthat.io>";
const REPLY_TO = "sause@catchthat.io";
const TEST_TO = process.env.EMAIL_TEST_TO || REPLY_TO;

const USAGE = `npm run email -- <command>

  new <slug>                 Start content/emails/<slug>.md
  preview <slug>             Render and open it in the browser
  test <slug> [--to addr]    Send one copy to yourself (default ${TEST_TO})
  sync                       Copy production opt-ins into the "${SEGMENT}" segment
  send <slug> [--at time]    Dry run: who it goes to and when
  send <slug> --yes [--at]   Send now, or schedule (--at "2026-11-17T09:00" local, or "in 2 hours")
  cancel <slug>              Cancel a scheduled send
  status                     Every draft and where it stands`;

const [command, slug, ...rest] = process.argv.slice(2);
const flag = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? undefined : rest[i + 1] && !rest[i + 1].startsWith("--") ? rest[i + 1] : true;
};
const pause = () => new Promise((done) => setTimeout(done, 600));

function fail(message) {
  console.error(message);
  process.exit(1);
}

function resend() {
  if (!process.env.RESEND_API_KEY) fail("RESEND_API_KEY is not set (expected in .env.local).");
  return new Resend(process.env.RESEND_API_KEY);
}

function unwrap(result, action) {
  if (result.error) fail(`Resend ${action} failed: ${result.error.name}: ${result.error.message}`);
  return result.data;
}

function draftPath(name) {
  if (!name || !/^[a-z0-9-]+$/.test(name)) fail("Give a draft slug: lowercase letters, digits and dashes.");
  return join(DRAFTS, `${name}.md`);
}

function loadDraft(name) {
  const path = draftPath(name);
  if (!existsSync(path)) fail(`No draft at ${path}. Start one with: npm run email -- new ${name}`);
  const source = readFileSync(path, "utf8");
  return { path, source, draft: parseDraft(source) };
}

function checkDraft(draft) {
  const { errors, warnings } = lintDraft(draft);
  for (const w of warnings) console.warn(`warning: ${w}`);
  if (errors.length) fail(errors.map((e) => `error: ${e}`).join("\n"));
}

async function segmentId(client, { create = false } = {}) {
  const found = unwrap(await client.segments.list(), "segment list").data.find((s) => s.name === SEGMENT);
  if (found) return found.id;
  if (!create) fail(`No "${SEGMENT}" segment yet. Run: npm run email -- sync`);
  const made = unwrap(await client.segments.create({ name: SEGMENT }), "segment create");
  console.log(`Created the "${SEGMENT}" segment.`);
  return made.id;
}

async function segmentContacts(client, id) {
  const contacts = [];
  let after;
  for (;;) {
    const page = unwrap(await client.contacts.list({ segmentId: id, limit: 100, ...(after ? { after } : {}) }), "contact list");
    contacts.push(...page.data);
    if (!page.has_more || !page.data.length) return contacts;
    after = page.data[page.data.length - 1].id;
    await pause();
  }
}

function productionOptIns() {
  const out = execFileSync("npx", ["convex", "run", "--prod", "signups:subscribedEmails"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
  const emails = JSON.parse(out.slice(out.indexOf("[")));
  if (!Array.isArray(emails)) fail("Unexpected reply from Convex.");
  return emails;
}

async function sync(client) {
  const id = await segmentId(client, { create: true });
  const optIns = productionOptIns();
  const inSegment = new Set((await segmentContacts(client, id)).map((c) => c.email.toLowerCase()));
  let added = 0;
  let skipped = 0;
  for (const email of optIns.filter((e) => !inSegment.has(e))) {
    await pause();
    const found = await client.contacts.get({ email });
    if (found.data?.unsubscribed) {
      skipped++;
      continue;
    }
    await pause();
    const result = found.data
      ? await client.contacts.segments.add({ email, segmentId: id })
      : await client.contacts.create({ email, unsubscribed: false, segments: [{ id }] });
    if (result.error && result.error.statusCode !== 409) fail(`Resend segment add failed: ${result.error.name}`);
    added++;
  }
  const recipients = (await segmentContacts(client, id)).filter((c) => !c.unsubscribed).length;
  console.log(`Opt-ins on the site: ${optIns.length}. Added to the segment: ${added}. Unsubscribed in Resend, left out: ${skipped}.`);
  console.log(`A broadcast now reaches ${recipients} ${recipients === 1 ? "person" : "people"}.`);
  return { id, recipients };
}

function resolveWhen(at) {
  if (!at || at === true) return null;
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return { scheduledAt: at, label: at };
  if (date.getTime() < Date.now() + 60_000) fail(`--at ${at} is not in the future.`);
  return { scheduledAt: date.toISOString(), label: date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" }) };
}

function openFile(path) {
  if (process.platform === "darwin") spawn("open", [path], { detached: true, stdio: "ignore" }).unref();
}

switch (command) {
  case "new": {
    const path = draftPath(slug);
    if (existsSync(path)) fail(`${path} already exists.`);
    mkdirSync(DRAFTS, { recursive: true });
    writeFileSync(path, "---\nsubject: \npreview: \n---\n\nTODO: write the email.\n");
    console.log(`Started ${path}`);
    break;
  }
  case "preview": {
    const { draft } = loadDraft(slug);
    checkDraft(draft);
    const email = renderEmail(draft, { unsubscribeUrl: `${SITE_URL}/unsubscribe` });
    mkdirSync(PREVIEWS, { recursive: true });
    const htmlPath = join(PREVIEWS, `${slug}.html`);
    writeFileSync(htmlPath, email.html);
    writeFileSync(join(PREVIEWS, `${slug}.txt`), `Subject: ${email.subject}\n\n${email.text}`);
    console.log(`Subject: ${email.subject}\nPreview: ${draft.meta.preview || "(none)"}\n\n${email.text}\nWrote ${htmlPath}`);
    if (!flag("no-open")) openFile(htmlPath);
    break;
  }
  case "test": {
    const { draft } = loadDraft(slug);
    checkDraft(draft);
    const to = typeof flag("to") === "string" ? flag("to") : TEST_TO;
    const email = renderEmail(draft, { unsubscribeUrl: `${SITE_URL}/unsubscribe` });
    const sent = unwrap(await resend().emails.send({ from: FROM, replyTo: REPLY_TO, to, subject: `[Test] ${email.subject}`, html: email.html, text: email.text }), "test send");
    console.log(`Test sent to ${to} (${sent.id}).`);
    break;
  }
  case "sync":
    await sync(resend());
    break;
  case "send": {
    const { path, source, draft } = loadDraft(slug);
    checkDraft(draft);
    if (draft.meta.broadcast) fail(`${slug} already went out as broadcast ${draft.meta.broadcast}. Cancel it first if it is only scheduled.`);
    const client = resend();
    const { id, recipients } = await sync(client);
    if (!recipients) fail("Nobody to send to.");
    const when = resolveWhen(flag("at"));
    const summary = `"${draft.meta.subject}" to ${recipients} ${recipients === 1 ? "person" : "people"}, ${when ? `scheduled for ${when.label}` : "right now"}`;
    if (flag("yes") !== true) {
      console.log(`\nDry run: would send ${summary}.\nRun again with --yes to send.`);
      break;
    }
    const email = renderEmail(draft);
    const created = unwrap(await client.broadcasts.create({
      segmentId: id, from: FROM, replyTo: REPLY_TO, name: slug, subject: email.subject, html: email.html, text: email.text,
      send: true, ...(when ? { scheduledAt: when.scheduledAt } : {}),
    }), "broadcast");
    const stamp = new Date().toISOString();
    writeFileSync(path, writeMeta(source, when ? { broadcast: created.id, scheduledFor: when.scheduledAt } : { broadcast: created.id, sentAt: stamp }));
    console.log(`${when ? "Scheduled" : "Sent"}: ${summary}. Broadcast ${created.id}, recorded in ${path}. Commit the draft so the record lands on main.`);
    break;
  }
  case "cancel": {
    const { path, source, draft } = loadDraft(slug);
    if (!draft.meta.broadcast) fail(`${slug} has no broadcast to cancel.`);
    if (!draft.meta.scheduledFor) fail(`${slug} was sent immediately; it cannot be cancelled.`);
    unwrap(await resend().broadcasts.cancel(draft.meta.broadcast), "cancel");
    writeFileSync(path, writeMeta(source, { broadcast: undefined, scheduledFor: undefined }));
    console.log(`Cancelled. ${slug} is a draft again.`);
    break;
  }
  case "status": {
    const files = existsSync(DRAFTS) ? readdirSync(DRAFTS).filter((f) => f.endsWith(".md")).sort() : [];
    if (!files.length) console.log("No drafts yet.");
    const client = files.some((f) => parseDraft(readFileSync(join(DRAFTS, f), "utf8")).meta.broadcast) ? resend() : null;
    for (const file of files) {
      const { meta } = parseDraft(readFileSync(join(DRAFTS, file), "utf8"));
      let state = "draft";
      if (meta.broadcast) {
        const b = unwrap(await client.broadcasts.get(meta.broadcast), "broadcast lookup");
        state = b.sent_at ? `sent ${b.sent_at}` : b.scheduled_at ? `scheduled ${b.scheduled_at}` : b.status;
        await pause();
      }
      console.log(`${file.replace(/\.md$/, "").padEnd(28)} ${state.padEnd(36)} ${meta.subject || "(no subject)"}`);
    }
    break;
  }
  default:
    console.log(USAGE);
}
