"use client"

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Check, ChevronDown, X } from "lucide-react"

/* ─────────────────────────────────────────────────────────────
   Event bus kecil antara Header (di layout) dan Catalog (di page)
   ───────────────────────────────────────────────────────────── */
export const EVT = {
  search: "kauny:search", // detail: string
  category: "kauny:category", // detail: string
  openCart: "kauny:open-cart",
  cartCount: "kauny:cart-count", // detail: number
} as const

export function emit<T>(name: string, detail?: T) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

export function useEvent<T>(name: string, handler: (detail: T) => void) {
  const ref = useRef(handler)
  useLayoutEffect(() => {
    ref.current = handler
  })
  useEffect(() => {
    const fn = (e: Event) => ref.current((e as CustomEvent<T>).detail)
    window.addEventListener(name, fn)
    return () => window.removeEventListener(name, fn)
  }, [name])
}

export function scrollToId(id: string, offset = 90) {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: y, behavior: "smooth" })
}

/* ─────────────────────────────────────────────────────────────
   usePresence — menahan elemen tetap ter-mount selama animasi keluar
   ───────────────────────────────────────────────────────────── */
export function usePresence(open: boolean, duration = 320) {
  // `lingering` menahan elemen tetap ter-mount selama animasi keluar
  const [lingering, setLingering] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let r2 = 0
    if (open) {
      const r = requestAnimationFrame(() => {
        setLingering(true)
        r2 = requestAnimationFrame(() => setVisible(true))
      })
      return () => {
        cancelAnimationFrame(r)
        cancelAnimationFrame(r2)
      }
    }
    const r = requestAnimationFrame(() => setVisible(false))
    const t = setTimeout(() => setLingering(false), duration)
    return () => {
      cancelAnimationFrame(r)
      clearTimeout(t)
    }
  }, [open, duration])

  const mounted = open || lingering
  return { mounted, visible }
}

function useBodyLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const { overflow, paddingRight } = document.body.style
    const gap = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = "hidden"
    if (gap > 0) document.body.style.paddingRight = `${gap}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [active])
}

function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [active, onClose])
}

const noopSubscribe = () => () => {}

function Portal({ children }: { children: ReactNode }) {
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
  return ready ? createPortal(children, document.body) : null
}

/* ─────────────────────────────────────────────────────────────
   Modal — tengah di desktop, bottom-sheet di HP
   ───────────────────────────────────────────────────────────── */
export function Modal({
  open,
  onClose,
  children,
  size = "md",
  title,
  subtitle,
  footer,
  bare = false,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  title?: ReactNode
  subtitle?: ReactNode
  footer?: ReactNode
  bare?: boolean
}) {
  const { mounted, visible } = usePresence(open)
  useBodyLock(mounted)
  useEscape(open, onClose)
  const titleId = useId()
  if (!mounted) return null

  const width = { sm: "sm:max-w-sm", md: "sm:max-w-lg", lg: "sm:max-w-2xl", xl: "sm:max-w-4xl" }[size]

  return (
    <Portal>
      <div className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}>
        <div
          className={`absolute inset-0 bg-brand-950/55 backdrop-blur-[6px] transition-opacity duration-300 ease-smooth ${visible ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />
        <div
          className={`relative w-full ${width} max-h-[92dvh] flex flex-col bg-white shadow-pop rounded-t-4xl sm:rounded-4xl overflow-hidden
          transition-all duration-[380ms] ease-smooth will-change-transform
          ${visible ? "opacity-100 translate-y-0 sm:scale-100" : "opacity-0 translate-y-full sm:translate-y-6 sm:scale-[0.96]"}`}
        >
          {/* grabber (HP) */}
          <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 h-1.5 w-10 rounded-full bg-black/10 z-20" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-3 right-3 z-20 grid place-items-center h-8 w-8 rounded-lg bg-white/90 backdrop-blur text-ink shadow-soft hover:bg-brand-50 transition-colors"
          >
            <X size={16} strokeWidth={2.2} />
          </button>

          {!bare && (title || subtitle) && (
            <div className="px-6 pt-7 pb-4 pr-16 border-b border-hairline">
              {title && <h3 id={titleId} className="text-base sm:text-lg font-bold text-ink tracking-tight">{title}</h3>}
              {subtitle && <p className="text-sm text-ink-faded mt-1">{subtitle}</p>}
            </div>
          )}
          <div className={`${bare ? "" : "px-6 py-5"} overflow-y-auto overscroll-contain flex-1 no-scrollbar`}>{children}</div>
          {footer && <div className="px-6 py-4 border-t border-hairline bg-white safe-bottom">{footer}</div>}
        </div>
      </div>
    </Portal>
  )
}

