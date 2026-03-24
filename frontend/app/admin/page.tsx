import Link from "next/link"
import { db } from "@/db"
import { recipes, categories } from "@/db/schema"
import { eq } from "drizzle-orm"
import DeleteButton from "./components/DeleteButton"
import { deleteRecipeAction, togglePublishedAction } from "./actions"

export const metadata = { title: "Przepisy – Admin" }

async function getAllRecipes() {
  return db
    .select({
      id: recipes.id,
      title: recipes.title,
      slug: recipes.slug,
      published: recipes.published,
      difficulty: recipes.difficulty,
      published_at: recipes.published_at,
      categoryName: categories.name,
    })
    .from(recipes)
    .leftJoin(categories, eq(recipes.category_id, categories.id))
    .orderBy(recipes.created_at)
}

export default async function AdminRecipesPage() {
  const allRecipes = await getAllRecipes()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Przepisy</h1>
          <p className="text-gray-500 text-sm mt-0.5">{allRecipes.length} łącznie</p>
        </div>
        <Link
          href="/admin/recipes/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#1e6020" }}
        >
          <PlusIcon />
          Nowy przepis
        </Link>
      </div>

      {allRecipes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-4">Brak przepisów. Dodaj pierwszy!</p>
          <Link
            href="/admin/recipes/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
            style={{ backgroundColor: "#1e6020" }}
          >
            <PlusIcon />
            Nowy przepis
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Tytuł</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Kategoria</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden sm:table-cell">Status</th>
                <th className="px-5 py-3 text-right font-semibold text-gray-600">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {allRecipes.map((recipe) => (
                <tr key={recipe.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900 leading-snug">{recipe.title}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{recipe.slug}</div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-gray-500">
                    {recipe.categoryName ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <form action={togglePublishedAction.bind(null, recipe.id, !recipe.published)}>
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          recipe.published
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                        title={recipe.published ? "Kliknij, aby cofnąć publikację" : "Kliknij, aby opublikować"}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${recipe.published ? "bg-green-500" : "bg-gray-400"}`} aria-hidden="true" />
                        {recipe.published ? "Opublikowany" : "Szkic"}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/recipes/${recipe.id}/edit`}
                        className="text-sm font-medium text-green-700 hover:text-green-900 transition-colors"
                      >
                        Edytuj
                      </Link>
                      {recipe.published && (
                        <Link
                          href={`/recipes/${recipe.slug}`}
                          target="_blank"
                          className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors hidden lg:inline"
                        >
                          Podgląd ↗
                        </Link>
                      )}
                      <DeleteButton
                        action={deleteRecipeAction.bind(null, recipe.id)}
                        confirmMessage={`Usunąć przepis "${recipe.title}"?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
