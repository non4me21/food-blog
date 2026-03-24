import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-auto" aria-label="Stopka strony">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Marka */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
                style={{ backgroundColor: "#e8531a" }}
                aria-hidden="true"
              >
                F
              </span>
              <span className="text-white font-bold text-lg">FlavourFind</span>
            </div>
            <p className="text-sm leading-relaxed">
              Starannie dobrane przepisy na każdą okazję. Od szybkich kolacji w tygodniu po imponujące desery.
            </p>
          </div>

          {/* Odkryj */}
          <nav aria-label="Nawigacja stopki – odkryj">
            <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Odkryj</h2>
            <ul className="space-y-2 text-sm" role="list">
              <li><Link href="/recipes" className="hover:text-white transition-colors">Wszystkie Przepisy</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Kategorie</Link></li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  Wyszukiwanie AI
                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-semibold" style={{ backgroundColor: "#e8531a" }}>AI</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* O blogu */}
          <div>
            <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">O blogu</h2>
            <p className="text-sm leading-relaxed">
              Kulinarny blog z ręcznie wybranymi przepisami i wyszukiwaniem AI po bazie ponad 62&nbsp;000 dań z całego świata.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-xs text-gray-600 text-center">
          © {new Date().getFullYear()} FlavourFind. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  )
}
