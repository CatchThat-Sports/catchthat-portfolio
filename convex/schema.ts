import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  subscribers: defineTable({
    email: v.string(),
    source: v.union(v.literal("teaser"), v.literal("release")),
    createdAt: v.number(),
    status: v.union(v.literal("subscribed"), v.literal("unsubscribed")),
    unsubscribeToken: v.optional(v.string()),
    welcomeSentAt: v.optional(v.number()),
  }).index("by_email", ["email"]).index("by_unsubscribe_token", ["unsubscribeToken"]),
  signupRateLimits: defineTable({
    actorHash: v.string(),
    windowStart: v.number(),
    count: v.number(),
  }).index("by_actor", ["actorHash"]),
  reports: defineTable({
    reportId: v.string(),
    installId: v.string(),
    receivedAt: v.number(),
    raw: v.string(),
    appSha: v.string(),
    engineSha: v.optional(v.string()),
    kind: v.string(),
  })
    .index("by_report_id", ["reportId"])
    .index("by_install_received", ["installId", "receivedAt"])
    .index("by_app_sha", ["appSha"]),
  sessions: defineTable({
    sessionId: v.string(),
    installId: v.string(),
    appSha: v.string(),
    engineSha: v.string(),
    receivedAt: v.number(),
  }).index("by_session_id", ["sessionId"]).index("by_app_sha", ["appSha"]),
});
