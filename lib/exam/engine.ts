import type { ExamAction, ExamState, AnswerOption } from './types'

export function examReducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        sessionId: action.sessionId,
        questions: action.questions,
        answers: Object.fromEntries(action.questions.map(q => [q.id, null])),
        timeRemainingSeconds: action.durationSeconds,
        status: 'active',
      }
    case 'SELECT_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.option },
      }
    case 'NAVIGATE':
      return { ...state, currentIndex: action.index }
    case 'TOGGLE_REVIEW': {
      const next = new Set(state.markedForReview)
      next.has(action.questionId) ? next.delete(action.questionId) : next.add(action.questionId)
      return { ...state, markedForReview: next }
    }
    case 'SET_TIME':
      return { ...state, timeRemainingSeconds: action.seconds }
    case 'SUBMIT':
      return { ...state, status: 'submitting' }
    case 'SUBMIT_SUCCESS':
      return { ...state, status: 'submitted' }
    default:
      return state
  }
}

export const initialExamState: ExamState = {
  sessionId: '',
  questions: [],
  answers: {},
  currentIndex: 0,
  timeRemainingSeconds: 0,
  status: 'loading',
  markedForReview: new Set(),
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getQuestionStatus(
  questionId: string,
  answers: Record<string, AnswerOption | null>,
  markedForReview: Set<string>,
  currentId: string
): 'current' | 'answered' | 'review' | 'unanswered' {
  if (questionId === currentId) return 'current'
  if (markedForReview.has(questionId)) return 'review'
  if (answers[questionId] !== null && answers[questionId] !== undefined) return 'answered'
  return 'unanswered'
}

export function countAnswered(answers: Record<string, AnswerOption | null>): number {
  return Object.values(answers).filter(v => v !== null).length
}
