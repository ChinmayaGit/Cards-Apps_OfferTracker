import { CATALOG_AS_OF, OFFER_SOURCES } from '../data/sources'

export function SourcesView() {
  return (
    <section className="page">
      <p className="eyebrow">Sources</p>
      <h1>Where latest offers actually live</h1>
      <p className="lede">
        Catalog snapshot: {CATALOG_AS_OF}. On open, Folio also loads <code>live-offers.json</code> for
        app coupons and card overlays. Banks still change caps every day — tap through to the official
        app the moment you pay.
      </p>
      <ol className="sources">
        {OFFER_SOURCES.map((s) => (
          <li key={s.name} className="source-item">
            <span className="chip">{s.kind}</span>
            <h3>{s.name}</h3>
            <p>{s.note}</p>
            <a href={s.url} target="_blank" rel="noreferrer">
              Open
            </a>
          </li>
        ))}
      </ol>
      <aside className="callout">
        <h3>Rules that catch people</h3>
        <ul>
          <li>UPI on credit works only on RuPay. Visa, Mastercard, Amex: never.</li>
          <li>Phone tap (Google Pay / Apple Pay) is NFC, not UPI. Movie BOGO almost never follows it.</li>
          <li>BookMyShow / MMT / Amazon extra % needs that card at their checkout, not a QR at the door.</li>
          <li>Fuel waiver ≠ cashback. VAT still sits on the bill.</li>
          <li>Tokenized wallet MCC can silently drop accelerated cashback.</li>
        </ul>
      </aside>
    </section>
  )
}
