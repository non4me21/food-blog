import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { recipes, categories } from "@/db/schema"
import { and, eq, gte, inArray, lte } from "drizzle-orm"

const WINDOW_MS = 12 * 60 * 1000

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const windowStart = new Date(now.getTime() - WINDOW_MS)

  const newlyPublished = await db
    .select({ slug: recipes.slug, category_id: recipes.category_id })
    .from(recipes)
    .where(and(
      eq(recipes.published, true),
      gte(recipes.published_at, windowStart),
      lte(recipes.published_at, now),
    ))

  if (newlyPublished.length === 0) {
    return NextResponse.json({ revalidated: false, message: "Nothing to revalidate" })
  }

  const categoryIds = [...new Set(newlyPublished.map((r) => r.category_id).filter((id): id is number => id !== null))]
  const categorySlugs = categoryIds.length > 0
    ? (await db.select({ slug: categories.slug }).from(categories).where(inArray(categories.id, categoryIds))).map((r) => r.slug)
    : []

  revalidatePath("/")
  revalidatePath("/przepisy")
  revalidatePath("/sitemap.xml")
  revalidatePath("/rss.xml")
  for (const { slug } of newlyPublished) revalidatePath(`/przepisy/${slug}`)
  for (const slug of categorySlugs) revalidatePath(`/kategorie/${slug}`)

  return NextResponse.json({
    revalidated: true,
    recipes: newlyPublished.map((r) => r.slug),
    categories: categorySlugs,
  })
}
