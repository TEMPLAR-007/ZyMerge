import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const searchImages: ReturnType<typeof action> = action({
  args: {
    query: v.string(),
    perProvider: v.optional(v.number()),
    page: v.optional(v.union(v.number(), v.string())), // allow 'last'
  },
  handler: async (ctx, args): Promise<any> => {
    "use node";

    // --- API rate limiting with rolling window and tiered limits ---
    const userId = await getAuthUserId(ctx);
    const now = Date.now();

    let searchCount = 0;
    let windowStart = 0;
    let windowEnd = 0;
    let hourlyLimit = 100; // Default limit for free users

    if (userId) {
      // Get user's tier and limits (for now, all users are free tier)
      // TODO: Implement premium tier detection based on subscription
      hourlyLimit = 100; // Free tier: 100 searches per hour

      // Get user's search window info
      const userWindow = await ctx.runQuery(api.cache.getUserSearchWindow, { userId });

      if (userWindow && userWindow.windowStart) {
        // Use existing rolling window
        windowStart = userWindow.windowStart;
        windowEnd = windowStart + (60 * 60 * 1000); // 1 hour window

        // If current time is past window end, reset the window
        if (now >= windowEnd) {
          windowStart = now;
          windowEnd = now + (60 * 60 * 1000);
          await ctx.runMutation(api.cache.setUserSearchWindow, {
            userId,
            windowStart: now
          });
        }
      } else {
        // First time user, create new window
        windowStart = now;
        windowEnd = now + (60 * 60 * 1000);
        await ctx.runMutation(api.cache.setUserSearchWindow, {
          userId,
          windowStart: now
        });
      }

      // Count searches from the current rolling window
      searchCount = (await ctx.runQuery(api.cache.countUserSearchRequests, {
        userId,
        since: windowStart
      })).count;
    }

    if (searchCount >= hourlyLimit) {
      throw new Error(`Rate limit exceeded: ${hourlyLimit} searches per hour`);
    }

    // Log this search
    if (userId) {
      await ctx.runMutation(api.cache.logUserSearchRequest, { userId, timestamp: now });
    }

    const rawQuery = args.query.toLowerCase().trim();
    const perProvider = args.perProvider ?? 20;
    const page = args.page ?? 1;
    const cacheKey = `search:${rawQuery}:${page}:${perProvider}`;

    // Check cache via query
    const cached: any = await ctx.runQuery(api.cache.getSearchCache, { key: cacheKey });
    if (cached && now < cached.expiresAt) {
      // Update hitCount in background (not blocking)
      await ctx.runMutation(api.cache.setSearchCache, {
        key: cacheKey,
        results: cached.results,
        timestamp: cached.timestamp,
        expiresAt: cached.expiresAt,
        hitCount: cached.hitCount + 1,
      });
      return cached.results;
    }

    const query = encodeURIComponent(args.query);

    async function getTotalPages() {
      const [unsplash, pexels, pixabay] = await Promise.all([
        fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=1&page=1`, {
          headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
        })
          .then(async (res) => (res.ok ? res.json() : { total: 0 }))
          .then((data) => Math.ceil((data.total || 0) / perProvider)),
        fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1&page=1`, {
          headers: { Authorization: String(process.env.PEXELS_API_KEY) },
        })
          .then(async (res) => (res.ok ? res.json() : { total_results: 0 }))
          .then((data) => Math.ceil((data.total_results || 0) / perProvider)),
        fetch(`https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${query}&per_page=1&page=1`)
          .then(async (res) => (res.ok ? res.json() : { totalHits: 0 }))
          .then((data) => Math.ceil((data.totalHits || 0) / perProvider)),
      ]);
      return { unsplash, pexels, pixabay };
    }

    let lastPages = { unsplash: page, pexels: page, pixabay: page };
    if (page === 'last') {
      lastPages = await getTotalPages();
    }

    const unsplashPage = typeof lastPages.unsplash === 'number' ? lastPages.unsplash : 1;
    const pexelsPage = typeof lastPages.pexels === 'number' ? lastPages.pexels : 1;
    const pixabayPage = typeof lastPages.pixabay === 'number' ? lastPages.pixabay : 1;

    const unsplashPromise = fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=${perProvider}&page=${unsplashPage}`,
      {
        headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
      }
    )
      .then(async (res: Response) => {
        if (!res.ok) {
          throw new Error(`Unsplash API error: ${res.status} ${res.statusText}`);
        }
        return await res.json();
      })
      .then((data: any) => ({
        images: (data.results || []).map((img: any) => ({
          provider: "unsplash",
          id: img.id,
          url: img.urls?.regular || img.urls?.full,
          thumb: img.urls?.small || img.urls?.thumb,
          alt: img.alt_description || img.description || "",
          link: img.links?.html,
          credit: img.user?.name || "Unknown",
          creditUrl: img.user?.links?.html || "",
        })),
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / perProvider)
      }))
      .catch(() => ({
        images: [],
        total: 0,
        totalPages: 0
      }));

    const pexelsPromise = fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=${perProvider}&page=${pexelsPage}`,
      {
        headers: { Authorization: String(process.env.PEXELS_API_KEY) },
      }
    )
      .then(async (res: Response) => {
        if (!res.ok) {
          throw new Error(`Pexels API error: ${res.status} ${res.statusText}`);
        }
        return await res.json();
      })
      .then((data: any) => ({
        images: (data.photos || []).map((img: any) => ({
          provider: "pexels",
          id: img.id,
          url: img.src?.large2x || img.src?.large,
          thumb: img.src?.medium || img.src?.small,
          alt: img.alt || "",
          link: img.url,
          credit: img.photographer || "Unknown",
          creditUrl: img.photographer_url || "",
        })),
        total: data.total_results || 0,
        totalPages: Math.ceil((data.total_results || 0) / perProvider)
      }))
      .catch(() => ({
        images: [],
        total: 0,
        totalPages: 0
      }));

    const pixabayPromise = fetch(
      `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${query}&per_page=${perProvider}&page=${pixabayPage}`
    )
      .then(async (res: Response) => {
        if (!res.ok) {
          throw new Error(`Pixabay API error: ${res.status} ${res.statusText}`);
        }
        return await res.json();
      })
      .then((data: any) => {
        // Debug: Log the first image to see the structure
        if (data.hits && data.hits.length > 0) {
          console.log("Pixabay first image structure:", {
            id: data.hits[0].id,
            webformatURL: data.hits[0].webformatURL,
            largeImageURL: data.hits[0].largeImageURL,
            imageURL: data.hits[0].imageURL,
            previewURL: data.hits[0].previewURL,
            tags: data.hits[0].tags,
            user: data.hits[0].user
          });

          // Debug: Check what URLs are being mapped
          const mappedImage = {
            provider: "pixabay",
            id: data.hits[0].id,
            url: data.hits[0].webformatURL || data.hits[0].largeImageURL || data.hits[0].imageURL,
            thumb: data.hits[0].previewURL || data.hits[0].webformatURL || data.hits[0].largeImageURL,
            alt: data.hits[0].tags || data.hits[0].user || "Pixabay Image",
            link: data.hits[0].pageURL,
            credit: data.hits[0].user || "Unknown",
            creditUrl: `https://pixabay.com/users/${data.hits[0].user}-${data.hits[0].user_id}/`,
          };
          console.log("Pixabay mapped image:", mappedImage);
        }

        return {
          images: (data.hits || []).map((img: any) => ({
            provider: "pixabay",
            id: img.id,
            url: img.webformatURL || img.largeImageURL || img.imageURL,
            thumb: img.previewURL || img.webformatURL || img.largeImageURL,
            alt: img.tags || img.user || "Pixabay Image",
            link: img.pageURL,
            credit: img.user || "Unknown",
            creditUrl: `https://pixabay.com/users/${img.user}-${img.user_id}/`,
          })),
          total: data.totalHits || 0,
          totalPages: Math.ceil((data.totalHits || 0) / perProvider)
        };
      })
      .catch(() => ({
        images: [],
        total: 0,
        totalPages: 0
      }));

    const [unsplash, pexels, pixabay] = await Promise.all([
      unsplashPromise,
      pexelsPromise,
      pixabayPromise,
    ]);

    const allImages = [...unsplash.images, ...pexels.images, ...pixabay.images];

    // Simplified pagination for Load More functionality
    const currentPage = typeof page === 'number' ? page : 1;
    const hasNextPage = currentPage < Math.max(unsplash.totalPages, pexels.totalPages, pixabay.totalPages);

    const results = {
      images: allImages,
      pagination: {
        currentPage,
        totalImages: allImages.length,
        hasNextPage,
        // Add provider-specific info for better context
        providerStats: {
          unsplash: { count: unsplash.images.length, total: unsplash.total },
          pexels: { count: pexels.images.length, total: pexels.total },
          pixabay: { count: pixabay.images.length, total: pixabay.total }
        }
      },
      // Add rate limit information with fixed window
      rateLimit: {
        used: searchCount + 1, // +1 for this current search
        limit: hourlyLimit,
        resetTime: windowEnd // Next hour boundary
      }
    };

    const expiresAt = now + 5 * 60 * 1000;
    await ctx.runMutation(api.cache.setSearchCache, {
      key: cacheKey,
      results,
      timestamp: now,
      expiresAt,
      hitCount: cached ? cached.hitCount + 1 : 1,
    });

    return results;
  },
});

