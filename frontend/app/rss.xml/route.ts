import { db } from "@/db"
import { recipes, categories } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kacperje.com"

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const rows = await db
    .select({ recipe: recipes, category: categories })
    .from(recipes)
    .leftJoin(categories, eq(recipes.category_id, categories.id))
    .where(eq(recipes.published, true))
    .orderBy(desc(recipes.published_at))

  const items = rows
    .map(({ recipe, category }) => {
      const link    = `${BASE_URL}/przepisy/${recipe.slug}`
      const pubDate = (recipe.published_at ?? recipe.created_at ?? new Date()).toUTCString()
      const title   = escapeXml(recipe.title)
      const desc    = recipe.description ? `<description>${escapeXml(recipe.description)}</description>` : ""
      const cat     = category?.name ? `<category>${escapeXml(category.name)}</category>` : ""
      const image   = recipe.image_url
        ? `<enclosure url="${escapeXml(recipe.image_url)}" type="image/jpeg" length="0" />`
        : ""

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      ${desc}
      ${cat}
      ${image}
    </item>`
    })
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>kacperje – przepisy</title>
    <link>${BASE_URL}</link>
    <description>Blog z przepisami, które weszły do mojego życia na stałe.</description>
    <language>pl</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>1440</ttl>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type":  "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
