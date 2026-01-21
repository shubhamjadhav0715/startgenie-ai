import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'StartGenie AI - AI-Powered Startup Blueprint Generator',
  description: 'Transform your startup ideas into comprehensive, investor-ready business blueprints using AI and RAG technology',
  keywords: ['startup', 'business plan', 'AI', 'blueprint', 'entrepreneurship', 'India'],
  authors: [{ name: 'StartGenie AI Team' }],
  openGraph: {
    title: 'StartGenie AI',
    description: 'AI-Powered Startup Blueprint Generator',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 antialiased">
        {children}
      </body>
    </html>
  )
}
