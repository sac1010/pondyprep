import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: {
    default: 'PondyPrep — Pondicherry Government Mock Tests & Question Papers',
    template: '%s | PondyPrep',
  },
  description:
    "Prepare for Pondicherry (Puducherry) government recruitment exams with actual question papers and timed mock tests. UDC, LDC, Field Assistant, Police Constable examinations. One-time lifetime payment.",
  keywords: [
    'pondicherry government examinations',
    'puducherry recruitment exams',
    'pondicherry question papers',
    'pondicherry mock tests',
    'UDC LDC mock test pondicherry',
    'puducherry exam previous papers',
    'pondicherry group c recruitment',
    'UDC 2023 pondicherry question paper',
    'puducherry field assistant mock test',
    'pondicherry police constable question paper',
    'puducherry VAO recruitment mock test',
  ],
  openGraph: {
    title: 'PondyPrep — Pondicherry Recruitment Mock Tests & Question Papers',
    description: 'Real past question papers and timed mock tests for Puducherry government examinations.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'PondyPrep',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PondyPrep — Pondicherry Exams & Mock Tests',
    description: 'Real past question papers and timed mock tests for Puducherry government examinations.',
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
      </body>
    </html>
  )
}
