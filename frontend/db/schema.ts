import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const categories = pgTable("categories", {
  id:   serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
})

export const recipes = pgTable("recipes", {
  id:           serial("id").primaryKey(),
  slug:         text("slug").unique().notNull(),
  title:        text("title").notNull(),
  description:  text("description"),
  ingredients:  jsonb("ingredients").notNull().default([]),
  directions:   jsonb("directions").notNull().default([]),
  difficulty:   text("difficulty"),
  category_id:  integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  image_url:    text("image_url"),
  published:    boolean("published").default(false),
  published_at: timestamp("published_at", { withTimezone: true }),
  created_at:   timestamp("created_at", { withTimezone: true }).defaultNow(),
})
