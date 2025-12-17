import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    userId: v.string(),
    isPro: v.boolean(), // ✅ add this
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
    // Change this from v.string() to v.optional(v.string())
    language: v.optional(v.string()),
  }).index("by_code", ["code"]),

  presence: defineTable({
    roomId: v.string(), // The 6-char room code or room ID
    userId: v.string(), // User's unique ID
    userName: v.string(),
    lastSeen: v.number(), // Timestamp
  }).index("by_room", ["roomId"]),

  // convex/schema.ts
  messages: defineTable({
    roomId: v.string(), // The 6-char room code
    userId: v.string(), // Clerk user ID
    userName: v.string(), // Sender's name
    body: v.string(), // Message content
    createdAt: v.number(), // Timestamp
  }).index("by_room", ["roomId"]),
});
