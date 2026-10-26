import axios from 'axios'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { appConfig } from '../config/appConfig'
import {
  authService,
  extractAuthSession,
  extractMessage,
  persistAuthSession,
  systemService,
} from '../services'
import './LoginPage.css'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>(
    'checking',
  )
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    systemService
      .healthCheck()
      .then(() => {
        if (isMounted) setApiStatus('online')
      })
      .catch(() => {
        if (isMounted) setApiStatus('offline')
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login({ username, password })
      const session = extractAuthSession(response.data)
      const token = session.token || appConfig.api.jwtToken

      if (!token) {
        throw new Error('Login succeeded, but no token was returned by the backend.')
      }

      persistAuthSession({
        token,
        userId: session.userId || appConfig.defaults.userId,
        userName: session.userName || username,
        userEmail: session.userEmail || username,
        departmentName: session.departmentName,
        roleName: session.roleName,
        isAdmin: session.isAdmin,
        refreshToken: session.refreshToken,
      })

      navigate('/dashboard')
    } catch (err) {
      const fallback = 'Login failed. Please try again.'
      setError(
        axios.isAxiosError(err)
          ? extractMessage(err.response?.data ?? err.message, fallback)
          : err instanceof Error
            ? err.message
            : fallback,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-glow"></div>

      <div className="login-content">
        <div className="login-brand">
          <div className="brand-icon">
            <Sparkles size={40} />
          </div>
          <div className="brand-text">
            <h1>{appConfig.appName}</h1>
            <p>Start Your AI Journey</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <h2>Welcome Back</h2>
          <p className="form-subtitle">Sign in to continue your conversation</p>
          <p className={`api-status api-status-${apiStatus}`}>
            API status: {apiStatus}
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <Mail size={20} />
              <input
                type="text"
                id="username"
                placeholder="testuser"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
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
            Don&apos;t have an account?{' '}
            <Link to="/register" className="signup-link">
              Create one now
            </Link>
          </p>
        </form>

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

      <div className="decoration decoration-1"></div>
      <div className="decoration decoration-2"></div>
      <div className="decoration decoration-3"></div>
    </div>
  )
}
