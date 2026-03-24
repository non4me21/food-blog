import type { Metadata } from "next"
import { db } from "@/db"
import { recipes, categories } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
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
        className="relative py-16 lg:py-24 overflow-hidden"
        style={{ backgroundColor: "#1e6020" }}
        aria-labelledby="recipes-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 id="recipes-heading" className="text-4xl lg:text-5xl font-black text-white mb-4">
            Wszystkie przepisy
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Nasza pełna kolekcja przepisów — od śniadań po kolacje.
          </p>
          <p className="mt-4 text-white/60 text-sm font-medium">
            {allRecipes.length} {allRecipes.length === 1 ? "przepis" : allRecipes.length % 10 >= 2 && allRecipes.length % 10 <= 4 && (allRecipes.length % 100 < 10 || allRecipes.length % 100 >= 20) ? "przepisy" : "przepisów"}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 leading-none" aria-hidden="true">
          <svg viewBox="0 0 1440 40" fill="white" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10">
            <path d="M0,40 C480,0 960,0 1440,40 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </section>

      {/* ── Siatka przepisów ── */}
      <section className="py-16 bg-white" aria-label="Lista przepisów">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allRecipes.length === 0 ? (
            <p className="text-center text-gray-400 py-16 text-lg">
              Brak przepisów — wróć wkrótce.
            </p>
          ) : (
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRecipes.map((recipe) => (
                <li key={recipe.slug}>
                  <RecipeCard
                    slug={recipe.slug}
                    title={recipe.title}
                    description={recipe.description}
                    image_url={recipe.image_url}
                    difficulty={recipe.difficulty}
                    categoryName={recipe.categoryName ?? undefined}
                    categorySlug={recipe.categorySlug ?? undefined}
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
