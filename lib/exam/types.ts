export type ExamType =
  | 'UDC'
  | 'LDC'
  | 'FIELD_ASSISTANT'
  | 'ASSISTANT_TIER1'
  | 'ASSISTANT_TIER2'
  | 'POLICE_CONSTABLE'
  | 'VAO'

export type SessionType = 'mock' | 'mini_topic' | 'mini_random' | 'mini_exam'

export type SessionStatus = 'in_progress' | 'submitted' | 'timed_out'

export type AnswerOption = 'A' | 'B' | 'C' | 'D'

export type Category =
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'History'
  | 'Geography'
  | 'Polity'
  | 'Mathematics'
  | 'English'
  | 'Economics'
  | 'General Knowledge'
  | 'Current Affairs'
  | 'Reasoning'
  | 'Pondicherry GK'

export interface Exam {
  id: string
  slug: string
  title: string
  year: number
  exam_type: ExamType
  duration_mins: number
  is_free: boolean
  is_active: boolean
  source_file: string
  created_at: string
}

export interface QuestionPublic {
  id: string
  exam_id: string
  position: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  category: Category | null
}

export interface ExamSession {
  id: string
  user_id: string
  exam_id: string | null
  session_type: SessionType
  is_free_attempt: boolean
  status: SessionStatus
  started_at: string
  submitted_at: string | null
  duration_secs: number | null
  score: number | null
  total_questions: number
  question_ids: string[]
  category: string | null
  question_count: number | null
}

export interface UserProfile {
  id: string
  full_name: string | null
  has_paid: boolean
  paid_at: string | null
  free_tests_used: number
}

export interface ExamState {
  sessionId: string
  questions: QuestionPublic[]
  answers: Record<string, AnswerOption | null>
  currentIndex: number
  timeRemainingSeconds: number
  status: 'loading' | 'active' | 'submitting' | 'submitted'
  markedForReview: Set<string>
}

export type ExamAction =
  | { type: 'INIT'; questions: QuestionPublic[]; sessionId: string; durationSeconds: number }
  | { type: 'SELECT_ANSWER'; questionId: string; option: AnswerOption }
  | { type: 'NAVIGATE'; index: number }
  | { type: 'TOGGLE_REVIEW'; questionId: string }
  | { type: 'SET_TIME'; seconds: number }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS' }

export interface ExamResult {
  score: number
  total: number
  accuracy: number
  timeTakenSeconds: number
  perQuestion: Array<{
    questionId: string
    selectedOption: AnswerOption | null
    correctAnswer: AnswerOption
    isCorrect: boolean
  }>
}

export interface StartExamPayload {
  session_type: SessionType
  exam_id?: string
  category?: Category
  question_count?: 10 | 25 | 50
}
