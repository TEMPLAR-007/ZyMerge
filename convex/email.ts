import { v } from "convex/values";
import { action, mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Submit contact request and send email
export const submitContactRequest = action({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    requestedTier: v.union(v.literal("premium"), v.literal("pro")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; requestId: any; emailError?: boolean }> => {
    "use node";

    const userId = await getAuthUserId(ctx);
    const now = Date.now();

    // Store the contact request
    const requestId: any = await ctx.runMutation(internal.email.createContactRequest, {
      userId: userId || undefined,
      email: args.email,
      name: args.name,
      requestedTier: args.requestedTier,
      message: args.message,
      createdAt: now,
    });

    // Send email using Resend
    try {
      const { Resend } = await import('resend');

      if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not set');
        return { success: true, requestId, emailError: true };
      }

      const resend = new Resend(process.env.RESEND_API_KEY);

      const tierPrice = args.requestedTier === 'premium' ? '$9.99' : '$19.99';
      const tierFeatures = args.requestedTier === 'premium'
        ? '500 searches/hour, Priority support, Advanced filters'
        : '1000 searches/hour, API access, Bulk tools, Dedicated support';

      await resend.emails.send({
        from: 'ZyMerge <onboarding@resend.dev>', // Using Resend's sandbox domain for testing
        to: ['arefin.khan8364@gmail.com'], // Your correct email
        subject: `🚀 New ${args.requestedTier.charAt(0).toUpperCase() + args.requestedTier.slice(1)} Upgrade Request - ZyMerge`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #333; margin-bottom: 20px;">🎉 New Upgrade Request!</h1>

              <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #2563eb; margin: 0 0 10px 0;">
                  ${args.requestedTier === 'premium' ? '👑' : '⚡'} ${args.requestedTier.charAt(0).toUpperCase() + args.requestedTier.slice(1)} Plan Request
                </h2>
                <p style="margin: 0; color: #666; font-size: 16px;">${tierPrice}/month • ${tierFeatures}</p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #333; margin-bottom: 10px;">Customer Details:</h3>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${args.email}</p>
                ${args.name ? `<p style="margin: 5px 0;"><strong>Name:</strong> ${args.name}</p>` : ''}
                ${userId ? `<p style="margin: 5px 0;"><strong>User ID:</strong> ${userId}</p>` : '<p style="margin: 5px 0; color: #f59e0b;"><strong>Status:</strong> Not signed up yet</p>'}
              </div>

              ${args.message ? `
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #333; margin-bottom: 10px;">Message:</h3>
                  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
                    <p style="margin: 0; color: #555; font-style: italic;">"${args.message}"</p>
                  </div>
                </div>
              ` : ''}

              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #16a34a; margin: 0 0 10px 0;">🚀 Quick Actions:</h3>
                <p style="margin: 5px 0; color: #555;">1. Go to your Convex Dashboard</p>
                <p style="margin: 5px 0; color: #555;">2. Run <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">upgradeUserByEmail</code></p>
                <p style="margin: 5px 0; color: #555;">3. Use: <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">{"email": "${args.email}", "tier": "${args.requestedTier}"}</code></p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #666; font-size: 14px;">
                  Request submitted at ${new Date(now).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        `,
      });

      return { success: true, requestId };
    } catch (error) {
      console.error('Failed to send email:', error);
      // Still return success since we saved the request
      return { success: true, requestId, emailError: true };
    }
  },
});

// Internal mutation to create contact request
export const createContactRequest = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    email: v.string(),
    name: v.optional(v.string()),
    requestedTier: v.union(v.literal("premium"), v.literal("pro")),
    message: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactRequests", {
      userId: args.userId,
      email: args.email,
      name: args.name,
      requestedTier: args.requestedTier,
      message: args.message,
      status: "pending",
      createdAt: args.createdAt,
    });
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

    const requests = args.status
      ? await ctx.db
        .query("contactRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit)
      : await ctx.db
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

// Admin function to mark request as processed
export const markRequestProcessed = mutation({
  args: {
    requestId: v.id("contactRequests"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: "processed",
      processedAt: Date.now(),
    });

    return { success: true };
  },
});

