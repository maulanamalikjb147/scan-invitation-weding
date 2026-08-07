import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const title = "Undangan Pernikahan Anisa & Maulana";
  const description = "Dengan penuh kebahagiaan, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan merayakan hari istimewa kami pada Sabtu, 26 September 2026. #roMAnSAsatuhati";
  const previewImage = new URL("/maulanaanisa.png", base);

  return {
    metadataBase: base,
    title,
    description,
    applicationName: "Undangan Anisa & Maulana",
    keywords: ["undangan pernikahan", "Anisa dan Maulana", "26 September 2026", "roMAnSAsatuhati"],
    icons: { icon: "/favicon.png", shortcut: "/favicon.png" },
    openGraph: {
      title,
      description,
      siteName: "Undangan Anisa & Maulana",
      url: base,
      type: "website",
      locale: "id_ID",
      images: [{ url: previewImage, secureUrl: previewImage, width: 1731, height: 909, type: "image/png", alt: "Undangan Pernikahan Anisa dan Maulana, 26 September 2026" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [previewImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
