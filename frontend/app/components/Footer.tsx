import Link from "next/link"

export default function Footer() {
  return (
    <footer className="mt-auto bg-basil-dark" aria-label="Stopka strony">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Marka */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className="w-8 h-8 flex items-center justify-center text-white text-sm font-black bg-coral"
                style={{ borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%" }}
                aria-hidden="true"
              >
                F
              </span>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                FlavourFind
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/45">
              Starannie dobrane przepisy na każdą okazję. Od szybkich kolacji w tygodniu po imponujące desery.
            </p>
          </div>

          {/* Odkryj */}
          <nav aria-label="Nawigacja stopki – odkryj">
            <h2 className="font-semibold mb-3 text-xs uppercase tracking-wider text-white/35">
              Odkryj
            </h2>
            <ul className="space-y-2 text-sm text-white/50" role="list">
              <li>
                <Link href="/przepisy" className="hover:text-white transition-colors">
                  Wszystkie Przepisy
                </Link>
              </li>
              <li>
                <Link href="/kategorie" className="hover:text-white transition-colors">
                  Kategorie
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                  Wyszukiwanie AI
                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-semibold bg-coral">
                    AI
                  </span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* O blogu */}
          <div>
            <h2 className="font-semibold mb-3 text-xs uppercase tracking-wider text-white/35">
              O blogu
            </h2>
            <p className="text-sm leading-relaxed text-white/45">
              Kulinarny blog z ręcznie wybranymi przepisami i wyszukiwaniem AI po bazie ponad 62&nbsp;000 dań z całego świata.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-xs text-white/20 text-center">
          © {new Date().getFullYear()} FlavourFind. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  )
}
