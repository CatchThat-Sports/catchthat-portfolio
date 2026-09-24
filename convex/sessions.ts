import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

/** One launch heartbeat per session id; repeat sends are idempotent. */
export const heartbeat = mutationGeneric({
  args: { sessionId: v.string(), installId: v.string(), appSha: v.string(), engineSha: v.string(), siteSecret: v.string() },
  returns: v.object({ status: v.union(v.literal("stored"), v.literal("duplicate")) }),
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SITE_SECRET || args.siteSecret !== process.env.CONVEX_SITE_SECRET) throw new Error("Unauthorized");
    const session = { sessionId: args.sessionId, installId: args.installId, appSha: args.appSha, engineSha: args.engineSha };
    const existing = await ctx.db.query("sessions").withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId)).first();
    if (existing) return { status: "duplicate" as const };
    await ctx.db.insert("sessions", { ...session, receivedAt: Date.now() });
    return { status: "stored" as const };
  },
});
