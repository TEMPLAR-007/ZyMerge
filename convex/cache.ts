import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSearchCache = query({
    args: {
        key: v.string(),
    },
    handler: async (ctx, args) => {
        const cached = await ctx.db
            .query("searchCache")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .unique();
        return cached;
    },
});

export const setSearchCache = mutation({
    args: {
        key: v.string(),
        results: v.any(),
        timestamp: v.number(),
        expiresAt: v.number(),
        hitCount: v.number(),
    },
    handler: async (ctx, args) => {
        const cached = await ctx.db
            .query("searchCache")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .unique();
        if (cached) {
            await ctx.db.patch(cached._id, {
                results: args.results,
                timestamp: args.timestamp,
                expiresAt: args.expiresAt,
                hitCount: args.hitCount,
            });
        } else {
            await ctx.db.insert("searchCache", {
                key: args.key,
                results: args.results,
                timestamp: args.timestamp,
                expiresAt: args.expiresAt,
                hitCount: args.hitCount,
            });
        }
        return true;
    },
});

export const evictCache = mutation({
    args: {
        maxEntries: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Remove expired entries
        const now = Date.now();
        let expired = await ctx.db
            .query("searchCache")
            .filter((q) => q.lt(q.field("expiresAt"), now))
            .collect();
        for (const entry of expired) {
            await ctx.db.delete(entry._id);
        }
        // If maxEntries is set, keep only the newest maxEntries
        if (args.maxEntries) {
            const all = await ctx.db
                .query("searchCache")
                .order("desc")
                .collect();
            if (all.length > args.maxEntries) {
                for (const entry of all.slice(args.maxEntries)) {
                    await ctx.db.delete(entry._id);
                }
            }
        }
        return true;
    },
});

export const cacheStats = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("searchCache").collect();
        let totalSize = 0;
        for (const entry of all) {
            // Estimate size: JSON string length
            totalSize += JSON.stringify(entry).length;
        }
        return {
            count: all.length,
            approxBytes: totalSize,
            approxMB: totalSize / (1024 * 1024),
        };
    },
});

export const logUserSearchRequest = mutation({
    args: {
        userId: v.id("users"),
        timestamp: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("searchRequests", {
            userId: args.userId,
            timestamp: args.timestamp,
        });
        return true;
    },
});

export const countUserSearchRequests = query({
    args: {
        userId: v.id("users"),
        since: v.number(),
    },
    handler: async (ctx, args) => {
        const count = await ctx.db
            .query("searchRequests")
            .withIndex("by_user_time", (q) => q.eq("userId", args.userId).gt("timestamp", args.since))
            .collect();
        return { count: count.length };
    },
});