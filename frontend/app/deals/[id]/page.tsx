'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react'

interface Deal {
  _id: string
  title: string
  description: string
  partner: string
  category: string
  accessLevel: 'public' | 'locked'
  eligibilityCriteria: string
  discount: string
}

export default function DealDetailsPage() {
  const params = useParams()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [claimMessage, setClaimMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchDeal()
    }
    checkAuthStatus()
  }, [params.id])

  const fetchDeal = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/deals/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setDeal(data)
      }
    } catch (error) {
      console.error('Error fetching deal:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }

  const handleClaim = async () => {
    if (!isLoggedIn) {
      setClaimMessage('Please log in to claim this deal.')
      return
    }

    setClaiming(true)
    setClaimMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/deals/${params.id}/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setClaimMessage('Deal claimed successfully!')
      } else {
        setClaimMessage(data.message || 'Failed to claim deal.')
      }
    } catch (error) {
      setClaimMessage('An error occurred while claiming the deal.')
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Deal Not Found</h1>
          <Link href="/deals" className="text-blue-600 hover:text-blue-800">
            ← Back to Deals
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link
            href="/deals"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Deals
          </Link>
        </motion.div>

        {/* Deal Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mr-4">{deal.title}</h1>
                  {deal.accessLevel === 'locked' ? (
                    <Lock className="h-6 w-6 text-red-500" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-2">by {deal.partner}</p>
                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {deal.category}
                  </span>
                  <span className="text-2xl font-bold text-green-600">{deal.discount}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{deal.description}</p>
            </div>

            {/* Eligibility Criteria */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Eligibility Criteria</h2>
              <p className="text-gray-700 leading-relaxed">{deal.eligibilityCriteria}</p>
            </div>

            {/* Access Level Info */}
            {deal.accessLevel === 'locked' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Verification Required</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      This deal requires user verification. Only verified startup founders can claim locked deals.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Claim Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            >
              <div className="flex-1">
                {claimMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg ${
                      claimMessage.includes('successfully')
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    {claimMessage}
                  </motion.div>
                )}
              </div>

              <button
                onClick={handleClaim}
                disabled={claiming || !isLoggedIn}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  claiming
                    ? 'bg-gray-400 cursor-not-allowed'
                    : !isLoggedIn
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {claiming ? 'Claiming...' : isLoggedIn ? 'Claim This Deal' : 'Login to Claim'}
              </button>
            </motion.div>

            {!isLoggedIn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-4 text-center"
              >
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Login or Register →
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
