# Feedback intake foundation

This site owns `POST /api/v1/reports` for the desktop app's queued `QueuedReport` schema version 1 and `POST /api/v1/sessions` for eventual session heartbeats. The game contract is defined in `catchthat-football/desktop/src/shared/reportQueue.ts` and `catchthat-football/docs/design/feedback-pipeline.md`.

The public HTTP routes validate request shapes and call Convex with a server-only `CONVEX_SITE_SECRET`. The matching Convex mutations reject direct calls without that value. The HTTP routes themselves still need edge abuse protection before a wide public launch.

## Reports

The desktop app already writes reports to an offline queue. Each queued report has an id of the form `YYYY-MM-DDTHH-MM-SS-mmmZ-xxxxxxxx`, which is also its idempotency key. The endpoint accepts the exact JSON envelope. If the optional `Idempotency-Key` header is sent, it must equal `id`.

- `201 {"status":"stored"}`: first accepted copy.
- `200 {"status":"duplicate"}`: same report id was previously stored; the desktop can remove its queued copy.
- `400`: malformed envelope or mismatched key; client should surface the error rather than retry forever.
- `413`: report exceeds the current 750 KiB cap. Larger attachments need file storage before the desktop drain is enabled.
- `429`: more than 10 reports from one install id in 24 hours; retry later.
- `503`: Convex is disconnected or temporarily unavailable; keep the report on disk and retry with backoff.

The Convex mutation stores the raw JSON string unchanged and lifts only `reportId`, `installId`, build shas, kind, and receive time into indexed columns. It repeats validation and performs duplicate detection and rate limiting in one transaction. This is intake only: classification, clustering, replay against the engine SHA, triage digest, and the dashboard remain later pipeline stages. The current desktop build does **not** send queued reports; its drain needs to be added in that repository after intake storage and attachment limits are confirmed.

## Session denominator

`POST /api/v1/sessions` expects `session_id`, `install_id`, `app_sha`, and `engine_sha`. A stable `session_id` per launch makes retries idempotent; a successful call returns `202`. The desktop app has no heartbeat sender yet. The database holds one row per unique session id so per-build report rates can eventually use an actual session denominator.

## Operational boundary

The website and feedback intake need only Convex. Online leagues are a separate, later AWS-backed system; no league runtime or account model is coupled to this site. Before wider public traffic, add edge abuse protection and an attachment upload path for reports above 750 KiB.
