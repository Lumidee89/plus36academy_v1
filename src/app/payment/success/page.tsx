'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowLeft, BookOpen } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard/student/explore?payment=success')
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card-dark rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-dark-300 mb-2">Payment Successful!</h1>
          <p className="text-dark-400 mb-4">
            Thank you for your purchase. You now have access to your course.
          </p>

          <div className="bg-dark-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-dark-400">
              Redirecting to your courses in <span className="text-brand-400 font-bold">{countdown}</span> seconds...
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard/student/explore?payment=success"
              className="btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              <BookOpen size={18} />
              Go to Explore
            </Link>
            <Link
              href="/dashboard/student"
              className="btn-secondary w-full inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}