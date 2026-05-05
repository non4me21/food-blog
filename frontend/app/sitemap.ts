import type { MetadataRoute } from "next"
import { db } from "@/db"
import { recipes, categories } from "@/db/schema"
import { eq } from "drizzle-orm"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kacperje.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publishedRecipes, allCategories] = await Promise.all([
    db
      .select({ slug: recipes.slug, published_at: recipes.published_at, created_at: recipes.created_at })
      .from(recipes)
      .where(eq(recipes.published, true)),
    db.select({ slug: categories.slug }).from(categories),
  ])

  const latestRecipeDate = publishedRecipes.reduce<Date | null>((max, r) => {
    const date = r.published_at ?? r.created_at
    if (!date) return max
    return max === null || date > max ? date : max
  }, null) ?? new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                   lastModified: latestRecipeDate, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/przepisy`,     lastModified: latestRecipeDate, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/kategorie`,    lastModified: new Date(),       changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/przepis-z-ai`, lastModified: new Date(),       changeFrequency: "monthly", priority: 0.6 },
  ]

  const recipeRoutes: MetadataRoute.Sitemap = publishedRecipes.map((r) => ({
    url:             `${BASE_URL}/przepisy/${r.slug}`,
    lastModified:    r.published_at ?? r.created_at ?? new Date(),
    changeFrequency: "monthly" as const,
    priority:        0.8,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = allCategories.map((c) => ({
    url:             `${BASE_URL}/kategorie/${c.slug}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.7,
  }))

  return [...staticRoutes, ...recipeRoutes, ...categoryRoutes]
}
