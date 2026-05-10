import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyRazorpaySignature } from '@/lib/razorpay/client'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()

  const body = await request.json()
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  // Verify HMAC signature
  const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!isValid) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  // Verify the order belongs to the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  const { data: payment } = await serviceSupabase
    .from('payments')
    .select('user_id, status')
    .eq('razorpay_order_id', razorpay_order_id)
    .single()

  if (!payment) return NextResponse.json({ error: 'order_not_found' }, { status: 404 })

  // Replay attack prevention: only process if authenticated user matches
  if (user && payment.user_id !== user.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Idempotent: skip if already processed
  if (payment.status === 'paid') {
    return NextResponse.json({ success: true })
  }

  // Update payment record
  await serviceSupabase
    .from('payments')
    .update({
      razorpay_payment_id,
      razorpay_signature,
      status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', razorpay_order_id)
    .eq('status', 'created') // Idempotent guard

  // Unlock access
  await serviceSupabase
    .from('user_profiles')
    .update({
      has_paid: true,
      paid_at: new Date().toISOString(),
      razorpay_payment_id,
    })
    .eq('id', payment.user_id)

  return NextResponse.json({ success: true })
}
