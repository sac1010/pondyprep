import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import ResultSummary from '@/components/exam/ResultSummary'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Test Results' }

export default async function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: session } = await supabase
    .from('exam_sessions')
    .select('*, exams(title, slug)')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session || session.status === 'in_progress') notFound()

  // Fetch answers with questions
  const { data: answers } = await supabase
    .from('user_answers')
    .select('question_id, selected_option, is_correct')
    .eq('session_id', sessionId)

  // Fetch questions with correct answers + explanations (service role)
  const questionIds: string[] = session.question_ids
  const [{ data: questions }, { data: bookmarks }, { data: profile }] = await Promise.all([
    serviceSupabase
      .from('questions')
      .select('id, position, question_text, option_a, option_b, option_c, option_d, correct_answer, category, explanation')
      .in('id', questionIds),
    supabase
      .from('bookmarks')
      .select('question_id')
      .eq('user_id', user.id),
    supabase
      .from('user_profiles')
      .select('has_paid')
      .eq('id', user.id)
      .single(),
  ])

  if (!questions) notFound()

  // Order questions by original session order
  const orderedQuestions = questionIds.map(id => questions.find(q => q.id === id)!).filter(Boolean)
  const answersMap = Object.fromEntries((answers || []).map(a => [a.question_id, a]))
  const bookmarkedIds = new Set((bookmarks || []).map(b => b.question_id))

  const accuracy = session.score != null
    ? Math.round((session.score / session.total_questions) * 100)
    : 0

  return (
    <ResultSummary
      session={session}
      questions={orderedQuestions}
      answersMap={answersMap}
      accuracy={accuracy}
      hasPaid={profile?.has_paid ?? false}
      isFreeAttempt={session.is_free_attempt}
      bookmarkedIds={Array.from(bookmarkedIds)}
    />
  )
}
