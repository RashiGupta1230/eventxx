import { v } from "convex/values";
import { query } from "./_generated/server";

export const getFeaturedEvents = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const limit = args.limit ?? 3;

        const events = await ctx.db
            .query("events")
            .withIndex("by_start_date", (q) => q.gte("startDate", now))
            .take(Math.max(limit * 8, 24));

        // Sort by registrations count for featured events
        const featured = events
            .sort((a, b) => b.registrationCount - a.registrationCount)
            .slice(0, limit);

        return featured;
    },
});

// Get events by Location (city, state)
export const getEventsByLocation = query({
    args: {
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const limit = args.limit ?? 4;

        if (args.city && args.state) {
            return await ctx.db
                .query("events")
                .withIndex("by_city_and_state_and_start_date", (q) =>
                    q
                        .eq("city", args.city)
                        .eq("state", args.state)
                        .gte("startDate", now)
                )
                .take(limit);
        }

        if (args.city) {
            const events = await ctx.db
                .query("events")
                .withIndex("by_start_date", (q) => q.gte("startDate", now))
                .take(Math.max(limit * 10, 50));

            return events
                .filter((event) => event.city === args.city)
                .slice(0, limit);
        }

        if (args.state) {
            return await ctx.db
                .query("events")
                .withIndex("by_state_and_start_date", (q) =>
                    q.eq("state", args.state).gte("startDate", now)
                )
                .take(limit);
        }

        return await ctx.db
            .query("events")
            .withIndex("by_start_date", (q) => q.gte("startDate", now))
            .take(limit);
    },
});

// Get Popular events (high registration count)
export const getPopularEvents = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const limit = args.limit ?? 6;

        const events = await ctx.db
            .query("events")
            .withIndex("by_start_date", (q) => q.gte("startDate", now))
            .take(Math.max(limit * 8, 48));

        // Sort by registrations count for popular events
        const popular = events
            .sort((a, b) => b.registrationCount - a.registrationCount)
            .slice(0, limit);

        return popular;
    }
});

// Get events by category
export const getEventsByCategory = query({
    args: {
        category: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const limit = args.limit ?? 12;

        return await ctx.db
            .query("events")
            .withIndex("by_category_and_start_date", (q) =>
                q.eq("category", args.category).gte("startDate", now)
            )
            .take(limit);
    },
});

// Get Category counts
export const getCategoryCounts = query({
    args: {},
    handler: async (ctx) => {
        const events = await ctx.db
            .query("events")
            .withIndex("by_start_date", (q) => q.gte("startDate", Date.now()))
            .take(500);

        // Count events by category
        const counts = {};
        events.forEach((event) => {
            counts[event.category] = (counts[event.category] || 0) + 1;
        });

        return counts;
    }
});
