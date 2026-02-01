'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, Filter, Lock, Unlock } from 'lucide-react'

interface Deal {
  _id: string
  title: string
  description: string
  partner: string
  category: string
  accessLevel: 'public' | 'locked'
  discount: string
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAccess, setSelectedAccess] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

  useEffect(() => {
    filterDeals()
  }, [deals, searchTerm, selectedCategory, selectedAccess])

  const fetchDeals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/deals')
      const data = await response.json()
      setDeals(data)
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDeals = () => {
    let filtered = deals

    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.partner.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(deal => deal.category === selectedCategory)
    }

    if (selectedAccess !== 'all') {
      filtered = filtered.filter(deal => deal.accessLevel === selectedAccess)
    }

    setFilteredDeals(filtered)
  }

  const categories = [...new Set(deals.map(deal => deal.category))]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Exclusive Startup Deals</h1>
            <p className="text-gray-600">Discover premium tools and services at discounted rates for your startup.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Access Level Filter */}
            <div className="w-full md:w-48">
              <select
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Access Levels</option>
                <option value="public">Public</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Deals Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredDeals.map((deal, index) => (
            <motion.div
              key={deal._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{deal.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {deal.partner}</p>
                  </div>
                  <div className="flex items-center ml-4">
                    {deal.accessLevel === 'locked' ? (
                      <Lock className="h-5 w-5 text-red-500" />
                    ) : (
                      <Unlock className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">{deal.description}</p>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {deal.category}
                  </span>
                  <span className="text-lg font-bold text-green-600">{deal.discount}</span>
                </div>

                <Link
                  href={`/deals/${deal._id}`}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredDeals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500 text-lg">No deals found matching your criteria.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
