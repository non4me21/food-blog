"use server"

import { createHash } from "crypto"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { recipes, categories } from "@/db/schema"
import { eq } from "drizzle-orm"
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  clearLoginRateLimit,
} from "@/lib/loginRateLimit"

async function getCategorySlug(categoryId: number | null): Promise<string | null> {
  if (!categoryId) return null
  const [cat] = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.id, categoryId))
  return cat?.slug ?? null
}

function computeSessionToken(login: string, password: string): string {
  return createHash("sha256")
    .update(login + ":" + password + ":kacperje-admin-v1")
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

async function getClientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return h.get("x-real-ip") ?? "unknown"
}

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const ip = await getClientIp()

  const { blocked, retryAfterSeconds } = await checkLoginRateLimit(ip)
  if (blocked) {
    const minutes = Math.ceil((retryAfterSeconds ?? 900) / 60)
    return `Zbyt wiele nieudanych prób. Spróbuj ponownie za ${minutes} min.`
  }

  const login = (formData.get("login") as string) ?? ""
  const password = (formData.get("password") as string) ?? ""
  const adminLogin = process.env.ADMIN_LOGIN
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminLogin || !adminPassword) return "Brak konfiguracji zmiennych środowiskowych."

  if (login !== adminLogin || password !== adminPassword) {
    await recordFailedLoginAttempt(ip)
    return "Nieprawidłowe dane logowania."
  }

  await clearLoginRateLimit(ip)
  const token = computeSessionToken(adminLogin, adminPassword)
  const cookieStore = await cookies()
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  const next = formData.get("next") as string | null
  redirect(next && next.startsWith("/slowik") ? next : "/slowik")
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/slowik/login")
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
  const publishedAtStr = (formData.get("published_at") as string) || null
  const publishedAt = published
    ? (publishedAtStr ? new Date(publishedAtStr) : new Date())
    : null

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
      notes: (formData.get("notes") as string) || null,
      ingredients: ingredients.filter(Boolean),
      directions: directions.filter(Boolean),
      difficulty: (formData.get("difficulty") as string) || null,
      category_id: categoryIdStr ? parseInt(categoryIdStr) : null,
      image_url: (formData.get("image_url") as string) || null,
      published,
      published_at: publishedAt,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("unique")) return "Przepis o tym slugu już istnieje."
    return "Błąd zapisu do bazy danych."
  }

  const newCategoryId = categoryIdStr ? parseInt(categoryIdStr) : null
  const categorySlug = await getCategorySlug(newCategoryId)
  revalidatePath("/")
  revalidatePath("/przepisy")
  if (categorySlug) revalidatePath(`/kategorie/${categorySlug}`)
  revalidatePath("/sitemap.xml")
  revalidatePath("/rss.xml")
  redirect("/slowik")
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
  const newCategoryId = categoryIdStr ? parseInt(categoryIdStr) : null
  const published = formData.get("published") === "on"
  const publishedAtStr = (formData.get("published_at") as string) || null

  let ingredients: string[] = []
  let directions: string[] = []
  try {
    ingredients = JSON.parse((formData.get("ingredients") as string) || "[]")
    directions = JSON.parse((formData.get("directions") as string) || "[]")
  } catch {
    return "Błąd parsowania składników lub kroków."
  }

  const [oldRecipe] = await db
    .select({ category_id: recipes.category_id, published: recipes.published, published_at: recipes.published_at })
    .from(recipes)
    .where(eq(recipes.id, id))
  const oldCategoryId = oldRecipe?.category_id ?? null
  const publishedAt = published
    ? (publishedAtStr ? new Date(publishedAtStr) : oldRecipe?.published_at ?? new Date())
    : null

  try {
    await db
      .update(recipes)
      .set({
        title,
        slug,
        description: (formData.get("description") as string) || null,
        notes: (formData.get("notes") as string) || null,
        ingredients: ingredients.filter(Boolean),
        directions: directions.filter(Boolean),
        difficulty: (formData.get("difficulty") as string) || null,
        category_id: newCategoryId,
        image_url: (formData.get("image_url") as string) || null,
        published,
        published_at: publishedAt,
      })
      .where(eq(recipes.id, id))
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("unique")) return "Inny przepis o tym slugu już istnieje."
    return "Błąd zapisu do bazy danych."
  }

  const [oldCategorySlug, newCategorySlug] = await Promise.all([
    getCategorySlug(oldCategoryId),
    getCategorySlug(newCategoryId),
  ])

  revalidatePath("/")
  revalidatePath("/przepisy")
  revalidatePath(`/przepisy/${slug}`)
  if (oldCategorySlug) revalidatePath(`/kategorie/${oldCategorySlug}`)
  if (newCategorySlug && newCategorySlug !== oldCategorySlug)
    revalidatePath(`/kategorie/${newCategorySlug}`)
  revalidatePath("/sitemap.xml")
  revalidatePath("/rss.xml")
  redirect("/slowik")
}

