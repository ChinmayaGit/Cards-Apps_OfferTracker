import type { CardProduct } from '../types'
import { getBank } from '../data/catalog'
import { maskPan } from '../data/pay'

export function CardPlastic({
  product,
  last4,
  nickname,
  compact,
  onClick,
}: {
  product: CardProduct
  last4: string
  nickname?: string
  compact?: boolean
  onClick?: () => void
}) {
  const bank = getBank(product.bankId)
  const className = `plastic ${compact ? 'plastic-compact' : ''}`
  const style = {
    background: `linear-gradient(145deg, ${product.accent} 0%, ${product.accent2} 100%)`,
  }

  const inner = (
    <>
      <div className="plastic-top">
        <span className="plastic-bank">{bank?.short ?? product.bankId}</span>
        <span className="plastic-net">{product.network}</span>
      </div>
      <div className="plastic-chip" aria-hidden />
      <p className="plastic-pan">{maskPan(last4)}</p>
      <div className="plastic-bottom">
        <div>
          <span className="plastic-label">{nickname || 'Cardholder'}</span>
          <strong>{product.name}</strong>
        </div>
        <span className="plastic-kind">{product.kind}</span>
      </div>
    </>
  )

  if (onClick) {
    return (
      <button type="button" className={className} style={style} onClick={onClick}>
        {inner}
      </button>
    )
  }

  return (
    <div className={className} style={style}>
      {inner}
    </div>
  )
}
