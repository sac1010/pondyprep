import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: {
    default: 'PondyPrep — Pondicherry Government Exam Mock Tests',
    template: '%s | PondyPrep',
  },
  description:
    "India's only mock test platform built exclusively for Pondicherry (Puducherry) government recruitment exams. Real question papers, timed tests, one-time lifetime payment.",
  keywords: [
    'pondicherry government exam mock test',
    'puducherry recruitment exam preparation',
    'UDC LDC mock test pondicherry',
    'puducherry exam question papers',
    'pondicherry group c exam preparation',
    'UDC 2023 pondicherry question paper',
    'puducherry field assistant mock test',
    'pondicherry police constable exam',
    'puducherry VAO exam preparation',
  ],
  openGraph: {
    title: 'PondyPrep — Pondicherry Government Exam Mock Tests',
    description: 'Real question papers. Timed tests. Exclusively for Puducherry.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'PondyPrep',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PondyPrep — Pondicherry Exam Prep',
    description: 'Real question papers. Timed tests. Exclusively for Puducherry.',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full antialiased bg-[#F8FAFC] text-slate-900 font-sans">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            classNames: {
              error: 'bg-red-50 text-red-900 border-red-200',
              success: 'bg-green-50 text-green-900 border-green-200',
              warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
            },
          }}
        />
        <SpeedInsights />
      </body>
    </html>
  )
}
