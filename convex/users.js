import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication present");
        }

        // Check if we've already stored this identity before.
        // Note: If you don't want to define an index right away, you can use
        // ctx.db.query("users")
        //  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
        //  .unique();
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier),
            )
            .unique();
        const name = identity.name ?? "Anonymous";
        if (user !== null) {
            // If we've seen this identity before but the name has changed, patch the value.
            if (user.name !== name) {
                await ctx.db.patch(user._id, {
                    name,
                    updatedAt: Date.now(),
                });
            }
            return user._id;
        }
        // If it's a new identity, create a new `User`.
        return await ctx.db.insert("users", {
            name,
            tokenIdentifier: identity.tokenIdentifier,
            email: identity.email ?? "",
            imageUrl: identity.pictureUrl,
            hasCompletedOnboarding: false,
            freeEventCreated: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db.query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier),
            )
            .unique();
        if (!user) {
            return null;
        }
        return user;
    },
});

export const completeOnboarding = mutation({
    args: {
        location: v.object({
            city: v.string(),
            state: v.string(),
            country: v.string(),
        }),
        interests: v.array(v.string()), // min 3 categories
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call to completeOnboarding");
        }

        const user = await ctx.db.query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier),
            )
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            location: args.location,
            interests: args.interests,
            hasCompletedOnboarding: true,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});
