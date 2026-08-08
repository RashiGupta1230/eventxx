import { v } from "convex/values";
import { query } from "./_generated/server";

export const searchEvents = query({
    args: {
        query: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        if (!args.query || args.query.trim().length < 2) {
            return [];
        }

        const now = Date.now();
        const limit = Math.min(args.limit ?? 8, 25);

        return await ctx.db
            .query("events")
            .withSearchIndex("search_title", (q) => q.search("title", args.query))
            .filter(q => q.gt(q.field("startDate"), now)) // Only upcoming events
            .take(limit);
    },
});
