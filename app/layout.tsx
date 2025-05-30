import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'El-Fouad Schools | Student Results Portal',
  description: 'El-Fouad Schools | Student Results Portal',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
