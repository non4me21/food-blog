import Footer from "@/app/components/Footer"
import Navbar from "@/app/components/Navbar"
import ScrollProgress from "@/app/components/ScrollProgress"

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main id="main-content" className="flex-1 bg-cream pt-14">
        {children}
      </main>
      <Footer />
    </>
  )
}
