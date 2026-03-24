import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { db } from "@/db"
import { categories, recipes } from "@/db/schema"
import { eq, count, and } from "drizzle-orm"

export const metadata: Metadata = {
  title: "Kategorie",
  description: "Przeglądaj przepisy według kategorii na FlavourFind.",
}

const CATEGORY_ACCENTS = [
  "#f5b731",
  "#1e6020",
  "#e8531a",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
]

function pluralPrzepis(n: number): string {
  if (n === 1) return "1 przepis"
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return `${n} przepisy`
  return `${n} przepisów`
}

async function getCategoriesWithCount() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      image_url: categories.image_url,
      recipeCount: count(recipes.id),
    })
    .from(categories)
    .leftJoin(recipes, and(eq(recipes.category_id, categories.id), eq(recipes.published, true)))
    .groupBy(categories.id, categories.name, categories.slug, categories.description, categories.image_url)
    .orderBy(categories.name)
}

export default async function CategoriesPage() {
  const allCategories = await getCategoriesWithCount()

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative py-16 lg:py-24 overflow-hidden"
        style={{ backgroundColor: "#1e6020" }}
        aria-labelledby="categories-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 id="categories-heading" className="text-4xl lg:text-5xl font-black text-white mb-4">
            Kategorie
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Odkryj nasze starannie dobrane kolekcje przepisów i znajdź swoją następną kulinarną przygodę.
          </p>
          <p className="mt-4 text-white/60 text-sm font-medium">
            {allCategories.length} {allCategories.length === 1 ? "kategoria" : allCategories.length % 10 >= 2 && allCategories.length % 10 <= 4 && (allCategories.length % 100 < 10 || allCategories.length % 100 >= 20) ? "kategorie" : "kategorii"}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 leading-none" aria-hidden="true">
          <svg viewBox="0 0 1440 40" fill="white" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10">
            <path d="M0,40 C480,0 960,0 1440,40 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </section>

      {/* ── Siatka kategorii ── */}
      <section className="py-16 bg-white" aria-label="Lista kategorii">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allCategories.length === 0 ? (
            <p className="text-center text-gray-400 py-16 text-lg">
              Brak kategorii — wróć wkrótce.
            </p>
          ) : (
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCategories.map((cat, i) => {
                const accent = CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length]
                const n = Number(cat.recipeCount)
                return (
                  <li key={cat.id}>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white border border-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
                      aria-label={`${cat.name} – ${pluralPrzepis(n)}`}
                    >
                      <div className="relative h-48 overflow-hidden">
                        {cat.image_url ? (
                          <Image
                            src={cat.image_url}
                            alt={cat.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{ background: `linear-gradient(135deg, ${accent}28, ${accent}80)` }}
                          />
                        )}
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                          {pluralPrzepis(n)}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ml-2 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: accent }}
                            aria-hidden="true"
                          >
                            <ArrowDiagonalIcon />
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                            {cat.description}
                          </p>
                        )}
                        <div className="h-0.5 w-8 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}

function ArrowDiagonalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
    </svg>
  )
}
