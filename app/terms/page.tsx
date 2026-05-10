import Link from 'next/link'
import type { Metadata } from 'next'
import Logo from '@/components/Logo'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-8">Effective Date: 1 June 2025</p>
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          {[
            { title: '1. Acceptance', body: 'By using PondyPrep.in, you agree to these terms. If you do not agree, please do not use the platform.' },
            { title: '2. What PondyPrep Provides', body: 'PondyPrep provides mock tests based on real Pondicherry government exam papers. We are not affiliated with the Government of Puducherry or any official recruitment body.' },
            { title: '3. Account Registration', body: 'You must provide accurate information, keep your password secure, and not share credentials with others. Creating multiple accounts to abuse the free tier violates these terms.' },
            { title: '4. Free Test', body: 'New users get one free test session per account. It cannot be transferred or used more than once.' },
            { title: '5. Paid Access', body: 'Payment of ₹349 gives lifetime access to all available exams. New papers added in future are included. Access is tied to your account and non-transferable.' },
            { title: '6. Prohibited Conduct', body: 'You may not share credentials, use bots to scrape questions, create multiple accounts, or reproduce exam content without permission.' },
            { title: '7. Limitation of Liability', body: 'PondyPrep provides practice material only. We do not guarantee exam results. Our liability is limited to the amount you paid (₹349).' },
            { title: '8. Governing Law', body: 'These terms are governed by the laws of India. Disputes are subject to jurisdiction of courts in Puducherry.' },
            { title: '9. Contact', body: 'Email: support@pondyprep.in' },
          ].map(s => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">{s.title}</h2>
              <p>{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