export async function deleteRecipeAction(id: number) {
  const [recipe] = await db
    .select({ category_id: recipes.category_id, slug: recipes.slug })
    .from(recipes)
    .where(eq(recipes.id, id))

  await db.delete(recipes).where(eq(recipes.id, id))

  const categorySlug = await getCategorySlug(recipe?.category_id ?? null)
  revalidatePath("/")
  revalidatePath("/przepisy")
  if (recipe?.slug) revalidatePath(`/przepisy/${recipe.slug}`)
  if (categorySlug) revalidatePath(`/kategorie/${categorySlug}`)
  revalidatePath("/sitemap.xml")
  revalidatePath("/rss.xml")
  redirect("/slowik")
}

export async function togglePublishedAction(id: number, published: boolean) {
  const [recipe] = await db
    .select({ category_id: recipes.category_id, slug: recipes.slug })
    .from(recipes)
    .where(eq(recipes.id, id))

  await db
    .update(recipes)
    .set({ published, published_at: published ? new Date() : null })
    .where(eq(recipes.id, id))

  const categorySlug = await getCategorySlug(recipe?.category_id ?? null)
  revalidatePath("/")
  revalidatePath("/przepisy")
  if (recipe?.slug) revalidatePath(`/przepisy/${recipe.slug}`)
  if (categorySlug) revalidatePath(`/kategorie/${categorySlug}`)
  revalidatePath("/sitemap.xml")
  revalidatePath("/rss.xml")
}

/* ── Categories ── */

export async function createCategoryAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const name = (formData.get("name") as string)?.trim()
  if (!name) return "Nazwa kategorii jest wymagana."

  const slug = (formData.get("slug") as string)?.trim() || toSlug(name)

  const displayOrderStr = formData.get("display_order") as string
  const displayOrder = displayOrderStr ? parseInt(displayOrderStr) : 0

  try {
    await db.insert(categories).values({
      name,
      slug,
      description: (formData.get("description") as string) || null,
      image_url: (formData.get("image_url") as string) || null,
      display_order: isNaN(displayOrder) ? 0 : displayOrder,
      updated_at: new Date(),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("unique")) return "Kategoria o tej nazwie lub slugu już istnieje."
    return "Błąd zapisu do bazy danych."
  }

  revalidatePath("/")
  revalidatePath("/kategorie")
  revalidatePath("/sitemap.xml")
  redirect("/slowik/categories")
}

export async function updateCategoryAction(
  id: number,
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const name = (formData.get("name") as string)?.trim()
  if (!name) return "Nazwa kategorii jest wymagana."

  const slug = (formData.get("slug") as string)?.trim() || toSlug(name)

  const displayOrderStr = formData.get("display_order") as string
  const displayOrder = displayOrderStr ? parseInt(displayOrderStr) : 0

  try {
    await db
      .update(categories)
      .set({
        name,
        slug,
        description: (formData.get("description") as string) || null,
        image_url: (formData.get("image_url") as string) || null,
        display_order: isNaN(displayOrder) ? 0 : displayOrder,
        updated_at: new Date(),
      })
      .where(eq(categories.id, id))
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("unique")) return "Kategoria o tej nazwie lub slugu już istnieje."
    return "Błąd zapisu do bazy danych."
  }

  revalidatePath("/")
  revalidatePath("/kategorie")
  revalidatePath(`/kategorie/${slug}`)
  revalidatePath("/sitemap.xml")
  redirect("/slowik/categories")
}

export async function deleteCategoryAction(id: number) {
  await db.delete(categories).where(eq(categories.id, id))
  revalidatePath("/")
  revalidatePath("/kategorie")
  revalidatePath("/sitemap.xml")
  redirect("/slowik/categories")
}
