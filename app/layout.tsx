import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Julius - Personal Finance',
  description: 'Track expenses, subscriptions, fixed costs, and monthly spending in EUR.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Julius',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f3f0f5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex justify-center antialiased`} suppressHydrationWarning>
        <div className="relative h-dvh w-full max-w-[430px] overflow-hidden bg-julius-bg shadow-[0_24px_90px_rgba(52,39,72,0.18)] sm:my-4 sm:h-[calc(100dvh-2rem)] sm:rounded-[28px] sm:border sm:border-julius-border sm:p-2">
          {children}
        </div>
      </body>
    </html>
  )
}
