import { redirect } from 'next/navigation'

// The landing page lives at app/page.tsx.
// This file must remain (cannot be deleted) but should not be served.
// If Next.js reports a "conflicting routes" build error, delete this file.
export default function MarketingRedirect() {
  redirect('/')
}
