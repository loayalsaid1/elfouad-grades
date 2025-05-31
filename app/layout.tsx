import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Footer from "@/components/layout/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "El Fouad Schools - 6th Grade Results",
  description:
    "Student exam results portal for El Fouad Schools 6th grade students. View and download official academic reports for the first term 2024-2025.",
  keywords: "El Fouad Schools, student results, 6th grade, exam results, academic reports, Egypt education",
  authors: [{ name: "El Fouad Schools" }],
  openGraph: {
    title: "El Fouad Schools - 6th Grade Results Portal",
    description: "Official student exam results portal for El Fouad Schools",
    type: "website",
    locale: "en_US",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
