import React, { useState, useEffect } from 'react'
import { TeacherApi } from '../../lib/teacherApi'

interface StudentScoreModalProps {
  isOpen: boolean
  onClose: () => void
  student: {
    student_id: string
    student?: {
      id: string
      full_name: string
      email: string
    }
    score: number
    level: string
    score_id: string | null
  }
  batch: {
    id: string
    name: string
    academy_id: string
    skill_id: string
    skill?: {
      name: string
    }
  }
  teacherId: string
  onScoreUpdated?: () => void
}

export const StudentScoreModal: React.FC<StudentScoreModalProps> = ({
  isOpen,
  onClose,
  student,
  batch,
  teacherId,
  onScoreUpdated
}) => {
  const [score, setScore] = useState<string>('')
  const [level, setLevel] = useState<string>('beginner')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && student) {
      setScore(student.score?.toString() || '0')
      setLevel(student.level || 'beginner')
    }
  }, [isOpen, student])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate score
    const scoreNum = parseInt(score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 9999) {
      setError('Score must be between 0 and 9999')
      setLoading(false)
      return
    }

    try {
      const { error: apiError } = await TeacherApi.updateStudentScore(
        student.student_id,
        batch.academy_id,
        batch.skill_id,
        scoreNum,
        level,
        teacherId
      )

      if (apiError) {
        setError(apiError)
        setLoading(false)
        return
      }

      // Success
      if (onScoreUpdated) {
        onScoreUpdated()
      }
      onClose()
    } catch (error) {
      console.error('Error updating score:', error)
      setError('Failed to update score')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setScore(student.score?.toString() || '0')
    setLevel(student.level || 'beginner')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-[#F7FCFA] rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex h-[72px] px-6 justify-between items-center border-b border-[#DBE5E0]">
          <h2 className="text-[#0F1717] font-lexend text-2xl font-bold">
            Update Student Score
          </h2>
          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 8L24 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
              <path d="M24 8L8 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Student Info */}
          <div className="mb-6 bg-white rounded-lg p-4 border border-[#DBE5E0]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#5E8C7D] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {student.student?.full_name?.charAt(0).toUpperCase() || 'S'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1717]">
                  {student.student?.full_name || 'Unknown Student'}
                </h3>
                <p className="text-sm text-[#5E8C7D]">{student.student?.email}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#DBE5E0]">
              <p className="text-sm text-[#5E8C7D]">
                <strong>Skill:</strong> {batch.skill?.name || 'Unknown'}
              </p>
              <p className="text-sm text-[#5E8C7D]">
                <strong>Batch:</strong> {batch.name}
              </p>
            </div>
          </div>

          {/* Current Score Display */}
          <div className="mb-6 bg-[#E8F0ED] rounded-lg p-4">
            <p className="text-sm text-[#5E8C7D] mb-1">Current Score</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-[#0F1717]">{student.score}</p>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#F0F5F2] text-[#5E8C7D] capitalize">
                {student.level}
              </span>
            </div>
          </div>

          {/* Score Input */}
          <div className="mb-4">
            <label className="block text-[#0F1717] font-lexend text-base font-normal leading-6 mb-2">
              New Score (0-9999) *
            </label>
            <input
              type="number"
              min="0"
              max="9999"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full h-14 px-[15px] rounded-xl border border-[#D9E8E3] bg-white text-[#0F1717] placeholder:text-[#5E8C7D] font-lexend text-base leading-6 focus:outline-none focus:ring-2 focus:ring-[#009963] focus:border-transparent"
              placeholder="Enter score (0-9999)"
              required
            />
            <p className="text-xs text-[#5E8C7D] mt-1">
              Enter a 4-digit score between 0 and 9999
            </p>
          </div>

          {/* Level Select */}
          <div className="mb-6">
            <label className="block text-[#0F1717] font-lexend text-base font-normal leading-6 mb-2">
              Level *
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full h-14 px-[15px] rounded-xl border border-[#D9E8E3] bg-white text-[#0F1717] font-lexend text-base leading-6 focus:outline-none focus:ring-2 focus:ring-[#009963] focus:border-transparent cursor-pointer"
              required
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex h-10 min-w-[84px] px-4 justify-center items-center flex-1 rounded-xl bg-[#F0F5F2] hover:bg-[#E0E8E5] transition-colors"
              disabled={loading}
            >
              <span className="text-[#0F1717] text-center font-lexend text-sm font-bold leading-[21px]">
                Cancel
              </span>
            </button>
            <button
              type="submit"
              className="flex h-10 min-w-[84px] px-4 justify-center items-center flex-1 rounded-xl bg-[#009963] hover:bg-[#007a4f] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              <span className="text-white text-center font-lexend text-sm font-bold leading-[21px]">
                {loading ? 'Updating...' : 'Update Score'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

