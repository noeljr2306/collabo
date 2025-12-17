// convex/presence.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const update = mutation({
  args: { roomId: v.string(), userName: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const userId = identity.subject;

    // Check if presence record exists
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: Date.now() });
    } else {
      await ctx.db.insert("presence", {
        roomId: args.roomId,
        userId,
        userName: args.userName,
        lastSeen: Date.now(),
      });
    }
  },
});

export const list = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - 10000; // Users active in the last 10 seconds
    return await ctx.db
      .query("presence")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.gt(q.field("lastSeen"), cutoff))
      .collect();
  },
});
