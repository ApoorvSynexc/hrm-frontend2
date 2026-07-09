import { Typography } from '../../components'
import { useSession } from '../../hooks'

export default function Home() {
  const { user } = useSession()

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
      <Typography variant="h2">Welcome back{user ? `, ${user.firstName}` : ''}</Typography>
      <Typography variant="body" color="body">
        You&apos;re signed in. This is where the HRM dashboard will live.
      </Typography>
    </div>
  )
}
