import prisma from "@/lib/prisma"
import Catalog from "./Catalog"
import { Reveal } from "./ui"
import { ArrowRight } from "lucide-react"

export default async function Home() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      include: { categories: true, variants: true },
      orderBy: { name: "asc" },
    }),
    prisma.setting.findMany(),
  ])
  const getSetting = (key: string) => settings.find((s: { key: string; value: string }) => s.key === key)?.value || ""

  const waNumber = getSetting("wa_number") || "6282324793627"
  const storeName = getSetting("store_name") || "Kauny Catering"
  const storeTagline = getSetting("store_tagline") || "Layanan Katering Kelas Enterprise untuk Setiap Acara Anda."
  const storeAddress = getSetting("store_address") || "Kota Anda, Indonesia"
  const storeHours = getSetting("store_hours") || "Senin – Sabtu: 07.00 – 20.00\nMinggu: 08.00 – 17.00"
  const storeInstagram = getSetting("store_instagram") || "@kaunycatering"

  const services = [
    { title: "Snack Box", desc: "Paket snack hemat untuk seminar, rapat, dan gathering dengan varian modern & tradisional." },
    { title: "Prasmanan & Buffet", desc: "Sajian prasmanan premium dengan dekorasi elegan dan staf pelayan profesional." },
    { title: "Catering Pernikahan", desc: "Menu istimewa untuk momen terpenting dalam hidup Anda. Konsultasi menu gratis." },
    { title: "Hampers & Hantaran", desc: "Kirim kebahagiaan melalui paket hampers eksklusif dengan kemasan kustom." },
  ]

  const stats = [
    { value: "500+", label: "Pelanggan" },
    { value: "50+", label: "Menu pilihan" },
    { value: "4.9/5", label: "Rating" },
    { value: "100%", label: "Halal" },
  ]

  return (
    <div id="top">
      {/* ── HERO ─────────────────────────────────── */}
      <section className="container-x pt-3 sm:pt-6">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-brand-900 text-white animate-fade-up">
          {/* HP: foto jadi latar; desktop: foto di kanan */}
          <div className="absolute inset-0 md:left-auto md:w-[46%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1100&q=80"
              alt=""
              className="h-full w-full object-cover hero-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/75 to-brand-950/30 md:bg-gradient-to-r md:from-brand-900 md:via-brand-900/40 md:to-transparent" />
          </div>
          <div className="absolute inset-0 hero-dots opacity-50 md:w-[60%]" />

          <div className="relative px-5 sm:px-10 lg:px-14 pt-28 pb-6 sm:pt-32 md:py-16 lg:py-20 md:max-w-[58%]">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-accent animate-fade-up" style={{ animationDelay: "120ms" }}>
              Katering terpercaya · 100% halal
            </span>
            <h1 className="mt-2 sm:mt-3 text-[26px] leading-[1.18] sm:text-4xl lg:text-[46px] font-extrabold tracking-tight text-balance animate-fade-up" style={{ animationDelay: "200ms" }}>
              Sajian <span className="text-accent">lezat</span> untuk setiap acara Anda
            </h1>
            <p className="mt-3 text-[13px] sm:text-[15px] text-white/75 leading-relaxed max-w-md animate-fade-up" style={{ animationDelay: "280ms" }}>
              Katering, snack box, dan prasmanan dengan bahan segar — pesan mudah langsung lewat WhatsApp.
            </p>
            <div className="mt-5 sm:mt-7 flex gap-2.5 animate-fade-up" style={{ animationDelay: "360ms" }}>
              <a href="#menu" className="btn btn-accent group">
                Pesan Sekarang
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href="#promo" className="btn bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur">
                Lihat Layanan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────── */}
      <section className="container-x mt-3 sm:mt-4">
        <Reveal className="grid grid-cols-4 rounded-xl bg-surface-1 divide-x divide-hairline">
          {stats.map((s) => (
            <div key={s.label} className="px-2 py-3 sm:py-5 text-center">
              <div className="text-[15px] sm:text-2xl font-extrabold text-brand-900">{s.value}</div>
              <div className="text-[10.5px] sm:text-xs text-ink-faded mt-0.5">{s.label}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ── SERVICES ─────────────────────────────── */}
      <section id="promo" className="container-x pt-12 sm:pt-20 scroll-mt-32">
        <Reveal className="mb-5 sm:mb-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 mb-1.5">Layanan kami</div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-ink tracking-tight">Katering untuk semua momen</h2>
        </Reveal>

        {/* HP: geser horizontal; desktop: grid */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {services.map((f, i) => (
            <Reveal key={f.title} delay={i * 80} className="shrink-0 w-[72%] sm:w-auto snap-start">
              <a href="#menu" className="group flex h-full flex-col rounded-xl bg-surface-1 p-5 transition-all duration-500 ease-smooth hover:bg-white hover:shadow-lift hover:-translate-y-1">
                <span className="text-xs font-bold text-brand-500">0{i + 1}</span>
                <h3 className="mt-2 font-bold text-ink text-[15px]">{f.title}</h3>
                <p className="mt-1.5 text-[13px] text-ink-faded leading-relaxed flex-1">{f.desc}</p>
                <span className="mt-4 text-[13px] font-semibold text-brand-700 group-hover:underline underline-offset-4">Lihat menu →</span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CATALOG ───────────────────────────────── */}
      <section id="menu" className="container-x pt-12 sm:pt-20 pb-8 scroll-mt-32">
        <Catalog initialProducts={products} waNumber={waNumber} />
      </section>

      {/* ── STORE INFO ───────────────────────────── */}
      <section id="store" className="container-x pt-8 pb-28 sm:pb-24 scroll-mt-32">
        <Reveal>
          <div className="grid lg:grid-cols-2 gap-3 sm:gap-5 items-stretch">
            <div className="rounded-2xl bg-surface-1 p-5 sm:p-10 flex flex-col">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 mb-1.5">Info toko</div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-ink tracking-tight">Dapur kami siap melayani</h2>
              <p className="mt-2.5 text-[13px] sm:text-sm text-ink-faded leading-relaxed">
                Dapur utama kami dilengkapi standar kebersihan tinggi untuk memproses pesanan hingga ribuan porsi per hari. Kami menjamin setiap makanan tiba tepat waktu.
              </p>

              <dl className="mt-6 grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-faded">Lokasi dapur</dt>
                  <dd className="mt-1 text-[13px] font-semibold text-ink leading-relaxed">{storeAddress}</dd>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-faded">Jam operasional</dt>
                  <dd className="mt-1 text-[13px] font-semibold text-ink leading-relaxed whitespace-pre-line">{storeHours}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
                  Hubungi via WhatsApp
                </a>
                <a href={`https://instagram.com/${storeInstagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  Instagram {storeInstagram}
                </a>
              </div>
            </div>

            <div className="relative min-h-[220px] sm:min-h-[280px] rounded-2xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80"
                alt="Dapur Kauny Catering"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-smooth group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/10 to-transparent" />
              <div className="absolute left-5 right-5 bottom-5 sm:left-8 sm:bottom-8 text-white">
                <div className="text-[11px] font-semibold text-accent mb-1">Siap untuk acara Anda</div>
                <div className="text-lg sm:text-2xl font-extrabold leading-snug max-w-sm">Ribuan porsi per hari, tiba tepat waktu.</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className="bg-brand-950 text-white">
        <div className="container-x pt-12 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2">
              <div className="text-lg font-extrabold tracking-tight">{storeName}</div>
              <p className="mt-3 text-[13px] text-white/60 max-w-sm leading-relaxed">{storeTagline}</p>
            </div>
            <div>
              <div className="font-bold mb-3 text-white/90 text-[13px]">Layanan</div>
              <ul className="space-y-2.5 text-[13px] text-white/55">
                <li><a href="#menu" className="hover:text-accent transition-colors">Snack Box Corporate</a></li>
                <li><a href="#promo" className="hover:text-accent transition-colors">Wedding Catering</a></li>
                <li><a href="#promo" className="hover:text-accent transition-colors">Prasmanan Premium</a></li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-3 text-white/90 text-[13px]">Kontak</div>
              <ul className="space-y-2.5 text-[13px] text-white/55">
                <li><a href={`https://wa.me/${waNumber}`} className="hover:text-accent transition-colors">WhatsApp Order</a></li>
                <li><a href={`https://instagram.com/${storeInstagram.replace("@", "")}`} className="hover:text-accent transition-colors">Instagram {storeInstagram}</a></li>
                <li><a href="#store" className="hover:text-accent transition-colors">Jam &amp; Lokasi</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11.5px] text-white/40">
            <div>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</div>
            <div className="flex gap-5">
              <a href="#" className="hover:text-white/80 transition-colors">Privasi</a>
              <a href="#" className="hover:text-white/80 transition-colors">Syarat &amp; Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
