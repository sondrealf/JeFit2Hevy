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
  title: "Jefit to Hevy Converter - Effortless Workout Data Migration",
  description: "Convert your JEFIT workout data to Hevy format",
  keywords: [
    "Jefit to Hevy converter",
    "Jefit CSV to Hevy",
    "workout data migration",
    "Jefit to Hevy tool",
    "open-source workout converter",
    "fitness data conversion",
    "Jefit workout export",
    "Hevy workout data",
    "Jefit to Hevy migration",
    "Jefit to Hevy format",
  ],
  openGraph: {
    title: "Jefit to Hevy Converter - Open-Source Tool for Fitness Enthusiasts",
    description:
      "Switch from Jefit to Hevy without losing your workout data. Use this open-source tool to convert Jefit CSV files into a Hevy-compatible format. Contribute or suggest features on GitHub!",
    url: "https://github.com/sondrealf/JeFit2Hevy",
    siteName: "Jefit to Hevy Converter",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Migrate Your Jefit Data to Hevy - Open-Source Fitness Tool",
    description:
      "Easily transfer your Jefit workout data to Hevy with our open-source converter. Join the community on GitHub and make your fitness tracking seamless.",
  },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://jefit2hevy.vercel.app/",
            "@type": "SoftwareApplication",
            name: "Jefit to Hevy Converter",
            operatingSystem: "Web",
            applicationCategory: "Utility",
            url: "https://jefit2hevy.vercel.app/",
            author: {
              "@type": "Person",
              name: "Sondre Alfnes",
            },
            offers: {
              "@type": "Offer",
              price: "0.00",
              priceCurrency: "USD",
            },
          }),
        }}
      />
    </html>
  );
}
