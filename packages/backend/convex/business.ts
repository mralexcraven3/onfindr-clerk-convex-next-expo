import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBusinesses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("businesses").collect();
  },
});
