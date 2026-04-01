import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/db"
import { recipes, categories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { updateRecipeAction } from "@/app/admin/actions"
import RecipeForm from "@/app/admin/components/RecipeForm"

type Props = { params: Promise<{ id: string }> }

export const metadata = { title: "Edytuj przepis – Admin" }

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params
  const recipeId = parseInt(id)
  if (isNaN(recipeId)) notFound()

  const [recipe] = await db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1)
  if (!recipe) notFound()

  const allCategories = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(categories.name)

  const boundAction = updateRecipeAction.bind(null, recipeId)

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeftIcon />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Edytuj przepis</h1>
          <p className="text-sm text-gray-400 font-mono">{recipe.slug}</p>
        </div>
      </div>

      <RecipeForm
        serverAction={boundAction}
        categories={allCategories}
        submitLabel="Zapisz zmiany"
        defaultValues={{
          title: recipe.title,
          slug: recipe.slug,
          description: recipe.description ?? undefined,
          notes: recipe.notes,
          category_id: recipe.category_id,
          difficulty: recipe.difficulty,
          image_url: recipe.image_url,
          published: recipe.published ?? false,
          ingredients: (recipe.ingredients as string[]) ?? [],
          directions: (recipe.directions as string[]) ?? [],
        }}
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
