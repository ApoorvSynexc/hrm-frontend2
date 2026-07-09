import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
export type Palette = 'indigo' | 'olive'

export const PALETTES: readonly Palette[] = ['indigo', 'olive']

const MODE_STORAGE_KEY = 'hrm-theme'
const PALETTE_STORAGE_KEY = 'hrm-palette'

type ThemeContextValue = {
  mode: ThemeMode
  resolved: ResolvedTheme
  palette: Palette
  setMode: (mode: ThemeMode) => void
  toggle: () => void
  setPalette: (palette: Palette) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const raw = window.localStorage.getItem(MODE_STORAGE_KEY)
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system'
}

function readStoredPalette(): Palette {
  if (typeof window === 'undefined') return 'indigo'
  const raw = window.localStorage.getItem(PALETTE_STORAGE_KEY)
  return (PALETTES as readonly string[]).includes(raw ?? '')
    ? (raw as Palette)
    : 'indigo'
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function applyMode(mode: ThemeMode): ResolvedTheme {
  const resolved: ResolvedTheme =
    mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode

  const root = document.documentElement
  if (mode === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', mode)
  }
  return resolved
}

function applyPalette(palette: Palette): void {
  const root = document.documentElement
  // "indigo" is the default (no attribute) so no palette CSS overrides fire.
  if (palette === 'indigo') {
    root.removeAttribute('data-palette')
  } else {
    root.setAttribute('data-palette', palette)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode())
  const [palette, setPaletteState] = useState<Palette>(() => readStoredPalette())
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode,
  )

  useEffect(() => {
    setResolved(applyMode(mode))
    window.localStorage.setItem(MODE_STORAGE_KEY, mode)
  }, [mode])

  useEffect(() => {
    applyPalette(palette)
    window.localStorage.setItem(PALETTE_STORAGE_KEY, palette)
  }, [palette])

  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setResolved(systemPrefersDark() ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  const setMode = useCallback((next: ThemeMode) => setModeState(next), [])
  const setPalette = useCallback((next: Palette) => setPaletteState(next), [])

  const toggle = useCallback(() => {
    setModeState((prev) =>
      prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light',
    )
  }, [])

  const value = useMemo(
    () => ({ mode, resolved, palette, setMode, toggle, setPalette }),
    [mode, resolved, palette, setMode, toggle, setPalette],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
