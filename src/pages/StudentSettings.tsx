import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { UserProfile } from '../components/UserProfile'

const StudentSettings = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FCFA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963]"></div>
      </div>
    )
  }

  if (!user || user.role !== 'student') {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen bg-[#F7FCFA] font-lexend">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E8EB]">
        <div className="flex items-center gap-4 px-4 sm:px-6 md:px-10 py-3">
          <button
            onClick={() => navigate('/student')}
            className="p-2 hover:bg-[#F0F5F2] rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-[#0F1717]" />
          </button>
          <h1 className="text-xl font-bold text-[#0F1717]">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <UserProfile />
      </main>
    </div>
  )
}

export default StudentSettings

