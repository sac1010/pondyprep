import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import RazorpayButton from '@/components/payment/RazorpayButton'
import type { Metadata } from 'next'
import Logo from '@/components/Logo'

export const metadata: Metadata = { title: 'Unlock All Exams' }

export default async function PaymentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signup')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('has_paid, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.has_paid) redirect('/tests')

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">Dashboard</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Unlock All Exams</h1>
            <p className="text-slate-500 text-sm mt-2">One-time payment. Lifetime access. No subscriptions.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Price */}
            <div className="bg-blue-600 p-6 text-white text-center">
              <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                🎉 Launch offer — valid till 31 May
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold">₹199</span>
                <span className="text-blue-200 line-through text-xl">₹499</span>
              </div>
              <p className="text-blue-100 text-sm mt-1">One-time · Lifetime access</p>
            </div>

            <div className="p-6">
              <ul className="space-y-3 mb-6">
                {[
                  'All available exam papers (1000+ questions)',
                  'Unlimited mock test attempts',
                  'Topic-wise mini tests',
                  'Random practice tests',
                  'Score history & performance analytics',
                  'New exam papers included free',
                  'Exclusively for Pondicherry exams',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                    <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <RazorpayButton userEmail={user.email} userName={profile?.full_name ?? undefined} />

              <p className="text-xs text-slate-400 text-center mt-3">
                Secure payment via Razorpay · UPI / Cards / Netbanking
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-4 text-xs text-slate-400">
            <Link href="/refunds" className="hover:text-slate-600">Refund Policy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-slate-600">Terms</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-slate-600">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
