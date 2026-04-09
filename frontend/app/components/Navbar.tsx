"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const NAV_LINKS = [
  { href: "/przepisy", label: "Przepisy", icon: BookIcon },
  { href: "/kategorie", label: "Kategorie", icon: GridIcon },
]

// Wavy bottom mask — nav content occupies top ~60/80 of the viewBox,
// bottom area is the wavy edge. preserveAspectRatio='none' lets it
// stretch to any width without distorting the vertical wave amplitude.
const NAV_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 80' preserveAspectRatio='none'%3E%3Cpath fill='black' d='M0,0 L1440,0 L1440,58 C1260,82 1080,50 900,70 C720,86 540,54 360,74 C180,84 90,60 0,72 Z'/%3E%3C/svg%3E")`

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Main nav — translucent cream + backdrop blur + wavy bottom mask */}
      <div
        className="bg-cream/60 backdrop-blur-md pb-4"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          maskImage: NAV_MASK,
          WebkitMaskImage: NAV_MASK,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil rounded"
            aria-label="FlavourFind — home"
          >
            <span
              className="w-8 h-8 flex items-center justify-center text-white text-sm font-black select-none bg-coral"
              style={{ borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%" }}
              aria-hidden="true"
            >
              F
            </span>
            <span className="font-display font-bold text-lg tracking-tight text-gray-900">
              FlavourFind
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname.startsWith(href) ? "page" : undefined}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-basil/8 transition-colors aria-[current=page]:text-basil-dark aria-[current=page]:bg-basil/10"
              >
                <Icon />
                {label}
              </Link>
            ))}
            <Link
              href="/przepis-z-ai"
              aria-current={pathname === "/przepis-z-ai" ? "page" : undefined}
              className="ml-3 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white bg-coral transition-all hover:brightness-110 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-coral"
            >
              <SparkleIcon aria-hidden="true" />
              Szukaj AI
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-basil/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Zamknij menu nawigacyjne" : "Otwórz menu nawigacyjne"}
          >
            {open ? <XIcon /> : <HamburgerIcon />}
          </button>
        </nav>
      </div>

      {/* Mobile menu — floats over content, tucks under the wavy nav edge */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden absolute top-20 left-3 right-3 bg-cream/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl"
        >
          <ul className="p-2 flex flex-col gap-1" role="list">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={pathname.startsWith(href) ? "page" : undefined}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-basil/10 hover:text-gray-900 transition-colors aria-[current=page]:text-basil-dark aria-[current=page]:bg-basil/10"
                  onClick={() => setOpen(false)}
                >
                  <Icon />
                  {label}
                </Link>
              </li>
            ))}
            <li className="mt-1 pt-2 border-t border-gold/15">
              <Link
                href="/przepis-z-ai"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-coral shadow-sm hover:brightness-110 transition-all"
                onClick={() => setOpen(false)}
              >
                <SparkleIcon aria-hidden="true" />
                Szukaj AI
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

function BookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function SparkleIcon({ "aria-hidden": hidden }: { "aria-hidden"?: boolean | "true" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden={hidden}>
      <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
