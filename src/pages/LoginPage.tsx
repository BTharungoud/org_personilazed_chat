import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import './LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (email && password) {
        localStorage.setItem('authToken', 'dummy_token_' + Date.now())
        localStorage.setItem('userEmail', email)
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-glow"></div>
      
      <div className="login-content">
        {/* Brand Section */}
        <div className="login-brand">
          <div className="brand-icon">
            <Sparkles size={40} />
          </div>
          <div className="brand-text">
            <h1>PersonalChat</h1>
            <p>Start Your AI Journey</p>
          </div>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Welcome Back</h2>
          <p className="form-subtitle">Sign in to continue your conversation</p>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={20} />
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <div className="form-divider">
            <span>or</span>
          </div>

          <p className="signup-prompt">
            Don't have an account?{' '}
            <Link to="/register" className="signup-link">
              Create one now
            </Link>
          </p>
        </form>

        {/* Feature Highlights */}
        <div className="features-highlight">
          <div className="feature-item">
            <div className="feature-dot"></div>
            <span>Instant AI Responses</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot"></div>
            <span>Multi-Department Support</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot"></div>
            <span>File Upload & Analysis</span>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="decoration decoration-1"></div>
      <div className="decoration decoration-2"></div>
      <div className="decoration decoration-3"></div>
    </div>
  )
}
