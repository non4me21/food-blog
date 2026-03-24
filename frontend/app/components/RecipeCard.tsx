import Image from "next/image"
import Link from "next/link"

type RecipeCardProps = {
  slug: string
  title: string
  description: string | null
  image_url: string | null
  difficulty: string | null
  categoryName?: string
  categorySlug?: string
}

export default function RecipeCard({
  slug,
  title,
  description,
  image_url,
  difficulty,
  categoryName,
  categorySlug,
}: RecipeCardProps) {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      {/* Image */}
      <Link href={`/recipes/${slug}`} tabIndex={-1} aria-hidden="true">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {image_url ? (
            <Image
              src={image_url}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-200" />
          )}
          {difficulty && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
              {difficulty}
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="p-5">
        {categoryName && categorySlug && (
          <Link
            href={`/categories/${categorySlug}`}
            className="text-xs font-semibold uppercase tracking-wider text-green-700 hover:text-green-900 transition-colors mb-2 inline-block"
          >
            {categoryName}
          </Link>
        )}

        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">
          <Link
            href={`/recipes/${slug}`}
            className="hover:text-green-800 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            {title}
          </Link>
        </h3>

        {description && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
            {description}
          </p>
        )}

      </div>
    </article>
  )
}

