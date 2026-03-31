import Image from "next/image"
import Link from "next/link"
import { pluralPrzepis, getBlobSvg } from "@/lib/utils"

const CATEGORY_ACCENTS = [
  "#d4a017",
  "#38a169",
  "#e86833",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
]

type CategoryCardProps = {
  slug: string
  name: string
  description: string | null
  image_url: string | null
  recipeCount: number
  index: number
  headingLevel?: 2 | 3
}

export default function CategoryCard({
  slug,
  name,
  description,
  image_url,
  recipeCount,
  index,
  headingLevel = 2,
}: CategoryCardProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3"
  const accent = CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length]
  const n = Number(recipeCount)

  return (
    <Link
      href={`/categories/${slug}`}
      className="group relative block rounded-2xl overflow-hidden aspect-[4/3] hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil"
      aria-label={`${name} – ${pluralPrzepis(n)}`}
    >
      {/* Background: photo or accent gradient */}
      {image_url ? (
        <Image
          src={image_url}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${accent}90, ${accent})` }}
        />
      )}

      {/* Recipe count badge */}
      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
        {pluralPrzepis(n)}
      </span>

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
          <Heading className="font-display text-xl font-bold text-gray-900 leading-tight mb-1">
            {name}
          </Heading>
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
