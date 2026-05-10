import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MiniTestConfigurator from './MiniTestConfigurator'

export default async function MiniTestPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/tests/mini')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('has_paid')
    .eq('id', user.id)
    .single()

  if (!profile?.has_paid) redirect('/payment?reason=mini_test')

  const { data: exams } = await supabase
    .from('exams')
    .select('id, title, exam_type, year')
    .eq('is_active', true)
    .order('year', { ascending: false })

  return <MiniTestConfigurator exams={exams ?? []} />
}
