'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { Category, StartExamPayload } from '@/lib/exam/types'

const CATEGORIES: Category[] = [
  'Physics', 'Chemistry', 'Biology', 'History', 'Geography',
  'Polity', 'Mathematics', 'English', 'Economics',
  'General Knowledge', 'Current Affairs', 'Reasoning', 'Pondicherry GK',
]

interface ExamOption {
  id: string
  title: string
  exam_type: string
  year: number
}

type Mode = 'mini_topic' | 'mini_random' | 'mini_exam'

export default function MiniTestConfigurator({ exams }: { exams: ExamOption[] }) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [mode, setMode] = useState<Mode | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [examId, setExamId] = useState<string | null>(null)
  const [count, setCount] = useState<10 | 25 | 50>(10)
  const [loading, setLoading] = useState(false)

  function selectMode(m: Mode) {
    setMode(m)
    if (m === 'mini_random') {
      setStep(3)
    } else {
      setStep(2)
    }
  }

  async function handleStart() {
    setLoading(true)
    try {
      const payload: StartExamPayload = {
        session_type: mode!,
        category: category ?? undefined,
        exam_id: examId ?? undefined,
        question_count: count,
      }

      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status === 403) {
        router.push('/payment')
        return
      }

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start')
      }

      const { sessionId } = await res.json()
      router.push(`/exam/${sessionId}`)
    } catch (err) {
      setLoading(false)
      toast.error(err instanceof Error ? err.message : 'Failed to start test. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Mini Test</h1>
          <p className="text-slate-500 text-sm mt-1">Quick focused practice</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-2.5 h-2.5 rounded-full transition-colors ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Mode */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm font-medium text-slate-600 mb-4">Choose test mode</p>
              <div className="space-y-3">
                {[
                  { mode: 'mini_topic' as Mode, icon: '🎯', title: 'By Topic', desc: 'Questions from a specific subject' },
                  { mode: 'mini_random' as Mode, icon: '🔀', title: 'Random Mix', desc: 'Mixed questions from all exams' },
                  { mode: 'mini_exam' as Mode, icon: '📝', title: 'From Exam', desc: 'Random questions from one exam' },
                ].map(opt => (
                  <button
                    key={opt.mode}
                    onClick={() => selectMode(opt.mode)}
                    className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all text-left"
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{opt.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                    </div>
                    <span className="ml-auto text-slate-300">→</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Category or Exam selection */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1">
                ← Back
              </button>

              {mode === 'mini_topic' && (
                <>
                  <p className="text-sm font-medium text-slate-600 mb-4">Choose a subject</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setCategory(cat); setStep(3) }}
                        className="p-3 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-400 text-sm font-medium text-slate-700 hover:text-blue-600 transition-all"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {mode === 'mini_exam' && (
                <>
                  <p className="text-sm font-medium text-slate-600 mb-4">Choose an exam</p>
                  <div className="space-y-2">
                    {exams.map(exam => (
                      <button
                        key={exam.id}
                        onClick={() => { setExamId(exam.id); setStep(3) }}
                        className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-400 text-sm font-medium text-slate-700 hover:text-blue-600 transition-all text-left"
                      >
                        {exam.title}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step 3: Question count + Start */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button
                onClick={() => setStep(mode === 'mini_random' ? 1 : 2)}
                className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1"
              >
                ← Back
              </button>
              <p className="text-sm font-medium text-slate-600 mb-4">How many questions?</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {([10, 25, 50] as const).map(n => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`py-4 rounded-2xl border-2 font-bold text-lg transition-all ${
                      count === n ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    {n}
                    <div className="text-xs font-normal text-slate-400 mt-0.5">{n} min</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loading ? 'Starting…' : 'Start Test →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
