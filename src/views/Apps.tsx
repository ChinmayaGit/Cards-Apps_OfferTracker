import { useMemo, useState } from 'react'
import type { WalletApp, WalletCard } from '../types'
import { getApp } from '../data/apps'
import { walletPicksForApp } from '../data/app-match'
import { AppTile } from '../components/AppTile'

function appCaption(appId: string, wallet: WalletCard[]): string {
  const app = getApp(appId)
  if (!app) return ''
  const top = walletPicksForApp(wallet, app.id)[0]
  if (top) return `Use ${top.product.name}${top.w.last4 ? ` · ${top.w.last4}` : ''}`
  if (wallet.length) return 'No strong card match — open for catalog picks'
  return `${app.offers.length} offers`
}

export function AppsView({
  wallet,
  apps,
  liveEpoch,
  onOpen,
  onAdd,
}: {
  wallet: WalletCard[]
  apps: WalletApp[]
  liveEpoch: number
  onOpen: (id: string) => void
  onAdd: () => void
}) {
  const [q, setQ] = useState('')
  const mine = useMemo(() => {
    const query = q.trim().toLowerCase()
    return apps
      .map((w) => {
        const app = getApp(w.appId)
        if (!app) return null
        if (query) {
          const blob = `${app.name} ${app.kind} ${app.blurb} ${app.payHint}`.toLowerCase()
          if (!blob.includes(query)) return null
        }
        return { w, app }
      })
      .filter((x) => x !== null)
  }, [apps, q, liveEpoch])

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Apps</p>
          <h1>Your apps</h1>
        </div>
        <button type="button" className="primary" onClick={onAdd}>
          Add app
        </button>
      </header>
      <p className="lede">
        Amazon Pay, POP, CRED, GPay, PhonePe, Paytm, Tata Neu, CheQ — add the ones you use.
        Offers and Best for then mix those apps with your cards.
      </p>
      <input
        className="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search CRED, PhonePe, Neu…"
      />

      {apps.length === 0 ? (
        <div className="empty">
          <h2>No apps yet</h2>
          <p>
            Add GPay, PhonePe, CRED, Tata Neu — whatever you actually pay with. Coupons and
            “which card” attach automatically.
          </p>
          <button type="button" className="primary" onClick={onAdd}>
            Add your first app
          </button>
        </div>
      ) : mine.length === 0 ? (
        <p className="muted">No app matches that search.</p>
      ) : (
        <div className="wallet-grid">
          {mine.map(({ w, app }) => (
            <div key={w.id} className="wallet-item">
              <AppTile
                app={app}
                caption={appCaption(app.id, wallet)}
                onClick={() => onOpen(app.id)}
              />
              <p className="wallet-caption">
                {app.kind} · {app.offers.length} offers
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
