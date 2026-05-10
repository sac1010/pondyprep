import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question_id } = await request.json()
  if (!question_id) return NextResponse.json({ error: 'question_id required' }, { status: 400 })

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('question_id', question_id)
    .single()

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id)
    return NextResponse.json({ bookmarked: false })
  }

  await supabase.from('bookmarks').insert({ user_id: user.id, question_id })
  return NextResponse.json({ bookmarked: true })
}
