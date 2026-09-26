# CatchThat Football site

Next.js site for the public CatchThat Football teaser, a feature-flagged release-site preview, email signup, and game-report intake.

## Run locally

```sh
npm install
npm run dev
```

Use `.env.example` as the reference for local switches. This workspace's ignored `.env.local` is configured for the raccoon development deployment. The teaser is the default at `/`.

```sh
npm run dev:preview  # teaser at /, release pages at /game
npm run dev:release  # release overview at /
```

The current local preview already has the flag enabled, so open `http://localhost:3000/game` to see the release site. In release phase the full navigation is visible and preview `noindex` is removed. The preview flag is a visibility switch, not authentication; anyone who knows the URL can view a preview while enabled.

`NEXT_PUBLIC_STEAM_URL` activates the Steam CTA. Without it, the site explicitly says the Steam page is coming soon.

## Publishing content

The journal index and article template are in `app/game/journal/`. Add an entry to `content/journal.ts`, keeping `published: false` until it is ready. Once published, the article appears in the journal and in `/game/journal/feed.xml`. The roadmap, design decisions, mechanics, and about copy live in their respective `app/game/` pages and can be expanded without changing the navigation.

## Convex connection

The site uses Convex for subscribers, raw game reports, and session heartbeats. The schema and mutations in `convex/` are deployed to development (`resolute-raccoon-990`) and production (`fantastic-crocodile-127`). Run `npx convex dev --once` to push local backend changes to development; run `npx convex deploy` to push them to production. The site's API routes require a server-only `CONVEX_SITE_SECRET` that matches the selected Convex deployment before they invoke a mutation.

The Vercel project `catchthat/catchthat-portfolio` has `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_SITE_SECRET` configured for Production, Preview, and Development. Production points to crocodile; Preview and Development point to raccoon. Local `.env.production.local` also names the production URL for local production builds. Environment-variable changes take effect on the next Vercel deployment. The website code in this workspace still needs a normal Git/Vercel deployment to make the new forms and API routes live.

Convex backend changes are currently pushed manually. For automatic backend deploys from Vercel, create a scoped production Convex deploy key in Vercel and set the build command to `npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`, following the [Convex Vercel guide](https://docs.convex.dev/production/hosting/vercel). Do not place the deploy key in `NEXT_PUBLIC_` variables or source control.

## Mailing list

The signup form saves an opt-in in Convex. When `RESEND_DELIVERY_ENABLED=true`, the API adds the address to the account's main Resend Contacts list and sends one welcome email from `Sam <sause@catchthat.io>`. The welcome email includes the company's public postal address, a visible `/unsubscribe` link, and one-click unsubscribe headers. Unsubscribing marks the contact unsubscribed in Resend and the Convex record. A new public signup does not override an unsubscribe. Resend Broadcasts can use the same contact list for later game updates. No separate segment is needed while this Resend account contains only CatchThat contacts.

The Resend API key is server-only. The local development key is in ignored `.env.local`; Vercel Production has the hidden `RESEND_API_KEY` secret and `RESEND_DELIVERY_ENABLED=true`. Delivery stays disabled for local development and Preview. Production delivery will start when this website code is published. `SITE_PUBLIC_URL` is set to `https://catchthat.io` for unsubscribe links. The sender domain `catchthat.io` must remain verified in Resend.

The `/privacy` and `/terms` pages are maintained in this repository and use the same visual system as CatchThat Football. They replace the old Termly embeds, which described the previous sports platform, social logins, direct purchases, subscriptions, and free trials. The new pages describe the actual website, email and report flows, the game under development, and a possible Steam storefront. Revisions to the legal pages now require a code change and deployment.

The signup route uses a hidden form field and an hourly limit of eight attempts per client IP, stored as a keyed hash in Convex. The Vercel IP headers supply the address; no raw IP is stored in the signup table. Keep Vercel's edge abuse controls available if public traffic warrants stronger protection. A subscriber's opt-in is not shared with game feedback.

See `docs/reporting.md` for the game intake contract and the work needed to drain the desktop queue.
