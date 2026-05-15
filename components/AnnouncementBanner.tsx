'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-blue-600 text-white px-4 py-2 text-sm flex items-center justify-center relative z-50">
      <div className="text-center font-medium flex-1">
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider mr-2 shadow-sm animate-pulse">
          Alert
        </span>
        Puducherry CHSL (Combined Higher Secondary Level) Exam Date: May 31, 2026!{' '}
        <Link href="/tests" className="underline underline-offset-2 hover:text-blue-100 ml-1 font-bold">
          Take a free mock test now →
        </Link>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 text-blue-200 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
