import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CSPostHogProvider } from './providers'
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gist",
  description: "The Future of Education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
            <head>
        {/* Open Graph meta tags */}
        <meta property="og:title" content="Gist" />
        <meta property="og:description" content="The future of education" />
        <meta property="og:image" content="/gist.png" />
        <meta property="og:url" content="https://gist-quiz.com" />
        
        {/* Twitter-specific meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gist" />
        <meta name="twitter:description" content="The future of education" />
        <meta name="twitter:image" content="/gist.png" />
      </head>
      <CSPostHogProvider>
      <body className={inter.className}>{children}
        <Analytics />
        <SpeedInsights />
      </body>
      </CSPostHogProvider>
    </html>
  );
}
