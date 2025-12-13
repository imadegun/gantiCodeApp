import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navigation } from "@/components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ceramic Production Management System",
  description: "Comprehensive ceramic production management with collections, codes, production tracking, and inventory management.",
  keywords: ["Ceramic", "Production", "Management", "Collections", "Inventory", "MySQL", "PostgreSQL", "Next.js", "TypeScript"],
  authors: [{ name: "Ceramic Production Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Ceramic Production Management System",
    description: "Comprehensive ceramic production management system",
    url: "https://chat.z.ai",
    siteName: "Ceramic Production Management",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ceramic Production Management System",
    description: "Comprehensive ceramic production management system",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
