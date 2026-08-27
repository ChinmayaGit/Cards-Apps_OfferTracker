import type { PayMethod, PayStatus } from '../types'

export const PAY_METHODS: { id: PayMethod; label: string; hint: string }[] = [
  { id: 'swipe', label: 'Swipe / chip', hint: 'Physical POS' },
  { id: 'tapCard', label: 'Tap card', hint: 'Contactless plastic' },
  { id: 'phoneNfc', label: 'Phone tap', hint: 'GPay / Apple Pay' },
  { id: 'upi', label: 'UPI', hint: 'Scan QR / intent' },
  { id: 'online', label: 'Online', hint: 'Site or app checkout' },
]

export const CATEGORIES: { id: import('../types').Category; label: string }[] = [
  { id: 'movies', label: 'Movies' },
  { id: 'flights', label: 'Flights' },
  { id: 'hotels', label: 'Hotels' },
  { id: 'dining', label: 'Dining' },
  { id: 'groceries', label: 'Groceries' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'online', label: 'Online shopping' },
  { id: 'upi', label: 'Daily UPI' },
  { id: 'bills', label: 'Bills' },
  { id: 'lounge', label: 'Lounge' },
  { id: 'travel', label: 'Travel' },
  { id: 'entertainment', label: 'OTT / events' },
  { id: 'shopping', label: 'In-store' },
]

export function visaMc(
  extra: Partial<Record<PayMethod, PayStatus>> = {},
): Record<PayMethod, PayStatus> {
  return {
    swipe: 'yes',
    tapCard: 'yes',
    phoneNfc: 'maybe',
    upi: 'no',
    online: 'yes',
    ...extra,
  }
}

export function rupay(
  extra: Partial<Record<PayMethod, PayStatus>> = {},
): Record<PayMethod, PayStatus> {
  return {
    swipe: 'yes',
    tapCard: 'yes',
    phoneNfc: 'maybe',
    upi: 'yes',
    online: 'yes',
    ...extra,
  }
}

export function amexPay(
  extra: Partial<Record<PayMethod, PayStatus>> = {},
): Record<PayMethod, PayStatus> {
  return {
    swipe: 'yes',
    tapCard: 'yes',
    phoneNfc: 'maybe',
    upi: 'no',
    online: 'yes',
    ...extra,
  }
}

export function onlineOnly(): Record<PayMethod, PayStatus> {
  return {
    swipe: 'no',
    tapCard: 'no',
    phoneNfc: 'no',
    upi: 'no',
    online: 'yes',
  }
}

export const NOTE = {
  upiVisa:
    'Visa, Mastercard and Amex cannot be linked to UPI. Scanning a QR will not use this card or this offer.',
  upiRupay:
    'Link this RuPay card in GPay / PhonePe / Paytm as a credit account, then scan any UPI QR.',
  phoneMaybe:
    'Works if your bank enabled Google Pay / Apple Pay. Tokenized phone tap is often coded as a wallet MCC — extra cashback or movie BOGO usually will not apply.',
  tapPos:
    'Contactless tap on the terminal is a card-present sale. Online-only merchant offers (BookMyShow, Amazon, MMT) will not fire.',
  swipePos:
    'Chip-and-PIN or magstripe at a physical terminal. Same as tap for most reward rates, unless the offer is online-only.',
  selectCard:
    'At checkout, choose Credit / Debit card and pick this card. Do not pick UPI, wallet, or EMI unless the offer says so.',
  debitUpiVisa:
    'UPI spends the savings/current account — this Visa/Mastercard debit is not in the QR path. Lounge, BMS and debit reward offers will not apply on UPI.',
  debitUpiRupay:
    'UPI still spends the linked account (same pot as this RuPay debit). QR does not unlock debit lounge or movie offers. Credit-on-UPI is RuPay credit, not debit.',
  debitPhone:
    'Phone tap only if your bank tokenized this debit card in Google Pay / Apple Pay. Many debit cards still cannot NFC-pay from the phone.',
}

export function maskPan(last4: string): string {
  const tail = last4.replace(/\D/g, '').slice(0, 4)
  return `••••  ••••  ••••  ${tail.length === 4 ? tail : 'XXXX'}`
}

export function payLabel(status: PayStatus): string {
  if (status === 'yes') return 'Works'
  if (status === 'no') return 'No'
  return 'Maybe'
}
