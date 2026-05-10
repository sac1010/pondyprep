'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Logo from '@/components/Logo'

interface NavbarProps {
  user?: { email?: string } | null
  hasPaid?: boolean
}

export default function Navbar({ user, hasPaid }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/"><Logo /></Link>

        <div className="flex items-center gap-6">
          <Link href="/tests" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            Exams
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              {!hasPaid && (
                <Link
                  href="/payment"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Unlock All
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
