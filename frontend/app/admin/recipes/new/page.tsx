import Link from "next/link"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { createRecipeAction } from "@/app/admin/actions"
import RecipeForm from "@/app/admin/components/RecipeForm"

export const metadata = { title: "Nowy przepis – Admin" }

export default async function NewRecipePage() {
  const allCategories = await db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(categories.name)

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeftIcon />
        </Link>
        <h1 className="text-2xl font-black text-gray-900">Nowy przepis</h1>
      </div>

      <RecipeForm
        serverAction={createRecipeAction}
        categories={allCategories}
        submitLabel="Dodaj przepis"
      />
    </div>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Wróć do listy przepisów">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  )
}
