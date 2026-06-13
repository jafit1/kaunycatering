import prisma from "@/lib/prisma"
import Catalog from "./Catalog"
import { CheckCircle2, ChevronRight, Clock, MapPin, MessageSquare, Package, Shield, Star, Users } from "lucide-react"

export default async function Home() {
  const products = await prisma.product.findMany({
    include: { categories: true, variants: true },
    orderBy: { name: 'asc' }
  })
  const settings = await prisma.setting.findMany()
  const getSetting = (key: string) => settings.find((s: any) => s.key === key)?.value || ''
  
  const waNumber = getSetting('wa_number') || '6282324793627'
  const storeName = getSetting('store_name') || 'Kauny Catering'
  const storeTagline = getSetting('store_tagline') || 'Layanan Katering Kelas Enterprise untuk Setiap Acara Anda.'
  const storeAddress = getSetting('store_address') || 'Kota Anda, Indonesia'
  const storeHours = getSetting('store_hours') || 'Senin – Sabtu: 07.00 – 20.00\nMinggu: 08.00 – 17.00'
  const storeInstagram = getSetting('store_instagram') || '@kaunycatering'

  return (
    <>
      {/* ── HERO ──────────────────────────────── */}
      <section className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Text */}
          <div className="flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-1 border border-hairline rounded-sm text-xs font-mono text-ink-body mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Catering Enterprise Edition
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-ink leading-tight tracking-tight mb-6">
              Layanan Katering Terpercaya untuk Skala Besar & Kecil
            </h1>
            <p className="text-lg md:text-xl text-ink-body leading-relaxed mb-8 max-w-xl">
              Platform pemesanan katering instan dengan kapasitas tinggi, bahan segar terkurasi, dan pengiriman terjamin. Dibangun untuk kebutuhan personal hingga enterprise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#menu" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-aws-pill font-bold hover:bg-primary-hover transition-colors shadow-aws-elevation-1">
                Pesan Sekarang
                <ChevronRight size={18} strokeWidth={2} />
              </a>
              <a href="#about" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-ink border border-hairline rounded-aws-pill font-semibold hover:bg-surface-1 transition-colors">
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>
          
          {/* Right Visual (AWS Thumbnail Card Style) */}
          <div className="flex-1 w-full max-w-lg">
            <div className="relative rounded-aws-card overflow-hidden border border-hairline shadow-aws-elevation-1 group">
              {/* Subtle dynamic background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 group-hover:to-black/30 transition-all duration-500 z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Kauny Catering Spread" 
                className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/95 backdrop-blur-sm border border-hairline p-4 rounded-aws-card shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Featured Service</div>
                    <div className="font-semibold text-ink">Premium Buffet Package</div>
                  </div>
                  <ChevronRight size={20} className="text-ink-faded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS / LOGOS ───────────────────── */}
      <section className="border-y border-hairline bg-surface-1 py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-wrap justify-center gap-8 md:gap-16 items-center text-ink-body">
          <div className="text-sm font-semibold tracking-wide uppercase text-ink-faded w-full text-center mb-2">Dipercaya oleh berbagai instansi & keluarga</div>
          <div className="flex items-center gap-2"><Users size={24} strokeWidth={1.5} className="text-primary"/> <span className="font-semibold text-lg">500+ Pelanggan</span></div>
          <div className="flex items-center gap-2"><Package size={24} strokeWidth={1.5} className="text-primary"/> <span className="font-semibold text-lg">50+ Menu Pilihan</span></div>
          <div className="flex items-center gap-2"><Star size={24} strokeWidth={1.5} className="text-primary"/> <span className="font-semibold text-lg">Rating 4.9/5</span></div>
          <div className="flex items-center gap-2"><Shield size={24} strokeWidth={1.5} className="text-primary"/> <span className="font-semibold text-lg">100% Halal</span></div>
        </div>
      </section>

      {/* ── FEATURED SERVICES (4-Up Grid) ─────── */}
      <section id="promo" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-medium text-ink tracking-tight mb-2">Layanan Katering Terpadu</h2>
        <p className="text-ink-body mb-12 max-w-2xl">Solusi lengkap untuk segala kebutuhan konsumsi acara Anda, mulai dari rapat kecil hingga perhelatan besar.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Package size={24} strokeWidth={1.5} />, title: "Snack Box Enterprise", desc: "Paket snack hemat untuk seminar, rapat, dan gathering dengan varian modern & tradisional." },
            { icon: <Users size={24} strokeWidth={1.5} />, title: "Prasmanan & Buffet", desc: "Sajian prasmanan premium dengan dekorasi elegan dan staf pelayan profesional." },
            { icon: <CheckCircle2 size={24} strokeWidth={1.5} />, title: "Catering Pernikahan", desc: "Menu istimewa untuk momen terpenting dalam hidup Anda. Konsultasi menu gratis." },
            { icon: <MessageSquare size={24} strokeWidth={1.5} />, title: "Hampers & Hantaran", desc: "Kirim kebahagiaan melalui paket hampers eksklusif dengan kemasan kustom." }
          ].map((feature, i) => (
            <div key={i} className="bg-white border border-hairline p-6 rounded-aws-card group hover:bg-surface-1 transition-colors duration-300">
              <div className="w-12 h-12 bg-surface-1 rounded-sm flex items-center justify-center text-primary mb-6 group-hover:bg-white transition-colors border border-hairline">
                {feature.icon}
              </div>
              <h3 className="font-bold text-ink mb-2">{feature.title}</h3>
              <p className="text-sm text-ink-body leading-relaxed mb-6">{feature.desc}</p>
              <a href="#menu" className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1">
                Pelajari selengkapnya <ChevronRight size={16} strokeWidth={2} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── MENU / CATALOG ────────────────────── */}
      <section id="menu" className="py-20 px-4 md:px-8 bg-surface-1 border-y border-hairline">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-medium text-ink tracking-tight mb-2">Eksplorasi Menu</h2>
          <p className="text-ink-body mb-8 max-w-2xl">Jelajahi berbagai pilihan menu satuan atau bangun paket Snack Box kustom Anda sendiri.</p>
          <Catalog initialProducts={products} waNumber={waNumber} />
        </div>
      </section>

      {/* ── STORE INFO / FOOTER PREVIEW ───────── */}
      <section id="store" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-medium text-ink tracking-tight mb-6">Infrastruktur & Layanan Kami</h2>
            <p className="text-lg text-ink-body mb-8 leading-relaxed">
              Dapur utama kami dilengkapi standar kebersihan tinggi untuk memproses pesanan hingga ribuan porsi per hari. Kami menjamin setiap makanan tiba tepat waktu.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <MapPin size={24} strokeWidth={1.5} className="text-primary shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-ink">Lokasi Dapur Pusat</div>
                  <div className="text-ink-body text-sm mt-1">{storeAddress}</div>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Clock size={24} strokeWidth={1.5} className="text-primary shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-ink">Jam Operasional</div>
                  <div className="text-ink-body text-sm mt-1 whitespace-pre-line">{storeHours}</div>
                </div>
              </div>
            </div>
            <div className="mt-10">
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ink border border-hairline rounded-aws-pill font-semibold hover:bg-surface-1 transition-colors">
                <MessageSquare size={18} strokeWidth={2} className="text-green-600" />
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
          <div className="relative rounded-aws-card overflow-hidden border border-hairline shadow-sm h-80 lg:h-[450px]">
            <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Kitchen Infrastructure" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────── */}
      <footer className="bg-[#0f141a] text-white pt-16 pb-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold mb-4">{storeName}</div>
              <p className="text-gray-400 text-sm max-w-md leading-relaxed">{storeTagline}</p>
            </div>
            <div>
              <div className="font-bold mb-4 text-gray-200">Layanan Khusus</div>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Snack Box Corporate</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Wedding Catering</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Prasmanan Premium</a></li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-4 text-gray-200">Kontak</div>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href={`https://wa.me/${waNumber}`} className="hover:text-white transition-colors">WhatsApp Order</a></li>
                <li><a href={`https://instagram.com/${storeInstagram.replace('@','')}`} className="hover:text-white transition-colors">Instagram {storeInstagram}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bantuan & FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <div>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-gray-300 transition-colors">Privasi</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
