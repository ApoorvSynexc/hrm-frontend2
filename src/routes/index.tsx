import { Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/auth/login'
import Home from '../pages/home'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
