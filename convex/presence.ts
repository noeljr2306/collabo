import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const update = mutation({
  args: {
    roomId:   v.string(),
    userName: v.string(),
    color:    v.optional(v.string()),
    isTyping: v.optional(v.boolean()),
    cursor: v.optional(v.object({
      fileId: v.string(),
      line:   v.number(),
      column: v.number(),
    })),
    selection: v.optional(v.object({
      fileId:      v.string(),
      startLine:   v.number(),
      startColumn: v.number(),
      endLine:     v.number(),
      endColumn:   v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    const data = {
      roomId:    args.roomId,
      userId:    identity.subject,
      userName:  args.userName,
      lastSeen:  Date.now(),
      color:     args.color,
      isTyping:  args.isTyping ?? false,
      cursor:    args.cursor,
      selection: args.selection,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("presence", data);
    }
  },
});

export const list = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("presence")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    const cutoff = Date.now() - 15_000;
    return all.filter((u) => u.lastSeen > cutoff);
  },
});

export const leave = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    if (existing) await ctx.db.delete(existing._id);
  },
});