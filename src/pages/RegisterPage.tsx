import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Sparkles, ChevronDown, Check } from 'lucide-react'
import { appConfig } from '../config/appConfig'
import { authService, extractMessage, registrationService } from '../services'
import type { RegistrationMetadataItem } from '../services/registrationService'
import './RegisterPage.css'

const getOrganizationId = () => appConfig.defaults.organizationId

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [departments, setDepartments] = useState<RegistrationMetadataItem[]>([])
  const [roles, setRoles] = useState<RegistrationMetadataItem[]>([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number>(0)
  const [selectedRoleId, setSelectedRoleId] = useState<number>(0)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [showDepartmentMenu, setShowDepartmentMenu] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const departmentDropdownRef = useRef<HTMLDivElement>(null)
  const roleDropdownRef = useRef<HTMLDivElement>(null)

  const selectedDepartment = departments.find(item => item.id === selectedDepartmentId)
  const selectedRole = roles.find(item => item.id === selectedRoleId)

  const loadCatalog = async () => {
    setCatalogLoading(true)
    setCatalogError('')

    try {
      const response = await registrationService.getMetadata(getOrganizationId())
      const catalog = response.data?.data
      const departmentList = catalog?.departments ?? []
      const roleList = catalog?.roles ?? []

      setDepartments(departmentList)
      setRoles(roleList)

      if (departmentList.length > 0) {
        setSelectedDepartmentId(previousId => {
          if (previousId && departmentList.some(item => item.id === previousId)) {
            return previousId
          }
          return departmentList[0].id
        })
      } else {
        setSelectedDepartmentId(0)
      }

      if (roleList.length > 0) {
        setSelectedRoleId(previousId => {
          if (previousId && roleList.some(item => item.id === previousId)) {
            return previousId
          }
          return roleList[0].id
        })
      } else {
        setSelectedRoleId(0)
      }

      if (departmentList.length === 0 || roleList.length === 0) {
        setCatalogError(
          departmentList.length === 0
            ? 'No departments were returned by the backend.'
            : 'No roles were returned by the backend.',
        )
      }
    } catch (err) {
      setDepartments([])
      setRoles([])
      setSelectedDepartmentId(0)
      setSelectedRoleId(0)
      setCatalogError(
        axios.isAxiosError(err)
          ? extractMessage(err.response?.data ?? err.message, 'Failed to load registration data.')
          : 'Failed to load registration data.',
      )
    } finally {
      setCatalogLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (
        departmentDropdownRef.current &&
        !departmentDropdownRef.current.contains(target)
      ) {
        setShowDepartmentMenu(false)
      }

      if (roleDropdownRef.current && !roleDropdownRef.current.contains(target)) {
        setShowRoleMenu(false)
      }
    }

    if (showDepartmentMenu || showRoleMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDepartmentMenu, showRoleMenu])

  useEffect(() => {
    void loadCatalog()
    // Initial load only
  }, [])

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!selectedDepartmentId || !selectedRoleId) {
      setError('Please choose a department and role')
      return
    }

    setSubmitLoading(true)

    try {
      const response = await authService.register({
        username,
        email,
        password,
        confirmPassword,
        departmentId: selectedDepartmentId,
        roleId: selectedRoleId,
      })

      const successMessage = extractMessage(response.data, 'Registration successful')
      navigate('/login', {
        replace: true,
        state: {
          message: successMessage,
          username,
        },
      })
    } catch (err) {
      const fallback = 'Registration failed. Please try again.'
      setError(
        axios.isAxiosError(err)
          ? extractMessage(err.response?.data ?? err.message, fallback)
          : err instanceof Error
            ? err.message
            : fallback,
      )
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-glow"></div>

      <div className="register-content">
        <div className="register-brand">
          <div className="brand-icon">
            <Sparkles size={40} />
          </div>
          <div className="brand-text">
            <h1>{appConfig.appName}</h1>
            <p>Start Your AI Journey</p>
          </div>
        </div>

        <form className="register-form" onSubmit={handleRegister}>
          <h2>Create Account</h2>
          <p className="form-subtitle">Join the workspace with your department access</p>

          {catalogLoading && (
            <div className="catalog-message">Loading departments and roles...</div>
          )}
          {catalogError && <div className="catalog-message">{catalogError}</div>}
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-wrapper">
              <User size={20} />
              <input
                type="text"
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User size={20} />
              <input
                type="text"
                id="username"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

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
            <label htmlFor="departmentId">Department</label>
            <div className="catalog-dropdown" ref={departmentDropdownRef}>
              <button
                type="button"
                className="catalog-trigger"
                disabled={catalogLoading || departments.length === 0}
                onClick={() => {
                  setShowDepartmentMenu(previous => !previous)
                  setShowRoleMenu(false)
                }}
              >
                <span className={`catalog-value ${selectedDepartment ? '' : 'placeholder'}`}>
                  {selectedDepartment?.name || 'Select department'}
                </span>
                <ChevronDown size={18} className={showDepartmentMenu ? 'rotated' : ''} />
              </button>

              {showDepartmentMenu && departments.length > 0 && (
                <div className="catalog-menu" role="listbox" aria-label="Departments">
                  {departments.map(department => {
                    const departmentName = department.name || `Department ${department.id}`
                    const isActive = selectedDepartmentId === department.id
                    return (
                      <button
                        key={department.id}
                        type="button"
                        className={`catalog-option ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedDepartmentId(department.id)
                          setShowDepartmentMenu(false)
                        }}
                      >
                        <span>{departmentName}</span>
                        {isActive && <Check size={16} />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="roleId">Role</label>
            <div className="catalog-dropdown" ref={roleDropdownRef}>
              <button
                type="button"
                className="catalog-trigger"
                disabled={catalogLoading || roles.length === 0}
                onClick={() => {
                  setShowRoleMenu(previous => !previous)
                  setShowDepartmentMenu(false)
                }}
              >
                <span className={`catalog-value ${selectedRole ? '' : 'placeholder'}`}>
                  {selectedRole?.name || (catalogLoading ? 'Loading roles...' : 'Select role')}
                </span>
                <ChevronDown size={18} className={showRoleMenu ? 'rotated' : ''} />
              </button>

              {showRoleMenu && roles.length > 0 && (
                <div className="catalog-menu" role="listbox" aria-label="Roles">
                  {roles.map(role => {
                    const roleName = role.name || `Role ${role.id}`
                    const isActive = selectedRoleId === role.id
                    return (
                      <button
                        key={role.id}
                        type="button"
                        className={`catalog-option ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedRoleId(role.id)
                          setShowRoleMenu(false)
                        }}
                      >
                        <span>{roleName}</span>
                        {isActive && <Check size={16} />}
                      </button>
                    )
                  })}
                </div>
              )}
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
            <p className="hint">At least 6 characters</p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input
                type="password"
                id="confirmPassword"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="register-button" disabled={submitLoading}>
            {submitLoading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <p className="login-prompt">
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign in here
            </Link>
          </p>
        </form>

        <div className="benefits-list">
          <div className="benefit-item">
            <div className="benefit-icon">OK</div>
            <span>Secure authentication</span>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">OK</div>
            <span>Chat history saved</span>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">OK</div>
            <span>Multi-department access</span>
          </div>
        </div>
      </div>

      <div className="decoration decoration-1"></div>
      <div className="decoration decoration-2"></div>
      <div className="decoration decoration-3"></div>
    </div>
  )
}
