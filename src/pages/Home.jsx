import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SignIn from '../components/SignIn'

function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Redirect authenticated users to their dashboards
  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        navigate('/study', { replace: true })
      } else if (user.role === 'parent') {
        navigate('/parent', { replace: true })
      } else if (user.role === 'teacher') {
        navigate('/teacher', { replace: true })
      }
    }
  }, [user, navigate])

  // Show sign-in if not authenticated
  return (
    <div className="login-page">
      <SignIn />
    </div>
  )
}

export default Home

