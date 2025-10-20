import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addEmail = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();

    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", q => q.eq("email", normalizedEmail))
      .unique();

    if (existing) {
      return existing._id;
    }

    const id = await ctx.db.insert("waitlist", {
      email: normalizedEmail,
      name: args.name,
      phone: args.phone,
    });
    return id;
  },
});


