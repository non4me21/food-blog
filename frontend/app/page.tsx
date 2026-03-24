import Link from "next/link"
import Image from "next/image"
import { db } from "@/db"
import { categories, recipes } from "@/db/schema"
import { eq, count, and } from "drizzle-orm"

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
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return `${n} przepisy`
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

export default async function HomePage() {
  const categoriesData = await getCategoriesWithCount()

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#1e6020" }}
        aria-labelledby="hero-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <span className="inline-block px-4 py-1.5 rounded-full border border-white/30 text-xs font-bold tracking-widest uppercase text-white/80 mb-8">
              Świeże i Oryginalne
            </span>
            <h1
              id="hero-heading"
              className="text-5xl lg:text-6xl font-black leading-tight mb-6"
            >
              Smakuj{" "}
              <span style={{ color: "#f5b731" }}>Wyjątkowości</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-md">
              Odkryj świat smaków z naszą starannie dobieraną kolekcją przepisów.
              Od szybkich kolacji w tygodniu po imponujące desery –
              mamy wszystko, czego potrzebujesz w kulinarnej podróży.
            </p>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-green-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-green-800"
            >
              Znajdź swój ulubiony przepis
              <ArrowRightIcon />
            </Link>
          </div>

          <div className="hidden lg:flex justify-end relative h-72" aria-hidden="true">
            <div className="absolute top-0 right-4 w-56 h-44 rounded-2xl overflow-hidden shadow-2xl rotate-2 bg-amber-200">
              <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-400" />
            </div>
            <div className="absolute bottom-0 right-36 w-60 h-48 rounded-2xl overflow-hidden shadow-2xl -rotate-1 bg-orange-300">
              <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-400" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 leading-none" aria-hidden="true">
          <svg
            viewBox="0 0 1440 56"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-14"
          >
            <path d="M0,56 C480,0 960,0 1440,56 L1440,56 L0,56 Z" />
          </svg>
        </div>
      </section>

      {/* ── Kategorie ── */}
      <section className="py-20 bg-white" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="categories-heading" className="text-4xl font-black text-gray-900 mb-4">
              Przeglądaj Kategorie
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Odkryj nasze starannie dobrane kolekcje przepisów i znajdź swoją
              następną kulinarną przygodę
            </p>
          </div>

          {categoriesData.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              Brak kategorii – wróć wkrótce.
            </p>
          ) : (
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesData.map((cat, i) => {
                const accent = CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length]
                const count = Number(cat.recipeCount)
                return (
                  <li key={cat.id}>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white border border-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
                      aria-label={`${cat.name} – ${pluralPrzepis(count)}`}
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
                          {pluralPrzepis(count)}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ml-2 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: accent }}
                            aria-hidden="true"
                          >
                            <ArrowDiagonalIcon />
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
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

      {/* ── AI CTA ── */}
      <section className="py-20" style={{ backgroundColor: "#f0f7f0" }} aria-labelledby="ai-cta-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-5">
            <span
              className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: "#4a7c4e" }}
              aria-hidden="true"
            >
              <SparkleIconLg />
            </span>
          </div>
          <p className="text-xs font-black tracking-widest uppercase text-green-800 mb-4">
            Zasilane przez AI
          </p>
          <h2 id="ai-cta-heading" className="text-4xl font-black text-gray-900 mb-4">
            Nie możesz znaleźć tego, czego szukasz?
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Pozwól naszemu narzędziu AI wyszukiwać przepisy z całego świata.
            Opisz, na co masz ochotę, a my znajdziemy idealny przepis dla Ciebie.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: "#e8f5e9" }} aria-hidden="true">
                <GlobeIcon />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Globalne Przepisy</h3>
              <p className="text-gray-500 text-sm">
                Przeglądaj przepisy z każdego zakątka świata, od włoskich klasyków po azjatyckie fusion
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: "#fff3e0" }} aria-hidden="true">
                <ChefIcon />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Mądre Sugestie</h3>
              <p className="text-gray-500 text-sm">
                Nasz AI rozumie Twoje preferencje i podpowiada przepisy skrojone specjalnie dla Ciebie
              </p>
            </div>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg shadow-md hover:shadow-lg transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-700"
            style={{ backgroundColor: "#1e6020" }}
          >
            <SparkleIconSm />
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

function ArrowDiagonalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
    </svg>
  )
}

function SparkleIconLg() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" /></svg>
}

function SparkleIconSm() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" /></svg>
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e6020" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function ChefIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8531a" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6V13.87z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  )
}
