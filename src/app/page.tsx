import prisma from "@/lib/prisma"
import Catalog from "./Catalog"

export default async function Home() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ category: { order: 'asc' } }, { name: 'asc' }]
  })
  const settings = await prisma.setting.findMany()
  const getSetting = (key: string) => settings.find((s: any) => s.key === key)?.value || ''
  
  const waNumber = getSetting('wa_number') || '6282324793627'
  const storeName = getSetting('store_name') || 'Kauny Catering'
  const storeTagline = getSetting('store_tagline') || 'Sajian lezat untuk setiap momen spesial Anda.'
  const storeAddress = getSetting('store_address') || 'Kota Anda, Indonesia'
  const storeHours = getSetting('store_hours') || 'Senin – Sabtu: 07.00 – 20.00\nMinggu: 08.00 – 17.00'
  const storeAbout = getSetting('store_about') || 'Kauny Catering lahir dari kecintaan kami terhadap kuliner Indonesia yang kaya rasa.\n\nKami berkomitmen menghadirkan pengalaman makan yang tidak hanya memuaskan lidah, tetapi juga memberikan kemudahan dalam pemesanan — langsung melalui WhatsApp, tanpa ribet.'
  const storeInstagram = getSetting('store_instagram') || '@kaunycatering'

  return (
    <>
      {/* ── HERO ──────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🍱 Catering Premium</div>
          <h1 className="hero-title">Sajian Lezat untuk<br />Setiap Momen Spesial</h1>
          <p className="hero-subtitle">
            Nikmati cita rasa terbaik dengan bahan pilihan segar. Pesan mudah, kirim tepat waktu.
          </p>
          <div className="hero-actions">
            <a href="#menu" className="btn hero-btn-primary">
              Pesan Sekarang
            </a>
            <a href="#about" className="btn btn-outline hero-btn-outline">
              Tentang Kami
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item"><span className="stat-num">500+</span><span className="stat-label">Pelanggan Puas</span></div>
            <div className="stat-divider" />
            <div className="stat-item"><span className="stat-num">50+</span><span className="stat-label">Menu Pilihan</span></div>
            <div className="stat-divider" />
            <div className="stat-item"><span className="stat-num">5★</span><span className="stat-label">Rating Tertinggi</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-circle">
            <span className="hero-emoji">🍱</span>
          </div>
          <div className="hero-floating hero-f1">🥘</div>
          <div className="hero-floating hero-f2">🍰</div>
          <div className="hero-floating hero-f3">☕</div>
        </div>
      </section>

      {/* ── MENU ──────────────────────────────── */}
      <section id="menu" className="page-section">
        <div className="section-header">
          <h2 className="section-title">Menu Kami</h2>
          <p className="section-subtitle">Temukan hidangan favorit Anda dari berbagai kategori pilihan</p>
        </div>
        <Catalog initialProducts={products} waNumber={waNumber} />
      </section>

      {/* ── NEWS & PROMO ───────────────────────── */}
      <section id="promo" className="page-section bg-section-alt">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Berita & Promo</h2>
            <p className="section-subtitle">Jangan lewatkan penawaran terbaik dari kami</p>
          </div>
          <div className="promo-grid">
            <div className="promo-card promo-featured">
              <div className="promo-badge-tag">🔥 Promo Spesial</div>
              <div className="promo-emoji">🎉</div>
              <h3>Paket Snack Box Spesial</h3>
              <p>Hemat hingga 20% untuk pemesanan Snack Box di atas 50 pax. Cocok untuk acara kantor dan seminar.</p>
              <a href="#menu" className="btn promo-btn">Pesan Sekarang</a>
            </div>
            <div className="promo-card">
              <div className="promo-emoji">🚀</div>
              <h3>Gratis Ongkir Dalam Kota</h3>
              <p>Pesan minimal 20 pax, pengiriman gratis ke seluruh area dalam kota.</p>
            </div>
            <div className="promo-card">
              <div className="promo-emoji">🎂</div>
              <h3>Paket Ulang Tahun</h3>
              <p>Rayakan momen istimewa dengan paket catering spesial hari jadi. Hubungi kami untuk info lebih lanjut.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHOOSE YOUR MOMENT ─────────────────── */}
      <section id="moment" className="page-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Pilihan Momen Anda</h2>
            <p className="section-subtitle">Kami siap hadir di setiap momen berharga Anda</p>
          </div>
          <div className="moment-grid">
            {[
              { emoji: "🏢", title: "Rapat & Seminar", desc: "Paket snack box dan nasi box untuk kegiatan kantor dan rapat." },
              { emoji: "🎊", title: "Pesta & Perayaan", desc: "Sajian lengkap untuk ulang tahun, gathering, dan acara keluarga." },
              { emoji: "💒", title: "Pernikahan", desc: "Catering pernikahan dengan menu premium dan pelayanan profesional." },
              { emoji: "🎓", title: "Wisuda & Syukuran", desc: "Rayakan pencapaian dengan hidangan terbaik bersama orang tersayang." },
              { emoji: "🏥", title: "Acara Sosial", desc: "Dukungan konsumsi untuk bakti sosial, pengajian, dan kegiatan komunitas." },
              { emoji: "🎁", title: "Hampers & Hadiah", desc: "Paket hampers snack premium sebagai hadiah berkesan untuk klien." },
            ].map((m) => (
              <div key={m.title} className="moment-card">
                <div className="moment-icon">{m.emoji}</div>
                <h3 className="moment-title">{m.title}</h3>
                <p className="moment-desc">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORE ──────────────────────────────── */}
      <section id="store" className="page-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Informasi Toko</h2>
            <p className="section-subtitle">Kunjungi kami atau hubungi untuk konsultasi menu</p>
          </div>
          <div className="store-grid">
            <div className="store-info-card">
              <div className="store-info-icon">📍</div>
              <div>
                <div className="store-info-label">Lokasi</div>
                <div className="store-info-value">{storeAddress}</div>
              </div>
            </div>
            <div className="store-info-card">
              <div className="store-info-icon">🕐</div>
              <div>
                <div className="store-info-label">Jam Operasional</div>
                <div className="store-info-value">
                  {storeHours.split('\n').map((line: string, i: number) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </div>
              </div>
            </div>
            <div className="store-info-card">
              <div className="store-info-icon">📞</div>
              <div>
                <div className="store-info-label">Hubungi Kami</div>
                <div className="store-info-value">
                  <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="store-wa-link">
                    Chat via WhatsApp →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── SOCIAL ─────────────────────────────── */}
      <section id="social" className="page-section bg-section-alt">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Ikuti Kami</h2>
            <p className="section-subtitle">Tetap terhubung dan dapatkan update terbaru dari Kauny Catering</p>
          </div>
          <div className="social-grid">
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="social-card social-wa">
              <div className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div>
                <div className="social-name">WhatsApp</div>
                <div className="social-handle">Chat & Pemesanan</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:"auto"}}>
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="social-card social-ig">
              <div className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div>
                <div className="social-name">Instagram</div>
                <div className="social-handle">{storeInstagram}</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:"auto"}}>
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────── */}
      <section id="faq" className="page-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Tanya Jawab</h2>
            <p className="section-subtitle">Pertanyaan yang sering ditanyakan pelanggan kami</p>
          </div>
          <div className="faq-list">
            {[
              { q: "Berapa minimal pemesanan?", a: "Minimal pemesanan adalah 10 pax untuk paket nasi box dan snack box. Untuk pemesanan satuan silakan hubungi kami terlebih dahulu." },
              { q: "Berapa lama waktu pemesanan sebelumnya?", a: "Kami menyarankan pemesanan minimal H-2 (2 hari sebelumnya) agar kualitas masakan terjaga. Untuk acara besar (>100 pax), minimal H-5." },
              { q: "Apakah tersedia layanan pengiriman?", a: "Ya, kami melayani pengiriman ke seluruh area kota. Biaya pengiriman gratis untuk pemesanan minimal 20 pax dalam radius 5 km." },
              { q: "Bagaimana cara memesan snack box custom?", a: "Pilih produk yang Anda inginkan lalu klik 'Buat Snack Box', tambahkan item ke dalam box, atur jumlah, dan konfirmasi. Pesanan akan dikirim ke WhatsApp kami." },
              { q: "Metode pembayaran apa yang diterima?", a: "Kami menerima transfer bank (BCA, BRI, Mandiri), QRIS, dan tunai saat pengiriman (COD) untuk area tertentu." },
            ].map((item, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">
                  {item.q}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="faq-chevron">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </summary>
                <div className="faq-answer">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT US ───────────────────────────── */}
      <section id="about" className="page-section bg-section-alt">
        <div className="section-container">
          <div className="about-grid">
            <div className="about-visual">
              <div className="about-circle">
                <span style={{ fontSize: "72px" }}>👨‍🍳</span>
              </div>
              <div className="about-badge-float">🍽️ Est. 2020</div>
            </div>
            <div className="about-content">
              <div className="section-eyebrow">Tentang Kami</div>
              <h2 className="section-title" style={{ textAlign: "left" }}>{storeName}</h2>
              {storeAbout.split('\n').map((paragraph: string, i: number) => paragraph.trim() ? (
                <p key={i} className="about-desc">
                  {paragraph}
                </p>
              ) : null)}
              <div className="about-values">
                {["🌿 Bahan Segar Setiap Hari", "⏱️ Tepat Waktu Selalu", "❤️ Dibuat dengan Cinta", "🛡️ Higienis & Terjamin"].map(v => (
                  <div key={v} className="about-value-item">{v}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-text" style={{ fontSize: "20px" }}>{storeName}</span>
            <p>{storeTagline}</p>
          </div>
          <div className="footer-links">
            <a href="#menu" className="footer-link">Menu</a>
            <a href="#promo" className="footer-link">Promo</a>
            <a href="#faq" className="footer-link">Tanya Jawab</a>
            <a href="#about" className="footer-link">Tentang Kami</a>
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="footer-link">WhatsApp</a>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
