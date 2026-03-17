import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Julius - Agente Financeiro',
  description: 'O teu agente financeiro pessoal com personalidade',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Julius',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020617',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className={`${inter.className} antialiased`}>
        <div className="mx-auto max-w-[430px] min-h-dvh bg-julius-bg relative">
          {children}
        </div>
      </body>
    </html>
  )
}
