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

  userSearchWindows: defineTable({
    userId: v.id("users"),
    windowStart: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  userSubscriptions: defineTable({
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("premium"), v.literal("pro")),
    status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("expired")),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_tier", ["tier"]),

  contactRequests: defineTable({
    userId: v.optional(v.id("users")),
    email: v.string(),
    name: v.optional(v.string()),
    requestedTier: v.union(v.literal("premium"), v.literal("pro")),
    message: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("processed"), v.literal("cancelled")),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  }).index("by_email", ["email"]).index("by_status", ["status"]),
});
