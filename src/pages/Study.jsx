import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Study() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true })
    } else if (user.role !== 'student') {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const subjects = [
    {
      id: 'mathematics',
      name: 'Mathematics',
      description: 'Master algebra, geometry, calculus, and more. Build strong mathematical foundations.',
      icon: '📐',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea'
    },
    {
      id: 'social-science',
      name: 'Social Science',
      description: 'Explore history, geography, civics, and economics. Understand the world around you.',
      icon: '🌍',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: '#f5576c'
    },
    {
      id: 'science',
      name: 'Science',
      description: 'Discover physics, chemistry, biology, and earth science. Unlock the mysteries of nature.',
      icon: '🔬',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#4facfe'
    }
  ]

  if (!user || user.role !== 'student') {
    return null
  }

  return (
    <div className="study-page">
      <div className="study-header">
        <h1 className="study-logo">LearnWyse</h1>
        <button className="signout-button" onClick={signOut}>
          Sign Out
        </button>
      </div>
      
      <div className="study-hero">
        <h2 className="study-title">Choose Your Subject</h2>
        <p className="study-subtitle">Select a subject to begin your learning journey</p>
      </div>

      <div className="subjects-container">
        {subjects.map((subject) => (
          <div 
            key={subject.id} 
            className="subject-card"
            style={{ '--gradient': subject.gradient, '--color': subject.color }}
          >
            <div className="subject-card-header">
              <div className="subject-icon">{subject.icon}</div>
              <h3 className="subject-name">{subject.name}</h3>
            </div>
            <p className="subject-description">{subject.description}</p>
            <button 
              className="subject-button"
              onClick={() => {
                if (subject.id === 'social-science') {
                  navigate('/study/social-science')
                }
              }}
            >
              Start Learning
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Study

