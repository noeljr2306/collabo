import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    userId: v.string(),
    isPro: v.boolean(),
  }).index("byUserId", ["userId"]),

  codeExecutions: defineTable({
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.string(),
    error: v.string(),
  }).index("byUserId", ["userId"]),

  rooms: defineTable({
    name: v.string(),
    code: v.string(),
    hostId: v.string(),
    createdAt: v.float64(),
    // kept as optional for backwards compatibility with existing rooms
    content: v.optional(v.string()),
    language: v.optional(v.string()),
  }).index("by_code", ["code"]),

  // Each file belongs to a room
  files: defineTable({
    roomId: v.string(), // The 6-char room code
    name: v.string(), // e.g. "main.java", "index.html"
    content: v.string(), // File content
    language: v.string(), // monaco language id e.g. "java", "javascript"
    isFolder: v.boolean(), // true = folder, false = file
    parentId: v.optional(v.string()), // parent file/folder id (null = root)
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_parent", ["roomId", "parentId"]),

  presence: defineTable({
    roomId: v.string(),
    userId: v.string(),
    userName: v.string(),
    lastSeen: v.number(),
  }).index("by_room", ["roomId"]),

  messages: defineTable({
    roomId: v.string(),
    userId: v.string(),
    userName: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_room", ["roomId"]),
});
