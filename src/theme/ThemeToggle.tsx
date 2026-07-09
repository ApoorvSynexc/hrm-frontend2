import { useTheme, type ThemeMode } from './ThemeProvider'
import './theme-toggle.css'

const NEXT_LABEL: Record<ThemeMode, string> = {
  light: 'Switch to dark',
  dark: 'Switch to system',
  system: 'Switch to light',
}

function Icon({ mode }: { mode: ThemeMode }) {
  if (mode === 'light') {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    )
  }
  if (mode === 'dark') {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  )
}

export function ThemeToggle() {
  const { mode, toggle } = useTheme()
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={NEXT_LABEL[mode]}
      title={`Theme: ${mode} — click to cycle`}
    >
      <Icon mode={mode} />
      <span className="theme-toggle__label">{mode}</span>
    </button>
  )
}
