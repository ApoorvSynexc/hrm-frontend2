import { Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/auth/login'
import Home from '../pages/home'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
