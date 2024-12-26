import type { Metadata } from "next";
import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "@/app/globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "JEFIT to Hevy Converter",
  description: "Convert your JEFIT workout data to Hevy format",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 min-h-screen`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
