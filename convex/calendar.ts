import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getDayData = query({
  args: { year: v.number(), month: v.number(), day: v.number() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("calendarDays")
      .withIndex("by_year_month_day", (q) =>
        q.eq("year", args.year).eq("month", args.month).eq("day", args.day)
      )
      .unique();
    return doc ?? null;
  },
});

export const getMonthData = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("calendarDays")
      .withIndex("by_year_month_day", (q) =>
        q.eq("year", args.year).eq("month", args.month)
      )
      .collect();
    return docs;
  },
});

export const upsertDayData = mutation({
  args: {
    year: v.number(),
    month: v.number(),
    day: v.number(),
    color: v.optional(v.string()),
    assignments: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        description: v.string(),
      })
    ),
    ownerPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const expectedPassword = process.env.OWNER_PASSWORD ?? "jose";
    if (args.ownerPassword !== expectedPassword) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("calendarDays")
      .withIndex("by_year_month_day", (q) =>
        q.eq("year", args.year).eq("month", args.month).eq("day", args.day)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        color: args.color,
        assignments: args.assignments,
      });
    } else {
      await ctx.db.insert("calendarDays", {
        year: args.year,
        month: args.month,
        day: args.day,
        color: args.color,
        assignments: args.assignments,
      });
    }
    return null;
  },
});

export const setOwnerPassword = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ownerConfig")
      .withIndex("by_key", (q) => q.eq("key", "owner_password"))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.password });
    } else {
      await ctx.db.insert("ownerConfig", {
        key: "owner_password",
        value: args.password,
      });
    }
    return null;
  },
});

export const verifyOwnerPassword = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("ownerConfig")
      .withIndex("by_key", (q) => q.eq("key", "owner_password"))
      .unique();
    if (!config) return false;
    return config.value === args.password;
  },
});

export const hasOwnerPassword = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db
      .query("ownerConfig")
      .withIndex("by_key", (q) => q.eq("key", "owner_password"))
      .unique();
    return !!config;
  },
});
