import type { Metadata } from "next"
import { db } from "@/db"
import { recipes, categories } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import RecipeCard from "@/app/components/RecipeCard"

export const metadata: Metadata = {
  title: "Wszystkie przepisy",
  description: "Przeglądaj wszystkie przepisy na FlavourFind.",
}

async function getAllRecipes() {
  return db
    .select({
      slug: recipes.slug,
      title: recipes.title,
      description: recipes.description,
      image_url: recipes.image_url,
      difficulty: recipes.difficulty,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(recipes)
    .leftJoin(categories, eq(recipes.category_id, categories.id))
    .where(eq(recipes.published, true))
    .orderBy(desc(recipes.published_at))
}

export default async function RecipesPage() {
  const allRecipes = await getAllRecipes()

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative py-16 lg:py-24 overflow-hidden bg-basil"
        aria-labelledby="recipes-heading"
      >
        {/* Soft glow */}
        <div
          className="blob-float absolute pointer-events-none"
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
            id="recipes-heading"
            className="font-display text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight"
          >
            Wszystkie przepisy
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Nasza pełna kolekcja przepisów — od śniadań po kolacje.
          </p>
          <p className="mt-4 text-white/50 text-sm font-medium">
            {allRecipes.length}{" "}
            {allRecipes.length === 1
              ? "przepis"
              : allRecipes.length % 10 >= 2 &&
                allRecipes.length % 10 <= 4 &&
                (allRecipes.length % 100 < 10 || allRecipes.length % 100 >= 20)
              ? "przepisy"
              : "przepisów"}
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
            <path d="M0,70 C180,110 360,10 540,50 C720,90 900,20 1080,60 C1200,85 1320,30 1440,55 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* ── Siatka przepisów ── */}
      <section className="py-16" aria-label="Lista przepisów">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allRecipes.length === 0 ? (
            <p className="text-center text-gray-400 py-16 text-lg">
              Brak przepisów — wróć wkrótce.
            </p>
          ) : (
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allRecipes.map((recipe, i) => (
                <li key={recipe.slug}>
                  <RecipeCard
                    slug={recipe.slug}
                    title={recipe.title}
                    description={recipe.description}
                    image_url={recipe.image_url}
                    difficulty={recipe.difficulty}
                    categoryName={recipe.categoryName ?? undefined}
                    categorySlug={recipe.categorySlug ?? undefined}
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
