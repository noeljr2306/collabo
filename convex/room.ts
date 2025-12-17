import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 1. Mutation to create a room
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Generate a unique 6-character code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let roomCode = "";

    // Simple collision check: loop until we find a code that doesn't exist
    while (true) {
      roomCode = "";
      for (let i = 0; i < 6; i++) {
        roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const existing = await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("code", roomCode))
        .unique();

      if (!existing) break;
    }

    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      code: roomCode,
      hostId: identity.subject,
      language: "javascript", // Add this default
      content: "// Start coding...", // Add this default
      createdAt: Date.now(),
    });

    return { roomId, roomCode };
  },
});

// 2. Query to fetch rooms for the dashboard (Fixes the "Could not find" error)
export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    // If not logged in, return empty array instead of crashing
    if (!identity) return [];

    // Fetch rooms where the current user is the host
    return await ctx.db
      .query("rooms")
      .filter((q) => q.eq(q.field("hostId"), identity.subject))
      .collect();
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
  },
});
// convex/rooms.ts

export const updateContent = mutation({
  args: {
    id: v.id("rooms"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { content: args.content });
  },
});

export const updateLanguage = mutation({
  args: {
    id: v.id("rooms"),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { language: args.language });
  },
});
