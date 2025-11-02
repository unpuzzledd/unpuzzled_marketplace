import { supabase } from './supabase'
import { ApiResponse } from '../types/database'

/**
 * Teacher API - Teacher-specific API methods
 * This wraps existing functionality without modifying AdminApi
 */
export class TeacherApi {
  
  // =============================================
  // TEACHER PROFILE & ASSIGNMENTS
  // =============================================

  /**
   * Get teacher's academy assignments
   */
  static async getMyAssignments(teacherId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('teacher_assignments')
        .select(`
          *,
          academy:academies(
            id,
            name,
            status,
            location:locations(name, city)
          )
        `)
        .eq('teacher_id', teacherId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get teacher assignments'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get all batches assigned to a teacher
   */
  static async getMyBatches(teacherId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select(`
          *,
          skill:skills(
            id,
            name,
            description
          ),
          academy:academies(
            id,
            name
          )
        `)
        .eq('teacher_id', teacherId)
        .eq('status', 'active')
        .order('start_date', { ascending: true })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get teacher batches'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get a specific batch with full details
   */
  static async getBatchDetails(batchId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select(`
          *,
          skill:skills(
            id,
            name,
            description
          ),
          academy:academies(
            id,
            name
          )
        `)
        .eq('id', batchId)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get batch details'
      return { data: null, error: errorMessage }
    }
  }

  // =============================================
  // STUDENT MANAGEMENT
  // =============================================

  /**
   * Get students in a specific batch with their scores
   */
  static async getBatchStudentsWithScores(batchId: string): Promise<ApiResponse<any[]>> {
    try {
      // First get the batch to know the skill_id and academy_id
      const { data: batch, error: batchError } = await supabase
        .from('batches')
        .select('skill_id, academy_id')
        .eq('id', batchId)
        .single()

      if (batchError) {
        return { data: null, error: batchError.message }
      }

      // Get students enrolled in this batch
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('batch_enrollments')
        .select(`
          id,
          student_id,
          status,
          enrolled_at,
          student:users(
            id,
            full_name,
            email
          )
        `)
        .eq('batch_id', batchId)
        .eq('status', 'active')

      if (enrollmentsError) {
        return { data: null, error: enrollmentsError.message }
      }

      if (!enrollments || enrollments.length === 0) {
        return { data: [], error: null }
      }

      // Get scores for these students
      const studentIds = enrollments.map(e => e.student_id)
      const { data: scores, error: scoresError } = await supabase
        .from('student_scores')
        .select('*')
        .in('student_id', studentIds)
        .eq('skill_id', batch.skill_id)
        .eq('academy_id', batch.academy_id)

      if (scoresError) {
        console.error('Error fetching scores:', scoresError)
      }

      // Combine enrollment and score data
      const studentsWithScores = enrollments.map(enrollment => {
        const score = scores?.find(s => s.student_id === enrollment.student_id)
        return {
          ...enrollment,
          score: score?.score || 0,
          level: score?.level || 'beginner',
          score_id: score?.id || null
        }
      })

      return { data: studentsWithScores, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get batch students'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get all students across teacher's batches
   */
  static async getMyStudents(teacherId: string): Promise<ApiResponse<any[]>> {
    try {
      // Get all teacher's batches
      const { data: batches, error: batchesError } = await supabase
        .from('batches')
        .select('id, name, skill_id, academy_id')
        .eq('teacher_id', teacherId)
        .eq('status', 'active')

      if (batchesError) {
        return { data: null, error: batchesError.message }
      }

      if (!batches || batches.length === 0) {
        return { data: [], error: null }
      }

      const batchIds = batches.map(b => b.id)

      // Get all enrollments for these batches
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('batch_enrollments')
        .select(`
          *,
          student:users(
            id,
            full_name,
            email
          ),
          batch:batches(
            id,
            name,
            skill:skills(name)
          )
        `)
        .in('batch_id', batchIds)
        .eq('status', 'active')

      if (enrollmentsError) {
        return { data: null, error: enrollmentsError.message }
      }

      return { data: enrollments || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get students'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Update student score
   */
  static async updateStudentScore(
    studentId: string,
    academyId: string,
    skillId: string,
    score: number,
    level?: string,
    updatedBy?: string
  ): Promise<ApiResponse<any>> {
    try {
      // Check if score already exists
      const { data: existingScore, error: checkError } = await supabase
        .from('student_scores')
        .select('id')
        .eq('student_id', studentId)
        .eq('academy_id', academyId)
        .eq('skill_id', skillId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        return { data: null, error: checkError.message }
      }

      let result
      if (existingScore) {
        // Update existing score
        const { data, error } = await supabase
          .from('student_scores')
          .update({
            score,
            level: level || 'beginner',
            updated_by: updatedBy,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingScore.id)
          .select()
          .single()

        result = { data, error }
      } else {
        // Create new score
        const { data, error } = await supabase
          .from('student_scores')
          .insert({
            student_id: studentId,
            academy_id: academyId,
            skill_id: skillId,
            score,
            level: level || 'beginner',
            updated_by: updatedBy
          })
          .select()
          .single()

        result = { data, error }
      }

      if (result.error) {
        return { data: null, error: result.error.message }
      }

      return { data: result.data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update student score'
      return { data: null, error: errorMessage }
    }
  }

  // =============================================
  // TOPIC MANAGEMENT
  // =============================================

  /**
   * Get topics for a batch
   */
  static async getBatchTopics(batchId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          created_by_user:users(
            id,
            full_name,
            email
          )
        `)
        .eq('batch_id', batchId)
        .order('due_date', { ascending: true, nullsFirst: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get batch topics'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get a specific topic
   */
  static async getTopic(topicId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          batch:batches(
            id,
            name,
            skill:skills(name)
          ),
          created_by_user:users(
            id,
            full_name,
            email
          )
        `)
        .eq('id', topicId)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get topic'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Create a new topic
   */
  static async createTopic(
    batchId: string,
    topicData: {
      title: string
      description: string
      due_date?: string
    },
    createdBy: string
  ): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .insert({
          batch_id: batchId,
          title: topicData.title,
          description: topicData.description,
          due_date: topicData.due_date,
          created_by: createdBy,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create topic'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Update a topic
   */
  static async updateTopic(
    topicId: string,
    topicData: {
      title?: string
      description?: string
      due_date?: string
    }
  ): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .update({
          ...topicData,
          updated_at: new Date().toISOString()
        })
        .eq('id', topicId)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update topic'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Delete a topic
   */
  static async deleteTopic(topicId: string): Promise<ApiResponse<any>> {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: { success: true }, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete topic'
      return { data: null, error: errorMessage }
    }
  }

  // =============================================
  // STATISTICS & ANALYTICS
  // =============================================

  /**
   * Get teacher statistics
   */
  static async getMyStatistics(teacherId: string): Promise<ApiResponse<any>> {
    try {
      // Get batches
      const { data: batches } = await supabase
        .from('batches')
        .select('id, academy_id, skill_id')
        .eq('teacher_id', teacherId)
        .eq('status', 'active')

      const batchIds = batches?.map(b => b.id) || []
      const totalBatches = batches?.length || 0

      // Get total students across all batches
      const { count: totalStudents } = await supabase
        .from('batch_enrollments')
        .select('*', { count: 'exact', head: true })
        .in('batch_id', batchIds)
        .eq('status', 'active')

      // Get total topics
      const { data: topics } = await supabase
        .from('topics')
        .select('id, due_date')
        .in('batch_id', batchIds)

      const now = new Date()
      const upcomingTopics = topics?.filter(t => {
        if (!t.due_date) return false
        return new Date(t.due_date) > now
      }).length || 0

      const completedTopics = topics?.filter(t => {
        if (!t.due_date) return false
        return new Date(t.due_date) <= now
      }).length || 0

      return {
        data: {
          totalBatches,
          totalStudents: totalStudents || 0,
          totalTopics: topics?.length || 0,
          upcomingTopics,
          completedTopics
        },
        error: null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get statistics'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get top students for leaderboard
   */
  static async getTopStudents(
    teacherId: string,
    skillId?: string,
    limit: number = 20
  ): Promise<ApiResponse<any[]>> {
    try {
      // Get teacher's batches
      const { data: batches } = await supabase
        .from('batches')
        .select('academy_id, skill_id')
        .eq('teacher_id', teacherId)
        .eq('status', 'active')

      if (!batches || batches.length === 0) {
        return { data: [], error: null }
      }

      // Build query for scores
      let query = supabase
        .from('student_scores')
        .select(`
          *,
          student:users(
            id,
            full_name,
            email
          ),
          skill:skills(
            name
          )
        `)

      // Filter by skill if provided
      if (skillId) {
        query = query.eq('skill_id', skillId)
      } else {
        const skillIds = [...new Set(batches.map(b => b.skill_id))]
        query = query.in('skill_id', skillIds)
      }

      const { data, error } = await query
        .order('score', { ascending: false })
        .limit(limit)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get top students'
      return { data: null, error: errorMessage }
    }
  }
}

