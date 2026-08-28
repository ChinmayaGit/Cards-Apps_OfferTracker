import { useMemo, useState } from 'react'
import type { Category, Scope, WalletApp, WalletCard } from '../types'
import { getApp } from '../data/apps'
import { getBank, getProduct } from '../data/catalog'
import { CATEGORIES } from '../data/pay'
import { OfferBlock } from '../components/OfferBlock'
import { ScopeTabs } from '../components/ScopeTabs'

export function OffersView({
  wallet,
  apps,
  onAddCard,
  onAddApp,
  liveEpoch,
}: {
  wallet: WalletCard[]
  apps: WalletApp[]
  onAddCard: () => void
  onAddApp: () => void
  liveEpoch: number
}) {
  const [scope, setScope] = useState<Scope>('all')
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    const wantCards = scope === 'all' || scope === 'cards'
    const wantApps = scope === 'all' || scope === 'apps'
    const cardRows = wantCards
      ? wallet.flatMap((w) => {
          const product = getProduct(w.productId)
          if (!product) return []
          return product.offers
            .filter((o) => (cat === 'all' ? true : o.category === cat))
            .filter((o) => {
              if (!query) return true
              const blob = `${o.title} ${o.headline} ${o.where.join(' ')} ${product.name}`.toLowerCase()
              return blob.includes(query)
            })
            .map((offer) => {
              const bank = getBank(product.bankId)
              return {
                key: `card-${w.id}-${offer.id}`,
                kind: 'card' as const,
                offer,
                name: `${bank?.short} ${product.name}`,
                extra: w.last4 ? ` · ${w.last4}` : ' · XXXX',
              }
            })
        })
      : []
    const appRows = wantApps
      ? apps.flatMap((w) => {
          const app = getApp(w.appId)
          if (!app) return []
          return app.offers
            .filter((o) => (cat === 'all' ? true : o.category === cat))
            .filter((o) => {
              if (!query) return true
              const blob = `${o.title} ${o.headline} ${o.where.join(' ')} ${app.name}`.toLowerCase()
              return blob.includes(query)
            })
            .map((offer) => ({
              key: `app-${w.id}-${offer.id}`,
              kind: 'app' as const,
              offer,
              name: app.name,
              extra: '',
            }))
        })
      : []
    return [...cardRows, ...appRows]
  }, [wallet, apps, scope, cat, q, liveEpoch])

  const emptyWallet = wallet.length === 0
  const emptyApps = apps.length === 0
  const scopeEmpty =
    (scope === 'cards' && emptyWallet) ||
    (scope === 'apps' && emptyApps) ||
    (scope === 'all' && emptyWallet && emptyApps)

  return (
    <section className="page">
      <p className="eyebrow">Offers</p>
      <h1>Everything you can actually use</h1>
      <p className="lede">
        All mixes card and app offers. Cards or Apps shows one type. Filtered to what you added.
      </p>
      <ScopeTabs value={scope} onChange={setScope} />
      {scopeEmpty ? (
        <div className="empty">
          <h2>
            {scope === 'apps' ? 'No apps yet' : scope === 'cards' ? 'No cards yet' : 'Nothing in your lists'}
          </h2>
          <p>
            {scope === 'apps'
              ? 'Add GPay, CRED, Tata Neu and the rest under Apps.'
              : scope === 'cards'
                ? 'Add cards in Wallet first.'
                : 'Add cards in Wallet and apps in Apps — then this board fills in.'}
          </p>
          <div className="page-head-actions">
            {scope !== 'apps' ? (
              <button type="button" className="primary" onClick={onAddCard}>
                Add a card
              </button>
            ) : null}
            {scope !== 'cards' ? (
              <button
                type="button"
                className={scope === 'apps' ? 'primary' : 'ghost-btn'}
                onClick={onAddApp}
              >
                Add an app
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search movies, CRED, Swiggy, lounge…"
          />
          <div className="chips">
            <button
              type="button"
              className={`chip-btn ${cat === 'all' ? 'on' : ''}`}
              onClick={() => setCat('all')}
            >
              All categories
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chip-btn ${cat === c.id ? 'on' : ''}`}
                onClick={() => setCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="offer-list">
            {rows.map((row) => (
              <div key={row.key} className="offer-wrap">
                <p className="offer-cardname">
                  <span className="kind-pill">{row.kind === 'app' ? 'App' : 'Card'}</span>
                  {row.name}
                  {row.extra}
                </p>
                <OfferBlock offer={row.offer} cardName={row.name} />
              </div>
            ))}
            {rows.length === 0 ? <p className="muted">No offers match that filter.</p> : null}
          </div>
        </>
      )}
    </section>
  )
}
