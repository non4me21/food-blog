import Link from "next/link"
import Image from "next/image"
import { db } from "@/db"
import { categories, recipes } from "@/db/schema"
import { eq, count, and, desc, isNotNull } from "drizzle-orm"
import CategoryCard from "@/app/components/CategoryCard"
import StatsCard from "@/app/components/StatsCard"

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
      categories.image_url,
      categories.display_order
    )
    .orderBy(categories.display_order, categories.name)
}

async function getHeroImages() {
  const rows = await db
    .select({ image_url: recipes.image_url })
    .from(recipes)
    .where(and(eq(recipes.published, true), isNotNull(recipes.image_url)))
    .orderBy(desc(recipes.published_at))
    .limit(3)
  return rows.map((r) => r.image_url as string)
}

async function getLatestRecipes() {
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
    .limit(2)
}

async function getStats() {
  const [recipeResult, categoryResult] = await Promise.all([
    db.select({ value: count() }).from(recipes).where(eq(recipes.published, true)),
    db.select({ value: count() }).from(categories),
  ])
  return {
    recipes: Number(recipeResult[0].value),
    categories: Number(categoryResult[0].value),
  }
}

export default async function HomePage() {
  const [categoriesData, heroImages, latestRecipes, stats] = await Promise.all([
    getCategoriesWithCount(),
    getHeroImages(),
    getLatestRecipes(),
    getStats(),
  ])

  const [featured, second] = latestRecipes

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-basil" aria-labelledby="hero-heading">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 lg:pt-20 lg:pb-44 grid grid-cols-1 lg:grid-cols-[2fr_2fr_1.6fr] gap-10 lg:gap-8 items-center">

          {/* Left: copy */}
          <div className="text-white order-1">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold tracking-widest uppercase text-white/60 mb-7 bg-white/10 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" aria-hidden="true" />
              Świeże i Oryginalne
            </span>
            <h1
              id="hero-heading"
              className="font-display text-5xl lg:text-6xl font-extrabold leading-[1.05] mb-6 tracking-tight"
            >
              Przepisy które{" "}
              <em className="not-italic text-gold brightness-125">ożywiają</em>{" "}
              kuchnię
            </h1>
            <p className="text-white/75 text-base lg:text-lg leading-relaxed max-w-sm">
              Starannie dobierana kolekcja przepisów — od szybkich kolacji po
              imponujące desery.
            </p>
          </div>

          {/* Center: 3 overlapping blob photos */}
          <div className="order-3 lg:order-2 relative h-[440px]" aria-hidden="true">
            {/* Back blob — top right */}
            <div
              className="absolute overflow-hidden shadow-xl blob-hover-self"
              style={{
                width: "240px", height: "240px",
                top: "0", right: "0",
                borderRadius: "70% 30% 50% 50% / 40% 60% 40% 60%",
              }}
            >
              {heroImages[1] ? (
                <Image src={heroImages[1]} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: "linear-gradient(135deg, var(--color-basil-dark), var(--color-basil))" }} />
              )}
            </div>

            {/* Front blob — center, largest */}
            <div
              className="absolute overflow-hidden shadow-2xl blob-hover-self"
              style={{
                width: "300px", height: "300px",
                top: "80px", left: "0",
                borderRadius: "55% 45% 60% 40% / 50% 55% 45% 50%",
                zIndex: 2,
              }}
            >
              {heroImages[0] ? (
                <Image src={heroImages[0]} alt="" fill priority fetchPriority="high" className="object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: "linear-gradient(135deg, var(--color-gold), var(--color-coral))" }} />
              )}
            </div>

            {/* Bottom blob — bottom right */}
            <div
              className="absolute overflow-hidden shadow-lg blob-hover-self"
              style={{
                width: "190px", height: "190px",
                bottom: "0", right: "10px",
                borderRadius: "40% 60% 35% 65% / 60% 40% 60% 40%",
                zIndex: 1,
              }}
            >
              {heroImages[2] ? (
                <Image src={heroImages[2]} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: "linear-gradient(135deg, var(--color-coral), var(--color-gold))" }} />
              )}
            </div>
          </div>

          {/* Right: CTAs */}
          <div className="order-2 lg:order-3 flex flex-col items-start lg:items-stretch gap-3">
            <Link
              href="/przepisy"
              className="inline-flex items-center justify-between gap-3 px-6 py-3.5 rounded-full bg-white text-basil-dark font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-basil"
            >
              Przeglądaj przepisy
              <ArrowRightIcon />
            </Link>
            <Link
              href="/przepis-z-ai"
              className="inline-flex items-center justify-between gap-3 px-6 py-3.5 rounded-full bg-basil-dark/50 border border-white/20 text-white font-semibold backdrop-blur-sm transition-all duration-200 hover:bg-basil-dark/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-basil"
            >
              Wyszukaj z AI
              <SparkleIcon size={18} />
            </Link>
            <div className="flex items-center gap-4 mt-1 text-white/45 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-white/40" aria-hidden="true" />
                100% własne
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-white/40" aria-hidden="true" />
                Sezonowe
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 leading-none" aria-hidden="true">
          <svg viewBox="0 0 1440 120" fill="var(--color-cream)" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16 md:h-24 lg:h-32">
            <path d="M0,80 C60,10 120,90 240,60 C360,30 420,100 540,70 C660,40 720,110 840,50 C960,0 1080,90 1200,60 C1320,30 1380,80 1440,50 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* ── Kategorie ── */}
      <section className="py-20" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <h2 id="categories-heading" className="font-display text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
                Wybierz swój klimat
              </h2>
              <p className="text-gray-500 text-base">Przefiltrowane według nastroju i pory dnia</p>
            </div>
            <Link href="/kategorie" className="shrink-0 inline-flex items-center gap-1.5 text-basil font-semibold hover:text-basil-dark transition-colors text-sm">
              Wszystkie kategorie
              <ArrowRightIcon />
            </Link>
          </div>

          {categoriesData.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Brak kategorii – wróć wkrótce.</p>
          ) : (
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriesData.map((cat, i) => (
                <li key={cat.id}>
                  <CategoryCard
                    slug={cat.slug}
                    name={cat.name}
                    description={cat.description}
                    image_url={cat.image_url}
                    recipeCount={Number(cat.recipeCount)}
                    index={i}
                    headingLevel={3}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Polecane — editorial bento ── */}
      {latestRecipes.length > 0 && (
        <section className="py-4 pb-20" aria-labelledby="featured-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex items-center gap-3 mb-8">
              <span className="h-px flex-1 bg-stone-200" aria-hidden="true" />
              <h2 id="featured-heading" className="font-display text-sm font-black tracking-widest uppercase text-gray-400">
                Ostatnio dodane
              </h2>
              <span className="h-px flex-1 bg-stone-200" aria-hidden="true" />
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-[210px]">

              {/* LEFT: Featured recipe — full image + SVG blob as text background, spans 2 rows */}
              {featured && (
                <Link
                  href={`/przepisy/${featured.slug}`}
                  className="group lg:col-span-7 lg:row-span-2 relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil"
                >
                  <div className="absolute inset-0">
                    {featured.image_url ? (
                      <Image
                        src={featured.image_url}
                        alt={featured.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100" />
                    )}
                  </div>
                  <div className="absolute inset-y-0 left-2 flex items-center">
                    <div
                      className="px-12 py-14 drop-shadow-lg"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='white' d='M25,30 C50,5 95,18 135,8 C165,-2 195,25 192,60 C189,90 175,105 185,135 C195,165 170,192 130,192 C95,192 80,175 50,182 C20,189 -5,165 2,130 C8,100 -5,80 5,55 C12,38 18,35 25,30Z'/%3E%3C/svg%3E")`,
                        backgroundSize: "100% 100%",
                      }}
                    >
                      {featured.categoryName && (
                        <span className="text-xs font-black tracking-widest uppercase text-basil mb-1.5 block">
                          {featured.categoryName}
                        </span>
                      )}
                      <h3 className="font-display text-xl lg:text-2xl font-extrabold text-gray-900 leading-tight tracking-tight mb-2">
                        {featured.title}
                      </h3>
                      <span className="inline-flex items-center gap-1.5 text-basil font-semibold text-sm group-hover:gap-2.5 transition-all">
                        Zobacz przepis
                        <ArrowRightIcon />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* TOP-RIGHT: Stats */}
              <StatsCard recipes={stats.recipes} categories={stats.categories} />

              {/* BOTTOM-RIGHT: Second recipe with description quote */}
              {second && (
                <Link
                  href={`/przepisy/${second.slug}`}
                  className="group lg:col-span-5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil"
                >
                  <div className="relative w-2/5 shrink-0">
                    {second.image_url ? (
                      <Image
                        src={second.image_url}
                        alt={second.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-50 to-rose-100" />
                    )}
                  </div>
                  <div className="flex-1 bg-cream p-5 flex flex-col justify-between min-w-0">
                    <div>
                      <span className="font-display text-3xl text-basil/20 leading-none select-none" aria-hidden="true">&ldquo;</span>
                      {second.description && (
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 -mt-2">
                          {second.description}
                        </p>
                      )}
                    </div>
                    <div>
                      {second.categoryName && (
                        <span className="text-xs font-black tracking-widest uppercase text-basil/70 block mb-1">
                          {second.categoryName}
                        </span>
                      )}
                      <h3 className="font-display text-base font-extrabold text-gray-900 leading-tight tracking-tight mb-2">
                        {second.title}
                      </h3>
                      <span className="inline-flex items-center gap-1.5 text-basil font-semibold text-xs group-hover:gap-2.5 transition-all">
                        Zobacz przepis
                        <ArrowRightIcon />
                      </span>
                    </div>
                  </div>
                </Link>
              )}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/przepisy"
                className="inline-flex items-center gap-2 text-basil font-semibold hover:text-basil-dark transition-colors text-sm"
              >
                Wszystkie przepisy
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── AI CTA ── */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ background: "linear-gradient(180deg, var(--color-cream) 0%, var(--color-cream-warm) 100%)" }}
        aria-labelledby="ai-cta-heading"
      >
        <div
          className="blob-float-alt absolute pointer-events-none"
          style={{ width: "450px", height: "450px", bottom: "-120px", right: "-80px", background: "var(--color-basil)", opacity: 0.06, filter: "blur(80px)", borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%" }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span
            className="w-14 h-14 flex items-center justify-center text-white shadow-lg bg-basil mx-auto mb-5"
            style={{ borderRadius: "50% 50% 30% 70% / 60% 40% 60% 40%" }}
            aria-hidden="true"
          >
            <SparkleIcon size={24} />
          </span>
          <p className="text-xs font-black tracking-widest uppercase text-basil mb-4">Zasilane przez AI</p>
          <h2 id="ai-cta-heading" className="font-display text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Nie możesz znaleźć<br />
            <span className="text-basil">tego, czego szukasz?</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            Opisz, na co masz ochotę — AI przeszuka dziesiątki tysięcy przepisów z całego świata i dobierze idealny dla Ciebie.
          </p>
          <Link
            href="/przepis-z-ai"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base bg-basil shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-basil"
          >
            <SparkleIcon size={18} />
            Wypróbuj Wyszukiwanie AI
          </Link>
          <p className="text-gray-400 text-sm mt-3">Bez rejestracji · Bezpłatne</p>
        </div>
      </section>
    </>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function SparkleIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" /></svg>
}
