import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "thakseru.lk | Digital Cost Estimating & BOQ",
  description: "නොමිලේ Material Calculators සහ පැය 48න් Bank-Ready QS Certified BOQ සේවාව.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="si">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}