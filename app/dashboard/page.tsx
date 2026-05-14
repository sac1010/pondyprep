import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { formatDate, formatScore, formatAccuracy } from '@/lib/utils'
import Logo from '@/components/Logo'
import SignOutButton from '@/components/SignOutButton'
import QuickRandomButton from '@/components/dashboard/QuickRandomButton'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: sessions }] = await Promise.all([
    supabase.from('user_profiles').select('full_name, has_paid, free_tests_used').eq('id', user.id).single(),
    supabase.from('exam_sessions')
      .select('id, session_type, status, score, total_questions, duration_secs, started_at, exams(title, slug)')
      .eq('user_id', user.id)
      .eq('status', 'submitted')
      .order('started_at', { ascending: false })
      .limit(20),
  ])

  const hasPaid = profile?.has_paid ?? false
  const totalAttempts = sessions?.length ?? 0
  const bestScore = sessions?.length
    ? Math.max(...sessions.filter(s => s.score != null).map(s => Math.round((s.score! / s.total_questions) * 100)))
    : 0
  const avgScore = sessions?.length
    ? Math.round(sessions.filter(s => s.score != null).reduce((sum, s) => sum + (s.score! / s.total_questions) * 100, 0) / sessions.length)
    : 0

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            <Link href="/tests" className="text-sm text-slate-600 hover:text-slate-900">Exams</Link>
            {!hasPaid && (
              <Link href="/payment" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Unlock All
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{user.email}</p>
        </div>

        {!hasPaid && (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-lg">Unlock all exams</p>
              <p className="text-blue-100 text-sm mt-0.5">One-time payment · Lifetime access · No subscriptions</p>
            </div>
            <Link href="/payment" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors shrink-0">
              Unlock Now
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Tests Taken', value: totalAttempts },
            { label: 'Best Score', value: `${bestScore}%` },
            { label: 'Average Score', value: `${avgScore}%` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href="/tests" className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">Mock Tests</h3>
            <p className="text-xs text-slate-400 mt-0.5">Full exam papers, timed</p>
          </Link>
          <Link href={hasPaid ? "/tests/mini" : "/payment"} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">Mini Tests</h3>
            <p className="text-xs text-slate-400 mt-0.5">Topic or random practice</p>
            {!hasPaid && <span className="text-xs text-blue-600 font-medium">Unlock →</span>}
          </Link>
          <QuickRandomButton hasPaid={hasPaid} />
        </div>

        {/* Test history */}
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Test History</h2>
        {!sessions?.length ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <p className="text-slate-400 text-sm">No tests taken yet.</p>
            <Link href="/tests" className="mt-3 inline-block text-sm text-blue-600 font-medium hover:underline">
              Take your first test →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">Exam</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Score</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {(s.exams as any)?.title || 'Practice Test'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                        {s.session_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.score != null ? (
                        <span className={`font-semibold ${
                          (s.score / s.total_questions) >= 0.7 ? 'text-green-600' :
                          (s.score / s.total_questions) >= 0.4 ? 'text-yellow-600' : 'text-red-500'
                        }`}>
                          {formatScore(s.score, s.total_questions)} ({formatAccuracy(s.score, s.total_questions)})
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(s.started_at)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/exam/${s.id}/results`} className="text-blue-600 hover:underline text-xs font-medium">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
