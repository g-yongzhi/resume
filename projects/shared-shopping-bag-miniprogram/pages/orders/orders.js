const store = require('../../services/store')
const { requireLogin } = require('../../utils/auth')
const { formatMoney, formatDateTime } = require('../../utils/format')
const { buildOngoingSummary } = require('../../utils/order')
const { ORDER_STATUS } = store.constants

const STATUS_MAP = {
  [ORDER_STATUS.ONGOING]: { text: 'Ongoing', className: 'ongoing' },
  [ORDER_STATUS.RETURNED]: { text: 'Returned', className: 'returned' },
  [ORDER_STATUS.OVERDUE]: { text: 'Overdue', className: 'overdue' },
}

const formatOrder = (order, user) => {
  const status = STATUS_MAP[order.status] || { text: order.status, className: '' }
  const formatted = {
    ...order,
    orderNo: order.id.slice(-8).toUpperCase(),
    statusText: status.text,
    statusClass: status.className,
    borrowTimeText: formatDateTime(order.borrowTime),
    returnTimeText: formatDateTime(order.returnTime),
    feeText: formatMoney(order.fee || 0),
    totalText: formatMoney(order.totalCharge || 0),
  }

  if (order.status === ORDER_STATUS.ONGOING && user) {
    const summary = buildOngoingSummary(order, user)
    if (summary) {
      formatted.usageText = summary.usageText
      formatted.usageClass = summary.usageClass
      formatted.elapsedText = summary.elapsedText
      formatted.estimatedFeeText = summary.estimatedFeeText
    }
  }

  return formatted
}

Page({
  data: {
    tab: 'active',
    activeOrders: [],
    historyOrders: [],
    emptyText: 'No ongoing rentals',
  },

  onShow() {
    store.syncOverdueOrders()
    this.loadOrders()
    this.startTimer()
  },

  onHide() {
    this.stopTimer()
  },

  onUnload() {
    this.stopTimer()
  },

  startTimer() {
    this.stopTimer()
    this._timer = setInterval(() => {
      if (this.data.tab === 'active' && this.data.activeOrders.length > 0) {
        store.syncOverdueOrders()
        this.loadOrders()
      }
    }, 30000)
  },

  stopTimer() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  },

  loadOrders() {
    const user = store.getUser()
    if (!user) {
      this.setData({
        activeOrders: [],
        historyOrders: [],
        emptyText: 'Please sign in to view orders',
      })
      return
    }

    const activeOrders = store.getActiveOrders(user.id).map((order) => formatOrder(order, user))
    const historyOrders = store.getHistoryOrders(user.id)
      .sort((a, b) => (b.returnTime || b.borrowTime) - (a.returnTime || a.borrowTime))
      .map((order) => formatOrder(order, user))

    this.setData({
      activeOrders,
      historyOrders,
      emptyText: this.data.tab === 'active' ? 'No ongoing rentals' : 'No order history yet',
    })
  },

  onSwitchTab(event) {
    const { tab } = event.currentTarget.dataset
    this.setData({
      tab,
      emptyText: tab === 'active' ? 'No ongoing rentals' : 'No order history yet',
    })
  },

  onOrderTap(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + id })
  },

  onReturnTap(event) {
    const { id, station } = event.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/return-confirm/return-confirm?orderId=' + id + '&stationId=' + station,
    })
  },

  onBorrowTap() {
    if (!requireLogin('Sign in to borrow a bag.')) {
      return
    }
    wx.switchTab({ url: '/pages/scan/scan' })
  },
})
