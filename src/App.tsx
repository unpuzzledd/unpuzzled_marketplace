import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { AdminAuthProvider } from './hooks/useAdminAuth'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import RoleSelection from './pages/RoleSelection'
import ProfileCompletion from './pages/ProfileCompletion'
import Dashboard from './pages/Dashboard'
import StudentDashboard from './pages/StudentDashboard'
import StudentCourses from './pages/StudentCourses'
import StudentAcademySearch from './pages/StudentAcademySearch'
import AdminDashboard from './pages/AdminDashboard'
import AdminSignIn from './pages/AdminSignIn'
import SmartRedirect from './pages/SmartRedirect'
import AcademyDashboard from './pages/AcademyDashboard'
import TeacherLanding from './pages/TeacherLanding'
import ViewTopic from './pages/ViewTopic'
import BatchManagement from './pages/BatchManagement'
import ChessClasses from './pages/ChessClasses'
import KarateClasses from './pages/KarateClasses'
import ArtsClasses from './pages/ArtsClasses'
import DanceMusicClasses from './pages/DanceMusicClasses'
import { CreateTopicExample } from './examples/CreateTopicExample'

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/profile-completion" element={<ProfileCompletion />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<StudentCourses />} />
            <Route path="/student/search" element={<StudentAcademySearch />} />
            <Route path="/academy" element={<AcademyDashboard />} />
            <Route path="/teacher" element={<TeacherLanding />} />
            <Route path="/teacher/search" element={<StudentAcademySearch />} />
            <Route path="/batches" element={<BatchManagement />} />
            <Route path="/admin/signin" element={<AdminSignIn />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/smart-redirect" element={<SmartRedirect />} />
            <Route path="/course/:courseId/topic/:topicId" element={<ViewTopic />} />
            <Route path="/examples/create-topic" element={<CreateTopicExample />} />
            <Route path="/chess-classes" element={<ChessClasses />} />
            <Route path="/karate-classes" element={<KarateClasses />} />
            <Route path="/arts-classes" element={<ArtsClasses />} />
            <Route path="/dance-music-classes" element={<DanceMusicClasses />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

export default App
