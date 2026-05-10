import { redirect } from 'next/navigation'

export default function RandomTestPage() {
  redirect('/tests/mini?mode=mini_random')
}
