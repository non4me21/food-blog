import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { db } from "@/db"
import { categories, recipes } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import RecipeCard from "@/app/components/RecipeCard"

type Props = { params: Promise<{ slug: string }> }

function pluralPrzepis(n: number): string {
  if (n === 1) return "1 przepis"
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return `${n} przepisy`
  return `${n} przepisów`
}

export async function generateStaticParams() {
  const allCategories = await db.select({ slug: categories.slug }).from(categories)
  return allCategories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}

  return {
    title: `Przepisy: ${category.name}`,
    description:
      category.description ??
      `Przeglądaj wszystkie przepisy z kategorii ${category.name} na FlavourFind.`,
    openGraph: {
      title: `${category.name} | FlavourFind`,
      description:
        category.description ??
        `Przeglądaj wszystkie przepisy z kategorii ${category.name} na FlavourFind.`,
      ...(category.image_url ? { images: [category.image_url] } : {}),
    },
  }
}

async function getCategoryBySlug(slug: string) {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1)
  return rows[0] ?? null
}

async function getRecipesByCategory(categoryId: number) {
  return db
    .select()
    .from(recipes)
    .where(and(eq(recipes.category_id, categoryId), eq(recipes.published, true)))
    .orderBy(desc(recipes.published_at))
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const categoryRecipes = await getRecipesByCategory(category.id)

  return (
    <>
      {/* ── Hero kategorii ── */}
      <section
        className="relative py-16 lg:py-24 overflow-hidden"
        style={{ backgroundColor: "#1e6020" }}
        aria-labelledby="category-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav aria-label="Ścieżka nawigacji" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-white/60" role="list">
              <li><Link href="/" className="hover:text-white transition-colors">Strona główna</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Kategorie</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white font-medium" aria-current="page">{category.name}</li>
            </ol>
          </nav>

          <h1 id="category-heading" className="text-4xl lg:text-5xl font-black text-white mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-white/80 text-lg max-w-2xl leading-relaxed">{category.description}</p>
          )}
          <p className="mt-4 text-white/60 text-sm font-medium">
            {pluralPrzepis(categoryRecipes.length)}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 leading-none" aria-hidden="true">
          <svg viewBox="0 0 1440 40" fill="white" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10">
            <path d="M0,40 C480,0 960,0 1440,40 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </section>

      {/* ── Siatka przepisów ── */}
      <section className="py-16 bg-white" aria-label={`Przepisy z kategorii ${category.name}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categoryRecipes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-4">Brak przepisów w tej kategorii.</p>
              <Link href="/" className="text-green-700 font-semibold hover:text-green-900 transition-colors">
                ← Powrót do strony głównej
              </Link>
            </div>
          ) : (
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryRecipes.map((recipe) => (
                <li key={recipe.id}>
                  <RecipeCard
                    slug={recipe.slug}
                    title={recipe.title}
                    description={recipe.description}
                    image_url={recipe.image_url}
                    difficulty={recipe.difficulty}
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
