"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const NAV_LINKS = [
  { href: "/recipes", label: "Przepisy", icon: BookIcon },
  { href: "/categories", label: "Kategorie", icon: GridIcon },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-gold/15">
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
            href="/search"
            aria-current={pathname === "/search" ? "page" : undefined}
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

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-gold/15 bg-cream">
          <ul className="px-4 py-3 flex flex-col gap-1" role="list">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={pathname.startsWith(href) ? "page" : undefined}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-basil/8 aria-[current=page]:text-basil-dark aria-[current=page]:bg-basil/10"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/search"
                className="block mt-1 px-3 py-2 rounded-lg text-sm font-semibold text-white text-center bg-coral"
                onClick={() => setOpen(false)}
              >
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
