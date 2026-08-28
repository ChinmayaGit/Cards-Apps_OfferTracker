import type { WalletCard } from '../types'
import { getApp } from '../data/apps'
import { catalogPicksForApp, walletPicksForApp } from '../data/app-match'
import { getBank } from '../data/catalog'
import { AppTile } from '../components/AppTile'
import { OfferBlock } from '../components/OfferBlock'

export function AppDetailView({
  appId,
  wallet,
  onBack,
  onAdd,
  onRemove,
}: {
  appId: string
  wallet: WalletCard[]
  onBack: () => void
  onAdd: () => void
  onRemove?: () => void
}) {
  const app = getApp(appId)
  if (!app) {
    return (
      <section className="page">
        <p>Unknown app.</p>
        <button type="button" className="linkish" onClick={onBack}>
          ← Apps
        </button>
      </section>
    )
  }

  const picks = walletPicksForApp(wallet, app.id)
  const discover = catalogPicksForApp(wallet, app.id)

  return (
    <section className="page">
      <button type="button" className="linkish" onClick={onBack}>
        ← Apps
      </button>
      <div className="detail-hero">
        <AppTile app={app} />
        <div>
          <p className="eyebrow">{app.kind}</p>
          <h1>{app.name}</h1>
          <p className="lede">{app.blurb}</p>
          <p className="muted">{app.payHint}</p>
          <p>
            <a href={app.url} target="_blank" rel="noreferrer">
              Open official app / site
            </a>
          </p>
          {onRemove ? (
            <button type="button" className="danger" onClick={onRemove}>
              Remove from your apps
            </button>
          ) : null}
        </div>
      </div>

      <h2 className="subhead">Which card to use here</h2>
      {wallet.length === 0 ? (
        <p className="muted">Add cards in Wallet — Folio will rank them for this app.</p>
      ) : picks.length === 0 ? (
        <p className="muted">
          Nothing in your wallet is a specialist for {app.name}. Add a partner card below, or use
          RuPay credit if this is a UPI app.
        </p>
      ) : (
        <ol className="rank">
          {picks.map((row, i) => {
            const bank = getBank(row.product.bankId)
            return (
              <li key={row.w.id} className="rank-item">
                <span className="rank-n">{i + 1}</span>
                <div>
                  <strong>
                    {bank?.short} {row.product.name}
                  </strong>
                  <span className="muted">
                    {' '}
                    · {row.w.last4 ? `•••• ${row.w.last4}` : '•••• XXXX'} · {row.product.network}{' '}
                    {row.product.kind}
                  </span>
                  {row.use.slice(0, 3).map((o) => (
                    <p key={o.id} className="rank-offer">
                      {o.title}
                      {o.fresh ? ' · live' : ''}
                    </p>
                  ))}
                  {row.trap.slice(0, 2).map((o) => (
                    <p key={o.id} className="rank-offer trap-line">
                      Trap: {o.title}
                    </p>
                  ))}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {discover.length > 0 ? (
        <>
          <h2 className="subhead">Partner cards you could add</h2>
          <ul className="discover">
            {discover.map(({ product, bank }) => (
              <li key={product.id}>
                <strong>
                  {bank?.short} {product.name}
                </strong>
                <span className="muted">
                  {' '}
                  · {product.network} {product.kind}
                </span>
                <p className="rank-offer">{product.blurb}</p>
              </li>
            ))}
          </ul>
          <button type="button" className="primary" onClick={onAdd}>
            Add a card
          </button>
        </>
      ) : null}

      <h2 className="subhead">App coupons & how to pay</h2>
      <div className="offer-list">
        {app.offers.map((offer) => (
          <OfferBlock key={offer.id} offer={offer} cardName={app.name} />
        ))}
      </div>

      {picks.some((p) => p.use.length > 0) ? (
        <>
          <h2 className="subhead">Offers from your cards on {app.short}</h2>
          <div className="offer-list">
            {picks.flatMap((row) =>
              row.use.map((offer) => {
                const bank = getBank(row.product.bankId)
                return (
                  <div key={`${row.w.id}-${offer.id}`} className="offer-wrap">
                    <p className="offer-cardname">
                      {bank?.short} {row.product.name}
                      {row.w.last4 ? ` · ${row.w.last4}` : ' · XXXX'}
                    </p>
                    <OfferBlock offer={offer} cardName={`${bank?.short} ${row.product.name}`} />
                  </div>
                )
              }),
            )}
          </div>
        </>
      ) : null}
    </section>
  )
}
