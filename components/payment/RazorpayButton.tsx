'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface RazorpayButtonProps {
  userEmail?: string
  userName?: string
}

declare global {
  interface Window { Razorpay: any }
}

export default function RazorpayButton({ userEmail, userName }: RazorpayButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePayment() {
    setLoading(true)

    try {
      // Create order
      const orderRes = await fetch('/api/razorpay/create-order', { method: 'POST' })
      if (!orderRes.ok) {
        const { error } = await orderRes.json()
        if (error === 'already_paid') {
          toast.success('You already have access!')
          router.push('/tests')
          return
        }
        throw new Error('Order creation failed')
      }
      const { orderId, amount, currency, keyId } = await orderRes.json()

      // Load Razorpay script dynamically
      await loadRazorpayScript()

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'PondyPrep',
        description: 'Lifetime Access — All Pondicherry Exams',
        order_id: orderId,
        prefill: { email: userEmail, name: userName },
        theme: { color: '#2563EB' },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
        handler: async (response: any) => {
          await verifyPayment(response)
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        setLoading(false)
        toast.error('Payment unsuccessful. Please try again.', { duration: 6000 })
      })
      rzp.open()

    } catch {
      setLoading(false)
      toast.error("Couldn't initiate payment. Please check your connection and try again.", { duration: 6000 })
    }
  }

  async function verifyPayment(response: any) {
    let attempts = 0
    while (attempts < 3) {
      try {
        const res = await fetch('/api/razorpay/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        })

        if (res.ok) {
          router.push('/payment/success')
          return
        }
        throw new Error('Verification failed')
      } catch {
        attempts++
        if (attempts < 3) await new Promise(r => setTimeout(r, Math.pow(2, attempts) * 1000))
      }
    }

    setLoading(false)
    toast.error('Payment received — your access will be unlocked within a few minutes. Refresh if it doesn\'t.', {
      duration: 10000,
    })
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing…
        </>
      ) : (
        'Unlock All Exams — ₹299'
      )}
    </button>
  )
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}
