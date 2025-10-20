import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBusinesses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("businesses").collect();
  },
});

export const getBusinessByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("businesses").filter((q) => q.eq(q.field("name"), args.name)).first();
  },
});

export const getBusinessBySlug = query({
  args: {
    slug: v.string(),
  },  
  handler: async (ctx, args) => {
    return await ctx.db.query("businesses").filter((q) => q.eq(q.field("slug"), args.slug)).first();
  },
});

export const updateBusiness = mutation({
  args: {
    business: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      email: v.optional(v.string()),
      slug: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const businesses = await ctx.db.query("businesses").collect();
    const baseForSlug = (args.business.slug ?? args.business.name) ?? "";
    const desiredSlug = baseForSlug
      ? baseForSlug.trim().toLowerCase().replace(/\s+/g, "-")
      : undefined;

    const existingBySlug = desiredSlug
      ? businesses.find((b) => b.slug === desiredSlug)
      : undefined;
    const existingByName = args.business.name
      ? businesses.find((b) => b.name === args.business.name)
      : undefined;
    const target = existingBySlug ?? existingByName;
    if (!target) {
      throw new Error("Business not found");
    }
    const normalizedSlug = (desiredSlug ?? target.slug)
      ? (desiredSlug ?? target.slug)!.replace(/-/g, "")
      : undefined;
    const update: Record<string, string | undefined> = {
      name: args.business.name,
      description: args.business.description,
      email: args.business.email,
      slug: normalizedSlug,
    };
    return await ctx.db.patch(target._id, update);
  },
});