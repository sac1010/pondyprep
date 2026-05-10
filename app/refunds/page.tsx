import Link from 'next/link'
import type { Metadata } from 'next'
import Logo from '@/components/Logo'

export const metadata: Metadata = { title: 'Refund Policy' }

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Refund Policy</h1>
        <p className="text-slate-500 text-sm mb-8">Effective Date: 1 June 2025</p>
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>We offer a free test before any payment is required so you can experience the platform before committing.</p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Refund Eligibility</h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Payment made, no paid test started, within 24 hours', '✅ Full refund'],
                    ['Payment made, no paid test started, after 24 hours', '❌ Not eligible'],
                    ['At least one paid test started', '❌ Not eligible'],
                    ['Duplicate payment (charged twice)', '✅ Full refund'],
                    ['Technical error — payment deducted, no access', '✅ Full refund or access granted'],
                  ].map(([situation, result]) => (
                    <tr key={situation}>
                      <td className="px-4 py-3 text-slate-700">{situation}</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">How to Request</h2>
            <p>Email <a href="mailto:support@pondyprep.in" className="text-blue-600 hover:underline">support@pondyprep.in</a> with your registered email and Razorpay payment ID. We respond within 2 working days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Processing Time</h2>
            <p>Approved refunds are processed within 5–7 working days back to the original payment method.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
