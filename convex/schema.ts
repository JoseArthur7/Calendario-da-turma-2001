import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  calendarDays: defineTable({
    year: v.number(),
    month: v.number(), // 1-12
    day: v.number(),
    color: v.optional(v.string()), // hex color
    assignments: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        description: v.string(),
      })
    ),
  }).index("by_year_month_day", ["year", "month", "day"]),

  ownerConfig: defineTable({
    key: v.string(), // "owner_password"
    value: v.string(),
  }).index("by_key", ["key"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
