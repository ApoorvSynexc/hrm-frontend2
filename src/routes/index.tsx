import { Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/auth/login'
import Home from '../pages/home'
import ProfilePage from '../pages/profile'
import ConfigurationPage from '../pages/configuration'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { AppLayout } from '../layout/AppLayout'

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
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/configuration" element={<ConfigurationPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
