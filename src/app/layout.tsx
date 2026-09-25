import type { Metadata, Viewport } from "next";
// Montserrat di-host sendiri (tidak perlu unduh dari Google saat build)
import "@fontsource-variable/montserrat";
import "./globals.css";
import prisma from "@/lib/prisma";
import Header from "./Header";

// Selalu ambil data terbaru dari database (build di Vercel tidak perlu akses database)
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await prisma.setting.findUnique({ where: { key: "store_name" } });
  const name = s?.value || "Kauny Catering";
  return {
    title: name,
    description: "Pesan makanan basah dan paket snack dengan mudah",
  };
}

export const viewport: Viewport = {
  themeColor: "#0b3b25",
  width: "device-width",
  initialScale: 1,
};

// Sembunyikan layar pembuka sebelum halaman tampil bila sudah pernah dilihat di tab ini
const introScript = `try{if(sessionStorage.getItem('kauny-intro-seen'))document.documentElement.classList.add('intro-seen')}catch(e){}`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await prisma.setting.findMany();
  const get = (key: string) => settings.find((s: { key: string; value: string }) => s.key === key)?.value;

  const storeName = get("store_name") || "Kauny Catering";
  const logoUrl = get("logo_url") || "";
  const announcement = get("announcement") ?? "Pesan mudah lewat WhatsApp · Bahan segar & 100% halal";

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <Header storeName={storeName} logoUrl={logoUrl} announcement={announcement} />
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}
