import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { fontSatoshi, HelveticaNeue } from "@/fonts";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/site";
import "./globals.css";
import { PostHogProvider } from "./providers";
import GuideframeClient from "../components/common/guideframe-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "GuideFrame",
    template: "%s | GuideFrame",
  },
  description:
    "Figma-style layout grids, rulers, and draggable guides inside the browser.",
  applicationName: "GuideFrame",
  keywords: [
    "GuideFrame",
    "layout grid",
    "rulers and guides",
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
  openGraph: {
    type: "website",
    url: "/",
    title: "GuideFrame",
    siteName: "GuideFrame",
    description:
      "Add a browser-visible layout grid, rulers, and snapping guides to your app for spacing and alignment checks.",
    images: [
      {
        url: getAbsoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "GuideFrame layout grid overlay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GuideFrame",
    description:
      "Figma-style layout grids, rulers, and draggable guides inside the browser.",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  category: "developer tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${HelveticaNeue.variable} ${fontSatoshi.variable} antialiased transition-colors duration-300`}
    >
      <body className="">
        <PostHogProvider>
          <GuideframeClient />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
