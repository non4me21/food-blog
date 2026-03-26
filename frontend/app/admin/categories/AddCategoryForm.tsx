"use client"

import { useActionState, useState, useEffect } from "react"
import ImageUpload from "../components/ImageUpload"

type Props = {
  serverAction: (prevState: string | null, formData: FormData) => Promise<string | null>
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

export default function AddCategoryForm({ serverAction }: Props) {
  const [error, formAction, isPending] = useActionState(serverAction, null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)

  useEffect(() => {
    if (!slugEdited) setSlug(toSlug(name))
  }, [name, slugEdited])

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
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
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
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-700 text-gray-900"
          placeholder="Krótki opis kategorii"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Zdjęcie (opcjonalne)
        </label>
        <ImageUpload />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
        style={{ backgroundColor: "#1e6020" }}
      >
        {isPending ? "Dodawanie…" : "Dodaj kategorię"}
      </button>
    </form>
  )
}
