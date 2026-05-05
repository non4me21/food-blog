import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google"
import "./globals.css"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ScrollProgress from "./components/ScrollProgress"

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
})

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
})

export const viewport: Viewport = {
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: {
    default: "kacperje – sprawdź moje przepisy, bo warto",
    template: "%s | kacperje",
  },
  description:
    "Blog z przepisami, które weszły do mojego życia na stałe.",
  openGraph: {
    siteName: "kacperje",
    type: "website",
    locale: "pl_PL",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`${plusJakarta.variable} ${bricolage.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-basil-dark focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <ScrollProgress />
        <Navbar />
        <main id="main-content" className="flex-1 bg-cream pt-14">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
