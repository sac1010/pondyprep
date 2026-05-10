import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient, createServiceClient, createBuildClient } from '@/lib/supabase/server'
import StartExamButton from './StartExamButton'
import Logo from '@/components/Logo'

const EXAM_LABELS: Record<string, string> = {
  UDC: 'Upper Division Clerk',
  LDC: 'Lower Division Clerk',
  FIELD_ASSISTANT: 'Field Assistant',
  ASSISTANT_TIER1: 'Assistant Tier-1 (Combined Services)',
  ASSISTANT_TIER2: 'Assistant Tier-2 (Maths)',
  POLICE_CONSTABLE: 'Police Constable',
  VAO: 'Village Administrative Officer',
}

const CATEGORY_COLORS: Record<string, string> = {
  Physics: 'bg-blue-50 text-blue-700',
  Chemistry: 'bg-purple-50 text-purple-700',
  Biology: 'bg-green-50 text-green-700',
  History: 'bg-amber-50 text-amber-700',
  Geography: 'bg-teal-50 text-teal-700',
  Polity: 'bg-red-50 text-red-700',
  Mathematics: 'bg-indigo-50 text-indigo-700',
  English: 'bg-pink-50 text-pink-700',
  Economics: 'bg-orange-50 text-orange-700',
  'General Knowledge': 'bg-slate-100 text-slate-700',
  'Current Affairs': 'bg-cyan-50 text-cyan-700',
  Reasoning: 'bg-violet-50 text-violet-700',
  'Pondicherry GK': 'bg-emerald-50 text-emerald-700',
}

export async function generateStaticParams() {
  try {
    const db = createBuildClient()
    const { data: exams } = await db
      .from('exams')
      .select('slug')
      .eq('is_active', true)
    return (exams ?? []).map(e => ({ slug: e.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const db = createBuildClient()
  const { data: exam } = await db
    .from('exams')
    .select('title, year, exam_type')
    .eq('slug', slug)
    .single()

  if (!exam) return { title: 'Exam Not Found' }

  const label = EXAM_LABELS[exam.exam_type] || exam.exam_type
  const title = `${exam.title} Mock Test — Pondicherry ${label} ${exam.year}`
  const description = `Practice the ${exam.title} question paper online. 100 questions, ${exam.year} actual paper. Timed mock test exclusively for Pondicherry recruitment exam preparation.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `/tests/${slug}` },
  }
}

export default async function ExamDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()

  const { data: exam } = await serviceSupabase
    .from('exams')
    .select('id, slug, title, year, exam_type, duration_mins, is_free, is_active')
    .eq('slug', slug)
    .single()

  if (!exam || !exam.is_active) notFound()

  // Category breakdown
  const { data: categories } = await serviceSupabase
    .from('questions')
    .select('category')
    .eq('exam_id', exam.id)
    .not('category', 'is', null)

  const categoryCount: Record<string, number> = {}
  for (const row of categories ?? []) {
    if (row.category) {
      categoryCount[row.category] = (categoryCount[row.category] ?? 0) + 1
    }
  }
  const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])

  const { data: { user } } = await supabase.auth.getUser()
  let hasPaid = false
  let canStart = exam.is_free

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('has_paid')
      .eq('id', user.id)
      .single()
    hasPaid = profile?.has_paid ?? false
    canStart = hasPaid || exam.is_free
  }

  const label = EXAM_LABELS[exam.exam_type] || exam.exam_type

  // Sample questions for SEO
  const { data: sampleQs } = await serviceSupabase
    .from('questions')
    .select('question_text, option_a, option_b, option_c, option_d')
    .eq('exam_id', exam.id)
    .order('position', { ascending: true })
    .limit(3)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/tests" className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link href="/"><Logo /></Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{label}</span>
                {exam.is_free && (
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">Free</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
              <p className="text-slate-500 text-sm mt-1">
                {exam.year} · Official Pondicherry Government Exam Paper
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">100</div>
              <div className="text-xs text-slate-500 mt-0.5">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{exam.duration_mins}</div>
              <div className="text-xs text-slate-500 mt-0.5">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{exam.year}</div>
              <div className="text-xs text-slate-500 mt-0.5">Year</div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6">
            {!user ? (
              <Link
                href={`/login?next=/tests/${slug}`}
                className="block w-full text-center bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                Sign in to Start
              </Link>
            ) : canStart ? (
              <StartExamButton examId={exam.id} examSlug={slug} />
            ) : (
              <Link
                href="/payment"
                className="block w-full text-center bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                Unlock for ₹349 — Lifetime Access
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category breakdown */}
          {sortedCategories.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Topic Breakdown</h2>
              <div className="space-y-2">
                {sortedCategories.map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[cat] ?? 'bg-slate-100 text-slate-700'}`}>
                      {cat}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-400 h-1.5 rounded-full"
                        style={{ width: `${Math.round((count / 100) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">How This Works</h2>
            <ol className="space-y-3">
              {[
                'Timer starts when you click "Start Test" — it counts down in real time',
                'Answer questions in any order using the navigation grid',
                'Mark questions for review and come back to them',
                'Submit before time runs out, or the test auto-submits',
                'Your score and answer key are shown immediately',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-medium text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Sample questions for SEO */}
        {(sampleQs?.length ?? 0) > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-5">Sample Questions from {exam.title}</h2>
            <div className="space-y-6">
              {sampleQs!.map((q, i) => (
                <div key={i} className="border-b border-slate-100 last:border-0 pb-5 last:pb-0">
                  <p className="text-sm font-medium text-slate-900 mb-3">
                    <span className="text-slate-400 mr-2">Q{i + 1}.</span>{q.question_text}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map(opt => (
                      <div key={opt} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-5 h-5 rounded border border-slate-200 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium text-slate-500">{opt}</span>
                        {q[`option_${opt.toLowerCase() as 'a' | 'b' | 'c' | 'd'}`]}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">Sign in to see all 100 questions with answers after completing the test.</p>
          </div>
        )}

        {/* Breadcrumb JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pondyprep.in' },
                { '@type': 'ListItem', position: 2, name: 'Exams', item: 'https://pondyprep.in/tests' },
                { '@type': 'ListItem', position: 3, name: exam.title, item: `https://pondyprep.in/tests/${slug}` },
              ],
            }),
          }}
        />
      </div>
    </div>
  )
}
