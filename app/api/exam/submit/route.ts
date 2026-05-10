import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface SubmitPayload {
  sessionId: string
  answers: Record<string, string | null>
  timeTakenSeconds: number
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body: SubmitPayload = await request.json()
  const { sessionId, answers, timeTakenSeconds } = body

  // Fetch and validate session
  const { data: session } = await serviceSupabase
    .from('exam_sessions')
    .select('id, user_id, status, question_ids, total_questions')
    .eq('id', sessionId)
    .single()

  if (!session) return NextResponse.json({ error: 'session_not_found' }, { status: 404 })
  if (session.user_id !== user.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.status !== 'in_progress') return NextResponse.json({ error: 'already_submitted' }, { status: 400 })

  const questionIds: string[] = session.question_ids

  // Fetch correct answers (service role bypasses RLS)
  const { data: correctAnswers } = await serviceSupabase
    .from('questions')
    .select('id, correct_answer')
    .in('id', questionIds)

  if (!correctAnswers) return NextResponse.json({ error: 'questions_not_found' }, { status: 500 })

  const correctMap = Object.fromEntries(correctAnswers.map(q => [q.id, q.correct_answer]))

  // Score answers
  let score = 0
  const answerRows = questionIds.map(qId => {
    const selected = answers[qId] || null
    const correct = correctMap[qId]
    const isCorrect = selected !== null && selected === correct
    if (isCorrect) score++
    return {
      session_id: sessionId,
      question_id: qId,
      selected_option: selected,
      is_correct: isCorrect,
    }
  })

  // Upsert all answers
  await serviceSupabase
    .from('user_answers')
    .upsert(answerRows, { onConflict: 'session_id,question_id' })

  // Update session
  await serviceSupabase
    .from('exam_sessions')
    .update({
      status: 'submitted',
      score,
      submitted_at: new Date().toISOString(),
      duration_secs: timeTakenSeconds,
    })
    .eq('id', sessionId)

  const total = session.total_questions
  const accuracy = Math.round((score / total) * 100)

  return NextResponse.json({
    score,
    total,
    accuracy,
    timeTakenSeconds,
    perQuestion: answerRows.map(r => ({
      questionId: r.question_id,
      selectedOption: r.selected_option,
      correctAnswer: correctMap[r.question_id],
      isCorrect: r.is_correct,
    })),
  })
}
