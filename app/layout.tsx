import type { Metadata } from "next";
import { Noto_Sans_Sinhala, Inter } from "next/font/google";
import "./globals.css";

const notoSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sinhala",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "thakseru.lk | Digital Cost Estimating & BOQ",
  description: "නොමිලේ Material Calculators සහ පැය 48න් Bank-Ready QS Certified BOQ සේවාව.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="si" className={`${notoSinhala.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}