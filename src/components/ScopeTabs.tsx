import type { Scope } from '../types'

const ITEMS: { id: Scope; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'cards', label: 'Cards' },
  { id: 'apps', label: 'Apps' },
]

export function ScopeTabs({
  value,
  onChange,
}: {
  value: Scope
  onChange: (scope: Scope) => void
}) {
  return (
    <div className="seg seg-3" role="tablist" aria-label="All, cards, or apps">
      {ITEMS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          className={value === id ? 'on' : ''}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
