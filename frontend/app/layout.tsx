import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbit World Travels - Travel Operations",
  description: "Enterprise travel operations platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <footer className="w-full mt-auto py-4 px-4 text-center text-xs text-gray-500 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950 dark:via-purple-950 dark:to-blue-950 border-t border-gray-200 dark:border-gray-800 transition-colors">
          © 2026 Orbit World Technologies. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