/* ─────────────────────────────────────────────────────────────
   Drawer — panel geser dari kanan (keranjang / menu HP)
   ───────────────────────────────────────────────────────────── */
export function Drawer({
  open,
  onClose,
  children,
  side = "right",
  title,
  footer,
  width = "max-w-md",
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  side?: "right" | "left"
  title?: ReactNode
  footer?: ReactNode
  width?: string
}) {
  const { mounted, visible } = usePresence(open, 380)
  useBodyLock(mounted)
  useEscape(open, onClose)
  if (!mounted) return null
  const hidden = side === "right" ? "translate-x-full" : "-translate-x-full"

  return (
    <Portal>
      <div className="fixed inset-0 z-[130]" role="dialog" aria-modal="true">
        <div
          className={`absolute inset-0 bg-brand-950/50 backdrop-blur-[5px] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />
        <aside
          className={`absolute top-0 ${side === "right" ? "right-0 sm:rounded-l-4xl" : "left-0 sm:rounded-r-4xl"} h-full w-full ${width} bg-white shadow-pop flex flex-col
          transition-transform duration-[420ms] ease-smooth will-change-transform ${visible ? "translate-x-0" : hidden}`}
        >
          <div className="flex items-center justify-between gap-4 px-4 sm:px-5 h-14 border-b border-hairline shrink-0">
            <div className="font-bold text-ink text-[15px] tracking-tight">{title}</div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="grid place-items-center h-8 w-8 rounded-lg bg-surface-1 text-ink hover:bg-brand-50 transition-colors"
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar">{children}</div>
          {footer && <div className="border-t border-hairline px-4 sm:px-5 py-3.5 bg-white safe-bottom">{footer}</div>}
        </aside>
      </div>
    </Portal>
  )
}

/* ─────────────────────────────────────────────────────────────
   Dropdown — pengganti <select> dengan animasi & keyboard
   ───────────────────────────────────────────────────────────── */
export type DropdownOption<V extends string = string> = {
  value: V
  label: ReactNode
  hint?: ReactNode
  icon?: ReactNode
}

export function Dropdown<V extends string = string>({
  value,
  options,
  onChange,
  placeholder = "Pilih",
  label,
  variant = "outline",
  align = "left",
  fullWidth = false,
  icon,
  menuTitle,
  className = "",
}: {
  value: V | ""
  options: DropdownOption<V>[]
  onChange: (v: V) => void
  placeholder?: ReactNode
  label?: ReactNode
  variant?: "solid" | "outline" | "soft" | "field"
  align?: "left" | "right"
  fullWidth?: boolean
  icon?: ReactNode
  menuTitle?: ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [pos, setPos] = useState<React.CSSProperties & { up?: boolean }>({})
  const { mounted, visible } = usePresence(open, 220)
  const listId = useId()
  const current = options.find((o) => o.value === value)

  const close = useCallback(() => setOpen(false), [])

  /** Posisi menu (fixed, di portal) supaya tidak terpotong modal/drawer */
  const measure = (): React.CSSProperties & { up?: boolean } => {
    const b = btnRef.current
    if (!b) return {}
    const r = b.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const minW = Math.min(fullWidth ? r.width : Math.max(220, r.width), vw - 16)
    const below = vh - r.bottom
    const up = below < 280 && r.top > below
    const style: React.CSSProperties & { up?: boolean } = { position: "fixed", minWidth: minW, up }
    if (fullWidth) style.width = r.width
    if (up) style.bottom = vh - r.top + 8
    else style.top = r.bottom + 8
    if (align === "right") style.right = Math.max(8, vw - r.right)
    else style.left = Math.min(Math.max(8, r.left), vw - minW - 8)
    style.maxHeight = Math.max(180, (up ? r.top : below) - 24)
    return style
  }


  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!rootRef.current?.contains(t) && !menuRef.current?.contains(t)) close()
    }
    const onMove = () => setPos(measure())
    document.addEventListener("pointerdown", onDown)
    window.addEventListener("scroll", onMove, true)
    window.addEventListener("resize", onMove)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      window.removeEventListener("scroll", onMove, true)
      window.removeEventListener("resize", onMove)
    }
  }, [open, close]) // eslint-disable-line react-hooks/exhaustive-deps

  const openMenu = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)))
    setPos(measure())
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const el = listRef.current?.children[active] as HTMLElement | undefined
    el?.scrollIntoView({ block: "nearest" })
  }, [active, open])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close()
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      return openMenu()
    }
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(options.length - 1, a + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      const opt = options[active]
      if (opt) {
        onChange(opt.value)
        close()
      }
    } else if (e.key === "Tab") close()
  }

  const styles = {
    solid: "bg-brand-800 text-white border-brand-800 hover:bg-brand-900",
    outline: "bg-white text-ink border-hairline hover:border-brand-300",
    soft: "bg-surface-1 text-ink border-transparent hover:bg-brand-50",
    field: "bg-white text-ink border-hairline hover:border-brand-300 rounded-lg h-10 px-3.5 text-[13px]",
  }[variant]

  const isField = variant === "field"
  const selectedHasValue = !!current

  return (
    <div ref={rootRef} className={`relative ${fullWidth ? "w-full" : "inline-block"} ${className}`} onKeyDown={onKey}>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? close() : openMenu())}
        className={`group inline-flex items-center gap-2 border font-semibold whitespace-nowrap transition-all duration-200 ease-smooth
          ${isField ? "" : "h-9 px-3.5 rounded-lg text-[13px]"} ${fullWidth ? "w-full justify-between" : ""} ${styles}
          ${open ? (variant === "solid" ? "ring-2 ring-brand-200" : "border-brand-500 ring-2 ring-brand-100") : ""}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {icon && <span className="shrink-0 opacity-80">{icon}</span>}
          {label && <span className={`${variant === "solid" ? "text-white/70" : "text-ink-faded"} font-medium`}>{label}</span>}
          <span className={`truncate ${!selectedHasValue && isField ? "text-ink-faded font-medium" : ""}`}>
            {current ? current.label : placeholder}
          </span>
        </span>
        <ChevronDown size={14} strokeWidth={2.4} className={`shrink-0 transition-transform duration-300 ease-smooth ${open ? "rotate-180" : ""}`} />
      </button>

      {mounted && (
        <Portal>
        <div
          ref={menuRef}
          style={{ ...pos, up: undefined } as React.CSSProperties}
          className={`z-[160] flex flex-col ${pos.up ? "origin-bottom" : "origin-top"}
          rounded-xl bg-white border border-hairline shadow-pop p-1
          transition-[opacity,transform] duration-200 ease-smooth ${visible ? "opacity-100 translate-y-0 scale-100" : `opacity-0 ${pos.up ? "translate-y-1" : "-translate-y-1"} scale-[0.97] pointer-events-none`}`}
        >
          {menuTitle && <div className="px-3 pt-2 pb-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-faded">{menuTitle}</div>}
          <ul ref={listRef} id={listId} role="listbox" className="max-h-72 min-h-0 overflow-y-auto no-scrollbar">
            {options.map((o, i) => {
              const selected = o.value === value
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    onChange(o.value)
                    close()
                  }}
                  style={{ transitionDelay: visible ? `${Math.min(i, 8) * 18}ms` : "0ms" }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-[13px] transition-all duration-200
                    ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}
                    ${i === active ? "bg-brand-50" : ""} ${selected ? "text-brand-800 font-semibold" : "text-ink-body"}`}
                >
                  {o.icon && <span className="shrink-0 text-brand-700">{o.icon}</span>}
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{o.label}</span>
                    {o.hint && <span className="block text-[11px] text-ink-faded font-normal mt-0.5">{o.hint}</span>}
                  </span>
                  <span className={`transition-all duration-200 text-brand-700 ${selected ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
                    <Check size={14} strokeWidth={2.6} />
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
        </Portal>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Reveal — animasi muncul saat di-scroll
   ───────────────────────────────────────────────────────────── */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  id,
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: "div" | "section" | "li" | "article"
  id?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!("IntersectionObserver" in window)) {
      const r = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(r)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} id={id} className={`reveal ${shown ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  )
}
