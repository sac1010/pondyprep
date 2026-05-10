import { notFound, redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import ExamShell from '@/components/exam/ExamShell'
import type { Metadata } from 'next'
import type { QuestionPublic } from '@/lib/exam/types'

export const metadata: Metadata = { title: 'Exam in Progress — PondyPrep' }

export default async function ExamPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/exam/${sessionId}`)

  const { data: session } = await supabase
    .from('exam_sessions')
    .select('id, exam_id, session_type, status, started_at, total_questions, question_ids')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) notFound()
  if (session.status !== 'in_progress') redirect(`/exam/${sessionId}/results`)

  // Get exam duration
  let durationMins = session.total_questions // 1 min per question for mini tests
  if (session.exam_id) {
    const { data: exam } = await supabase
      .from('exams')
      .select('duration_mins')
      .eq('id', session.exam_id)
      .single()
    if (exam) durationMins = exam.duration_mins
  }

  // Compute remaining seconds based on wall-clock (prevents extra time on new tab/device)
  const startedAt = new Date(session.started_at).getTime()
  const endTime = startedAt + durationMins * 60 * 1000
  const durationSeconds = Math.max(10, Math.floor((endTime - Date.now()) / 1000))

  // Fetch questions (service role bypasses RLS but we only select public fields)
  const questionIds: string[] = session.question_ids
  const { data: rawQuestions } = await serviceSupabase
    .from('questions')
    .select('id, exam_id, position, question_text, option_a, option_b, option_c, option_d, category')
    .in('id', questionIds)

  if (!rawQuestions?.length) notFound()

  // Preserve original shuffle order from session
  const questionsMap = new Map(rawQuestions.map(q => [q.id, q]))
  const questions: QuestionPublic[] = questionIds
    .map(id => questionsMap.get(id))
    .filter((q): q is QuestionPublic => Boolean(q))

  return (
    <ExamShell
      initialData={{ sessionId, questions, durationSeconds }}
    />
  )
}
