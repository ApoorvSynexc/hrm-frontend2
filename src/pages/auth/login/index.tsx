import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi'
import { Button, TextField, Typography } from '../../../components'
import microsoftLogo from '../../../assets/svg/microsoft-logo.svg'
import { ApiError } from '../../../lib'
import { useAuth } from '../../../services'
import { loginSchema, type LoginFormValues } from './validations'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '', remember: false },
    resolver: joiResolver(loginSchema),
  })

  const onSubmit = ({ email, password }: LoginFormValues) => {
    login.mutate(
      { email, password },
      { onSuccess: () => navigate('/home', { replace: true }) },
    )
  }

  const onMicrosoftLogin = () => {
    // TODO: redirect into the Microsoft OAuth flow once configured.
    console.log('microsoft login clicked')
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-lg font-bold text-accent-fg">
            H
          </div>
          <Typography variant="h2">Welcome back</Typography>
          <Typography variant="body-sm" color="body" className="mt-1">
            Sign in to your HRM account
          </Typography>
        </div>

        <div className="rounded-2xl border border-border bg-surface-2 p-6 shadow-lg sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            {login.isError && (
              <Typography variant="body-sm" className="text-red-600">
                {login.error instanceof ApiError
                  ? login.error.message
                  : 'Something went wrong. Please try again.'}
              </Typography>
            )}

            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              leftIcon={<FiMail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-heading">
                  Password
                </label>
                <a href="#" className="text-xs text-accent hover:underline">
                  Forgot password?
                </a>
              </div>
              <TextField
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                leftIcon={<FiLock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="pointer-events-auto text-body hover:text-heading"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-body">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-[var(--accent)]"
                {...register('remember')}
              />
              Remember me
            </label>

            <Button type="submit" size="lg" fullWidth loading={login.isPending} className="mt-1">
              Sign in
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <Typography variant="caption" color="body">
              or continue with
            </Typography>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            leftIcon={<img src={microsoftLogo} alt="" width={18} height={18} />}
            onClick={onMicrosoftLogin}
          >
            Sign in with Microsoft
          </Button>
        </div>

        <Typography variant="body-sm" color="body" className="mt-6 text-center">
          Don&apos;t have an account?{' '}
          <a href="#" className="font-medium text-accent hover:underline">
            Contact your admin
          </a>
        </Typography>
      </div>
    </div>
  )
}
