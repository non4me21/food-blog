import type { MetadataRoute } from "next"
import { db } from "@/db"
import { recipes, categories } from "@/db/schema"
import { eq } from "drizzle-orm"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kacperje.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publishedRecipes, allCategories] = await Promise.all([
    db.select({ slug: recipes.slug }).from(recipes).where(eq(recipes.published, true)),
    db.select({ slug: categories.slug }).from(categories),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                         lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/przepisy`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/kategorie`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/przepis-z-ai`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ]

  const recipeRoutes: MetadataRoute.Sitemap = publishedRecipes.map((r) => ({
    url:             `${BASE_URL}/przepisy/${r.slug}`,
    lastModified:    new Date(),
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
