const store = require('../../services/store')
const storage = require('../../utils/storage')
const { formatMoney, formatDateTime, formatDuration } = require('../../utils/format')
const { buildOngoingSummary } = require('../../utils/order')
const { ORDER_STATUS, STORAGE_KEYS } = store.constants

const STATUS_MAP = {
  [ORDER_STATUS.ONGOING]: { text: 'Ongoing', className: 'ongoing' },
  [ORDER_STATUS.RETURNED]: { text: 'Returned', className: 'returned' },
  [ORDER_STATUS.OVERDUE]: { text: 'Overdue', className: 'overdue' },
}

Page({
  data: {
    order: null,
    isOngoing: false,
    usageSummary: null,
  },

  onLoad(options) {
    this.orderId = options.id
  },

  onShow() {
    this.refreshOrder()
    this.startTimer()
  },

  onHide() {
    this.stopTimer()
  },

  onUnload() {
    this.stopTimer()
    if (this._backTimer) {
      clearTimeout(this._backTimer)
      this._backTimer = null
    }
  },

  startTimer() {
    this.stopTimer()
    this._timer = setInterval(() => {
      if (this.data.isOngoing) {
        store.syncOverdueOrders()
        this.refreshOrder()
      }
    }, 30000)
  },

  stopTimer() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  },

  refreshOrder() {
    const order = store.getOrderById(this.orderId)
    const user = store.getUser()

    if (!order || !user || order.userId !== user.id) {
      wx.showToast({ title: 'Order not found', icon: 'none' })
      this._backTimer = setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const status = STATUS_MAP[order.status] || { text: order.status, className: '' }
    const endTime = order.returnTime || Date.now()
    const isOngoing = order.status === ORDER_STATUS.ONGOING
    const usageSummary = isOngoing ? buildOngoingSummary(order, user) : null

    this.setData({
      isOngoing,
      usageSummary,
      order: {
        ...order,
        orderNo: order.id.slice(-8).toUpperCase(),
        statusText: status.text,
        statusClass: status.className,
        borrowTimeText: formatDateTime(order.borrowTime),
        returnTimeText: formatDateTime(order.returnTime),
        durationText: formatDuration(order.borrowTime, endTime),
        depositText: formatMoney(order.deposit),
        feeText: isOngoing && usageSummary
          ? usageSummary.estimatedFeeText
          : formatMoney(order.fee || 0),
        totalText: formatMoney(order.totalCharge || 0),
        depositRefundText: order.depositRefunded === false
          ? 'Forfeited'
          : isOngoing
            ? 'Pending return'
            : 'Refunded',
        returnStationName: order.returnStationName || '-',
      },
    })
  },

  onReturn() {
    storage.set(STORAGE_KEYS.SCAN_MODE, 'return')
    if (this.data.order?.stationId) {
      storage.set(STORAGE_KEYS.SELECTED_STATION, this.data.order.stationId)
    }
    wx.switchTab({ url: '/pages/scan/scan' })
  },
})
