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
   * Get teacher's academy assignments (only approved)
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
   * Get all teacher's academy assignments (including pending/rejected)
   */
  static async getAllMyAssignments(teacherId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('teacher_assignments')
        .select(`
          *,
          academy:academies(
            id,
            name,
            status
          )
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get all teacher assignments'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Search academies by name, location, or skill (same as student search)
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

      if (query && query.trim()) {
        academiesQuery = academiesQuery.ilike('name', `%${query.trim()}%`)
      }

      const { data: academies, error } = await academiesQuery

      if (error) {
        return { data: null, error: error.message }
      }

      // Filter by locations if provided
      let filteredAcademies = academies || []
      if (filters?.locationIds && filters.locationIds.length > 0) {
        filteredAcademies = filteredAcademies.filter(academy =>
          academy.location_ids && 
          Array.isArray(academy.location_ids) && 
          filters.locationIds!.some(locationId => academy.location_ids.includes(locationId))
        )
      }

      // Filter by skills if provided
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
          const locations = academy.location_ids && academy.location_ids.length > 0
            ? await supabase
                .from('locations')
                .select('id, name, city, state')
                .in('id', academy.location_ids)
            : { data: [] }

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

      const locations = academy.location_ids && academy.location_ids.length > 0
        ? await supabase
            .from('locations')
            .select('id, name, city, state')
            .in('id', academy.location_ids)
        : { data: [] }

      const skills = academy.skill_ids && academy.skill_ids.length > 0
        ? await supabase
            .from('skills')
            .select('id, name, description')
            .in('id', academy.skill_ids)
        : { data: [] }

      return {
        data: {
          ...academy,
          locations: locations.data || [],
          skills: skills.data || []
        },
        error: null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academy details'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Request to join an academy
   */
  static async requestToJoinAcademy(teacherId: string, academyId: string): Promise<ApiResponse<any>> {
    try {
      // Check if assignment already exists
      const { data: existingAssignment } = await supabase
        .from('teacher_assignments')
        .select('id, status')
        .eq('teacher_id', teacherId)
        .eq('academy_id', academyId)
        .single()

      if (existingAssignment) {
        if (existingAssignment.status === 'pending') {
          return { data: null, error: 'Request already pending' }
        }
        if (existingAssignment.status === 'approved') {
          return { data: null, error: 'Already approved for this academy' }
        }
        if (existingAssignment.status === 'rejected') {
          return { data: null, error: 'Your request was rejected. Please contact the academy.' }
        }
      }

      const { data, error } = await supabase
        .from('teacher_assignments')
        .insert({
          teacher_id: teacherId,
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
   * Get all batches assigned to a teacher
   * Only returns batches from academies where the teacher has an approved assignment
   */
  static async getMyBatches(teacherId: string): Promise<ApiResponse<any[]>> {
    try {
      // First, get all approved academy assignments for this teacher
      const { data: assignments, error: assignmentsError } = await supabase
        .from('teacher_assignments')
        .select('academy_id')
        .eq('teacher_id', teacherId)
        .eq('status', 'approved')

      if (assignmentsError) {
        return { data: null, error: assignmentsError.message }
      }

      // If no approved assignments, return empty array
      if (!assignments || assignments.length === 0) {
        return { data: [], error: null }
      }

      const academyIds = assignments.map(a => a.academy_id)

      // Get batches where teacher is assigned AND academy is in approved assignments
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
        .in('academy_id', academyIds)
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
   * Only returns batch if teacher has approved assignment to the academy
   */
  static async getBatchDetails(batchId: string, teacherId: string): Promise<ApiResponse<any>> {
    try {
      // First get the batch to check academy_id
      const { data: batch, error: batchError } = await supabase
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
        .eq('teacher_id', teacherId)
        .single()

      if (batchError || !batch) {
        return { data: null, error: batchError?.message || 'Batch not found' }
      }

      // Verify teacher has approved assignment to this academy
      const { data: assignment, error: assignmentError } = await supabase
        .from('teacher_assignments')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('academy_id', batch.academy_id)
        .eq('status', 'approved')
        .single()

      if (assignmentError || !assignment) {
        return { data: null, error: 'You do not have access to this batch' }
      }

      return { data: batch, error: null }
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
   * Only returns data if teacher has approved assignment to the academy
   */
  static async getBatchStudentsWithScores(batchId: string, teacherId: string): Promise<ApiResponse<any[]>> {
    try {
      // First get the batch to know the skill_id, academy_id, and verify teacher assignment
      const { data: batch, error: batchError } = await supabase
        .from('batches')
        .select('skill_id, academy_id, teacher_id')
        .eq('id', batchId)
        .eq('teacher_id', teacherId)
        .single()

      if (batchError || !batch) {
        return { data: null, error: batchError?.message || 'Batch not found' }
      }

      // Verify teacher has approved assignment to this academy
      const { data: assignment, error: assignmentError } = await supabase
        .from('teacher_assignments')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('academy_id', batch.academy_id)
        .eq('status', 'approved')
        .single()

      if (assignmentError || !assignment) {
        return { data: null, error: 'You do not have access to this batch' }
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
   * Only returns students from batches in academies where teacher has approved assignment
   */
  static async getMyStudents(teacherId: string): Promise<ApiResponse<any[]>> {
    try {
      // First, get all approved academy assignments for this teacher
      const { data: assignments, error: assignmentsError } = await supabase
        .from('teacher_assignments')
        .select('academy_id')
        .eq('teacher_id', teacherId)
        .eq('status', 'approved')

      if (assignmentsError) {
        return { data: null, error: assignmentsError.message }
      }

      if (!assignments || assignments.length === 0) {
        return { data: [], error: null }
      }

      const academyIds = assignments.map(a => a.academy_id)

      // Get all teacher's batches from approved academies only
      const { data: batches, error: batchesError } = await supabase
        .from('batches')
        .select('id, name, skill_id, academy_id')
        .eq('teacher_id', teacherId)
        .in('academy_id', academyIds)
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

