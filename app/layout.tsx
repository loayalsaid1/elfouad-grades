import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { SystemStatusProvider } from "@/contexts/SystemStatusContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "El Fouad Schools - Student Results Portal",
  description:
    "Student exam results portal for El Fouad Schools. View and download official academic reports for all grades.",
  keywords: "El Fouad Schools, student results, exam results, academic reports, Egypt education",
  authors: [{ name: "El Fouad Schools" }],
  openGraph: {
    title: "El Fouad Schools - Student Results Portal",
    description: "Official student exam results portal for El Fouad Schools",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: "/square-logo.png",
    shortcut: "/square-logo.png",
    apple: "/square-logo.png"
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-screen">
      <body className={`${inter.className} h-full `}>
        <SystemStatusProvider>
            {children}
        </SystemStatusProvider>
      </body>
    </html>
  )
}
