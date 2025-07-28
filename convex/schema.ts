import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  favorites: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    imageId: v.string(),
    url: v.string(),
    thumb: v.optional(v.string()),
    alt: v.optional(v.string()),
    link: v.optional(v.string()),
    credit: v.optional(v.string()),
    creditUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user_image", ["userId", "provider", "imageId"]),
  searchCache: defineTable({
    key: v.string(),
    results: v.any(),
    timestamp: v.number(),
    expiresAt: v.number(),
    hitCount: v.number(),
  }).index("by_key", ["key"]),
  searchRequests: defineTable({
    userId: v.id("users"),
    timestamp: v.number(),
  }).index("by_user_time", ["userId", "timestamp"]),
});
