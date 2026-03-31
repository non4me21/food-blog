import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { db } from "@/db"
import { categories, recipes } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import ShareButton from "@/app/components/ShareButton"

type Props = { params: Promise<{ slug: string }> }

async function getRecipe(slug: string) {
  const rows = await db
    .select({ recipe: recipes, category: categories })
    .from(recipes)
    .leftJoin(categories, eq(recipes.category_id, categories.id))
    .where(and(eq(recipes.slug, slug), eq(recipes.published, true)))
    .limit(1)
  return rows[0] ?? null
}

export async function generateStaticParams() {
  const allRecipes = await db
    .select({ slug: recipes.slug })
    .from(recipes)
    .where(eq(recipes.published, true))
  return allRecipes.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getRecipe(slug)
  if (!result) return {}

  const { recipe, category } = result
  return {
    title: recipe.title,
    description: recipe.description ?? undefined,
    openGraph: {
      title: `${recipe.title} | FlavourFind`,
      description: recipe.description ?? undefined,
      type: "article",
      publishedTime: recipe.published_at?.toISOString(),
      ...(recipe.image_url ? { images: [recipe.image_url] } : {}),
      section: category?.name ?? undefined,
    },
  }
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params
  const result = await getRecipe(slug)
  if (!result) notFound()

  const { recipe, category } = result
  const ingredients = (recipe.ingredients ?? []) as string[]
  const directions = (recipe.directions ?? []) as string[]

  const DIFFICULTY_DOTS: Record<string, string> = {
    easy: "●○○", medium: "●●○", hard: "●●●",
    łatwy: "●○○", średni: "●●○", trudny: "●●●",
  }

  const DIFFICULTY_LABEL: Record<string, string> = {
    easy: "łatwy", medium: "średni", hard: "trudny",
    łatwy: "łatwy", średni: "średni", trudny: "trudny",
  }

  /* ── JSON-LD Schema.org Recipe ── */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description ?? undefined,
    image: recipe.image_url ?? undefined,
    datePublished: recipe.published_at?.toISOString(),
    inLanguage: "pl",
    recipeCategory: category?.name ?? undefined,
    recipeIngredient: ingredients,
    recipeInstructions: directions.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: step,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Zdjęcie główne z organiczną dolną krawędzią ── */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        {recipe.image_url ? (
          <Image src={recipe.image_url} alt={recipe.title} fill priority className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Organic bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 leading-none" aria-hidden="true">
          <svg
            viewBox="0 0 1440 80"
            fill="var(--color-cream)"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-8 md:h-12 lg:h-16"
          >
            <path d="M0,50 C200,80 400,10 600,40 C800,70 1000,15 1200,45 C1340,65 1400,30 1440,45 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ── Ścieżka nawigacji ── */}
        <nav aria-label="Ścieżka nawigacji" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-400" role="list">
            <li><Link href="/" className="hover:text-gray-600 transition-colors">Strona główna</Link></li>
            <li aria-hidden="true">/</li>
            {category && (
              <>
                <li>
                  <Link href={`/categories/${category.slug}`} className="hover:text-gray-600 transition-colors">
                    {category.name}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
              </>
            )}
            <li className="text-gray-700 font-medium" aria-current="page">{recipe.title}</li>
          </ol>
        </nav>

        {/* ── Nagłówek ── */}
        <header className="mb-8">
          {category && (
            <Link
              href={`/categories/${category.slug}`}
              className="text-xs font-bold uppercase tracking-widest text-basil hover:text-basil-dark transition-colors mb-3 inline-block"
            >
              {category.name}
            </Link>
          )}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-5 tracking-tight">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="text-gray-500 text-lg leading-relaxed mb-6">{recipe.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <dl className="flex flex-wrap gap-3">
              {recipe.difficulty && (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-basil/8 rounded-full text-sm font-medium text-basil-dark">
                  <DifficultyIcon />
                  <dt className="sr-only">Trudność</dt>
                  <dd className="relative group/diff font-mono tracking-widest cursor-default">
                    {DIFFICULTY_DOTS[recipe.difficulty] ?? recipe.difficulty}
                    <span className="ml-1 lg:hidden">{DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}</span>
                    <span className="hidden lg:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-gray-900 text-white text-xs font-mono font-medium whitespace-nowrap opacity-0 group-hover/diff:opacity-100 transition-opacity pointer-events-none">
                      {DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
            <ShareButton
              title={recipe.title}
              url={`/recipes/${recipe.slug}`}
            />
          </div>
        </header>

        <div className="h-px bg-stone-100 mb-10" role="separator" />

        {/* ── Składniki + Przygotowanie ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {ingredients.length > 0 && (
            <section className="lg:col-span-2" aria-labelledby="ingredients-heading">
              <h2 id="ingredients-heading" className="font-display text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span
                  className="w-7 h-7 flex items-center justify-center text-white text-xs font-black bg-basil"
                  style={{ borderRadius: "50% 50% 30% 70% / 60% 40% 60% 40%" }}
                  aria-hidden="true"
                >
                  <ListIcon />
                </span>
                Składniki
              </h2>
              <ul role="list" className="space-y-3" aria-label="Lista składników">
                {ingredients.map((item, i) => (
                  <li key={i} className="group flex items-start gap-3 text-gray-700 text-sm leading-relaxed">
                    <span
                      className="mt-1.5 w-2 h-2 shrink-0 bg-gold blob-on-hover"
                      style={{ borderRadius: "50% 50% 30% 70% / 60% 40% 60% 40%" }}
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {directions.length > 0 && (
            <section className="lg:col-span-3" aria-labelledby="directions-heading">
              <h2 id="directions-heading" className="font-display text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span
                  className="w-7 h-7 flex items-center justify-center text-white text-xs font-black bg-basil"
                  style={{ borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%" }}
                  aria-hidden="true"
                >
                  <StepsIcon />
                </span>
                Przygotowanie
              </h2>
              <ol role="list" className="space-y-6" aria-label="Kroki przygotowania">
                {directions.map((step, i) => (
                  <li key={i} className="group flex gap-4">
                    <span
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-sm font-black text-white mt-0.5 bg-basil blob-on-hover"
                      style={{ borderRadius: "50% 50% 30% 70% / 60% 40% 60% 40%" }}
                      aria-label={`Krok ${i + 1}`}
                    >
                      {i + 1}
                    </span>
                    <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {category && (
          <div className="mt-14 pt-8 border-t border-stone-100">
            <Link
              href={`/categories/${category.slug}`}
              className="inline-flex items-center gap-2 text-basil font-semibold hover:text-basil-dark transition-colors"
            >
              <ArrowLeftIcon />
              Więcej przepisów z kategorii {category.name}
            </Link>
          </div>
        )}
      </article>
    </>
  )
}

function DifficultyIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
}
function ListIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
}
function StepsIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
}
function ArrowLeftIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
}
