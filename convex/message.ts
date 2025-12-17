// convex/messages.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: { roomId: v.string(), body: v.string(), userName: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    await ctx.db.insert("messages", {
      roomId: args.roomId,
      body: args.body,
      userId: identity.subject,
      userName: args.userName,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc") // Get newest messages first
      .take(50); // Limit to last 50 for MVP
  },
});
