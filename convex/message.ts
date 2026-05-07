import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: {
    roomId: v.string(),
    body: v.string(),
    userName: v.string(),
    userId: v.string(), // ← added: chat-panel passes this explicitly
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    await ctx.db.insert("messages", {
      roomId: args.roomId,
      body: args.body,
      userId: args.userId,
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
      .order("asc") // ← fixed: oldest first so chat reads top→bottom
      .take(50);
  },
});
