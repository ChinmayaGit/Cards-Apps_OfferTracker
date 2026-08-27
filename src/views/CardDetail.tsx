import type { WalletCard } from '../types'
import { getBank, getProduct } from '../data/catalog'
import { CardPlastic } from '../components/CardPlastic'
import { OfferBlock } from '../components/OfferBlock'

export function CardDetailView({
  card,
  onBack,
  onRemove,
}: {
  card: WalletCard
  onBack: () => void
  onRemove: () => void
}) {
  const product = getProduct(card.productId)
  if (!product) {
    return (
      <section className="page">
        <p>This card is no longer in the catalog.</p>
        <button type="button" className="linkish" onClick={onBack}>
          ← Wallet
        </button>
      </section>
    )
  }
  const bank = getBank(product.bankId)

  return (
    <section className="page">
      <button type="button" className="linkish" onClick={onBack}>
        ← Wallet
      </button>
      <div className="detail-hero">
        <CardPlastic product={product} last4={card.last4} nickname={card.nickname} />
        <div>
          <p className="eyebrow">
            {bank?.name} · {product.network} · {product.kind}
          </p>
          <h1>{product.name}</h1>
          <p className="lede">{product.blurb}</p>
          <p className="muted">Fee: {product.annualFee}</p>
          <p className="muted">Best for: {product.bestFor.join(', ')}</p>
          <button type="button" className="danger" onClick={onRemove}>
            Remove from wallet
          </button>
        </div>
      </div>
      <h2 className="subhead">Offers & how to actually pay</h2>
      <div className="offer-list">
        {product.offers.map((offer) => (
          <OfferBlock
            key={offer.id}
            offer={offer}
            cardName={`${bank?.short} ${product.name}`}
          />
        ))}
      </div>
    </section>
  )
}
