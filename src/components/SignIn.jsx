import { useAuth } from '../contexts/AuthContext'
import './SignIn.css'

function SignIn() {
  const { signIn } = useAuth()

  const handleSignIn = (role) => {
    signIn(role)
  }

  return (
    <div className="signin-container">
      <div className="signin-overlay">
        <div className="signin-content">
          <h1 className="signin-title">Welcome to LearnWyse</h1>
          <p className="signin-subtitle">Choose your role to continue</p>
          <div className="signin-options">
            <button
              className="signin-button signin-button-student"
              onClick={() => handleSignIn('student')}
            >
              <div className="signin-icon">🎓</div>
              <div className="signin-button-text">
                <div className="signin-button-title">Sign in as Student</div>
                <div className="signin-button-subtitle">Access your courses and study materials</div>
              </div>
            </button>
            <button
              className="signin-button signin-button-parent"
              onClick={() => handleSignIn('parent')}
            >
              <div className="signin-icon">👨‍👩‍👧</div>
              <div className="signin-button-text">
                <div className="signin-button-title">Sign in as Parent</div>
                <div className="signin-button-subtitle">Monitor your child's progress</div>
              </div>
            </button>
            <button
              className="signin-button signin-button-teacher"
              onClick={() => handleSignIn('teacher')}
            >
              <div className="signin-icon">👩‍🏫</div>
              <div className="signin-button-text">
                <div className="signin-button-title">Sign in as Teacher</div>
                <div className="signin-button-subtitle">Manage classes and assignments</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn

