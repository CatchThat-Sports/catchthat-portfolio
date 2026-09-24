import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

function assertSiteSecret(siteSecret: string) {
  if (!process.env.CONVEX_SITE_SECRET || siteSecret !== process.env.CONVEX_SITE_SECRET) throw new Error("Unauthorized");
}

export const join = mutationGeneric({
  args: { email: v.string(), source: v.union(v.literal("teaser"), v.literal("release")), unsubscribeToken: v.string(), actorHash: v.optional(v.string()), siteSecret: v.string() },
  returns: v.object({ ok: v.boolean(), suppressed: v.boolean(), rateLimited: v.optional(v.boolean()), unsubscribeToken: v.optional(v.string()), welcomeSentAt: v.optional(v.number()) }),
  handler: async (ctx, { email, source, unsubscribeToken, actorHash, siteSecret }) => {
    assertSiteSecret(siteSecret);
    const normalized = email.trim().toLowerCase();
    if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || unsubscribeToken.length < 32) {
      return { ok: false, suppressed: false };
    }
    if (actorHash) {
      const now = Date.now();
      const limit = await ctx.db.query("signupRateLimits").withIndex("by_actor", (q) => q.eq("actorHash", actorHash)).first();
      if (!limit) await ctx.db.insert("signupRateLimits", { actorHash, windowStart: now, count: 1 });
      else if (now - limit.windowStart >= 60 * 60 * 1000) await ctx.db.patch(limit._id, { windowStart: now, count: 1 });
      else if (limit.count >= 8) return { ok: false, suppressed: false, rateLimited: true };
      else await ctx.db.patch(limit._id, { count: limit.count + 1 });
    }
    const existing = await ctx.db.query("subscribers").withIndex("by_email", (q) => q.eq("email", normalized)).first();
    if (existing) {
      const token = existing.unsubscribeToken || unsubscribeToken;
      if (!existing.unsubscribeToken) await ctx.db.patch(existing._id, { unsubscribeToken: token });
      return { ok: true, suppressed: existing.status === "unsubscribed", unsubscribeToken: token, welcomeSentAt: existing.welcomeSentAt };
    }
    await ctx.db.insert("subscribers", { email: normalized, source, createdAt: Date.now(), status: "subscribed", unsubscribeToken });
    return { ok: true, suppressed: false, unsubscribeToken };
  },
});

export const resolveUnsubscribe = queryGeneric({
  args: { unsubscribeToken: v.string(), siteSecret: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { unsubscribeToken, siteSecret }) => {
    assertSiteSecret(siteSecret);
    const subscriber = await ctx.db.query("subscribers").withIndex("by_unsubscribe_token", (q) => q.eq("unsubscribeToken", unsubscribeToken)).first();
    return subscriber?.email ?? null;
  },
});

export const markUnsubscribed = mutationGeneric({
  args: { email: v.string(), siteSecret: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, { email, siteSecret }) => {
    assertSiteSecret(siteSecret);
    const subscriber = await ctx.db.query("subscribers").withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase())).first();
    if (subscriber && subscriber.status !== "unsubscribed") await ctx.db.patch(subscriber._id, { status: "unsubscribed" });
    return { ok: true };
  },
});

export const markWelcomeSent = mutationGeneric({
  args: { email: v.string(), siteSecret: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, { email, siteSecret }) => {
    assertSiteSecret(siteSecret);
    const subscriber = await ctx.db.query("subscribers").withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase())).first();
    if (subscriber && !subscriber.welcomeSentAt) await ctx.db.patch(subscriber._id, { welcomeSentAt: Date.now() });
    return { ok: true };
  },
});
