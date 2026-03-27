"use server"

import { createHash } from "crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { recipes, categories } from "@/db/schema"
import { eq } from "drizzle-orm"

function computeSessionToken(password: string): string {
  return createHash("sha256")
    .update(password + ":flavourfind-admin-v1")
    .digest("hex")
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

/* ── Auth ── */

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const password = (formData.get("password") as string) ?? ""
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) return "Brak ustawionej zmiennej ADMIN_PASSWORD."
  if (password !== adminPassword) return "Nieprawidłowe hasło."

  const token = computeSessionToken(adminPassword)
  const cookieStore = await cookies()
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  const next = formData.get("next") as string | null
  redirect(next && next.startsWith("/admin") ? next : "/admin")
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/admin/login")
}

/* ── Recipes ── */

export async function createRecipeAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const title = (formData.get("title") as string)?.trim()
  if (!title) return "Tytuł jest wymagany."

  const slugInput = (formData.get("slug") as string)?.trim()
  const slug = slugInput || toSlug(title)
  if (!slug) return "Nie udało się wygenerować sluga."

  const categoryIdStr = formData.get("category_id") as string
  const published = formData.get("published") === "on"

  let ingredients: string[] = []
  let directions: string[] = []
  try {
    ingredients = JSON.parse((formData.get("ingredients") as string) || "[]")
    directions = JSON.parse((formData.get("directions") as string) || "[]")
  } catch {
    return "Błąd parsowania składników lub kroków."
  }

  try {
    await db.insert(recipes).values({
      title,
      slug,
      description: (formData.get("description") as string) || null,
      ingredients: ingredients.filter(Boolean),
      directions: directions.filter(Boolean),
      difficulty: (formData.get("difficulty") as string) || null,
      category_id: categoryIdStr ? parseInt(categoryIdStr) : null,
      image_url: (formData.get("image_url") as string) || null,
      published,
      published_at: published ? new Date() : null,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("unique")) return "Przepis o tym slugu już istnieje."
    return "Błąd zapisu do bazy danych."
  }

  revalidatePath("/")
  redirect("/admin")
}

export async function updateRecipeAction(
  id: number,
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const title = (formData.get("title") as string)?.trim()
  if (!title) return "Tytuł jest wymagany."

  const slugInput = (formData.get("slug") as string)?.trim()
  const slug = slugInput || toSlug(title)

  const categoryIdStr = formData.get("category_id") as string
  const published = formData.get("published") === "on"

  let ingredients: string[] = []
  let directions: string[] = []
  try {
    ingredients = JSON.parse((formData.get("ingredients") as string) || "[]")
    directions = JSON.parse((formData.get("directions") as string) || "[]")
  } catch {
    return "Błąd parsowania składników lub kroków."
  }

  try {
    await db
      .update(recipes)
      .set({
        title,
        slug,
        description: (formData.get("description") as string) || null,
        ingredients: ingredients.filter(Boolean),
        directions: directions.filter(Boolean),
        difficulty: (formData.get("difficulty") as string) || null,
        category_id: categoryIdStr ? parseInt(categoryIdStr) : null,
        image_url: (formData.get("image_url") as string) || null,
        published,
        published_at: published ? new Date() : null,
      })
      .where(eq(recipes.id, id))
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("unique")) return "Inny przepis o tym slugu już istnieje."
    return "Błąd zapisu do bazy danych."
  }

  revalidatePath("/")
  revalidatePath(`/recipes/${slug}`)
  redirect("/admin")
}

export async function deleteRecipeAction(id: number) {
  await db.delete(recipes).where(eq(recipes.id, id))
  revalidatePath("/")
  redirect("/admin")
}

export async function togglePublishedAction(id: number, published: boolean) {
  await db
    .update(recipes)
    .set({ published, published_at: published ? new Date() : null })
    .where(eq(recipes.id, id))
  revalidatePath("/")
  revalidatePath("/admin")
}

/* ── Categories ── */

export async function createCategoryAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const name = (formData.get("name") as string)?.trim()
  if (!name) return "Nazwa kategorii jest wymagana."

  const slug = (formData.get("slug") as string)?.trim() || toSlug(name)

  try {
    await db.insert(categories).values({
      name,
      slug,
      description: (formData.get("description") as string) || null,
      image_url: (formData.get("image_url") as string) || null,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("unique")) return "Kategoria o tej nazwie lub slugu już istnieje."
    return "Błąd zapisu do bazy danych."
  }

  revalidatePath("/")
  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}

export async function updateCategoryAction(
  id: number,
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const name = (formData.get("name") as string)?.trim()
  if (!name) return "Nazwa kategorii jest wymagana."

  const slug = (formData.get("slug") as string)?.trim() || toSlug(name)

  try {
    await db
      .update(categories)
      .set({
        name,
        slug,
        description: (formData.get("description") as string) || null,
        image_url: (formData.get("image_url") as string) || null,
      })
      .where(eq(categories.id, id))
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("unique")) return "Kategoria o tej nazwie lub slugu już istnieje."
    return "Błąd zapisu do bazy danych."
  }

  revalidatePath("/")
  revalidatePath("/admin/categories")
  revalidatePath(`/categories/${slug}`)
  redirect("/admin/categories")
}

export async function deleteCategoryAction(id: number) {
  await db.delete(categories).where(eq(categories.id, id))
  revalidatePath("/")
  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}
