import type { Metadata } from "next"
import { db } from "@/db"
import { categories, recipes } from "@/db/schema"
import { eq, count, and } from "drizzle-orm"
import CategoryCard from "@/app/components/CategoryCard"
import { pluralPrzepis } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Kategorie",
  description: "Przeglądaj przepisy według kategorii na FlavourFind.",
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
    .leftJoin(
      recipes,
      and(eq(recipes.category_id, categories.id), eq(recipes.published, true))
    )
    .groupBy(
      categories.id,
      categories.name,
      categories.slug,
      categories.description,
      categories.image_url
    )
    .orderBy(categories.name)
}

export default async function CategoriesPage() {
  const allCategories = await getCategoriesWithCount()

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative py-16 lg:py-24 overflow-hidden bg-basil"
        aria-labelledby="categories-heading"
      >
        <div
          className="blob-float-alt absolute pointer-events-none"
          style={{
            width: "400px",
            height: "400px",
            top: "-100px",
            right: "-50px",
            background: "var(--color-gold)",
            opacity: 0.10,
            filter: "blur(80px)",
            borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1
            id="categories-heading"
            className="font-display text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight"
          >
            Kategorie
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Odkryj nasze starannie dobrane kolekcje przepisów i znajdź swoją
            następną kulinarną przygodę.
          </p>
          <p className="mt-4 text-white/50 text-sm font-medium">
            {allCategories.length}{" "}
            {allCategories.length === 1
              ? "kategoria"
              : allCategories.length % 10 >= 2 &&
                allCategories.length % 10 <= 4 &&
                (allCategories.length % 100 < 10 ||
                  allCategories.length % 100 >= 20)
              ? "kategorie"
              : "kategorii"}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 leading-none" aria-hidden="true">
          <svg
            viewBox="0 0 1440 120"
            fill="var(--color-cream)"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-12 md:h-20 lg:h-24"
          >
            <path d="M0,50 C120,100 280,0 420,60 C560,120 700,30 840,70 C980,110 1120,10 1280,55 C1370,80 1420,40 1440,60 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* ── Siatka kategorii ── */}
      <section className="py-16" aria-label="Lista kategorii">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allCategories.length === 0 ? (
            <p className="text-center text-gray-400 py-16 text-lg">
              Brak kategorii — wróć wkrótce.
            </p>
          ) : (
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCategories.map((cat, i) => (
                <li key={cat.id}>
                  <CategoryCard
                    slug={cat.slug}
                    name={cat.name}
                    description={cat.description}
                    image_url={cat.image_url}
                    recipeCount={Number(cat.recipeCount)}
                    index={i}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}

