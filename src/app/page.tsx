import prisma from "@/lib/prisma"
import Catalog from "./Catalog"
import Intro from "./Intro"

// Selalu ambil data terbaru dari database saat halaman dibuka
export const dynamic = "force-dynamic"

export default async function Home() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      include: { categories: true, variants: true },
      orderBy: { name: "asc" },
    }),
    prisma.setting.findMany(),
  ])
  const get = (key: string) => settings.find((s: { key: string; value: string }) => s.key === key)?.value

  const waNumber = get("wa_number") || "6282324793627"
  const storeName = get("store_name") || "Kauny Catering"
  const logoUrl = get("logo_url") || ""
  const storeTagline = get("store_tagline") || "Sajian lezat untuk setiap momen spesial Anda."
  const storeAddress = get("store_address") || "Kota Anda, Indonesia"
  const storeHours = get("store_hours") || "Senin – Sabtu: 07.00 – 20.00\nMinggu: 08.00 – 17.00"
  const storeInstagram = get("store_instagram") || "@kaunycatering"
  const introEnabled = get("intro_enabled") !== "0"
  const introTitle = get("intro_title") || "Sajian *lezat* untuk setiap acara Anda"
  const introSubtitle = get("intro_subtitle") ?? "Katering, snack box, dan prasmanan — pesan mudah lewat WhatsApp."
  const catalogTitle = get("catalog_title") || "Mau pesan apa hari ini?"
  const deliveryStart = get("delivery_start") || "07:00"
  const deliveryEnd = get("delivery_end") || "18:00"
  const minDays = Math.max(0, parseInt(get("min_order_days") || "1", 10) || 0)

  return (
    <div id="top">
      {introEnabled && <Intro storeName={storeName} logoUrl={logoUrl} title={introTitle} subtitle={introSubtitle} />}

      <section id="menu" className="container-x pt-4 sm:pt-8 pb-10 scroll-mt-32">
        <Catalog
          initialProducts={products}
          waNumber={waNumber}
          storeName={storeName}
          title={catalogTitle}
          deliveryStart={deliveryStart}
          deliveryEnd={deliveryEnd}
          minDays={minDays}
        />
      </section>

      {/* ── Info toko & footer ─────────────────── */}
      <footer id="store" className="bg-brand-950 text-white pb-28 sm:pb-10">
        <div className="container-x pt-10 sm:pt-14">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="text-lg font-extrabold tracking-tight">{storeName}</div>
              <p className="mt-2 text-[13px] text-white/60 max-w-sm leading-relaxed">{storeTagline}</p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
                  Chat WhatsApp
                </a>
                <a
                  href={`https://instagram.com/${storeInstagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-white/10 border border-white/15 hover:bg-white/20"
                >
                  Instagram
                </a>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent mb-2">Alamat</div>
              <p className="text-[13px] text-white/75 leading-relaxed">{storeAddress}</p>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent mb-2">Jam buka</div>
              <p className="text-[13px] text-white/75 leading-relaxed whitespace-pre-line">{storeHours}</p>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-5 flex items-center justify-between gap-3 text-[11.5px] text-white/40">
            <span>&copy; {new Date().getFullYear()} {storeName}</span>
            <a href="/admin" className="hover:text-white/80 transition-colors">
              Masuk admin
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
