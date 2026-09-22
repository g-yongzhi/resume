const store = require('../services/store')
const { formatMoney, formatDuration } = require('./format')

const { ORDER_STATUS, FREE_MS, OVERDUE_MS, DEPOSIT } = store.constants

const WARN_BEFORE_OVERDUE_MS = 24 * 60 * 60 * 1000

const buildOngoingSummary = (order, user, now = Date.now()) => {
  if (!order || order.status !== ORDER_STATUS.ONGOING) {
    return null
  }

  const elapsedMs = now - order.borrowTime
  const elapsedText = formatDuration(order.borrowTime, now)

  if (elapsedMs >= OVERDUE_MS) {
    return {
      elapsedText,
      usageText: 'Overdue — deposit may be forfeited',
      usageClass: 'overdue',
      estimatedFeeText: formatMoney(DEPOSIT),
    }
  }

  if (elapsedMs >= OVERDUE_MS - WARN_BEFORE_OVERDUE_MS) {
    const hoursLeft = Math.max(Math.ceil((OVERDUE_MS - elapsedMs) / (60 * 60 * 1000)), 1)
    const fee = store.previewReturnFee(order.id)
    return {
      elapsedText,
      usageText: `Return within ${hoursLeft}h to keep your deposit`,
      usageClass: 'warning',
      estimatedFeeText: store.hasActiveMembership(user) ? formatMoney(0) : formatMoney(fee),
    }
  }

  if (elapsedMs <= FREE_MS) {
    const remainingMin = Math.max(Math.ceil((FREE_MS - elapsedMs) / 60000), 0)
    return {
      elapsedText,
      usageText: remainingMin > 0 ? `Free period · ${remainingMin} min left` : 'Free period ending soon',
      usageClass: 'free',
      estimatedFeeText: formatMoney(0),
    }
  }

  const fee = store.previewReturnFee(order.id)
  const membership = store.hasActiveMembership(user)

  return {
    elapsedText,
    usageText: membership
      ? 'Membership active · no usage fee'
      : `Est. fee if returned now: ${formatMoney(fee)}`,
    usageClass: membership ? 'free' : 'paid',
    estimatedFeeText: formatMoney(fee),
  }
}

module.exports = {
  buildOngoingSummary,
}
