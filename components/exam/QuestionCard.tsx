'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { QuestionPublic, AnswerOption } from '@/lib/exam/types'

interface QuestionCardProps {
  question: QuestionPublic
  selectedAnswer: AnswerOption | null
  index: number
  total: number
  onSelect: (option: AnswerOption) => void
}

const OPTIONS: AnswerOption[] = ['A', 'B', 'C', 'D']

const optionLabels: Record<AnswerOption, string> = {
  A: 'option_a',
  B: 'option_b',
  C: 'option_c',
  D: 'option_d',
}

export default function QuestionCard({ question, selectedAnswer, index, total, onSelect }: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.18 }}
        className="flex-1"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-slate-500">Q{index + 1}</span>
          {question.category && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
              {question.category}
            </span>
          )}
        </div>

        <p className="text-slate-900 font-medium leading-relaxed mb-6 text-base whitespace-pre-wrap">
          {question.question_text}
        </p>

        <div className="space-y-3">
          {OPTIONS.map(opt => {
            const isSelected = selectedAnswer === opt
            const optionText = question[optionLabels[opt] as keyof QuestionPublic] as string

            return (
              <motion.button
                key={opt}
                onClick={() => onSelect(opt)}
                whileTap={{ scale: 0.99 }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 min-h-[56px] ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {opt}
                </span>
                <span className="text-sm leading-relaxed">{optionText}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
