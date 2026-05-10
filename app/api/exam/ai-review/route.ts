import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { session_id } = await request.json()
  if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const { data: session } = await supabase
    .from('exam_sessions')
    .select('*, exams(title)')
    .eq('id', session_id)
    .eq('user_id', user.id)
    .single()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.ai_review) return NextResponse.json({ review: session.ai_review })

  const serviceSupabase = await createServiceClient()

  const [{ data: answers }, { data: questions }] = await Promise.all([
    supabase
      .from('user_answers')
      .select('question_id, selected_option, is_correct')
      .eq('session_id', session_id),
    serviceSupabase
      .from('questions')
      .select('id, category, correct_answer')
      .in('id', session.question_ids as string[]),
  ])

  if (!answers || !questions) return NextResponse.json({ error: 'Data missing' }, { status: 500 })

  const categoryStats: Record<string, { correct: number; total: number }> = {}
  for (const answer of answers) {
    const q = questions.find(q => q.id === answer.question_id)
    const cat = q?.category || 'General'
    if (!categoryStats[cat]) categoryStats[cat] = { correct: 0, total: 0 }
    categoryStats[cat].total++
    if (answer.is_correct) categoryStats[cat].correct++
  }

  const accuracy = session.score != null
    ? Math.round((session.score / session.total_questions) * 100)
    : 0

  const categoryLines = Object.entries(categoryStats)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
    .map(([cat, s]) => `- ${cat}: ${s.correct}/${s.total} (${Math.round((s.correct / s.total) * 100)}%)`)
    .join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 700,
    messages: [{
      role: 'user',
      content: `You are an exam coach reviewing a Pondicherry government recruitment exam result.

Exam: ${(session as any).exams?.title || 'Mock Test'}
Overall score: ${session.score}/${session.total_questions} (${accuracy}%)

Category performance (sorted weakest first):
${categoryLines}

Write a concise, encouraging performance review in 3 short paragraphs:
1. Overall performance summary (1-2 sentences)
2. Weak areas that need focus — be specific about topics within those categories
3. Action plan: 2-3 concrete study tips for the weakest areas

Be direct and practical. Write in second person. No bullet lists — plain paragraphs only.`,
    }],
  })

  const review = message.content[0].type === 'text' ? message.content[0].text : ''

  await serviceSupabase
    .from('exam_sessions')
    .update({ ai_review: review })
    .eq('id', session_id)

  return NextResponse.json({ review })
}
