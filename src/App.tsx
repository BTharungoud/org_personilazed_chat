import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import { isAuthenticated } from './services'
import './App.css'

type GuardProps = {
  children: ReactElement
}

function RequireAuth({ children }: GuardProps) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

function RedirectAuthenticated({ children }: GuardProps) {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectAuthenticated>
              <LoginPage />
            </RedirectAuthenticated>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectAuthenticated>
              <RegisterPage />
            </RedirectAuthenticated>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/dashborad"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated() ? '/dashboard' : '/login'}
              replace
            />
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated() ? '/dashboard' : '/login'}
              replace
            />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
