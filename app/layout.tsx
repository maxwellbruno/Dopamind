import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import TestNavigation from "@/components/test/test-navigation"
import ErrorBoundary from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dopamind - Digital Wellness Web App",
  description: "Rebalance Your Digital Life - Responsive web application for all devices",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  manifest: "/manifest.json",
  themeColor: "#0F172A",
  appleWebAppCapable: "yes",
  appleWebAppStatusBarStyle: "black-translucent",
  openGraph: {
    title: "Dopamind - Digital Wellness",
    description: "Break free from screen addiction with focused sessions and mindful habits",
    type: "website",
    url: "https://dopamind.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dopamind Digital Wellness App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dopamind - Digital Wellness",
    description: "Break free from screen addiction with focused sessions and mindful habits",
    images: ["/og-image.png"],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
            <div className="min-h-screen bg-slate-900 text-slate-100">{children}</div>
          </AuthProvider>
        </ErrorBoundary>
        <TestNavigation />
      </body>
    </html>
  )
}
