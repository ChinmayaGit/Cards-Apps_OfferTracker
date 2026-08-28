import type { PayApp } from '../types'

export function AppTile({
  app,
  caption,
  onClick,
}: {
  app: PayApp
  caption?: string
  onClick?: () => void
}) {
  const style = {
    background: `linear-gradient(145deg, ${app.accent} 0%, ${app.accent2} 100%)`,
  }
  const inner = (
    <>
      <div className="plastic-top">
        <span className="plastic-bank">{app.kind}</span>
        <span className="plastic-net">{app.short}</span>
      </div>
      <p className="app-tile-name">{app.name}</p>
      <p className="app-tile-blurb">{app.payHint}</p>
    </>
  )

  if (onClick) {
    return (
      <button type="button" className="app-tile" style={style} onClick={onClick}>
        {inner}
        {caption ? <span className="app-tile-cap">{caption}</span> : null}
      </button>
    )
  }

  return (
    <div className="app-tile" style={style}>
      {inner}
    </div>
  )
}
