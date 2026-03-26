"use client"

import { useActionState, useState, useEffect } from "react"
import ImageUpload from "./ImageUpload"

type Category = { id: number; name: string }

type DefaultValues = {
  title?: string
  slug?: string
  description?: string
  category_id?: number | null
  difficulty?: string | null
  image_url?: string | null
  published?: boolean
  ingredients?: string[]
  directions?: string[]
}

type Props = {
  serverAction: (prevState: string | null, formData: FormData) => Promise<string | null>
  categories: Category[]
  defaultValues?: DefaultValues
  submitLabel?: string
}

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

const DIFFICULTY_OPTIONS = [
  { value: "", label: "— Wybierz trudność —" },
  { value: "łatwy", label: "Łatwy" },
  { value: "średni", label: "Średni" },
  { value: "trudny", label: "Trudny" },
]

export default function RecipeForm({
  serverAction,
  categories,
  defaultValues = {},
  submitLabel = "Zapisz przepis",
}: Props) {
  const [error, formAction, isPending] = useActionState(serverAction, null)

  const [title, setTitle] = useState(defaultValues.title ?? "")
  const [slug, setSlug] = useState(defaultValues.slug ?? "")
  const [slugEdited, setSlugEdited] = useState(!!defaultValues.slug)

  const [ingredients, setIngredients] = useState<string[]>(
    defaultValues.ingredients?.length ? defaultValues.ingredients : [""]
  )
  const [directions, setDirections] = useState<string[]>(
    defaultValues.directions?.length ? defaultValues.directions : [""]
  )

  // Auto-generate slug from title (unless user manually edited it)
  useEffect(() => {
    if (!slugEdited) setSlug(toSlug(title))
  }, [title, slugEdited])

  function addIngredient() {
    setIngredients((prev) => [...prev, ""])
  }
  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i))
  }
  function updateIngredient(i: number, value: string) {
    setIngredients((prev) => prev.map((v, idx) => (idx === i ? value : v)))
  }

  function addDirection() {
    setDirections((prev) => [...prev, ""])
  }
  function removeDirection(i: number) {
    setDirections((prev) => prev.filter((_, idx) => idx !== i))
  }
  function updateDirection(i: number, value: string) {
    setDirections((prev) => prev.map((v, idx) => (idx === i ? value : v)))
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Hidden serialized arrays */}
      <input type="hidden" name="ingredients" value={JSON.stringify(ingredients.filter((s) => s.trim()))} />
      <input type="hidden" name="directions" value={JSON.stringify(directions.filter((s) => s.trim()))} />

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* ── Podstawowe informacje ── */}
      <section aria-labelledby="basic-info-heading">
        <h2 id="basic-info-heading" className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
          Podstawowe informacje
        </h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          {/* Tytuł */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tytuł <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900"
              placeholder="np. Placki ziemniaczane z sosem śmietanowym"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Slug URL
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 font-mono text-sm"
              placeholder="placki-ziemniaczane"
            />
            <p className="text-xs text-gray-400 mt-1">
              URL: /recipes/<span className="font-medium">{slug || "…"}</span>
            </p>
          </div>

          {/* Opis */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Krótki opis
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={defaultValues.description ?? ""}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 resize-y"
              placeholder="Krótki opis przepisu widoczny na kartach i w SEO"
            />
          </div>
        </div>
      </section>

      {/* ── Meta ── */}
      <section aria-labelledby="meta-heading">
        <h2 id="meta-heading" className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
          Szczegóły
        </h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Kategoria */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Kategoria
              </label>
              <select
                id="category_id"
                name="category_id"
                defaultValue={defaultValues.category_id ?? ""}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white text-gray-900"
              >
                <option value="">— Brak —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Trudność */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Trudność
              </label>
              <select
                id="difficulty"
                name="difficulty"
                defaultValue={defaultValues.difficulty ?? ""}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white text-gray-900"
              >
                {DIFFICULTY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Zdjęcie */}
          <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Zdjęcie
            </label>
            <ImageUpload initialUrl={defaultValues.image_url} />
          </div>
        </div>
      </section>

      {/* ── Składniki ── */}
      <section aria-labelledby="ingredients-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="ingredients-heading" className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Składniki
          </h2>
          <button
            type="button"
            onClick={addIngredient}
            className="text-sm font-semibold text-green-700 hover:text-green-900 transition-colors"
          >
            + Dodaj składnik
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
          {ingredients.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-gray-400 text-sm w-5 text-right shrink-0" aria-hidden="true">{i + 1}.</span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateIngredient(i, e.target.value)}
                aria-label={`Składnik ${i + 1}`}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-700 text-gray-900 text-sm"
                placeholder="np. 2 szklanki mąki pszennej"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  aria-label={`Usuń składnik ${i + 1}`}
                  className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <XIcon />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Kroki ── */}
      <section aria-labelledby="directions-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="directions-heading" className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Kroki przygotowania
          </h2>
          <button
            type="button"
            onClick={addDirection}
            className="text-sm font-semibold text-green-700 hover:text-green-900 transition-colors"
          >
            + Dodaj krok
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          {directions.map((step, i) => (
            <div key={i} className="flex gap-3">
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white mt-1"
                style={{ backgroundColor: "#1e6020" }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="flex-1 relative">
                <textarea
                  value={step}
                  onChange={(e) => updateDirection(i, e.target.value)}
                  aria-label={`Krok ${i + 1}`}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-700 text-gray-900 text-sm resize-y"
                  placeholder={`Opisz krok ${i + 1}…`}
                />
              </div>
              {directions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDirection(i)}
                  aria-label={`Usuń krok ${i + 1}`}
                  className="text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-1"
                >
                  <XIcon />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Publikacja ── */}
      <section aria-labelledby="publish-heading">
        <h2 id="publish-heading" className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
          Publikacja
        </h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="published"
              defaultChecked={defaultValues.published ?? false}
              className="w-5 h-5 rounded accent-green-700"
            />
            <span className="text-sm font-medium text-gray-700">
              Opublikuj przepis (widoczny na stronie)
            </span>
          </label>
        </div>
      </section>

      {/* ── Submit ── */}
      <div className="flex items-center gap-4 pb-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 rounded-xl font-bold text-white disabled:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
          style={{ backgroundColor: "#1e6020" }}
        >
          {isPending ? "Zapisywanie…" : submitLabel}
        </button>
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Anuluj
        </a>
      </div>
    </form>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
