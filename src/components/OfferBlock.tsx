import type { Offer, PayMethod, PayStatus } from '../types'
import { PAY_METHODS, payLabel } from '../data/pay'
import { useState } from 'react'

export function PayPills({
  payment,
  notes,
}: {
  payment: Record<PayMethod, PayStatus>
  notes?: Partial<Record<PayMethod, string>>
}) {
  const [open, setOpen] = useState<PayMethod | null>(null)

  return (
    <div className="pay-wrap">
      <div className="pay-grid">
        {PAY_METHODS.map((m) => {
          const status = payment[m.id]
          return (
            <button
              key={m.id}
              type="button"
              className={`pay-pill pay-${status} ${open === m.id ? 'on' : ''}`}
              onClick={() => setOpen(open === m.id ? null : m.id)}
            >
              <span className="pay-status">{payLabel(status)}</span>
              <span className="pay-name">{m.label}</span>
              <span className="pay-hint">{m.hint}</span>
            </button>
          )
        })}
      </div>
      {open && notes?.[open] ? <p className="pay-note">{notes[open]}</p> : null}
      {open && !notes?.[open] ? (
        <p className="pay-note">Tap another rail, or read How to use below.</p>
      ) : null}
    </div>
  )
}

export function OfferBlock({ offer, cardName }: { offer: Offer; cardName: string }) {
  const [showHidden, setShowHidden] = useState(false)

  return (
    <article className="offer">
      <header className="offer-head">
        <span className="chip">{offer.category}</span>
        {offer.cap ? <span className="chip chip-mute">{offer.cap}</span> : null}
      </header>
      <h3>{offer.title}</h3>
      <p className="offer-lead">{offer.headline}</p>
      <PayPills payment={offer.payment} notes={offer.paymentNotes} />
      <h4>How to use</h4>
      <ol className="steps">
        {offer.howToUse.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <h4>Where</h4>
      <p className="where">{offer.where.join(' · ')}</p>
      <button
        type="button"
        className="linkish"
        onClick={() => setShowHidden((v) => !v)}
      >
        {showHidden ? 'Hide fine print' : 'Hidden details & traps'}
      </button>
      {showHidden ? (
        <ul className="hidden-list">
          {offer.hidden.map((h) => (
            <li key={h}>{h}</li>
          ))}
          <li>
            Card: {cardName}. Source: {offer.source}.
          </li>
        </ul>
      ) : null}
    </article>
  )
}
