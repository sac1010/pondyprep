import Link from 'next/link'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'
import Logo from '@/components/Logo'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-8">Effective Date: 1 June 2025</p>
        <div className="prose prose-slate max-w-none">
          <LegalContent />
        </div>
      </div>
    </div>
  )
}

function LegalContent() {
  return (
    <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Who We Are</h2>
        <p>PondyPrep.in is an online exam preparation platform exclusively for Pondicherry (Puducherry) government recruitment examinations. PondyPrep is operated as a sole proprietorship based in Puducherry, India.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Information We Collect</h2>
        <p>We collect your name and email at signup, test scores and answers, device/session data for security, and Razorpay order/payment IDs (not card numbers). Google OAuth only shares your name and email.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">3. How We Use Your Information</h2>
        <p>We use your information to provide the service, process payments, show test history, enforce single-session security, and notify you of new exam papers. We do not sell your data.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Data Storage</h2>
        <p>Data is stored on Supabase (PostgreSQL, hosted on AWS ap-south-1 / Mumbai). Your data does not leave India.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Payment Data</h2>
        <p>Payments are processed by Razorpay. PondyPrep never stores card numbers, CVV, UPI PINs, or netbanking credentials.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Your Rights</h2>
        <p>You can access, correct, export, or delete your data by emailing <a href="mailto:support@pondyprep.in" className="text-blue-600 hover:underline">support@pondyprep.in</a>. We respond within 7 working days.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Contact</h2>
        <p>Email: <a href="mailto:support@pondyprep.in" className="text-blue-600 hover:underline">support@pondyprep.in</a></p>
      </section>
    </div>
  )
}
