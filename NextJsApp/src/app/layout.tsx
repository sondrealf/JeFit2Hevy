"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "@/app/globals.css";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
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
    images: [
      {
        url: "/favicon.ico",
        width: 32,
        height: 32,
        alt: "Jefit to Hevy Converter Favicon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Migrate Your Jefit Data to Hevy - Open-Source Fitness Tool",
    description:
      "Easily transfer your Jefit workout data to Hevy with our open-source converter. Join the community on GitHub and make your fitness tracking seamless.",
    images: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <meta
        name="google-site-verification"
        content="8KBjB47WDgyCfg5fvNdH76QHQ_Pt04ZymBJZGbV1SaQ"
      />
      {/* Google Analytics 4 */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${"G-BV1G6V4860"}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BV1G6V4860');
          `,
        }}
      />
      {/* Microsoft Clarity */}
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "rzwlb7juhc");
        `}
      </Script>
      <body
        className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 min-h-screen`}
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
