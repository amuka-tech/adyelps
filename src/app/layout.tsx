import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import PWAInstallProvider from "@/components/PWAInstallProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adyel | Adyel Alumni Network",
  description: "Official website for the Adyel Alumni Association. Join the network, reconnect with old friends, and give back to our alma mater.",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Adyel Alumni",
    statusBarStyle: "default",
    capable: true,
  },
};

export const viewport = {
  themeColor: "#800000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <PWAInstallProvider />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
