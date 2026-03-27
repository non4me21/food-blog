"use client"

import { useActionState, useState } from "react"
import ImageUpload from "../components/ImageUpload"

type DefaultValues = {
  name?: string
  slug?: string
  description?: string
  image_url?: string | null
}

type Props = {
  serverAction: (prevState: string | null, formData: FormData) => Promise<string | null>
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

export default function AddCategoryForm({ serverAction, defaultValues = {}, submitLabel = "Dodaj kategorię" }: Props) {
  const [error, formAction, isPending] = useActionState(serverAction, null)
  const [name, setName] = useState(defaultValues.name ?? "")
  const [slugInput, setSlugInput] = useState(defaultValues.slug ?? "")
  const [slugEdited, setSlugEdited] = useState(!!defaultValues.slug)

  const slug = slugEdited ? slugInput : toSlug(name)

  return (
    <form action={formAction} className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cat-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nazwa <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="cat-name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-700 text-gray-900"
            placeholder="np. Śniadania"
          />
        </div>
        <div>
          <label htmlFor="cat-slug" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Slug
          </label>
          <input
            id="cat-slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(e) => { setSlugInput(e.target.value); setSlugEdited(true) }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-700 text-gray-900 font-mono text-sm"
            placeholder="sniadania"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cat-description" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Opis (opcjonalny)
        </label>
        <input
          id="cat-description"
          name="description"
          type="text"
          defaultValue={defaultValues.description ?? ""}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-700 text-gray-900"
          placeholder="Krótki opis kategorii"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Zdjęcie (opcjonalne)
        </label>
        <ImageUpload initialUrl={defaultValues.image_url} />
      </div>

      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
          style={{ backgroundColor: "#1e6020" }}
        >
          {isPending ? "Zapisywanie…" : submitLabel}
        </button>
        <a href="/admin/categories" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Anuluj
        </a>
      </div>
    </form>
  )
}
