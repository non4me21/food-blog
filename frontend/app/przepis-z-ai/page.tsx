"use client"

import { useState } from "react"

const DIFFICULTY_DOTS: Record<string, string> = {
  easy: "●○○", medium: "●●○", hard: "●●●",
  łatwy: "●○○", średni: "●●○", trudny: "●●●",
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "łatwy", medium: "średni", hard: "trudny",
  łatwy: "łatwy", średni: "średni", trudny: "trudny",
}

type RecipeResult = {
  title: string
  description: string
  ingredients: string[]
  directions: string[]
  total_time: string
  difficulty: string
}

export default function PrzepisZAiPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<RecipeResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!query.trim() || loading) return

    setLoading(true)
    setResults(null)
    setError(null)

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResults(data.results)
      }
    } catch {
      setError("Nie udało się połączyć z serwisem. Spróbuj ponownie.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      {/* ── Hero ── */}
      <section className="bg-basil pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/55 text-xs font-bold uppercase tracking-widest mb-4">
            Ponad 60 000 przepisów · Powered by AI
          </p>
          <h1 className="font-display text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
            Znajdź przepis<br />
            <span className="text-gold brightness-125">po swojemu</span>
          </h1>
          <p className="text-white/65 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Opisz czego szukasz — składniki, dietę, nastrój, porę dnia. AI dobierze najlepsze dopasowania.
          </p>

          <form
            onSubmit={e => { e.preventDefault(); handleSubmit() }}
            className="text-left"
          >
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="np. coś wegańskiego bez glutenu na szybki obiad z ciecierzycą…"
              rows={3}
              className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/35 text-base resize-none focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/15 transition-all"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-coral text-white font-semibold text-sm transition-all hover:brightness-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SparkleIcon />
                {loading ? "Szukam…" : "Szukaj"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Wave */}
      <div className="bg-basil -mb-px">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full" aria-hidden="true">
          <path d="M0 48 C360 0 1080 0 1440 48 L1440 48 L0 48Z" fill="var(--color-cream)" />
        </svg>
      </div>

      {/* ── Results ── */}
      <section className="bg-cream min-h-[40vh] py-16 px-4 sm:px-6 lg:px-8" aria-live="polite" aria-atomic="true">
        <div className="max-w-4xl mx-auto">

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-flex flex-col items-center gap-5">
                <div className="w-12 h-12 rounded-full border-4 border-basil/20 border-t-basil animate-spin" />
                <p className="text-gray-400 font-medium">AI analizuje Twoje zapytanie…</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="max-w-lg mx-auto text-center py-16">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <span className="text-red-400 font-bold text-lg" aria-hidden="true">!</span>
              </div>
              <p className="text-gray-700 font-semibold mb-2">Brak wyników</p>
              <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <>
              <p className="text-gray-400 text-sm mb-10 text-center">
                Znaleziono{" "}
                <span className="font-semibold text-basil">{results.length}</span>{" "}
                {results.length === 1 ? "przepis" : results.length < 5 ? "przepisy" : "przepisów"}
              </p>
              <div className="flex flex-col gap-8">
                {results.map((recipe, i) => (
                  <RecipeCard key={i} recipe={recipe} index={i} />
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {!results && !error && !loading && (
            <div className="text-center py-24">
              <SparkleIconLarge />
              <p className="mt-4 text-gray-400 font-medium">Wpisz czego szukasz, żeby zobaczyć wyniki</p>
              <p className="mt-1 text-gray-300 text-sm">Możesz pisać po polsku lub po angielsku</p>
            </div>
          )}

        </div>
      </section>
    </main>
  )
}

function RecipeCard({ recipe, index }: { recipe: RecipeResult; index: number }) {
  return (
    <article className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-stone-100">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold uppercase tracking-widest text-basil mb-2 block">
              Przepis {index + 1}
            </span>
            <h2 className="font-display text-2xl font-extrabold text-gray-900 leading-tight">
              {recipe.title}
            </h2>
            {recipe.description && (
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">{recipe.description}</p>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {recipe.total_time && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 rounded-full text-xs font-medium text-gray-500">
                <ClockIcon />
                {recipe.total_time}
              </span>
            )}
            {recipe.difficulty && (
              <span className="relative group/diff flex items-center gap-1 px-3 py-1.5 bg-basil/8 rounded-full text-xs font-medium text-basil-dark font-mono tracking-widest cursor-default">
                {DIFFICULTY_DOTS[recipe.difficulty] ?? recipe.difficulty}
                <span className="ml-1 lg:hidden font-sans tracking-normal">
                  {DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}
                </span>
                <span className="hidden lg:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-gray-900 text-white text-xs font-sans font-medium tracking-normal whitespace-nowrap opacity-0 group-hover/diff:opacity-100 transition-opacity pointer-events-none">
                  {DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Ingredients */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Składniki
            </h3>
            <ul className="space-y-2" role="list">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-basil shrink-0" aria-hidden="true" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Directions */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Przygotowanie
            </h3>
            <ol className="space-y-4" role="list">
              {recipe.directions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-basil/10 text-basil text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

        </div>
      </div>
    </article>
  )
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
    </svg>
  )
}

function SparkleIconLarge() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" className="mx-auto text-gray-200" aria-hidden="true">
      <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
