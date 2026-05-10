'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { formatTime } from '@/lib/exam/engine'
import Logo from '@/components/Logo'

interface ResultSummaryProps {
  session: any
  questions: any[]
  answersMap: Record<string, any>
  accuracy: number
  hasPaid: boolean
  isFreeAttempt: boolean
  bookmarkedIds: string[]
}

export default function ResultSummary({
  session, questions, answersMap, accuracy, hasPaid, isFreeAttempt, bookmarkedIds,
}: ResultSummaryProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedIds))
  const [bookmarkLoading, setBookmarkLoading] = useState<string | null>(null)
  const [aiReview, setAiReview] = useState<string | null>(session.ai_review ?? null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiReview, setShowAiReview] = useState(!!session.ai_review)

  useEffect(() => {
    const target = session.score ?? 0
    const duration = 1200
    const startTime = Date.now()
    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(ease * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
    if (isFreeAttempt && !hasPaid) setTimeout(() => setShowPaywall(true), 2000)
  }, [])

  async function toggleBookmark(questionId: string) {
    setBookmarkLoading(questionId)
    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: questionId }),
      })
      const { bookmarked } = await res.json()
      setBookmarks(prev => {
        const next = new Set(prev)
        bookmarked ? next.add(questionId) : next.delete(questionId)
        return next
      })
    } finally {
      setBookmarkLoading(null)
    }
  }

  async function handleAiReview() {
    if (aiReview) { setShowAiReview(true); return }
    setAiLoading(true)
    try {
      const res = await fetch('/api/exam/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id }),
      })
      const { review } = await res.json()
      setAiReview(review)
      setShowAiReview(true)
    } finally {
      setAiLoading(false)
    }
  }

  const scoreColor = accuracy >= 70 ? 'text-green-600' : accuracy >= 40 ? 'text-yellow-600' : 'text-red-600'
  const scoreBg = accuracy >= 70 ? 'bg-green-50 border-green-200' : accuracy >= 40 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <Link href="/tests" className="text-sm text-slate-600 hover:text-slate-900">All Exams</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-2xl border-2 ${scoreBg} p-8 text-center mb-6`}
        >
          <p className="text-slate-500 text-sm font-medium mb-2">
            {session.exams?.title || 'Test'} — Results
          </p>
          <div className={`text-6xl font-bold ${scoreColor} mb-2`}>
            {displayScore}<span className="text-3xl text-slate-400">/{session.total_questions}</span>
          </div>
          <p className="text-slate-500 text-sm">
            {accuracy}% accuracy · {session.duration_secs ? formatTime(session.duration_secs) : '—'} taken
          </p>
          <div className="mt-6 flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{session.score ?? 0}</div>
              <div className="text-slate-400 mt-0.5">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{session.total_questions - (session.score ?? 0)}</div>
              <div className="text-slate-400 mt-0.5">Wrong / Skipped</div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <Link
            href="/tests"
            className="flex-1 text-center py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-colors"
          >
            All Exams
          </Link>
          {session.exams?.slug && (
            <Link
              href={`/tests/${session.exams.slug}`}
              className="flex-1 text-center py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Retake Test
            </Link>
          )}
        </div>

        {/* AI Review */}
        <div className="mb-8">
          {!showAiReview ? (
            <button
              onClick={handleAiReview}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-60"
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Generating your AI review…
                </>
              ) : (
                <>✨ Get AI Performance Review</>
              )}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-blue-100 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <span>✨</span> AI Performance Review
                </h3>
                <button onClick={() => setShowAiReview(false)} className="text-xs text-slate-400 hover:text-slate-600">
                  Hide
                </button>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{aiReview}</div>
            </motion.div>
          )}
        </div>

        {/* Question review */}
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Question Review</h2>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const ans = answersMap[q.id]
            const isCorrect = ans?.is_correct
            const selected = ans?.selected_option
            const isExpanded = expandedQuestion === q.id
            const isBookmarked = bookmarks.has(q.id)

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCorrect ? 'bg-green-100 text-green-700' : selected ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isCorrect ? '✓' : selected ? '✗' : '—'}
                    </span>
                    <span className="text-sm text-slate-700 line-clamp-2 flex-1">{q.question_text}</span>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleBookmark(q.id)}
                      disabled={bookmarkLoading === q.id}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
                    >
                      <svg className={`w-4 h-4 ${isBookmarked ? 'text-blue-600 fill-blue-600' : 'text-slate-400'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                      className="text-slate-400 text-xs"
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
                        {(['A', 'B', 'C', 'D'] as const).map(opt => {
                          const text = q[`option_${opt.toLowerCase()}`]
                          const isCorrectOpt = q.correct_answer === opt
                          const isSelectedOpt = selected === opt
                          return (
                            <div key={opt} className={`flex items-center gap-3 p-3 rounded-xl text-sm ${
                              isCorrectOpt ? 'bg-green-50 border border-green-200 text-green-800' :
                              isSelectedOpt && !isCorrectOpt ? 'bg-red-50 border border-red-200 text-red-800' :
                              'border border-transparent text-slate-600'
                            }`}>
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isCorrectOpt ? 'bg-green-500 text-white' :
                                isSelectedOpt ? 'bg-red-400 text-white' :
                                'bg-slate-100 text-slate-500'
                              }`}>{opt}</span>
                              {text}
                              {isCorrectOpt && <span className="ml-auto text-green-600 text-xs font-medium">Correct</span>}
                              {isSelectedOpt && !isCorrectOpt && <span className="ml-auto text-red-500 text-xs font-medium">Your answer</span>}
                            </div>
                          )
                        })}
                        {q.explanation && (
                          <div className="mt-3 flex gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <span className="text-blue-500 text-sm shrink-0 mt-0.5">💡</span>
                            <p className="text-xs text-blue-800 leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Paywall overlay for free users */}
      <AnimatePresence>
        {showPaywall && !hasPaid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end justify-center z-50 px-4 pb-6"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="text-lg font-bold text-slate-900">You scored {session.score}/{session.total_questions}</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Unlock all exams and unlimited practice — one-time payment
                </p>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-600 mb-5">
                {['All available exam papers', 'Unlimited attempts', 'AI performance review', 'Topic mini tests', 'Explanations for every question'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/payment"
                className="block text-center bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Unlock All Exams
              </Link>
              <button
                onClick={() => setShowPaywall(false)}
                className="block w-full text-center text-slate-400 text-sm mt-3 hover:text-slate-600"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
