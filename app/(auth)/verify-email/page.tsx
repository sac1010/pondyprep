'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Logo from '@/components/Logo'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const supabase = createClient()

  async function handleResend() {
    setResending(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      toast.error('No email found. Please sign up again.')
      setResending(false)
      return
    }

    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email })
    setResending(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Verification email sent')
    setCooldown(60)
    const timer = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(timer); return 0 }
        return c - 1
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md text-center"
      >
        <Link href="/" className="inline-flex"><Logo size="lg" /></Link>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-slate-900">Check your inbox</h1>
          <p className="mt-2 text-slate-500 text-sm">
            We sent a verification link to your email. Click it to activate your account and start your free test.
          </p>

          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="mt-6 text-sm text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            {resending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
          </button>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700">
              Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
