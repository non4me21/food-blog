import Image from "next/image"
import Link from "next/link"
import { getBlobSvg } from "@/lib/utils"

type RecipeCardProps = {
  slug: string
  title: string
  description: string | null
  image_url: string | null
  difficulty: string | null
  categoryName?: string
  categorySlug?: string
  index?: number
}

const DIFFICULTY_PL: Record<string, string> = {
  easy: "łatwy", medium: "średni", hard: "trudny",
  łatwy: "łatwy", średni: "średni", trudny: "trudny",
}

export default function RecipeCard({
  slug,
  title,
  description,
  image_url,
  difficulty,
  categoryName,
  categorySlug,
  index = 0,
}: RecipeCardProps) {
  return (
    <Link
      href={`/recipes/${slug}`}
      className="group relative block rounded-2xl overflow-hidden aspect-[4/3] hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil"
    >
      {/* Full bleed image */}
      {image_url ? (
        <Image
          src={image_url}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100" />
      )}

      {/* Difficulty badge */}
      {difficulty && (
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full capitalize">
          {DIFFICULTY_PL[difficulty] ?? difficulty}
        </span>
      )}

      {/* Text on blob */}
      <div className="absolute inset-y-0 left-2 flex items-center">
        <div
          className="px-10 py-10 drop-shadow-md"
          style={{
            backgroundImage: getBlobSvg(index),
            backgroundSize: "100% 100%",
          }}
        >
          {categoryName && categorySlug && (
            <span className="text-xs font-black tracking-widest uppercase text-basil mb-1 block">
              {categoryName}
            </span>
          )}
          <h3 className="font-display text-xl font-bold text-gray-900 leading-tight mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 max-w-[160px]">
              {description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
