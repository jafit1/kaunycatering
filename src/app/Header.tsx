"use client"

import { useState, useEffect } from "react"

const NAV_ITEMS = [
  { label: "Menu", id: "menu" },
  { label: "News & Promo", id: "promo" },
  { label: "Choose Your Moment", id: "moment" },
  { label: "Social", id: "social" },
  { label: "FAQ", id: "faq" },
  { label: "About Us", id: "about" },
  { label: "Store", id: "store" },
]

export default function Header({ storeName, logoUrl }: { storeName: string; logoUrl: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 992) setMenuOpen(false) }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
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
    <>
      <header className={`top-header${scrolled ? " scrolled" : ""}`}>
        <div className="header-container">
          <a href="/" className="logo-link">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="header-logo" />
            ) : (
              <span className="logo-text">{storeName}</span>
            )}
          </a>

          <nav className="header-nav" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className="nav-link nav-btn"
                onClick={() => scrollTo(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="header-icons">
            <button className="icon" title="Cari menu" onClick={() => scrollTo("menu")} aria-label="Cari menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <button className="icon" title="Lihat Menu" onClick={() => scrollTo("menu")} aria-label="Keranjang">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </button>

            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mobile-drawer-header">
          <span className="logo-text" style={{ fontSize: "18px" }}>{storeName}</span>
          <button className="mobile-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Tutup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} className="mobile-nav-item" onClick={() => scrollTo(item.id)}>
              {item.label}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          ))}
        </nav>
        <div className="mobile-drawer-footer">
          <p style={{ fontSize: "12px", color: "#718096", textAlign: "center" }}>
            © 2024 Kauny Catering · Pesan via WhatsApp
          </p>
        </div>
      </div>
    </>
  )
}
