import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Logo from '@/components/Logo'

export const metadata: Metadata = {
  title: 'All Exams — Pondicherry Mock Tests',
  description: 'Browse all available Pondicherry government recruitment exam mock tests. UDC, LDC, Field Assistant, VAO, Police Constable — real question papers.',
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

export default async function TestsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let hasPaid = false

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('has_paid')
      .eq('id', user.id)
      .single()
    hasPaid = profile?.has_paid ?? false
  }

  const { data: exams } = await supabase
    .from('exams')
    .select('id, slug, title, year, exam_type, is_free, duration_mins')
    .eq('is_active', true)
    .order('year', { ascending: false })

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">Dashboard</Link>
            ) : (
              <Link href="/login" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Sign in</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">All Exams</h1>
          <p className="mt-2 text-slate-500">Real past papers from Pondicherry government recruitment examinations</p>
        </div>

        {!hasPaid && user && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-medium text-blue-900 text-sm">Unlock all exams — one-time payment</p>
              <p className="text-blue-600 text-xs mt-0.5">Lifetime access · No subscriptions</p>
            </div>
            <Link href="/payment" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shrink-0">
              Unlock Now
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(exams || []).map(exam => {
            const isLocked = !hasPaid && !exam.is_free
            return (
              <Link
                key={exam.id}
                href={`/tests/${exam.slug}`}
                className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                {exam.is_free && (
                  <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">Free</span>
                )}
                {isLocked && (
                  <span className="absolute top-4 right-4 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                )}
                <div className="text-xs text-blue-600 font-medium mb-1">{EXAM_LABELS[exam.exam_type] || exam.exam_type}</div>
                <h2 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{exam.title}</h2>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span>100 questions</span>
                  <span>·</span>
                  <span>{exam.duration_mins} min</span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-3xl">🎯</div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Practice by Topic or Random</h3>
            <p className="text-sm text-slate-500 mt-0.5">Take focused mini tests on specific subjects or mix it up with random questions from all exams.</p>
          </div>
          {hasPaid ? (
            <Link href="/tests/mini" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shrink-0">
              Start Mini Test
            </Link>
          ) : (
            <Link href="/payment" className="border border-blue-600 text-blue-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors shrink-0">
              Unlock Access
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
