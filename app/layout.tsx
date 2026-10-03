import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Caleb Chua — Software & System Engineer",
  description:
    "Portfolio of Caleb Chua, software engineer building C++/C# manufacturing applications, data-tracking systems, and PLC-integrated software. Drawn as an engineering sheet with a live PLC sorting station.",
  keywords: [
    "Caleb Chua",
    "Software Engineer",
    "PLC",
    "SCADA",
    "C++",
    "Mechatronics",
    "Malaysia",
  ],
  openGraph: {
    title: "Caleb Chua — Software & System Engineer",
    description:
      "Mechatronics-trained software engineer. A portfolio drawn as an engineering sheet, with a live PLC scan cycle wired to the work experience.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
