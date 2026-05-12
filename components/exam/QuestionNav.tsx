'use client'

import type { AnswerOption } from '@/lib/exam/types'
import { getQuestionStatus } from '@/lib/exam/engine'

interface QuestionNavProps {
  questionIds: string[]
  answers: Record<string, AnswerOption | null>
  markedForReview: Set<string>
  currentIndex: number
  onNavigate: (index: number) => void
}

const statusColors = {
  current: 'bg-blue-600 text-white border-blue-600',
  answered: 'bg-green-500 text-white border-green-500',
  review: 'bg-yellow-400 text-white border-yellow-400',
  unanswered: 'bg-white text-slate-600 border-slate-200 hover:border-blue-300',
}

export default function QuestionNav({ questionIds, answers, markedForReview, currentIndex, onNavigate }: QuestionNavProps) {
  const currentId = questionIds[currentIndex]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-xs font-medium text-slate-500 mb-3">Questions</p>
      <div className="grid grid-cols-10 gap-0.5 sm:gap-1">
        {questionIds.map((id, i) => {
          const status = getQuestionStatus(id, answers, markedForReview, currentId)
          return (
            <button
              key={id}
              onClick={() => onNavigate(i)}
              className={`w-full aspect-square rounded-md border text-[10px] sm:text-[11px] font-semibold tracking-tighter flex items-center justify-center transition-all ${statusColors[status]}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
          Answered
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" />
          Marked
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
          Current
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-3 h-3 rounded-sm bg-white border border-slate-300 inline-block" />
          Not visited
        </div>
      </div>
    </div>
  )
}
