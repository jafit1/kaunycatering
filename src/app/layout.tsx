import type { Metadata, Viewport } from "next";
// Montserrat di-host sendiri (tidak perlu unduh dari Google saat build)
import "@fontsource-variable/montserrat";
import "./globals.css";
import prisma from "@/lib/prisma";
import Header from "./Header";

export const metadata: Metadata = {
  title: "Kauny Catering",
  description: "Pesan makanan basah dan paket snack dengan mudah",
};

export const viewport: Viewport = {
  themeColor: "#0b3b25",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [storeNameSetting, logoUrlSetting, waSetting, categories] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "store_name" } }),
    prisma.setting.findUnique({ where: { key: "logo_url" } }),
    prisma.setting.findUnique({ where: { key: "wa_number" } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { name: true } }),
  ]);
  const storeName = storeNameSetting?.value || "Kauny Catering";
  const logoUrl = logoUrlSetting?.value || "";
  const waNumber = waSetting?.value || "6282324793627";

  return (
    <html lang="id">
      <body>
        <Header
          storeName={storeName}
          logoUrl={logoUrl}
          waNumber={waNumber}
          categories={categories.map((c: { name: string }) => c.name)}
        />
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}
