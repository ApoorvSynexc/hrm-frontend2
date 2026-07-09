import { PALETTES, useTheme, type Palette } from './ThemeProvider'
import './palette-picker.css'

const PALETTE_SWATCHES: Record<Palette, { label: string; color: string }> = {
  indigo: { label: 'Indigo', color: '#4f46e5' },
  olive: { label: 'Olive', color: '#867e32' },
}

export function PalettePicker() {
  const { palette, setPalette } = useTheme()
  return (
    <div className="palette-picker" role="radiogroup" aria-label="Color palette">
      {PALETTES.map((p) => {
        const meta = PALETTE_SWATCHES[p]
        const active = palette === p
        return (
          <button
            key={p}
            type="button"
            className={`palette-swatch${active ? ' is-active' : ''}`}
            style={{ ['--swatch' as string]: meta.color }}
            aria-label={meta.label}
            aria-checked={active}
            role="radio"
            title={meta.label}
            onClick={() => setPalette(p)}
          />
        )
      })}
    </div>
  )
}
