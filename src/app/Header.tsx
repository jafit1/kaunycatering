"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag, Menu, X } from "lucide-react"

const NAV_ITEMS: { label: string; id: string }[] = []

export default function Header({ storeName, logoUrl }: { storeName: string; logoUrl: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false)
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) {
        const headerH = document.querySelector(".top-header")?.clientHeight ?? 70
        const y = el.getBoundingClientRect().top + window.scrollY - headerH - 12
        window.scrollTo({ top: y, behavior: "smooth" })
      }
    }, 80)
  }

  return (
    <header className={`top-header${scrolled ? " scrolled" : ""}`}>
      <div className="header-container">
        {/* Left: Logo */}
        <a href="/" className="logo-link">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="header-logo" />
          ) : (
            <span className="logo-text">{storeName}</span>
          )}
        </a>

        {/* Center: Desktop Nav */}
        <nav className="header-nav hidden lg:flex items-center gap-8" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className="nav-link text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              onClick={() => scrollTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Icons & Mobile Toggle */}
        <div className="header-icons flex items-center gap-4">
          <button className="icon hover:bg-gray-800 p-2 rounded-full transition-colors text-white" title="Cari menu" onClick={() => scrollTo("menu")} aria-label="Cari menu">
            <Search size={20} strokeWidth={1.5} />
          </button>

          <button className="icon hover:bg-gray-800 p-2 rounded-full transition-colors text-white" title="Lihat Keranjang" onClick={() => scrollTo("menu")} aria-label="Keranjang">
            <ShoppingBag size={20} strokeWidth={1.5} />
          </button>

          <button
            className="lg:hidden p-2 text-white hover:bg-gray-800 rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Top-Down Menu (AWS style dropdown, not side drawer) */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#0f141a] border-t border-gray-800 shadow-xl z-50">
          <nav className="flex flex-col py-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className="text-left px-6 py-4 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                onClick={() => scrollTo(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
