import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createRazorpayOrder } from '@/lib/razorpay/client'

const AMOUNT_PAISE = 29900 // ₹299 launch offer

export async function POST() {
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Check if already paid
  const { data: profile } = await serviceSupabase
    .from('user_profiles')
    .select('has_paid')
    .eq('id', user.id)
    .single()

  if (profile?.has_paid) {
    return NextResponse.json({ error: 'already_paid' }, { status: 400 })
  }

  try {
    const order = await createRazorpayOrder(
      AMOUNT_PAISE,
      `order_${user.id}_${Date.now()}`
    )

    // Insert payment record
    await serviceSupabase.from('payments').insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      amount_paise: AMOUNT_PAISE,
      status: 'created',
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Razorpay order error:', message)
    return NextResponse.json({ error: 'order_failed', detail: message }, { status: 500 })
  }
}
