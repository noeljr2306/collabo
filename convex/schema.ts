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
    content: v.optional(v.string()),
    language: v.optional(v.string()),
  }).index("by_code", ["code"]),

  files: defineTable({
    roomId: v.string(),
    name: v.string(),
    content: v.string(),
    language: v.string(),
    isFolder: v.boolean(),
    parentId: v.optional(v.string()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_parent", ["roomId", "parentId"]),

  // Enhanced presence with cursor + selection data
  presence: defineTable({
    roomId: v.string(),
    userId: v.string(),
    userName: v.string(),
    lastSeen: v.number(),
    color: v.optional(v.string()),
    isTyping: v.optional(v.boolean()),
    cursor: v.optional(
      v.object({
        fileId: v.string(),
        line: v.number(),
        column: v.number(),
      }),
    ),
    selection: v.optional(
      v.object({
        fileId: v.string(),
        startLine: v.number(),
        startColumn: v.number(),
        endLine: v.number(),
        endColumn: v.number(),
      }),
    ),
  }).index("by_room", ["roomId"]),

  messages: defineTable({
    roomId: v.string(),
    userId: v.string(),
    userName: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_room", ["roomId"]),
});
