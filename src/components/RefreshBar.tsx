import type { LiveStatus } from '../lib/live'
import { formatCheckedAt } from '../lib/live'

export function RefreshBar({
  live,
  onRefresh,
}: {
  live: LiveStatus
  onRefresh: () => void
}) {
  const time = formatCheckedAt(live.checkedAt)
  let text = 'Checking latest app & card offers…'
  if (live.state === 'ok' && time) {
    text = live.fromCache
      ? `Using saved offers (${live.asOf}). Last check ${time}${live.error ? ' — refresh failed, retry.' : ''}`
      : `Offers checked ${time} · snapshot ${live.asOf}. Confirm the live tile in the app before you pay.`
  } else if (live.state === 'error') {
    text = `Using bundled offers. Live file did not load${live.error ? ` (${live.error})` : ''}.`
  }

  return (
    <div className="live-bar">
      <p>{text}</p>
      <button type="button" className="ghost-btn live-refresh" onClick={onRefresh} disabled={live.state === 'loading'}>
        {live.state === 'loading' ? 'Checking' : 'Refresh'}
      </button>
    </div>
  )
}
