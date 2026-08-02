import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { fontSatoshi, HelveticaNeue } from "@/fonts";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/site";
import "./globals.css";
import GuideframeClient from "../components/common/guideframe-client";
import { PostHogProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "GuideFrame — Browser Layout Grids, Rulers & Guides",
    template: "%s | GuideFrame",
  },
  description:
    "Add Figma-style layout grids, rulers, snapping guides, and DOM geometry inspection to React or any browser-based app.",
  applicationName: "GuideFrame",
  keywords: [
    "GuideFrame",
    "layout grid",
    "rulers and guides",
    "browser design tools",
    "DOM geometry inspector",
    "design engineering",
    "React overlay",
    "Next.js",
    "Svelte",
    "developer tools",
  ],
  authors: [{ name: "Dinil Thilakarathne" }],
  creator: "Dinil Thilakarathne",
  publisher: "Dinil Thilakarathne",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: "/",
    title: "GuideFrame — Browser Layout Grids, Rulers & Guides",
    siteName: "GuideFrame",
    description:
      "Inspect real interface spacing with browser-native layout grids, rulers, snapping guides, and DOM geometry comparison.",
    images: [
      {
        url: getAbsoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "GuideFrame browser overlay with rulers, layout columns, and cyan guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GuideFrame — Browser Layout Grids, Rulers & Guides",
    description:
      "Inspect real interface spacing with layout grids, rulers, snapping guides, and DOM geometry comparison.",
    images: [getAbsoluteUrl("/twitter-image")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "developer tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = getSiteUrl().toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: "GuideFrame",
        description:
          "Figma-style layout grids, rulers, snapping guides, and DOM geometry inspection for browser-based apps.",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}#software`,
        name: "GuideFrame",
        url: siteUrl,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: "Design engineering tool",
        operatingSystem: "Any operating system with a modern browser",
        description:
          "An open-source browser overlay for layout grids, rulers, snapping guides, and rendered DOM geometry inspection.",
        license: "https://opensource.org/license/mit",
        codeRepository: "https://github.com/Dinil-Thilakarathne/guide-frame",
        downloadUrl: "https://www.npmjs.com/package/@guideframe/react",
        author: {
          "@type": "Person",
          name: "Dinil Thilakarathne",
          url: "https://github.com/Dinil-Thilakarathne",
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${HelveticaNeue.variable} ${fontSatoshi.variable} antialiased transition-colors duration-300`}
    >
      <head>
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="GuideFrame documentation for AI agents"
        />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </head>
      <body className="">
        <PostHogProvider>
          <GuideframeClient />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
