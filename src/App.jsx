import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import Study from './pages/Study'
import SocialScience from './pages/SocialScience'
import VideoPlayer from './pages/VideoPlayer'
import MindMapPage from './pages/MindMapPage'
import ExercisesPage from './pages/ExercisesPage'
import ParentDashboard from './pages/ParentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/study" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Study />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/study/social-science" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <SocialScience />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/study/social-science/video/:chapterSlug" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <VideoPlayer />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/study/social-science/mindmap/:chapterSlug" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <MindMapPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/study/social-science/exercises/:chapterSlug" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <ExercisesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/parent" 
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App

