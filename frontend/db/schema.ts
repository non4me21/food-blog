import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const recipes = pgTable("recipes", {
  id:           serial("id").primaryKey(),
  slug:         text("slug").unique().notNull(),
  title:        text("title").notNull(),
  description:  text("description"),
  ingredients:  jsonb("ingredients").notNull().default([]),
  directions:   jsonb("directions").notNull().default([]),
  prep_time:    integer("prep_time"),
  cook_time:    integer("cook_time"),
  cuisine:      text("cuisine"),
  category:     text("category"),
  tags:         text("tags").array().default([]),
  image_url:    text("image_url"),
  published:    boolean("published").default(false),
  published_at: timestamp("published_at", { withTimezone: true }),
  created_at:   timestamp("created_at", { withTimezone: true }).defaultNow(),
})
