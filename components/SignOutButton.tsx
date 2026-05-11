'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className={className ?? 'text-sm text-slate-500 hover:text-slate-700 transition-colors'}
    >
      Sign out
    </button>
  )
}
