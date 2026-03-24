import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "FlavourFind – Odkryj Wyjątkowe Przepisy",
    template: "%s | FlavourFind",
  },
  description:
    "Kulinarny blog z wyjątkowymi przepisami. Od szybkich kolacji w tygodniu po imponujące desery – Twoja kulinarna podróż zaczyna się tutaj.",
  openGraph: {
    siteName: "FlavourFind",
    type: "website",
    locale: "pl_PL",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-green-800 focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
