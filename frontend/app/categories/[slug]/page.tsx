import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { db } from "@/db"
import { categories, recipes } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import RecipeCard from "@/app/components/RecipeCard"
import { pluralPrzepis } from "@/lib/utils"

type Props = { params: Promise<{ slug: string }> }

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
        className="relative py-16 lg:py-24 overflow-hidden bg-basil"
        aria-labelledby="category-heading"
      >
        {/* Subtle glow */}
        <div
          className="blob-float absolute pointer-events-none"
          style={{
            width: "350px",
            height: "350px",
            top: "-80px",
            right: "-60px",
            background: "var(--color-gold)",
            opacity: 0.10,
            filter: "blur(70px)",
            borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav aria-label="Ścieżka nawigacji" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-white/50" role="list">
              <li><Link href="/" className="hover:text-white transition-colors">Strona główna</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Kategorie</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white font-medium" aria-current="page">{category.name}</li>
            </ol>
          </nav>

          <h1
            id="category-heading"
            className="font-display text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight"
          >
            {category.name}
          </h1>
          {category.description && (
            <p className="text-white/80 text-lg max-w-2xl leading-relaxed">{category.description}</p>
          )}
          <p className="mt-4 text-white/50 text-sm font-medium">
            {pluralPrzepis(categoryRecipes.length)}
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
            <path d="M0,60 C160,110 320,20 480,70 C640,120 800,10 960,50 C1120,90 1280,25 1440,65 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* ── Siatka przepisów ── */}
      <section className="py-16" aria-label={`Przepisy z kategorii ${category.name}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categoryRecipes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-4">Brak przepisów w tej kategorii.</p>
              <Link href="/" className="text-basil font-semibold hover:text-basil-dark transition-colors">
                ← Powrót do strony głównej
              </Link>
            </div>
          ) : (
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryRecipes.map((recipe, i) => (
                <li key={recipe.id}>
                  <RecipeCard
                    slug={recipe.slug}
                    title={recipe.title}
                    description={recipe.description}
                    image_url={recipe.image_url}
                    difficulty={recipe.difficulty}
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
