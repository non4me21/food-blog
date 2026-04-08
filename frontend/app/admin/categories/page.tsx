import { db } from "@/db"
import { categories, recipes } from "@/db/schema"
import { eq, count } from "drizzle-orm"
import { deleteCategoryAction, createCategoryAction } from "@/app/admin/actions"
import DeleteButton from "@/app/admin/components/DeleteButton"
import AddCategoryForm from "./AddCategoryForm"
import { pluralPrzepisLabel } from "@/lib/utils"

export const metadata = { title: "Kategorie – Admin" }

async function getCategoriesWithCount() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      display_order: categories.display_order,
      recipeCount: count(recipes.id),
    })
    .from(categories)
    .leftJoin(recipes, eq(recipes.category_id, categories.id))
    .groupBy(categories.id, categories.name, categories.slug, categories.description, categories.display_order)
    .orderBy(categories.display_order, categories.name)
}

export default async function CategoriesPage() {
  const allCategories = await getCategoriesWithCount()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Kategorie</h1>
        <p className="text-gray-500 text-sm mt-0.5">{allCategories.length} łącznie</p>
      </div>

      {/* Lista kategorii */}
      {allCategories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          <ul role="list">
            {allCategories.map((cat, i) => (
              <li
                key={cat.id}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${i < allCategories.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900">{cat.name}</div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">{cat.slug}</div>
                  {cat.description && (
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">{cat.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-gray-400 font-mono" title="Kolejność wyświetlania">#{cat.display_order}</span>
                  <span className="text-xs text-gray-400">{Number(cat.recipeCount)} {pluralPrzepisLabel(Number(cat.recipeCount))}</span>
                  <a
                    href={`/admin/categories/${cat.id}/edit`}
                    className="text-xs font-semibold text-green-700 hover:text-green-900 transition-colors"
                  >
                    Edytuj
                  </a>
                  <DeleteButton
                    action={deleteCategoryAction.bind(null, cat.id)}
                    confirmMessage={`Usunąć kategorię "${cat.name}"? Przepisy nie zostaną usunięte.`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formularz dodawania */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-5">
          Dodaj kategorię
        </h2>
        <AddCategoryForm serverAction={createCategoryAction} />
      </div>
    </div>
  )
}
