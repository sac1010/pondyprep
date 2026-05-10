import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { sessionId, answers } = await request.json()
  if (!sessionId || typeof answers !== 'object') {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  const serviceSupabase = await createServiceClient()

  // Verify session belongs to user
  const { data: session } = await serviceSupabase
    .from('exam_sessions')
    .select('id, status')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) return NextResponse.json({ error: 'session_not_found' }, { status: 404 })
  if (session.status !== 'in_progress') {
    return NextResponse.json({ error: 'session_already_ended' }, { status: 409 })
  }

  // Upsert each answer (null = skipped)
  const rows = Object.entries(answers as Record<string, string | null>).map(
    ([questionId, selectedOption]) => ({
      session_id: sessionId,
      question_id: questionId,
      selected_option: selectedOption,
      is_correct: null, // scoring happens on submit
    })
  )

  if (rows.length > 0) {
    const { error } = await serviceSupabase
      .from('user_answers')
      .upsert(rows, { onConflict: 'session_id,question_id', ignoreDuplicates: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ saved: rows.length })
}
