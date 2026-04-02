"use client"

import { useEffect, useRef, useState } from "react"
import { pluralPrzepisLabel, pluralKategoriaLabel } from "@/lib/utils"

type StatsCardProps = {
  recipes: number
  categories: number
}

function useCountUp(target: number, duration: number, started: boolean) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return value
}

export default function StatsCard({ recipes, categories }: StatsCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const recipesCount = useCountUp(recipes, 1500, started)
  const categoriesCount = useCountUp(categories, 1500, started)

  return (
    <div
      ref={ref}
      className="lg:col-span-5 rounded-2xl bg-basil flex items-center justify-around px-10"
    >
      <div className="text-center text-white">
        <span className="font-display text-7xl font-extrabold block leading-none">
          {recipesCount}
        </span>
        <span className="text-xs font-black tracking-widest uppercase text-white/50 mt-2 block">
          {pluralPrzepisLabel(recipesCount)}
        </span>
      </div>
      <div className="w-px h-16 bg-white/20" aria-hidden="true" />
      <div className="text-center text-white">
        <span className="font-display text-7xl font-extrabold block leading-none">
          {categoriesCount}
        </span>
        <span className="text-xs font-black tracking-widest uppercase text-white/50 mt-2 block">
          {pluralKategoriaLabel(categoriesCount)}
        </span>
      </div>
    </div>
  )
}
