"use client"

import { useMemo, useState, type ReactNode } from "react"
import { updateSettings } from "./actions"
import { Dropdown, TimePicker } from "../ui"

type Setting = { id: string; key: string; value: string }

const DEFAULTS: Record<string, string> = {
  store_name: "Kauny Catering",
  logo_url: "",
  store_tagline: "Sajian lezat untuk setiap momen spesial Anda.",
  intro_enabled: "1",
  intro_title: "Sajian *lezat* untuk setiap acara Anda",
  intro_subtitle: "Katering, snack box, dan prasmanan — pesan mudah lewat WhatsApp.",
  catalog_title: "Mau pesan apa hari ini?",
  announcement: "Pesan mudah lewat WhatsApp · Bahan segar & 100% halal",
  wa_number: "",
  delivery_start: "07:00",
  delivery_end: "18:00",
  min_order_days: "1",
  store_address: "Kota Anda, Indonesia",
  store_hours: "Senin – Sabtu: 07.00 – 20.00\nMinggu: 08.00 – 17.00",
  store_instagram: "@kaunycatering",
  admin_password: "",
}

function Section({ title, desc, children, delay = 0 }: { title: string; desc?: string; children: ReactNode; delay?: number }) {
  return (
    <section className="bg-white rounded-xl border border-hairline/70 shadow-soft p-5 md:p-7 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <h3 className="text-[15px] font-extrabold text-ink tracking-tight">{title}</h3>
      {desc && <p className="text-[12.5px] text-ink-faded mt-0.5">{desc}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, help, children }: { label: string; help?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {help && <p className="form-help">{help}</p>}
    </div>
  )
}

export default function SettingsPanel({ settings, onToast }: { settings: Setting[]; onToast: (m: string, t?: "success" | "error") => void }) {
  const initial = useMemo(() => {
    const o: Record<string, string> = { ...DEFAULTS }
    settings.forEach((s) => {
      if (s.key in o) o[s.key] = s.value
    })
    return o
  }, [settings])

  const [form, setForm] = useState<Record<string, string>>(initial)
  const [saved, setSaved] = useState<Record<string, string>>(initial)
  const [saving, setSaving] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }))
  const bind = (key: string) => ({ value: form[key] ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key)(e.target.value) })
  const dirtyKeys = Object.keys(form).filter((k) => form[k] !== saved[k])
  const dirty = dirtyKeys.length > 0

  const save = async () => {
    if (form.delivery_start >= form.delivery_end) return onToast("Jam antar mulai harus lebih awal dari jam selesai", "error")
    setSaving(true)
    try {
      await updateSettings(dirtyKeys.map((key) => ({ key, value: form[key] })))
      setSaved(form)
      onToast("Pengaturan tersimpan")
    } catch {
      onToast("Gagal menyimpan, coba lagi", "error")
    }
    setSaving(false)
  }

  // pratinjau judul intro (*kata* → kuning)
  const introPreview = form.intro_title.split("*").map((part, i) => (
    <span key={i} className={i % 2 === 1 ? "text-accent" : ""}>
      {part}
    </span>
  ))

  const allTimes = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`)

  return (
    <div className="flex flex-col gap-5 pb-28">
      <Section title="Identitas web" desc="Nama dan logo yang tampil di bagian atas halaman.">
        <Field label="Nama toko / web">
          <input className="form-input" {...bind("store_name")} placeholder="Kauny Catering" />
        </Field>
        <Field label="Link logo (opsional)" help="Kosongkan untuk memakai huruf depan nama toko.">
          <div className="flex gap-3 items-center">
            <input className="form-input" {...bind("logo_url")} placeholder="https://..." />
            <div className="grid place-items-center h-11 w-11 shrink-0 rounded-lg bg-surface-1 overflow-hidden">
              {form.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logo_url} alt="" className="h-9 w-9 object-contain" />
              ) : (
                <span className="text-brand-800 font-extrabold">{form.store_name.charAt(0)}</span>
              )}
            </div>
          </div>
        </Field>
        <Field label="Slogan singkat" help="Tampil di bagian bawah halaman.">
          <input className="form-input" {...bind("store_tagline")} />
        </Field>
      </Section>

      <Section title="Halaman depan" desc="Tulisan pembuka dan judul katalog." delay={60}>
        <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-1 px-4 py-3">
          <div>
            <div className="text-[13px] font-semibold text-ink">Tampilkan layar pembuka</div>
            <div className="text-[12px] text-ink-faded">Muncul sekali saat web pertama dibuka.</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.intro_enabled !== "0"}
            onClick={() => set("intro_enabled")(form.intro_enabled === "0" ? "1" : "0")}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${form.intro_enabled !== "0" ? "bg-brand-700" : "bg-surface-2"}`}
          >
            <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-spring ${form.intro_enabled !== "0" ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <div className={`grid transition-all duration-500 ease-smooth ${form.intro_enabled !== "0" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden space-y-4">
            <Field label="Judul layar pembuka" help={<>Beri tanda bintang untuk kata berwarna kuning, contoh: <b>Sajian *lezat* untuk acara Anda</b></>}>
              <input className="form-input" {...bind("intro_title")} />
            </Field>
            <Field label="Kalimat di bawah judul">
              <input className="form-input" {...bind("intro_subtitle")} />
            </Field>
            <div className="rounded-lg hero-glow p-5 text-center text-white">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/60">{form.store_name}</div>
              <div className="mt-2 text-lg font-extrabold leading-snug">{introPreview}</div>
              {form.intro_subtitle && <div className="mt-1.5 text-[12px] text-white/70">{form.intro_subtitle}</div>}
            </div>
          </div>
        </div>

        <Field label="Judul di atas daftar menu">
          <input className="form-input" {...bind("catalog_title")} />
        </Field>
        <Field label="Pengumuman (baris hijau paling atas)" help="Kosongkan jika tidak ingin menampilkan pengumuman.">
          <input className="form-input" {...bind("announcement")} placeholder="Contoh: Libur lebaran tanggal 1–5 April" />
        </Field>
      </Section>

      <Section title="Pemesanan" desc="Nomor penerima pesanan dan waktu antar yang bisa dipilih pembeli." delay={120}>
        <Field label="Nomor WhatsApp penerima pesanan" help="Awali dengan 62, tanpa + atau 0. Contoh: 6282324793627">
          <input className="form-input" inputMode="numeric" {...bind("wa_number")} placeholder="628xxxxxxxxxx" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Jam antar paling awal">
            <TimePicker value={form.delivery_start} onChange={set("delivery_start")} start={allTimes[0]} end={allTimes[47]} />
          </Field>
          <Field label="Jam antar paling akhir">
            <TimePicker value={form.delivery_end} onChange={set("delivery_end")} start={allTimes[0]} end={allTimes[47]} />
          </Field>
        </div>
        <Field label="Pesan paling lambat">
          <Dropdown
            value={form.min_order_days}
            onChange={set("min_order_days")}
            variant="field"
            fullWidth
            options={Array.from({ length: 8 }, (_, i) => ({
              value: String(i),
              label: i === 0 ? "Bisa diantar hari ini juga" : `H-${i} (${i} hari sebelum acara)`,
            }))}
          />
        </Field>
      </Section>

      <Section title="Alamat & kontak" delay={180}>
        <Field label="Alamat toko">
          <input className="form-input" {...bind("store_address")} />
        </Field>
        <Field label="Jam buka" help="Tekan Enter untuk baris baru.">
          <textarea className="form-input" rows={3} {...bind("store_hours")} />
        </Field>
        <Field label="Instagram">
          <input className="form-input" {...bind("store_instagram")} placeholder="@namatoko" />
        </Field>
      </Section>

      <Section title="Keamanan" delay={240}>
        <Field label="Password admin">
          <div className="relative">
            <input className="form-input pr-16" type={showPass ? "text" : "password"} {...bind("admin_password")} placeholder="Password baru" />
            <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-2 rounded-md text-[12px] font-semibold text-brand-700 hover:bg-brand-50">
              {showPass ? "Sembunyi" : "Lihat"}
            </button>
          </div>
        </Field>
      </Section>

      {/* Bar simpan — muncul saat ada perubahan */}
      <div
        className={`fixed left-0 right-0 md:left-64 bottom-0 z-40 px-4 pb-4 transition-all duration-500 ease-smooth ${dirty ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}
      >
        <div className="mx-auto max-w-3xl flex items-center gap-3 rounded-xl bg-brand-950 text-white p-2 pl-4 shadow-pop">
          <span className="flex-1 text-[13px]">{dirtyKeys.length} perubahan belum disimpan</span>
          <button type="button" onClick={() => setForm(saved)} className="h-10 px-3 rounded-lg text-[13px] font-semibold text-white/80 hover:bg-white/10">
            Batal
          </button>
          <button type="button" onClick={save} disabled={saving} className="btn btn-accent h-10">
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  )
}
