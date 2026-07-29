import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── ROOM MUTATIONS ──────────────────────────────────────────────────────────

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let roomCode = "";

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
      createdAt: Date.now(),
    });

    // Seed with a default welcome file
    await ctx.db.insert("files", {
      roomId: roomCode,
      name: "index.js",
      content: "// Welcome to Collabo!\n// Start coding together.\n\nconsole.log('Hello, World!');\n",
      language: "javascript",
      isFolder: false,
      parentId: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { roomId, roomCode };
  },
});

export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
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

// ─── FILE QUERIES ─────────────────────────────────────────────────────────────

export const getFiles = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

export const getFileContent = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId);
  },
});

// ─── FILE MUTATIONS ───────────────────────────────────────────────────────────

export const createFile = mutation({
  args: {
    roomId: v.string(),
    name: v.string(),
    language: v.string(),
    isFolder: v.boolean(),
    parentId: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("files", {
      roomId: args.roomId,
      name: args.name,
      language: args.language,
      isFolder: args.isFolder,
      parentId: args.parentId,
      content: args.content ?? "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return fileId;
  },
});

export const updateFileContent = mutation({
  args: {
    fileId: v.id("files"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

export const updateContent = mutation({
  args: {
    id: v.id("rooms"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      content: args.content,
    });
  },
});

export const updateLanguage = mutation({
  args: {
    id: v.id("rooms"),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      language: args.language,
    });
  },
});

export const renameFile = mutation({
  args: {
    fileId: v.id("files"),
    name: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, {
      name: args.name,
      language: args.language,
      updatedAt: Date.now(),
    });
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    // Also delete all children if it's a folder
    const children = await ctx.db
      .query("files")
      .withIndex("by_room_parent", (q) =>
        q.eq("roomId", "").eq("parentId", args.fileId)
      )
      .collect();

    for (const child of children) {
      await ctx.db.delete(child._id);
    }

    await ctx.db.delete(args.fileId);
  },
});

export const deleteFilesByRoom = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    for (const file of files) {
      await ctx.db.delete(file._id);
    }
  },
});
