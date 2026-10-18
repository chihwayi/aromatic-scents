export interface DiscountInfo {
  percent: number | null
  startsAt: string | null
  endsAt: string | null
}

// A discount is "active" if a percentage is set and the current time falls
// within its optional start/end window. No start = active immediately once
// set; no end = runs indefinitely.
export function isDiscountActive(discount: DiscountInfo, now: Date = new Date()): boolean {
  if (!discount.percent || discount.percent <= 0) return false
  if (discount.startsAt && now < new Date(discount.startsAt)) return false
  if (discount.endsAt && now > new Date(discount.endsAt)) return false
  return true
}

export function applyDiscount(price: number, percent: number): number {
  return Math.round(price * (1 - percent / 100) * 100) / 100
}
