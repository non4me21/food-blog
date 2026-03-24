import Link from "next/link"
import { logoutAction } from "./actions"

export const dynamic = "force-dynamic"

const NAV = [
  { href: "/admin", label: "Przepisy", exact: true },
  { href: "/admin/categories", label: "Kategorie", exact: false },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-gray-900 shrink-0">
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-black"
                style={{ backgroundColor: "#e8531a" }}
                aria-hidden="true"
              >
                F
              </span>
              <span className="hidden sm:inline">Admin</span>
            </Link>

            <nav aria-label="Nawigacja admina">
              <ul className="flex items-center gap-1" role="list">
                {NAV.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors hidden sm:block"
            >
              Podgląd strony ↗
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                Wyloguj
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