export const addFavorite = mutation({
  args: {
    provider: v.string(),
    imageId: v.string(),
    url: v.string(),
    thumb: v.optional(v.string()),
    alt: v.optional(v.string()),
    link: v.optional(v.string()),
    credit: v.optional(v.string()),
    creditUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_image", (q) =>
        q.eq("userId", userId).eq("provider", args.provider).eq("imageId", args.imageId)
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("favorites", {
      userId,
      provider: args.provider,
      imageId: args.imageId,
      url: args.url,
      thumb: args.thumb,
      alt: args.alt,
      link: args.link,
      credit: args.credit,
      creditUrl: args.creditUrl,
      createdAt: Date.now(),
    });
  },
});

export const removeFavorite = mutation({
  args: {
    provider: v.string(),
    imageId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_image", (q) =>
        q.eq("userId", userId).eq("provider", args.provider).eq("imageId", args.imageId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});

export const listFavorites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("favorites")
      .withIndex("by_user_image", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getUserSearchCount = query({
  args: {},
  returns: v.object({
    count: v.number(),
    limit: v.number(),
    tier: v.string(),
    timeUntilReset: v.union(v.object({
      minutes: v.number(),
      seconds: v.number(),
      totalSeconds: v.number()
    }), v.null())
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { count: 0, limit: 100, tier: "free", timeUntilReset: null };

    const now = Date.now();

    // Get user's tier and limits (for now, all users are free tier)
    // TODO: Implement premium tier detection based on subscription
    const userTier = "free";
    const hourlyLimit = 100; // Free tier: 100 searches per hour

    // Get user's search window info
    const userWindow: any = await ctx.runQuery(api.cache.getUserSearchWindow, { userId });

    if (!userWindow || !userWindow.windowStart) {
      return { count: 0, limit: hourlyLimit, tier: userTier, timeUntilReset: null };
    }

    const windowStart: number = userWindow.windowStart;
    const windowEnd: number = windowStart + (60 * 60 * 1000); // 1 hour window

    // Get searches from the current rolling window
    const searchRequests: any[] = await ctx.db
      .query("searchRequests")
      .withIndex("by_user_time", (q) => q.eq("userId", userId).gte("timestamp", windowStart))
      .collect();

    // Calculate time until window reset
    const timeLeft: number = windowEnd - now;
    let timeUntilReset: any = null;

    if (searchRequests.length >= hourlyLimit) {
      const minutes = Math.floor(timeLeft / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      timeUntilReset = { minutes, seconds, totalSeconds: Math.floor(timeLeft / 1000) };
    }

    return {
      count: searchRequests.length,
      limit: hourlyLimit,
      tier: userTier,
      timeUntilReset
    };
  },
});

// Cleanup function to remove old search requests and windows
// This ensures we don't accumulate too much data while keeping enough for the rolling window
export const cleanupOldSearchRequests = internalMutation({
  args: {},
  handler: async (ctx) => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Clean up old search requests (older than 2 hours)
    const oldRequests = await ctx.db
      .query("searchRequests")
      .filter((q) => q.lt(q.field("timestamp"), twoHoursAgo))
      .collect();

    for (const request of oldRequests) {
      await ctx.db.delete(request._id);
    }

    // Clean up old user search windows (older than 24 hours)
    const oldWindows = await ctx.db
      .query("userSearchWindows")
      .filter((q) => q.lt(q.field("updatedAt"), oneDayAgo))
      .collect();

    for (const window of oldWindows) {
      await ctx.db.delete(window._id);
    }

    return {
      deletedRequests: oldRequests.length,
      deletedWindows: oldWindows.length
    };
  },
});
