import { supabase } from './supabase'
import { ApiResponse } from '../types/database'

/**
 * Student API - Student-specific API methods
 * Handles all student-related data operations
 * Pattern follows TeacherApi for consistency
 */
export class StudentApi {
  
  // =============================================
  // ENROLLMENT & BATCH MANAGEMENT
  // =============================================

  /**
   * Get all batches the student is enrolled in
   * Returns batches with skill, academy, and teacher information
   * Only returns batches from academies where student has approved enrollment
   */
  static async getMyBatches(studentId: string): Promise<ApiResponse<any[]>> {
    try {
      // First get all approved academy enrollments
      const { data: academyEnrollments, error: academyError } = await supabase
        .from('student_enrollments')
        .select('academy_id')
        .eq('student_id', studentId)
        .eq('status', 'approved')

      if (academyError) {
        return { data: null, error: academyError.message }
      }

      // If no approved academies, return empty array
      if (!academyEnrollments || academyEnrollments.length === 0) {
        return { data: [], error: null }
      }

      const approvedAcademyIds = academyEnrollments.map(e => e.academy_id)

      // Get batch enrollments for batches in approved academies
      const { data, error } = await supabase
        .from('batch_enrollments')
        .select(`
          id,
          enrolled_at,
          status,
          batch:batches!inner (
            id,
            name,
            start_date,
            end_date,
            status,
            max_students,
            academy_id,
            skill:skills (
              id,
              name,
              description
            ),
            academy:academies (
              id,
              name
            ),
            teacher:users!batches_teacher_id_fkey (
              id,
              full_name,
              email
            )
          )
        `)
        .eq('student_id', studentId)
        .in('batch.academy_id', approvedAcademyIds)
        .order('enrolled_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      // Flatten the structure for easier use and include enrollment status
      const batches = (data || []).map(enrollment => ({
        enrollment_id: enrollment.id,
        enrolled_at: enrollment.enrolled_at,
        enrollment_status: enrollment.status,
        ...enrollment.batch
      }))

      return { data: batches, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get student batches'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get single batch details with all related info
   */
  static async getBatchDetails(batchId: string, studentId: string): Promise<ApiResponse<any>> {
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
          ),
          teacher:users!batches_teacher_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .eq('id', batchId)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      // Get enrollment info
      const { data: enrollmentData } = await supabase
        .from('batch_enrollments')
        .select('id, enrolled_at')
        .eq('batch_id', batchId)
        .eq('student_id', studentId)
        .single()

      // Get topics count
      const { count: topicsCount } = await supabase
        .from('topics')
        .select('id', { count: 'exact', head: true })
        .eq('batch_id', batchId)

      // Get students count
      const { count: studentsCount } = await supabase
        .from('batch_enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('batch_id', batchId)

      return {
        data: {
          ...data,
          enrollment: enrollmentData,
          topics_count: topicsCount || 0,
          students_count: studentsCount || 0
        },
        error: null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get batch details'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get enrollment status for a specific batch
   */
  static async getEnrollmentStatus(studentId: string, batchId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('batch_enrollments')
        .select('*')
        .eq('student_id', studentId)
        .eq('batch_id', batchId)
        .single()

      if (error) {
        // Not enrolled is not an error
        if (error.code === 'PGRST116') {
          return { data: null, error: null }
        }
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get enrollment status'
      return { data: null, error: errorMessage }
    }
  }

  // =============================================
  // TOPICS & ASSIGNMENTS
  // =============================================

  /**
   * Get all topics assigned to student across all batches
   * Can filter by: upcoming, completed, overdue
   */
  static async getMyTopics(studentId: string, filter?: 'upcoming' | 'completed' | 'overdue'): Promise<ApiResponse<any[]>> {
    try {
      // First get enrolled batch IDs
      const { data: enrollments, error: enrollError } = await supabase
        .from('batch_enrollments')
        .select('batch_id')
        .eq('student_id', studentId)

      if (enrollError) {
        return { data: null, error: enrollError.message }
      }

      if (!enrollments || enrollments.length === 0) {
        return { data: [], error: null }
      }

      const batchIds = enrollments.map(e => e.batch_id)

      // Build query
      let query = supabase
        .from('topics')
        .select(`
          id,
          title,
          description,
          due_date,
          created_at,
          batch:batches (
            id,
            name,
            skill:skills (
              id,
              name
            )
          )
        `)
        .in('batch_id', batchIds)

      // Apply filters
      const today = new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
      if (filter === 'upcoming') {
        query = query.gte('due_date', today)
      } else if (filter === 'overdue') {
        query = query.lt('due_date', today)
      }

      const { data, error } = await query.order('due_date', { ascending: true })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get student topics'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get topics for a specific batch
   */
  static async getBatchTopics(batchId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          description,
          due_date,
          created_at,
          batch:batches (
            id,
            name
          )
        `)
        .eq('batch_id', batchId)
        .order('due_date', { ascending: true })

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
   * Get single topic details with files and resources
   */
  static async getTopicDetails(topicId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          batch:batches (
            id,
            name,
            skill:skills (
              id,
              name
            ),
            teacher:users!batches_teacher_id_fkey (
              id,
              full_name,
              email
            )
          )
        `)
        .eq('id', topicId)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get topic details'
      return { data: null, error: errorMessage }
    }
  }

  // =============================================
  // SCORES & PROGRESS
  // =============================================

  /**
   * Get student's scores across all batches
   * Grouped by academy and skill
   */
  static async getMyScores(studentId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('student_scores')
        .select(`
          id,
          score,
          level,
          updated_at,
          batch:batches (
            id,
            name,
            skill:skills (
              id,
              name
            )
          ),
          academy:academies (
            id,
            name
          )
        `)
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get student scores'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get score for specific batch/skill
   */
  static async getBatchScore(studentId: string, batchId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('student_scores')
        .select(`
          id,
          score,
          level,
          updated_at,
          batch:batches (
            id,
            name
          ),
          skill:skills (
            id,
            name
          )
        `)
        .eq('student_id', studentId)
        .eq('batch_id', batchId)
        .maybeSingle()

      if (error) {
        return { data: null, error: error.message }
      }

      // No score yet - return default
      if (!data) {
        return { data: { score: 0, level: 'beginner' }, error: null }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get batch score'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get student's progress statistics
   * Returns: completed topics, upcoming topics, total score, enrolled batches
   */
  static async getMyStatistics(studentId: string): Promise<ApiResponse<any>> {
    try {
      // Get enrolled batches count
      const { count: batchesCount } = await supabase
        .from('batch_enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)

      // Get batch IDs for topic queries
      const { data: enrollments } = await supabase
        .from('batch_enrollments')
        .select('batch_id')
        .eq('student_id', studentId)

      const batchIds = enrollments?.map(e => e.batch_id) || []

      let completedTopics = 0
      let upcomingTopics = 0

      if (batchIds.length > 0) {
        const today = new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD

        // Count completed (past due date) topics
        const { count: completedCount } = await supabase
          .from('topics')
          .select('id', { count: 'exact', head: true })
          .in('batch_id', batchIds)
          .lt('due_date', today)

        // Count upcoming topics
        const { count: upcomingCount } = await supabase
          .from('topics')
          .select('id', { count: 'exact', head: true })
          .in('batch_id', batchIds)
          .gte('due_date', today)

        completedTopics = completedCount || 0
        upcomingTopics = upcomingCount || 0
      }

      // Get total score
      const { data: scores } = await supabase
        .from('student_scores')
        .select('score')
        .eq('student_id', studentId)

      const totalScore = scores?.reduce((sum, s) => sum + (s.score || 0), 0) || 0

      return {
        data: {
          enrolledBatches: batchesCount || 0,
          completedTopics,
          upcomingTopics,
          totalTopics: completedTopics + upcomingTopics,
          totalScore,
          averageScore: scores && scores.length > 0 ? totalScore / scores.length : 0
        },
        error: null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get student statistics'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get leaderboard for a batch
   * Returns top students by score
   */
  static async getBatchLeaderboard(batchId: string, limit: number = 10): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('student_scores')
        .select(`
          score,
          level,
          student:users!student_scores_student_id_fkey (
            id,
            full_name
          )
        `)
        .eq('batch_id', batchId)
        .order('score', { ascending: false })
        .limit(limit)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get batch leaderboard'
      return { data: null, error: errorMessage }
    }
  }

  // =============================================
  // COURSE BROWSING & ENROLLMENT
  // =============================================

  /**
   * Get available courses (skills) student can browse
   */
  static async getAvailableCourses(): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get available courses'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get batches available for enrollment in a skill
   * Optionally filter by academy
   */
  static async getAvailableBatches(skillId: string, academyId?: string): Promise<ApiResponse<any[]>> {
    try {
      let query = supabase
        .from('batches')
        .select(`
          *,
          skill:skills (
            id,
            name,
            description
          ),
          academy:academies (
            id,
            name
          ),
          teacher:users!batches_teacher_id_fkey (
            id,
            full_name
          )
        `)
        .eq('skill_id', skillId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())

      if (academyId) {
        query = query.eq('academy_id', academyId)
      }

      const { data, error } = await query.order('start_date', { ascending: true })

      if (error) {
        return { data: null, error: error.message }
      }

      // Get enrollment counts for each batch
      const batchesWithCounts = await Promise.all(
        (data || []).map(async (batch) => {
          const { count } = await supabase
            .from('batch_enrollments')
            .select('id', { count: 'exact', head: true })
            .eq('batch_id', batch.id)

          return {
            ...batch,
            enrolled_count: count || 0,
            available_slots: batch.max_students - (count || 0)
          }
        })
      )

      return { data: batchesWithCounts, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get available batches'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Enroll student in a batch
   * NOTE: Students should request academy enrollment first, then academy assigns batches
   * This method is kept for backward compatibility but should primarily be used by academy owners
   */
  static async enrollInBatch(studentId: string, batchId: string): Promise<ApiResponse<any>> {
    try {
      // Get batch to find academy_id
      const { data: batch, error: batchError } = await supabase
        .from('batches')
        .select('id, academy_id, max_students')
        .eq('id', batchId)
        .single()

      if (batchError || !batch) {
        return { data: null, error: 'Batch not found' }
      }

      // Check if student is approved for the academy
      const { data: academyEnrollment } = await supabase
        .from('student_enrollments')
        .select('status')
        .eq('student_id', studentId)
        .eq('academy_id', batch.academy_id)
        .single()

      if (!academyEnrollment || academyEnrollment.status !== 'approved') {
        return { 
          data: null, 
          error: 'You must be approved by the academy first. Please request to join the academy.' 
        }
      }

      // Check if already enrolled (any status)
      const { data: existingEnrollment } = await supabase
        .from('batch_enrollments')
        .select('id, status')
        .eq('student_id', studentId)
        .eq('batch_id', batchId)
        .single()

      if (existingEnrollment) {
        if (existingEnrollment.status === 'pending') {
          return { data: null, error: 'Enrollment request already pending' }
        }
        if (existingEnrollment.status === 'active') {
          return { data: null, error: 'Already enrolled in this batch' }
        }
        if (existingEnrollment.status === 'rejected') {
          return { data: null, error: 'Your enrollment request was rejected. Please contact the academy.' }
        }
        return { data: null, error: 'Already enrolled in this batch' }
      }

      // Check if batch is full (only count active enrollments)
      const { count: enrolledCount } = await supabase
        .from('batch_enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('batch_id', batchId)
        .eq('status', 'active')

      if (batch.max_students && enrolledCount && enrolledCount >= batch.max_students) {
        return { data: null, error: 'Batch is full' }
      }

      // Create enrollment with pending status
      const { data, error } = await supabase
        .from('batch_enrollments')
        .insert({
          student_id: studentId,
          batch_id: batchId,
          enrolled_at: new Date().toISOString(),
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enroll in batch'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Unenroll student from a batch
   */
  static async unenrollFromBatch(studentId: string, batchId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('batch_enrollments')
        .delete()
        .eq('student_id', studentId)
        .eq('batch_id', batchId)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: null, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unenroll from batch'
      return { data: null, error: errorMessage }
    }
  }

  // =============================================
  // UPCOMING ACTIVITIES
  // =============================================

  /**
   * Get upcoming activities (topics with due dates)
   * Returns topics sorted by due date
   */
  static async getUpcomingActivities(studentId: string, limit: number = 5): Promise<ApiResponse<any[]>> {
    try {
      // Get enrolled batch IDs
      const { data: enrollments } = await supabase
        .from('batch_enrollments')
        .select('batch_id')
        .eq('student_id', studentId)

      if (!enrollments || enrollments.length === 0) {
        return { data: [], error: null }
      }

      const batchIds = enrollments.map(e => e.batch_id)

      // Get upcoming topics with batch schedule info
      const today = new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
      const { data, error } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          description,
          due_date,
          batch:batches (
            id,
            name,
            start_date,
            end_date,
            weekly_schedule,
            skill:skills (
              id,
              name
            )
          )
        `)
        .in('batch_id', batchIds)
        .gte('due_date', today)
        .order('due_date', { ascending: true })
        .limit(limit)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get upcoming activities'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Mark a topic as complete for a student
   * This can be used to track when students complete/view topics
   */
  static async markTopicComplete(topicId: string, studentId: string): Promise<ApiResponse<void>> {
    try {
      // For now, we'll just return success
      // In the future, you might want to create a topic_completions table:
      // CREATE TABLE topic_completions (
      //   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      //   student_id UUID REFERENCES users(id) ON DELETE CASCADE,
      //   topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
      //   completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      //   UNIQUE(student_id, topic_id)
      // );
      
      // For now, we'll simulate success
      // You can implement actual database tracking later
      return { data: undefined, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark topic as complete';
      return { data: undefined, error: errorMessage };
    }
  }

  /**
   * Get recently completed topics
   */
  static async getRecentCompletions(studentId: string, limit: number = 5): Promise<ApiResponse<any[]>> {
    try {
      // Get enrolled batch IDs
      const { data: enrollments } = await supabase
        .from('batch_enrollments')
        .select('batch_id')
        .eq('student_id', studentId)

      if (!enrollments || enrollments.length === 0) {
        return { data: [], error: null }
      }

      const batchIds = enrollments.map(e => e.batch_id)

      // Get past topics
      const today = new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
      const { data, error } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          description,
          due_date,
          batch:batches (
            id,
            name,
            skill:skills (
              id,
              name
            )
          )
        `)
        .in('batch_id', batchIds)
        .lt('due_date', today)
        .order('due_date', { ascending: false })
        .limit(limit)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get recent completions'
      return { data: null, error: errorMessage }
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  /**
   * Get student's rank in a batch
   */
  static async getMyRankInBatch(studentId: string, batchId: string): Promise<ApiResponse<{ rank: number, total: number }>> {
    try {
      // Get all scores for the batch
      const { data: allScores, error } = await supabase
        .from('student_scores')
        .select('student_id, score')
        .eq('batch_id', batchId)
        .order('score', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      if (!allScores || allScores.length === 0) {
        return { data: { rank: 0, total: 0 }, error: null }
      }

      const myRank = allScores.findIndex(s => s.student_id === studentId) + 1

      return {
        data: {
          rank: myRank || 0,
          total: allScores.length
        },
        error: null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get rank'
      return { data: null, error: errorMessage }
    }
  }

  // =============================================
  // ACADEMY SEARCH & ENROLLMENT
  // =============================================

  /**
   * Search academies by name, location, or skill
   */
  static async searchAcademies(
    query?: string,
    filters?: { locationIds?: string[]; skillIds?: string[] }
  ): Promise<ApiResponse<any[]>> {
    try {
      let academiesQuery = supabase
        .from('academies')
        .select(`
          id,
          name,
          phone_number,
          location_ids,
          skill_ids,
          photo_urls,
          status,
          owner:users!academies_owner_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .in('status', ['approved', 'active'])

      // Apply name search
      if (query && query.trim()) {
        academiesQuery = academiesQuery.ilike('name', `%${query.trim()}%`)
      }

      const { data: academies, error } = await academiesQuery

      if (error) {
        console.error('Error fetching academies:', error)
        return { data: null, error: error.message }
      }

      console.log('Academies fetched from DB:', academies?.length || 0)

      // Filter by locations if provided (academy must have at least one of the selected locations)
      let filteredAcademies = academies || []
      if (filters?.locationIds && filters.locationIds.length > 0) {
        filteredAcademies = filteredAcademies.filter(academy =>
          academy.location_ids && 
          Array.isArray(academy.location_ids) && 
          filters.locationIds!.some(locationId => academy.location_ids.includes(locationId))
        )
      }

      // Filter by skills if provided (academy must have at least one of the selected skills)
      if (filters?.skillIds && filters.skillIds.length > 0) {
        filteredAcademies = filteredAcademies.filter(academy =>
          academy.skill_ids && 
          Array.isArray(academy.skill_ids) && 
          filters.skillIds!.some(skillId => academy.skill_ids.includes(skillId))
        )
      }

      // Fetch location and skill details
      const enrichedAcademies = await Promise.all(
        filteredAcademies.map(async (academy) => {
          // Get locations
          const locations = academy.location_ids && academy.location_ids.length > 0
            ? await supabase
                .from('locations')
                .select('id, name, city, state')
                .in('id', academy.location_ids)
            : { data: [] }

          // Get skills
          const skills = academy.skill_ids && academy.skill_ids.length > 0
            ? await supabase
                .from('skills')
                .select('id, name, description')
                .in('id', academy.skill_ids)
            : { data: [] }

          return {
            ...academy,
            locations: locations.data || [],
            skills: skills.data || []
          }
        })
      )

      return { data: enrichedAcademies, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search academies'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get academy details with available batches
   */
  static async getAcademyDetails(academyId: string): Promise<ApiResponse<any>> {
    try {
      // Get academy details
      const { data: academy, error: academyError } = await supabase
        .from('academies')
        .select(`
          *,
          owner:users!academies_owner_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('id', academyId)
        .single()

      if (academyError || !academy) {
        return { data: null, error: academyError?.message || 'Academy not found' }
      }

      // Get locations
      const locations = academy.location_ids && academy.location_ids.length > 0
        ? await supabase
            .from('locations')
            .select('id, name, city, state')
            .in('id', academy.location_ids)
        : { data: [] }

      // Get skills
      const skills = academy.skill_ids && academy.skill_ids.length > 0
        ? await supabase
            .from('skills')
            .select('id, name, description')
            .in('id', academy.skill_ids)
        : { data: [] }

      // Get available batches (active and future end_date)
      const { data: batches } = await supabase
        .from('batches')
        .select(`
          *,
          skill:skills (
            id,
            name,
            description
          ),
          teacher:users!batches_teacher_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('academy_id', academyId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true })

      // Get enrollment counts for each batch
      const batchesWithCounts = batches
        ? await Promise.all(
            batches.map(async (batch) => {
              const { count } = await supabase
                .from('batch_enrollments')
                .select('id', { count: 'exact', head: true })
                .eq('batch_id', batch.id)
                .eq('status', 'active')

              return {
                ...batch,
                enrolled_count: count || 0,
                available_slots: batch.max_students - (count || 0)
              }
            })
          )
        : []

      return {
        data: {
          ...academy,
          locations: locations.data || [],
          skills: skills.data || [],
          batches: batchesWithCounts
        },
        error: null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academy details'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get student's pending enrollment requests
   */
  static async getMyEnrollmentRequests(studentId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('batch_enrollments')
        .select(`
          *,
          batch:batches (
            id,
            name,
            start_date,
            end_date,
            skill:skills (
              id,
              name
            ),
            academy:academies (
              id,
              name
            )
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'pending')
        .order('enrolled_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get enrollment requests'
      return { data: null, error: errorMessage }
    }
  }

  // =============================================
  // ACADEMY ENROLLMENT MANAGEMENT
  // =============================================

  /**
   * Request to join an academy
   * Similar to TeacherApi.requestToJoinAcademy()
   */
  static async requestToJoinAcademy(studentId: string, academyId: string): Promise<ApiResponse<any>> {
    try {
      // Check if enrollment already exists
      const { data: existingEnrollment } = await supabase
        .from('student_enrollments')
        .select('id, status')
        .eq('student_id', studentId)
        .eq('academy_id', academyId)
        .single()

      if (existingEnrollment) {
        if (existingEnrollment.status === 'pending') {
          return { data: null, error: 'Request already pending' }
        }
        if (existingEnrollment.status === 'approved') {
          return { data: null, error: 'Already approved for this academy' }
        }
        if (existingEnrollment.status === 'rejected') {
          return { data: null, error: 'Your request was rejected. Please contact the academy.' }
        }
      }

      const { data, error } = await supabase
        .from('student_enrollments')
        .insert({
          student_id: studentId,
          academy_id: academyId,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request to join academy'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get all academy enrollments for a student
   * Returns enrollments with academy details and status
   */
  static async getMyAcademyEnrollments(studentId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          academy:academies (
            id,
            name,
            phone_number,
            photo_urls,
            status
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academy enrollments'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Get academy enrollment status for a specific academy
   */
  static async getAcademyEnrollmentStatus(studentId: string, academyId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('student_id', studentId)
        .eq('academy_id', academyId)
        .single()

      if (error) {
        // If no enrollment found, return null status
        if (error.code === 'PGRST116') {
          return { data: null, error: null }
        }
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academy enrollment status'
      return { data: null, error: errorMessage }
    }
  }

  // =============================================
  // SCHEDULE EXCEPTIONS
  // =============================================

  /**
   * Get all schedule exceptions for a batch
   * Returns schedule exceptions (read-only access for students)
   */
  static async getBatchScheduleExceptions(batchId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('schedule_exceptions')
        .select('*')
        .eq('batch_id', batchId)
        .order('exception_date', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get schedule exceptions';
      return { data: null, error: errorMessage };
    }
  }
}

