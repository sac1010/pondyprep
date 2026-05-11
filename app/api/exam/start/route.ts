import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { StartExamPayload } from '@/lib/exam/types'

const FREE_QUESTION_COUNT = 10

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body: StartExamPayload = await request.json()
  const { session_type, exam_id, category, question_count = 10 } = body

  // Fetch user profile
  const { data: profile } = await serviceSupabase
    .from('user_profiles')
    .select('has_paid, free_tests_used')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'profile_not_found' }, { status: 404 })

  let isFreeAttempt = false
  let durationMins = 120
  let totalQuestions = 100

  // Access gate (don't consume free attempt yet — only after session is created)
  if (!profile.has_paid) {
    if (session_type !== 'mock') {
      return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })
    }

    const { data: exam } = await supabase
      .from('exams')
      .select('is_free')
      .eq('id', exam_id!)
      .single()

    if (!exam?.is_free) {
      return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })
    }

    if (profile.free_tests_used >= 1) {
      return NextResponse.json({ error: 'free_limit_reached' }, { status: 403 })
    }

    isFreeAttempt = true
    totalQuestions = FREE_QUESTION_COUNT
    durationMins = Math.ceil((FREE_QUESTION_COUNT * 120) / 100)
  }

  // Build question query based on session type
  let questionQuery = serviceSupabase
    .from('questions')
    .select('id, exam_id, position, question_text, option_a, option_b, option_c, option_d, category')

  if (session_type === 'mock') {
    questionQuery = questionQuery
      .eq('exam_id', exam_id!)
      .order('position', { ascending: true })
      .limit(isFreeAttempt ? FREE_QUESTION_COUNT : 100)

    // Get exam duration
    const { data: examData } = await supabase
      .from('exams')
      .select('duration_mins')
      .eq('id', exam_id!)
      .single()
    if (examData && !isFreeAttempt) durationMins = examData.duration_mins

  } else if (session_type === 'mini_topic') {
    questionQuery = questionQuery
      .eq('category', category!)
      .limit(question_count)
    totalQuestions = question_count
    durationMins = question_count

  } else if (session_type === 'mini_random') {
    questionQuery = questionQuery.limit(question_count)
    totalQuestions = question_count
    durationMins = question_count

  } else if (session_type === 'mini_exam') {
    questionQuery = questionQuery
      .eq('exam_id', exam_id!)
      .limit(question_count)
    totalQuestions = question_count
    durationMins = question_count
  }

  const { data: questions, error: qErr } = await questionQuery
  if (qErr || !questions?.length) {
    return NextResponse.json({ error: 'questions_not_found' }, { status: 500 })
  }

  // Shuffle for mini tests
  let orderedQuestions = questions
  if (session_type !== 'mock') {
    orderedQuestions = [...questions].sort(() => Math.random() - 0.5)
  }

  const questionIds = orderedQuestions.map(q => q.id)

  // Create exam session
  const { data: session, error: sErr } = await serviceSupabase
    .from('exam_sessions')
    .insert({
      user_id: user.id,
      exam_id: exam_id || null,
      session_type,
      is_free_attempt: isFreeAttempt,
      status: 'in_progress',
      total_questions: totalQuestions,
      question_ids: questionIds,
      category: category || null,
      question_count: totalQuestions,
    })
    .select('id')
    .single()

  if (sErr || !session) {
    return NextResponse.json({ error: 'session_create_failed' }, { status: 500 })
  }

  // Now that the session is created, consume the free attempt
  if (isFreeAttempt) {
    await serviceSupabase
      .from('user_profiles')
      .update({ free_tests_used: profile.free_tests_used + 1 })
      .eq('id', user.id)
  }

  return NextResponse.json({
    sessionId: session.id,
    questions: orderedQuestions,
    durationSeconds: durationMins * 60,
    totalQuestions,
  })
}
