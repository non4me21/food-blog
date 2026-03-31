"use client"

import { useState } from "react"

type Props = {
  title: string
  url: string
}

export default function ShareButton({ title, url }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const fullUrl = `${window.location.origin}${url}`
    if (navigator.share) {
      await navigator.share({ title, url: fullUrl })
      return
    }
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="relative group/share flex items-center gap-1.5 px-4 py-2 bg-basil/8 rounded-full text-sm font-medium text-basil-dark hover:bg-basil/15 transition-colors"
      aria-label="Udostępnij przepis"
    >
      <PullRequestIcon />
      <span>{copied ? "skopiowano!" : "udostępnij"}</span>
    </button>
  )
}

function PullRequestIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      {/* base commit */}
      <circle cx="4" cy="12" r="2" />
      {/* merged commit */}
      <circle cx="4" cy="4" r="2" />
      {/* head commit (feature branch) */}
      <circle cx="12" cy="4" r="2" />
      {/* trunk line */}
      <line x1="4" y1="6" x2="4" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* branch curve: from base commit up to head commit */}
      <path d="M4 10 C4 7 12 7 12 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
