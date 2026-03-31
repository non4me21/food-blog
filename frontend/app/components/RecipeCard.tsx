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

const DIFFICULTY_DOTS: Record<string, string> = {
  easy: "●○○", medium: "●●○", hard: "●●●",
  łatwy: "●○○", średni: "●●○", trudny: "●●●",
}

const DIFFICULTY_LABEL: Record<string, string> = {
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
      className="group relative block rounded-2xl aspect-[4/3] hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil"
    >
      {/* Full bleed image — overflow-hidden isolated here so tooltips aren't clipped */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        {image_url ? (
          <Image
            src={image_url}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100" />
        )}
      </div>

      {/* Difficulty badge */}
      {difficulty && (
        <span className="absolute top-3 right-3 group/diff bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full font-mono tracking-widest cursor-default">
          {DIFFICULTY_DOTS[difficulty] ?? difficulty}
          {/* mobile: label always visible; desktop: hover tooltip */}
          <span className="ml-1 lg:hidden">{DIFFICULTY_LABEL[difficulty] ?? difficulty}</span>
          <span className="hidden lg:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-gray-900 text-white text-xs font-mono font-medium whitespace-nowrap opacity-0 group-hover/diff:opacity-100 transition-opacity pointer-events-none">
            {DIFFICULTY_LABEL[difficulty] ?? difficulty}
          </span>
        </span>
      )}

      {/* Text on blob */}
      <div className="absolute inset-y-0 left-2 flex items-center">
        <div
          className="px-10 py-10"
          style={{
            backgroundImage: getBlobSvg(index),
            backgroundSize: "100% 100%",
            filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.22)) drop-shadow(0 2px 5px rgba(0,0,0,0.14))",
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
