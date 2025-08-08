import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import validator from "email-validator";

// Enhanced email validation using email-validator package
export const validateEmailForSignup = action({
  args: { email: v.string() },
  returns: v.object({
    isValid: v.boolean(),
    reason: v.optional(v.string()),
    suggestions: v.optional(v.array(v.string()))
  }),
  handler: async (_ctx, args) => {
    const email = args.email.toLowerCase();

    // Use email-validator package for comprehensive validation
    if (!validator.validate(email)) {
      return {
        isValid: false,
        reason: "Please enter a valid email address",
        suggestions: ["Make sure to include @ and a valid domain (e.g., .com, .org)"]
      };
    }

    // Check for disposable email domains
    const domain = email.split('@')[1];
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
      'yopmail.com', 'throwaway.email', 'temp-mail.org', 'fakeinbox.com',
      'sharklasers.com', 'getairmail.com', 'mailnesia.com', 'maildrop.cc',
      'mailmetrash.com', 'trashmail.com', 'mailnull.com', 'spam4.me',
      'bccto.me', 'chacuo.net', 'dispostable.com', 'mailnesia.com',
      'mailinator.net', 'mailinator2.com', 'mailinator3.com', 'mailinator4.com',
      'mailinator5.com', 'mailinator6.com', 'mailinator7.com', 'mailinator8.com',
      'mailinator9.com', 'mailinator10.com', 'mailinator11.com', 'mailinator12.com',
      'mailinator13.com', 'mailinator14.com', 'mailinator15.com', 'mailinator16.com',
      'mailinator17.com', 'mailinator18.com', 'mailinator19.com', 'mailinator20.com',
      'mailinator21.com', 'mailinator22.com', 'mailinator23.com', 'mailinator24.com',
      'mailinator25.com', 'mailinator26.com', 'mailinator27.com', 'mailinator28.com',
      'mailinator29.com', 'mailinator30.com', 'mailinator31.com', 'mailinator32.com',
      'mailinator33.com', 'mailinator34.com', 'mailinator35.com', 'mailinator36.com',
      'mailinator37.com', 'mailinator38.com', 'mailinator39.com', 'mailinator40.com',
      'mailinator41.com', 'mailinator42.com', 'mailinator43.com', 'mailinator44.com',
      'mailinator45.com', 'mailinator46.com', 'mailinator47.com', 'mailinator48.com',
      'mailinator49.com', 'mailinator50.com', 'mailinator51.com', 'mailinator52.com',
      'mailinator53.com', 'mailinator54.com', 'mailinator55.com', 'mailinator56.com',
      'mailinator57.com', 'mailinator58.com', 'mailinator59.com', 'mailinator60.com',
      'mailinator61.com', 'mailinator62.com', 'mailinator63.com', 'mailinator64.com',
      'mailinator65.com', 'mailinator66.com', 'mailinator67.com', 'mailinator68.com',
      'mailinator69.com', 'mailinator70.com', 'mailinator71.com', 'mailinator72.com',
      'mailinator73.com', 'mailinator74.com', 'mailinator75.com', 'mailinator76.com',
      'mailinator77.com', 'mailinator78.com', 'mailinator79.com', 'mailinator80.com',
      'mailinator81.com', 'mailinator82.com', 'mailinator83.com', 'mailinator84.com',
      'mailinator85.com', 'mailinator86.com', 'mailinator87.com', 'mailinator88.com',
      'mailinator89.com', 'mailinator90.com', 'mailinator91.com', 'mailinator92.com',
      'mailinator93.com', 'mailinator94.com', 'mailinator95.com', 'mailinator96.com',
      'mailinator97.com', 'mailinator98.com', 'mailinator99.com', 'mailinator100.com'
    ];

    const fakeDomains = ['test.com', 'example.com', 'fake.com', 'invalid.com', 'nonexistent.com'];

    if (disposableDomains.includes(domain)) {
      return {
        isValid: false,
        reason: "Disposable email addresses are not allowed. Please use a real email address.",
        suggestions: ["Use your personal or work email address"]
      };
    } else if (fakeDomains.includes(domain)) {
      return {
        isValid: false,
        reason: "Please use a real email address that you own.",
        suggestions: ["Use your actual email address, not a test domain"]
      };
    }

    return { isValid: true };
  }
});

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
      // Get user's subscription through query (actions can't access db directly)
      const subscription = await ctx.runQuery(api.myFunctions.getUserSubscription, {});
      const userTier = subscription?.tier || "free";

      switch (userTier) {
        case "premium":
          hourlyLimit = 500; // Premium: 500 searches per hour
          break;
        case "pro":
          hourlyLimit = 1000; // Pro: 1000 searches per hour
          break;
        default:
          hourlyLimit = 100; // Free: 100 searches per hour
      }

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

    // Ensure user has a subscription (will create free plan if needed)
    await ctx.runMutation(api.myFunctions.ensureUserSubscription, {});

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

    // Get user's subscription directly from database to avoid circular dependency
    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const userTier = subscription?.tier || "free";

    // Set limits based on tier
    let hourlyLimit: number;
    switch (userTier) {
      case "premium":
        hourlyLimit = 500; // Premium: 500 searches per hour
        break;
      case "pro":
        hourlyLimit = 1000; // Pro: 1000 searches per hour
        break;
      default:
        hourlyLimit = 100; // Free: 100 searches per hour
    }

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

