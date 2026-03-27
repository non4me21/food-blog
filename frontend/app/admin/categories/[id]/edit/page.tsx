import { db } from "@/db"
import { categories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { updateCategoryAction } from "@/app/admin/actions"
import AddCategoryForm from "../../AddCategoryForm"

export const metadata = { title: "Edytuj kategorię – Admin" }

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await db.select().from(categories).where(eq(categories.id, parseInt(id))).then((r) => r[0])

  if (!category) notFound()

  const action = updateCategoryAction.bind(null, category.id)

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Edytuj kategorię</h1>
        <p className="text-gray-500 text-sm mt-0.5">{category.name}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <AddCategoryForm
          serverAction={action}
          defaultValues={category}
          submitLabel="Zapisz zmiany"
        />
      </div>
    </div>
  )
}
