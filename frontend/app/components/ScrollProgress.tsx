"use client"

import { useEffect, useState } from "react"

const BAR_WIDTH = 24

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      const p = scrollTop / docHeight
      setProgress(p)
      setVisible(scrollTop > 10)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  const filled = Math.round(progress * BAR_WIDTH)
  const empty = BAR_WIDTH - filled

  return (
    <button
      className="fixed bottom-4 right-4 z-40 font-mono text-xs text-basil/50 select-none tracking-tight hover:text-basil transition-colors cursor-pointer"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Przewiń na górę strony"
    >
      [{Array(filled).fill("█").join("")}{Array(empty).fill("░").join("")}]
    </button>
  )
}