// User subscription management
export const createUserSubscription = mutation({
  args: {
    userId: v.id("users"),
    tier: v.optional(v.union(v.literal("free"), v.literal("premium"), v.literal("pro"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if user already has a subscription
    const existing = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      return existing._id; // User already has a subscription
    }

    // Create free plan subscription by default
    const subscriptionId = await ctx.db.insert("userSubscriptions", {
      userId: args.userId,
      tier: args.tier || "free",
      status: "active",
      startDate: now,
      createdAt: now,
      updatedAt: now,
    });

    return subscriptionId;
  },
});

export const getUserSubscription = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    // If no subscription exists, return default free subscription info
    // The actual subscription will be created when user performs an action (mutation)
    if (!subscription) {
      return {
        tier: "free" as const,
        status: "active" as const,
        startDate: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    return subscription;
  },
});

export const upgradeUserSubscription = mutation({
  args: {
    tier: v.union(v.literal("premium"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();

    const existing = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        tier: args.tier,
        status: "active",
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new subscription
      return await ctx.db.insert("userSubscriptions", {
        userId,
        tier: args.tier,
        status: "active",
        startDate: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Function to ensure user has a subscription (called on first interaction)
export const ensureUserSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const existing = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) {
      // Create free subscription for new user
      const now = Date.now();
      await ctx.db.insert("userSubscriptions", {
        userId,
        tier: "free",
        status: "active",
        startDate: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    return existing;
  },
});

// Admin functions to view and manage user subscriptions
export const getAllUserSubscriptions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const subscriptions = await ctx.db
      .query("userSubscriptions")
      .order("desc")
      .take(limit);

    // Get user details for each subscription
    const subscriptionsWithUsers = await Promise.all(
      subscriptions.map(async (subscription) => {
        const user = await ctx.db.get(subscription.userId);
        return {
          ...subscription,
          user: user ? {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user._creationTime,
          } : null,
        };
      })
    );

    return subscriptionsWithUsers;
  },
});

export const getUsersByTier = query({
  args: {
    tier: v.union(v.literal("free"), v.literal("premium"), v.literal("pro")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const subscriptions = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_tier", (q) => q.eq("tier", args.tier))
      .order("desc")
      .take(limit);

    // Get user details for each subscription
    const usersWithSubscriptions = await Promise.all(
      subscriptions.map(async (subscription) => {
        const user = await ctx.db.get(subscription.userId);
        return {
          subscription,
          user: user ? {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user._creationTime,
          } : null,
        };
      })
    );

    return usersWithSubscriptions;
  },
});

export const getSubscriptionStats = query({
  args: {},
  handler: async (ctx) => {
    const allSubscriptions = await ctx.db.query("userSubscriptions").collect();

    const stats = {
      total: allSubscriptions.length,
      free: allSubscriptions.filter(s => s.tier === "free").length,
      premium: allSubscriptions.filter(s => s.tier === "premium").length,
      pro: allSubscriptions.filter(s => s.tier === "pro").length,
      active: allSubscriptions.filter(s => s.status === "active").length,
      cancelled: allSubscriptions.filter(s => s.status === "cancelled").length,
      expired: allSubscriptions.filter(s => s.status === "expired").length,
    };

    return {
      ...stats,
      percentages: {
        free: Math.round((stats.free / stats.total) * 100) || 0,
        premium: Math.round((stats.premium / stats.total) * 100) || 0,
        pro: Math.round((stats.pro / stats.total) * 100) || 0,
      },
    };
  },
});

export const searchUsersByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all users (since we can't directly search by email in the users table)
    const users = await ctx.db.query("users").collect();

    // Filter by email (case-insensitive partial match)
    const matchingUsers = users.filter(user =>
      user.email?.toLowerCase().includes(args.email.toLowerCase())
    );

    // Get subscription info for each matching user
    const usersWithSubscriptions = await Promise.all(
      matchingUsers.map(async (user) => {
        const subscription = await ctx.db
          .query("userSubscriptions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .unique();

        return {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user._creationTime,
          },
          subscription: subscription || {
            tier: "free",
            status: "active",
            startDate: Date.now(),
          },
        };
      })
    );

    return usersWithSubscriptions;
  },
});

// Admin function to manually change a user's subscription
export const adminUpdateUserSubscription = mutation({
  args: {
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("premium"), v.literal("pro")),
    status: v.optional(v.union(v.literal("active"), v.literal("cancelled"), v.literal("expired"))),
  },
  handler: async (ctx, args) => {
    // Note: In a real app, you'd want to add admin authentication here
    // const adminUserId = await getAuthUserId(ctx);
    // if (!isAdmin(adminUserId)) throw new Error("Unauthorized");

    const now = Date.now();

    const existing = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        tier: args.tier,
        status: args.status || "active",
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new subscription
      return await ctx.db.insert("userSubscriptions", {
        userId: args.userId,
        tier: args.tier,
        status: args.status || "active",
        startDate: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Admin function to create free subscriptions for all existing users
export const createSubscriptionsForAllUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all users
    const allUsers = await ctx.db.query("users").collect();

    let created = 0;
    let alreadyExists = 0;

    for (const user of allUsers) {
      // Check if user already has a subscription
      const existing = await ctx.db
        .query("userSubscriptions")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique();

      if (!existing) {
        // Create free subscription for user
        await ctx.db.insert("userSubscriptions", {
          userId: user._id,
          tier: "free",
          status: "active",
          startDate: now,
          createdAt: now,
          updatedAt: now,
        });
        created++;
      } else {
        alreadyExists++;
      }
    }

    return {
      totalUsers: allUsers.length,
      subscriptionsCreated: created,
      alreadyExisted: alreadyExists,
      message: `Created ${created} free subscriptions for existing users`
    };
  },
});

// Admin function to bulk upgrade users by email list
export const bulkUpgradeUsers = mutation({
  args: {
    emails: v.array(v.string()),
    tier: v.union(v.literal("premium"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];

    // Get all users to find matching emails
    const allUsers = await ctx.db.query("users").collect();

    for (const email of args.emails) {
      const user = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());

      if (!user) {
        results.push({ email, status: 'user_not_found' });
        continue;
      }

      // Update or create subscription
      const existing = await ctx.db
        .query("userSubscriptions")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          tier: args.tier,
          status: "active",
          updatedAt: now,
        });
        results.push({ email, status: 'upgraded', userId: user._id });
      } else {
        await ctx.db.insert("userSubscriptions", {
          userId: user._id,
          tier: args.tier,
          status: "active",
          startDate: now,
          createdAt: now,
          updatedAt: now,
        });
        results.push({ email, status: 'created_premium', userId: user._id });
      }
    }

    return {
      processed: args.emails.length,
      results,
      summary: {
        upgraded: results.filter(r => r.status === 'upgraded').length,
        created: results.filter(r => r.status === 'created_premium').length,
        notFound: results.filter(r => r.status === 'user_not_found').length,
      }
    };
  },
});

// Admin function to upgrade user by email (easier than finding user ID)
export const upgradeUserByEmail = mutation({
  args: {
    email: v.string(),
    tier: v.union(v.literal("premium"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find user by email
    const allUsers = await ctx.db.query("users").collect();
    const user = allUsers.find(u => u.email?.toLowerCase() === args.email.toLowerCase());

    if (!user) {
      throw new Error(`User with email ${args.email} not found`);
    }

    // Update or create subscription
    const existing = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        tier: args.tier,
        status: "active",
        updatedAt: now,
      });
      return {
        message: `✅ User ${args.email} upgraded to ${args.tier}`,
        userId: user._id,
        subscriptionId: existing._id
      };
    } else {
      const subscriptionId = await ctx.db.insert("userSubscriptions", {
        userId: user._id,
        tier: args.tier,
        status: "active",
        startDate: now,
        createdAt: now,
        updatedAt: now,
      });
      return {
        message: `✅ User ${args.email} upgraded to ${args.tier}`,
        userId: user._id,
        subscriptionId
      };
    }
  },
});

// Admin function to view contact requests
export const getContactRequests = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("processed"), v.literal("cancelled"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const requests = await ctx.db
      .query("contactRequests")
      .order("desc")
      .take(limit);

    // Get user details for each request
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        let user = null;
        if (request.userId) {
          user = await ctx.db.get(request.userId);
        }

        return {
          ...request,
          user: user ? {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user._creationTime,
          } : null,
        };
      })
    );

    return requestsWithUsers;
  },
});

// Get current user data
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    return user ? {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user._creationTime,
    } : null;
  },
});