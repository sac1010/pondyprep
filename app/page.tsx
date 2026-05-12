import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Logo from '@/components/Logo'

export const metadata: Metadata = {
  title: "PondyPrep — Pondicherry Government Exam Mock Tests | Real Question Papers",
  description: "India's only mock test platform exclusively for Pondicherry (Puducherry) government recruitment exams. UDC, LDC, Field Assistant, VAO, Police Constable — real question papers, timed mock tests.",
}

const EXAM_LABELS: Record<string, string> = {
  UDC: 'Upper Division Clerk',
  LDC: 'Lower Division Clerk',
  FIELD_ASSISTANT: 'Field Assistant',
  ASSISTANT_TIER1: 'Assistant Tier-1',
  ASSISTANT_TIER2: 'Assistant Tier-2',
  POLICE_CONSTABLE: 'Police Constable',
  VAO: 'Village Administrative Officer',
}

const SAMPLE_QUESTION = {
  question: "Two identical conducting balls having positive charges q₁ and q₂ are separated by a centre to centre distance r. If they are made to touch each other and then separated to the same distance, the force between them will be",
  options: { A: "less than before", B: "same as before", C: "more than before", D: "zero" },
}

const FAQ = [
  { q: "Which exams are covered?", a: "UDC, LDC, Field Assistant, Assistant Tier 1 & 2, Police Constable, and VAO — all Pondicherry government recruitment exams." },
  { q: "Are these real question papers?", a: "Yes. Every question is sourced from official Pondicherry recruitment exam papers, not AI-generated content." },
  { q: "How often are new papers added?", a: "As soon as new exams are conducted. Paid users are notified by email when new papers are available." },
  { q: "Is the payment a subscription?", a: "No. It is a one-time, lifetime payment. Pay once and access everything forever." },
  { q: "Can I attempt the same test multiple times?", a: "Yes, unlimited attempts after paying." },
  { q: "Is this only for Pondicherry exams?", a: "Yes — exclusively Puducherry government recruitment. No irrelevant state-level content." },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: exams } = await supabase
    .from('exams')
    .select('id, slug, title, year, exam_type, is_free, duration_mins')
    .eq('is_active', true)
    .order('is_free', { ascending: false })
    .order('year', { ascending: false })

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-4">
              <Link href="/tests" className="text-sm text-slate-600 hover:text-slate-900">Exams</Link>
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">Log in</Link>
              <Link href="/signup" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Try Free
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-blue-100">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Exclusively for Pondicherry Government Exams
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight max-w-3xl mx-auto">
            India&apos;s Only Mock Test Platform Built for{' '}
            <span className="text-blue-600">Pondicherry Exams</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
            Real question papers. Timed mock tests. One-time payment.
            Exclusively for Puducherry government recruitment aspirants.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors shadow-sm"
            >
              Start Free Test
            </Link>
            <Link
              href="/tests"
              className="bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-base hover:bg-slate-50 transition-colors border border-slate-200"
            >
              View All Exams
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> 1000+ Real Questions</span>
            <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Updated Regularly</span>
            <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> One-time payment</span>
            <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Exclusively Puducherry</span>
          </div>
        </section>

        {/* Why PondyPrep */}
        <section className="bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Why choose us?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "📄", title: "Real Question Papers", desc: "Every test uses actual questions from official Pondicherry recruitment exams — not made-up content." },
                { icon: "⏱️", title: "Timed Mock Tests", desc: "Replicate actual exam conditions with countdown timers and auto-submit — build real exam stamina." },
                { icon: "💡", title: "Explanations for Every Answer", desc: "Every question comes with a concise explanation so you understand why the correct answer is right." },
                { icon: "✨", title: "AI Performance Review", desc: "After each test, get an AI-generated coaching report that identifies your weak areas and suggests what to study next." },
                { icon: "🔖", title: "Bookmark Questions", desc: "Save tricky questions to revisit later. Build your own revision list across all tests." },
                { icon: "🎯", title: "Exclusively for Puducherry", desc: "No irrelevant content from other states. Every question is relevant to Pondicherry recruitments." },
                { icon: "🔄", title: "Updated Regularly", desc: "New exam papers added as soon as they're released. Paid users get notified by email." },
                { icon: "♾️", title: "Unlimited Attempts", desc: "Retake any exam as many times as you want. Track your improvement over time." },
                { icon: "💳", title: "One-time Payment", desc: "Pay once. No monthly fees, no subscriptions. Lifetime access to all exams." },
              ].map(f => (
                <div key={f.title} className="p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Available Exams */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Available Exams</h2>
          <p className="text-slate-500 text-center text-sm mb-10">Real past papers from Pondicherry government recruitment examinations</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(exams || []).map(exam => (
              <Link
                key={exam.id}
                href={`/tests/${exam.slug}`}
                className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                {exam.is_free && (
                  <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    Free
                  </span>
                )}
                <div className="text-xs text-blue-600 font-medium mb-1">{EXAM_LABELS[exam.exam_type] || exam.exam_type}</div>
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{exam.title}</h3>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span>100 questions</span>
                  <span>·</span>
                  <span>{exam.duration_mins} min</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Sample Question */}
        <section className="bg-white border-y border-slate-200">
          <div className="max-w-2xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Try a Sample Question</h2>
            <p className="text-slate-500 text-center text-sm mb-8">From the actual UDC 2023 question paper</p>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-medium text-slate-800 mb-4 leading-relaxed">{SAMPLE_QUESTION.question}</p>
              <div className="space-y-2">
                {(Object.entries(SAMPLE_QUESTION.options) as [string, string][]).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">{key}</span>
                    {value}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400 text-center">Sign up to see the answer and take the full test →</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Simple Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <div className="text-slate-500 font-medium mb-2">Free</div>
              <div className="text-4xl font-bold text-slate-900 mb-1">₹0</div>
              <div className="text-sm text-slate-400 mb-6">No credit card needed</div>
              <ul className="space-y-2 text-sm text-slate-600 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 1 free test</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Instant results</li>
                <li className="flex items-center gap-2"><span className="text-slate-300">✗</span> All exams</li>
                <li className="flex items-center gap-2"><span className="text-slate-300">✗</span> Mini topic tests</li>
              </ul>
              <Link href="/signup" className="block text-center border border-slate-200 text-slate-700 py-3 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors">
                Try Free
              </Link>
            </div>

            <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                Launch offer
              </div>
              <div className="text-blue-100 font-medium mb-2">Lifetime Access</div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold">₹199</span>
                <span className="text-blue-300 line-through text-lg">₹499</span>
              </div>
              <div className="text-xs text-yellow-300 mb-5">Valid till 31 May · Pay once, access forever</div>
              <ul className="space-y-2 text-sm text-blue-100 mb-8">
                <li className="flex items-center gap-2"><span className="text-white">✓</span> All available exam papers</li>
                <li className="flex items-center gap-2"><span className="text-white">✓</span> Unlimited attempts</li>
                <li className="flex items-center gap-2"><span className="text-white">✓</span> Explanations for every question</li>
                <li className="flex items-center gap-2"><span className="text-white">✓</span> AI performance review after each test</li>
                <li className="flex items-center gap-2"><span className="text-white">✓</span> Bookmark questions</li>
                <li className="flex items-center gap-2"><span className="text-white">✓</span> Topic mini tests &amp; random practice</li>
                <li className="flex items-center gap-2"><span className="text-white">✓</span> New papers included free</li>
              </ul>
              <Link href="/signup" className="block text-center bg-white text-blue-600 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors">
                Unlock All Tests
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { step: "1", title: "Sign Up Free", desc: "Create your account in 30 seconds. No credit card needed." },
                { step: "2", title: "Take a Free Test", desc: "Experience the platform with a real question paper." },
                { step: "3", title: "Unlock Full Access", desc: "One-time payment for lifetime access to all exams." },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map(f => (
              <div key={f.q} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{f.q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="/tests" className="hover:text-slate-700">Exams</Link>
              <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-700">Terms</Link>
              <Link href="/refunds" className="hover:text-slate-700">Refunds</Link>
            </div>
            <div className="flex flex-col sm:items-end items-center gap-2">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <a href="mailto:pondyprepsupport@gmail.com" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Support
                </a>
                <a href="https://wa.me/918281810887" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-green-600 transition-colors flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp Support
                </a>
              </div>
              <p className="text-xs text-slate-400">© 2025 PondyPrep — Exclusively for Pondicherry Exam Aspirants</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
