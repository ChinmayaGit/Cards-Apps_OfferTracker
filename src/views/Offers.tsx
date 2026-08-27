import { useMemo, useState } from 'react'
import type { Category, WalletCard } from '../types'
import { getBank, getProduct } from '../data/catalog'
import { CATEGORIES } from '../data/pay'
import { OfferBlock } from '../components/OfferBlock'

export function OffersView({
  wallet,
  onAdd,
}: {
  wallet: WalletCard[]
  onAdd: () => void
}) {
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return wallet.flatMap((w) => {
      const product = getProduct(w.productId)
      if (!product) return []
      return product.offers
        .filter((o) => (cat === 'all' ? true : o.category === cat))
        .filter((o) => {
          if (!query) return true
          const blob = `${o.title} ${o.headline} ${o.where.join(' ')} ${product.name}`.toLowerCase()
          return blob.includes(query)
        })
        .map((offer) => ({ offer, product, wallet: w }))
    })
  }, [wallet, cat, q])

  if (wallet.length === 0) {
    return (
      <section className="page">
        <p className="eyebrow">Offers</p>
        <h1>All offers</h1>
        <p className="lede">Add cards in Wallet first. This board only shows products you hold.</p>
        <button type="button" className="primary" onClick={onAdd}>
          Add a card
        </button>
      </section>
    )
  }

  return (
    <section className="page">
      <p className="eyebrow">Offers</p>
      <h1>Everything you can actually use</h1>
      <p className="lede">
        Filtered to your wallet. Open any offer to see swipe vs tap vs phone vs UPI vs online.
      </p>
      <input
        className="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search movies, flights, Swiggy, lounge…"
      />
      <div className="chips">
        <button
          type="button"
          className={`chip-btn ${cat === 'all' ? 'on' : ''}`}
          onClick={() => setCat('all')}
        >
          All
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
        {rows.map(({ offer, product, wallet: w }) => {
          const bank = getBank(product.bankId)
          return (
            <div key={`${w.id}-${offer.id}`} className="offer-wrap">
              <p className="offer-cardname">
                {bank?.short} {product.name}
                {w.last4 ? ` · ${w.last4}` : ' · XXXX'}
              </p>
              <OfferBlock offer={offer} cardName={`${bank?.short} ${product.name}`} />
            </div>
          )
        })}
        {rows.length === 0 ? <p className="muted">No offers match that filter.</p> : null}
      </div>
    </section>
  )
}
