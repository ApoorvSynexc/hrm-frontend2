import { FiLogOut } from 'react-icons/fi'
import { Avatar, Button, Typography } from '../../components'
import { useAuth } from '../../services'

export default function Home() {
  const { logout } = useAuth()

  return (
    <div className="min-h-svh bg-surface">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Typography variant="h4">HRM</Typography>
        <div className="flex items-center gap-3">
          <Avatar name="Sachin Jangir" size="sm" />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FiLogOut size={16} />}
            loading={logout.isPending}
            onClick={() => logout.mutate()}
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center gap-2 px-6 py-24 text-center">
        <Typography variant="h2">Welcome back</Typography>
        <Typography variant="body" color="body">
          You&apos;re signed in. This is where the HRM dashboard will live.
        </Typography>
      </main>
    </div>
  )
}
