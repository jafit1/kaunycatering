"use client"

import { useEffect, useState } from "react"
import { EVT, emit } from "./ui"

const KEY = "kauny-intro-seen"

/**
 * Layar pembuka (hanya sekali per kunjungan/tab).
 * Teks judul: kata di antara *bintang* diberi warna kuning, contoh: "Sajian *lezat* untuk acara Anda".
 */
export default function Intro({
  storeName,
  title,
  subtitle,
  logoUrl,
}: {
  storeName: string
  title: string
  subtitle: string
  logoUrl: string
}) {
  const [phase, setPhase] = useState<"in" | "out" | "done">("in")

  useEffect(() => {
    let seen = false
    try {
      seen = !!sessionStorage.getItem(KEY)
    } catch {}
    const html = document.documentElement

    if (seen) {
      const r = requestAnimationFrame(() => setPhase("done"))
      return () => cancelAnimationFrame(r)
    }

    html.classList.add("intro-lock")
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const t1 = setTimeout(() => setPhase("out"), reduce ? 700 : 2600)
    return () => {
      clearTimeout(t1)
      html.classList.remove("intro-lock")
    }
  }, [])

  useEffect(() => {
    if (phase !== "out") return
    try {
      sessionStorage.setItem(KEY, "1")
    } catch {}
    document.documentElement.classList.remove("intro-lock")
    emit(EVT.introDone)
    const t = setTimeout(() => setPhase("done"), 1000)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === "done") return null

  // pecah judul per kata; bagian ganjil di antara *...* → kuning
  const words = title.split("*").flatMap((part, idx) =>
    part
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => ({ w, hl: idx % 2 === 1 }))
  )

  return (
    <div
      id="kauny-intro"
      role="presentation"
      onClick={() => phase === "in" && setPhase("out")}
      className={`intro fixed inset-0 z-[300] flex items-center justify-center overflow-hidden cursor-pointer select-none ${phase === "out" ? "intro-out" : ""}`}
    >
      <div className="absolute inset-0 hero-glow" />
      <div className="absolute inset-0 hero-dots opacity-60" />
      <div className="intro-orb absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      <div className="intro-orb absolute -left-28 -bottom-28 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" style={{ animationDelay: "-3s" }} />

      <div className="intro-content relative px-8 text-center text-white max-w-2xl">
        <div className="intro-mark mx-auto mb-6 grid place-items-center h-14 w-14 rounded-xl bg-white/10 border border-white/15 backdrop-blur">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-9 w-9 object-contain" />
          ) : (
            <span className="text-2xl font-extrabold text-accent">{storeName.charAt(0)}</span>
          )}
        </div>
        <div className="intro-name text-[11px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-white/70">{storeName}</div>
        <h1 className="mt-4 text-[30px] leading-[1.15] sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance">
          {words.map((x, i) => (
            <span key={i} className="intro-word inline-block" style={{ animationDelay: `${450 + i * 90}ms` }}>
              <span className={x.hl ? "text-accent" : ""}>{x.w}</span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        {subtitle && (
          <p className="intro-sub mt-4 text-sm sm:text-base text-white/75 leading-relaxed" style={{ animationDelay: `${600 + words.length * 90}ms` }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-3 text-white/60">
        <div className="h-[3px] w-32 rounded-full bg-white/15 overflow-hidden">
          <div className="intro-bar h-full bg-accent rounded-full" />
        </div>
        <span className="text-[11px] tracking-wide">Ketuk layar untuk lanjut</span>
      </div>
    </div>
  )
}
