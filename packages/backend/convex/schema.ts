import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  businesses: defineTable({
    categories: v.optional(v.array(v.string())),
    createdAt: v.optional(v.string()),
    description: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    address: v.optional(v.string()),
	addressId: v.optional(v.string()),
    name: v.string(),
	slug: v.optional(v.string()),
	openingTime: v.optional(v.string()),
	closingTime: v.optional(v.string()),
    phone: v.optional(v.string()),
    rating: v.optional(v.float64()),
    updatedAt: v.optional(v.string()),
    website: v.optional(v.string()),
	
  }),
  categories: defineTable({
    createdAt: v.optional(v.string()),
    image: v.optional(v.string()),
    name: v.string(),
	  description: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
  }),
  users: defineTable({
	  clerkId:v.string(),
	  username: v.optional(v.string()),
    role: v.optional(v.string()),
    status: v.optional(v.string()),
	  fullname: v.optional(v.string()),
  }),
  addresses: defineTable({
    streetNumber: v.optional(v.string()),
    streetName: v.optional(v.string()),
    TownOrCity: v.optional(v.string()),
    Locality: v.optional(v.string()),
    Postcode: v.optional(v.string()),
    combinedAddress: v.optional(v.string()),
  }),
  submittedBusinesses: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    email: v.string(),
    openingTime: v.optional(v.string()),
    closingTime: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
  }),
  waitlist: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
  }),
});