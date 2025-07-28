import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getSearchCache, setSearchCache } from "./cache";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const searchImages: ReturnType<typeof action> = action({
  args: {
    query: v.string(),
    perProvider: v.optional(v.number()),
    page: v.optional(v.union(v.number(), v.string())), // allow 'last'
  },
  handler: async (ctx, args): Promise<any> => {
    "use node";
    // --- API rate limiting ---
    const userId = await getAuthUserId(ctx);
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    let searchCount = 0;
    if (userId) {
      searchCount = (await ctx.runQuery(api.cache.countUserSearchRequests, { userId, since: oneHourAgo })).count;
    }
    if (searchCount >= 30) {
      throw new Error("Rate limit exceeded: 30 searches per hour");
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
          url: img.urls?.regular,
          thumb: img.urls?.thumb,
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
          url: img.src?.large,
          thumb: img.src?.tiny,
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
      .then((data: any) => ({
        images: (data.hits || []).map((img: any) => ({
          provider: "pixabay",
          id: img.id,
          url: img.webformatURL,
          thumb: img.previewURL,
          alt: img.tags || "",
          link: img.pageURL,
          credit: img.user || "Unknown",
          creditUrl: `https://pixabay.com/users/${img.user}-${img.user_id}/`,
        })),
        total: data.totalHits || 0,
        totalPages: Math.ceil((data.totalHits || 0) / perProvider)
      }))
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
    const totalImages = unsplash.total + pexels.total + pixabay.total;
    const maxTotalPages = Math.max(unsplash.totalPages, pexels.totalPages, pixabay.totalPages);

    const currentPage = page === 'last' ? maxTotalPages : (typeof page === 'number' ? page : 1);

    const results = {
      images: allImages,
      pagination: {
        currentPage,
        totalImages,
        totalPages: maxTotalPages,
        hasNextPage: typeof currentPage === 'number' ? currentPage < maxTotalPages : false,
        hasPrevPage: typeof currentPage === 'number' ? currentPage > 1 : false
      }
    };
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes
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
