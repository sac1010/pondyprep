'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'delayed'>('verifying')

  useEffect(() => {
    const supabase = createClient()
    let attempts = 0
    const interval = setInterval(async () => {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('has_paid')
        .single()

      if (profile?.has_paid) {
        clearInterval(interval)
        setStatus('success')
      } else {
        attempts++
        if (attempts >= 10) { // 30 seconds
          clearInterval(interval)
          setStatus('delayed')
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F8FAFC]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <Link href="/" className="inline-flex mb-8"><Logo size="lg" /></Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {status === 'verifying' && (
            <>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Activating your account…</h1>
              <p className="text-slate-500 text-sm mt-2">This usually takes a few seconds.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h1 className="text-xl font-semibold text-slate-900">You&apos;re all set!</h1>
              <p className="text-slate-500 text-sm mt-2">All exams are now unlocked. Start practising!</p>
              <Link
                href="/tests"
                className="mt-6 block bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                View All Exams →
              </Link>
            </>
          )}

          {status === 'delayed' && (
            <>
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Taking longer than usual</h1>
              <p className="text-slate-500 text-sm mt-2">
                Your payment was received. Access will be unlocked shortly.
                If it doesn&apos;t activate, email us at{' '}
                <a href="mailto:support@pondyprep.in" className="text-blue-600 hover:underline">support@pondyprep.in</a>
              </p>
              <button
                onClick={() => router.refresh()}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
