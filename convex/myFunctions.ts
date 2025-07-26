import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query:
export const listNumbers = query({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const numbers = await ctx.db
      .query("numbers")
      // Ordered by _creationTime, return most recent
      .order("desc")
      .take(args.count);
    const userId = await getAuthUserId(ctx);
    const user = userId === null ? null : await ctx.db.get(userId);
    return {
      viewer: user?.email ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  },
});

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    const id = await ctx.db.insert("numbers", { value: args.value });

    console.log("Added new document with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});

"use node";
export const searchImages = action({
  args: {
    query: v.string(),
    perProvider: v.optional(v.number()),
    page: v.optional(v.union(v.number(), v.string())), // allow 'last'
  },
  handler: async (ctx, args) => {
    const query = encodeURIComponent(args.query);
    const perProvider = args.perProvider ?? 20;
    let page = args.page ?? 1;

    // Read API keys from environment variables
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
    const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

    if (!UNSPLASH_ACCESS_KEY || !PEXELS_API_KEY || !PIXABAY_API_KEY) {
      throw new Error("Missing one or more image API keys in environment variables.");
    }

    // Helper to fetch total pages for each provider
    async function getTotalPages() {
      // Fetch first page with per_page=1 to get total counts
      const [unsplash, pexels, pixabay] = await Promise.all([
        fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=1&page=1`, {
          headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` as string },
        })
          .then(async (res) => (res.ok ? res.json() : { total: 0 }))
          .then((data) => Math.ceil((data.total || 0) / perProvider)),
        fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1&page=1`, {
          headers: { Authorization: String(PEXELS_API_KEY) },
        })
          .then(async (res) => (res.ok ? res.json() : { total_results: 0 }))
          .then((data) => Math.ceil((data.total_results || 0) / perProvider)),
        fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${query}&per_page=1&page=1`)
          .then(async (res) => (res.ok ? res.json() : { totalHits: 0 }))
          .then((data) => Math.ceil((data.totalHits || 0) / perProvider)),
      ]);
      return { unsplash, pexels, pixabay };
    }

    let lastPages = { unsplash: page, pexels: page, pixabay: page };
    if (page === 'last') {
      lastPages = await getTotalPages();
    }

    // Ensure page numbers are numbers for comparison
    const unsplashPage = typeof lastPages.unsplash === 'number' ? lastPages.unsplash : 1;
    const pexelsPage = typeof lastPages.pexels === 'number' ? lastPages.pexels : 1;
    const pixabayPage = typeof lastPages.pixabay === 'number' ? lastPages.pixabay : 1;

    // Fetch from Unsplash
    const unsplashPromise = fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=${perProvider}&page=${unsplashPage}`,
      {
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` as string },
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
        })),
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / perProvider)
      }))
      .catch((error) => ({
        images: [],
        total: 0,
        totalPages: 0
      }));

    // Fetch from Pexels
    const pexelsPromise = fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=${perProvider}&page=${pexelsPage}`,
      {
        headers: { Authorization: String(PEXELS_API_KEY) },
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
        })),
        total: data.total_results || 0,
        totalPages: Math.ceil((data.total_results || 0) / perProvider)
      }))
      .catch((error) => ({
        images: [],
        total: 0,
        totalPages: 0
      }));

    // Fetch from Pixabay
    const pixabayPromise = fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${query}&per_page=${perProvider}&page=${pixabayPage}`
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
        })),
        total: data.totalHits || 0,
        totalPages: Math.ceil((data.totalHits || 0) / perProvider)
      }))
      .catch((error) => ({
        images: [],
        total: 0,
        totalPages: 0
      }));

    // Wait for all
    const [unsplash, pexels, pixabay] = await Promise.all([
      unsplashPromise,
      pexelsPromise,
      pixabayPromise,
    ]);

    // Combine images and calculate totals
    const allImages = [...unsplash.images, ...pexels.images, ...pixabay.images];
    const totalImages = unsplash.total + pexels.total + pixabay.total;
    const maxTotalPages = Math.max(unsplash.totalPages, pexels.totalPages, pixabay.totalPages);

    // If we fetched 'last', set currentPage to max of lastPages
    const currentPage = page === 'last' ? maxTotalPages : (typeof page === 'number' ? page : 1);

    return {
      images: allImages,
      pagination: {
        currentPage,
        totalImages,
        totalPages: maxTotalPages,
        hasNextPage: typeof currentPage === 'number' ? currentPage < maxTotalPages : false,
        hasPrevPage: typeof currentPage === 'number' ? currentPage > 1 : false
      }
    };
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    // Prevent duplicate
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
