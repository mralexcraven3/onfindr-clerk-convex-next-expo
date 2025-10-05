import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSubmittedBusinesses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("submittedBusinesses").collect();
  },
});

export const addSubmittedBusiness = mutation({
    args: {
        business: v.object({
            name: v.string(),
            email: v.string(),
            description: v.optional(v.string()),
            address: v.optional(v.string()),
            phone: v.optional(v.string()),
            openingTime: v.optional(v.string()),
            closingTime: v.optional(v.string()),
            website: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("submittedBusinesses", args.business);
    },
});
