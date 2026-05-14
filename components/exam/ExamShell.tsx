'use client'

import { useReducer, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import ExamTimer from './ExamTimer'
import QuestionCard from './QuestionCard'
import QuestionNav from './QuestionNav'
import { examReducer, initialExamState, countAnswered } from '@/lib/exam/engine'
import type { QuestionPublic, AnswerOption } from '@/lib/exam/types'
import Logo from '@/components/Logo'

interface ExamShellProps {
  initialData: {
    sessionId: string
    questions: QuestionPublic[]
    durationSeconds: number
  }
}

export default function ExamShell({ initialData }: ExamShellProps) {
  const router = useRouter()
  const [state, dispatch] = useReducer(examReducer, initialExamState)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)
  const pendingSaveRef = useRef<Record<string, string | null>>({})

  useEffect(() => {
    // Initialize from server-provided data (no extra API call needed)
    dispatch({
      type: 'INIT',
      questions: initialData.questions,
      sessionId: initialData.sessionId,
      durationSeconds: initialData.durationSeconds,
    })

    autoSaveRef.current = setInterval(() => autoSave(initialData.sessionId), 30000)

    const onOffline = () => setIsOffline(true)
    const onOnline = () => {
      setIsOffline(false)
      flushPendingAnswers(initialData.sessionId)
    }
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('beforeunload', onBeforeUnload)
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    }
  }, [])

  async function autoSave(sessionId: string) {
    if (!Object.keys(pendingSaveRef.current).length) return
    try {
      await fetch('/api/exam/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers: pendingSaveRef.current }),
      })
      pendingSaveRef.current = {}
    } catch {
      // Silent fail — answers are safe in state and sessionStorage
    }
  }

  async function flushPendingAnswers(sessionId: string) {
    if (Object.keys(pendingSaveRef.current).length) {
      await autoSave(sessionId)
    }
  }

  function handleSelectAnswer(questionId: string, option: AnswerOption) {
    dispatch({ type: 'SELECT_ANSWER', questionId, option })
    pendingSaveRef.current[questionId] = option
    // Immediate sessionStorage backup
    const storedKey = `exam_answers_${initialData.sessionId}`
    try {
      const existing = JSON.parse(sessionStorage.getItem(storedKey) || '{}')
      sessionStorage.setItem(storedKey, JSON.stringify({ ...existing, [questionId]: option }))
    } catch {}
  }

  function handleSubmit() {
    dispatch({ type: 'SUBMIT' })
    setShowSubmitConfirm(false)
    submitExam()
  }

  async function submitExam() {
    setIsSubmitting(true)
    const sessionId = initialData.sessionId
    const endTimeStored = sessionStorage.getItem(`exam_end_${sessionId}`)
    const endTime = endTimeStored ? parseInt(endTimeStored, 10) : Date.now()
    const startTime = endTime - initialData.durationSeconds * 1000
    const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000)

    let attempts = 0
    while (attempts < 2) {
      try {
        const res = await fetch('/api/exam/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            answers: state.answers,
            timeTakenSeconds,
          }),
        })

        if (!res.ok) throw new Error('Submit failed')

        sessionStorage.removeItem(`exam_answers_${sessionId}`)
        sessionStorage.removeItem(`exam_end_${sessionId}`)
        router.push(`/exam/${sessionId}/results`)
        return

      } catch {
        attempts++
        if (attempts >= 2) {
          setIsSubmitting(false)
          dispatch({ type: 'INIT', questions: state.questions, sessionId, durationSeconds: state.timeRemainingSeconds })
          toast.error('Submission failed. Your answers are safe — please try again.', { duration: 8000 })
        }
      }
    }
  }

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading your test…</p>
        </div>
      </div>
    )
  }

  const currentQuestion = state.questions[state.currentIndex]
  const answered = countAnswered(state.answers)

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Offline banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -48 }}
            animate={{ y: 0 }}
            exit={{ y: -48 }}
            className="bg-yellow-500 text-white text-sm font-medium text-center py-2.5 px-4"
          >
            You&apos;re offline — your answers are saved and the timer is still running
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-600">
            {answered}/{state.questions.length} answered
          </span>
        </div>
        <ExamTimer
          durationSeconds={initialData.durationSeconds}
          sessionId={initialData.sessionId}
          onTimeUp={handleSubmit}
          onTick={s => dispatch({ type: 'SET_TIME', seconds: s })}
        />
      </div>

      {/* Main */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex gap-6">
        {/* Question area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex-1 flex flex-col">
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                selectedAnswer={state.answers[currentQuestion.id] ?? null}
                index={state.currentIndex}
                total={state.questions.length}
                onSelect={opt => handleSelectAnswer(currentQuestion.id, opt)}
              />
            )}
          </div>

          {/* Bottom navigation */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => dispatch({ type: 'NAVIGATE', index: Math.max(0, state.currentIndex - 1) })}
                disabled={state.currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              {currentQuestion && (
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_REVIEW', questionId: currentQuestion.id })}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    state.markedForReview.has(currentQuestion.id)
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {state.markedForReview.has(currentQuestion.id) ? '★ Marked' : '☆ Mark'}
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {state.currentIndex < state.questions.length - 1 ? (
                <button
                  onClick={() => dispatch({ type: 'NAVIGATE', index: state.currentIndex + 1 })}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar question nav */}
        <div className="w-64 shrink-0 hidden lg:block space-y-4">
          <QuestionNav
            questionIds={state.questions.map(q => q.id)}
            answers={state.answers}
            markedForReview={state.markedForReview}
            currentIndex={state.currentIndex}
            onNavigate={i => dispatch({ type: 'NAVIGATE', index: i })}
          />
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* Submit confirmation modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            onClick={() => setShowSubmitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-semibold text-slate-900 text-lg mb-2">Submit test?</h3>
              <p className="text-sm text-slate-500 mb-2">
                You&apos;ve answered <span className="font-semibold text-slate-700">{answered}</span> of{' '}
                <span className="font-semibold text-slate-700">{state.questions.length}</span> questions.
              </p>
              {answered < state.questions.length && (
                <p className="text-sm text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2 mb-4">
                  {state.questions.length - answered} questions unanswered — they will be marked as skipped.
                </p>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Review
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submitting Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[60]"
          >
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Submitting your test...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
