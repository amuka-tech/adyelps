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

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  let user = null;
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: userData } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role')
      .eq('id', session.user.id)
      .single();
    if (userData) {
      user = { ...userData, firstName: userData.first_name, lastName: userData.last_name };
    }
  }

  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <PWAInstallProvider />
        <Navbar serverUser={user} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
