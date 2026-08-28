import { useMemo, useState } from 'react'
import type { PayApp } from '../types'
import { getApps } from '../data/apps'
import { AppTile } from './AppTile'

export function AddApp({
  heldIds,
  onClose,
  onAdd,
}: {
  heldIds: Set<string>
  onClose: () => void
  onAdd: (app: PayApp) => void
}) {
  const [q, setQ] = useState('')
  const apps = useMemo(() => {
    const query = q.trim().toLowerCase()
    return getApps().filter((a) => {
      if (!query) return true
      const blob = `${a.name} ${a.kind} ${a.blurb} ${a.payHint}`.toLowerCase()
      return blob.includes(query)
    })
  }, [q])

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-labelledby="add-app-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-bar">
          <h2 id="add-app-title">Add an app</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className="muted">
          Pick the UPI / rewards apps you actually use. Offers and Best for then filter to this
          list — same idea as adding cards to Wallet.
        </p>
        <label className="field">
          <span>Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="CRED, PhonePe, Tata Neu, CheQ…"
            autoFocus
          />
        </label>
        <div className="product-pick">
          {apps.map((app) => {
            const held = heldIds.has(app.id)
            return (
              <div key={app.id} className="wallet-item">
                <AppTile app={app} caption={held ? 'Already in your apps' : app.payHint} />
                <button
                  type="button"
                  className="primary add-app-btn"
                  disabled={held}
                  onClick={() => onAdd(app)}
                >
                  {held ? 'Added' : 'Add this app'}
                </button>
              </div>
            )
          })}
          {apps.length === 0 ? <p className="muted">No apps match that search.</p> : null}
        </div>
      </div>
    </div>
  )
}
