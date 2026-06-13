import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import prisma from "@/lib/prisma";
import Header from "./Header";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kauny Catering",
  description: "Pesan makanan basah dan paket snack dengan mudah",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeNameSetting = await prisma.setting.findUnique({ where: { key: 'store_name' } });
  const logoUrlSetting = await prisma.setting.findUnique({ where: { key: 'logo_url' } });
  const storeName = storeNameSetting?.value || "Kauny Catering";
  const logoUrl = logoUrlSetting?.value || "";

  return (
    <html lang="id">
      <body className={inter.className}>
        <Header storeName={storeName} logoUrl={logoUrl} />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
