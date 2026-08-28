import type { WalletCard } from '../types'

const WALLET_KEY = 'offerfolio.wallet.v1'
const SNAP_KEY = 'offerfolio.snapshots.v1'
const MAX_SNAPS = 8

export const BACKUP_APP = 'folio'
export const BACKUP_VERSION = 1

export interface FolioBackup {
  app: typeof BACKUP_APP
  version: number
  exportedAt: string
  cards: WalletCard[]
}

export interface Snapshot {
  id: string
  savedAt: string
  cards: WalletCard[]
}

export function loadWallet(): WalletCard[] {
  try {
    const raw = localStorage.getItem(WALLET_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WalletCard[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isWalletCard)
  } catch {
    return []
  }
}

export function saveWallet(cards: WalletCard[]): void {
  localStorage.setItem(WALLET_KEY, JSON.stringify(cards))
}

export function uid(): string {
  return crypto.randomUUID()
}

function isWalletCard(c: unknown): c is WalletCard {
  if (!c || typeof c !== 'object') return false
  const x = c as WalletCard
  return typeof x.productId === 'string' && x.productId.length > 0
}

export function normalizeCards(raw: unknown): WalletCard[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(isWalletCard).map((c) => ({
    id: typeof c.id === 'string' && c.id ? c.id : uid(),
    productId: c.productId,
    last4: typeof c.last4 === 'string' ? c.last4.replace(/\D/g, '').slice(0, 4) : '',
    nickname: typeof c.nickname === 'string' ? c.nickname.slice(0, 24) : '',
    addedAt: typeof c.addedAt === 'number' ? c.addedAt : Date.now(),
  }))
}

export function makeBackup(cards: WalletCard[]): FolioBackup {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    cards,
  }
}

export function parseBackup(raw: string): WalletCard[] {
  const data = JSON.parse(raw) as unknown
  if (Array.isArray(data)) return normalizeCards(data)
  if (data && typeof data === 'object') {
    const obj = data as { app?: string; cards?: unknown; wallet?: unknown }
    if (obj.app && obj.app !== BACKUP_APP) {
      throw new Error('This file is not a Folio backup.')
    }
    if (Array.isArray(obj.cards)) return normalizeCards(obj.cards)
    if (Array.isArray(obj.wallet)) return normalizeCards(obj.wallet)
  }
  throw new Error('Could not read cards from that file.')
}

export function backupFilename(when = new Date()): string {
  const d = when.toISOString().slice(0, 10)
  return `folio-wallet-${d}.json`
}

export function downloadBackup(cards: WalletCard[]): void {
  const body = JSON.stringify(makeBackup(cards), null, 2)
  const blob = new Blob([body], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = backupFilename()
  a.click()
  URL.revokeObjectURL(url)
}

export function mergeWallets(current: WalletCard[], incoming: WalletCard[]): WalletCard[] {
  const seenId = new Set(current.map((c) => c.id))
  const seenKey = new Set(current.map((c) => `${c.productId}|${c.last4}|${c.nickname}`))
  const extra: WalletCard[] = []
  for (const card of incoming) {
    const key = `${card.productId}|${card.last4}|${card.nickname}`
    if (seenId.has(card.id) || seenKey.has(key)) continue
    seenId.add(card.id)
    seenKey.add(key)
    extra.push(card)
  }
  return [...current, ...extra]
}

export function loadSnapshots(): Snapshot[] {
  try {
    const raw = localStorage.getItem(SNAP_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Snapshot[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((s) => s && Array.isArray(s.cards))
  } catch {
    return []
  }
}

function saveSnapshots(list: Snapshot[]): void {
  localStorage.setItem(SNAP_KEY, JSON.stringify(list.slice(0, MAX_SNAPS)))
}

export function pushSnapshot(cards: WalletCard[]): Snapshot[] {
  const list = loadSnapshots()
  const serialized = JSON.stringify(cards)
  if (list[0] && JSON.stringify(list[0].cards) === serialized) return list
  const next: Snapshot[] = [
    { id: uid(), savedAt: new Date().toISOString(), cards: structuredClone(cards) },
    ...list,
  ].slice(0, MAX_SNAPS)
  saveSnapshots(next)
  return next
}

export function formatWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
