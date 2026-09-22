const store = require('../../services/store')
const { formatMoney, formatDateTime, formatDuration } = require('../../utils/format')

Page({
  data: {
    station: null,
    orders: [],
    selectedOrderId: '',
    feeText: formatMoney(0),
    durationText: '',
    submitting: false,
  },

  onUnload() {
    if (this._backTimer) {
      clearTimeout(this._backTimer)
      this._backTimer = null
    }
  },

  onLoad(options) {
    const user = store.getUser()
    if (!user) {
      wx.navigateBack()
      return
    }

    let stationId = options.stationId
    if (options.orderId) {
      const targetOrder = store.getOrderById(options.orderId)
      if (targetOrder) {
        stationId = stationId || targetOrder.stationId
      }
    }

    const station = store.getStationById(stationId)
    if (!station) {
      wx.navigateBack()
      return
    }

    const orders = store.getActiveOrders(user.id).map((item) => ({
      ...item,
      borrowTimeText: formatDateTime(item.borrowTime),
    }))

    if (orders.length === 0) {
      wx.showToast({ title: 'No active rental', icon: 'none' })
      this._backTimer = setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const selectedOrderId = orders.some((item) => item.id === options.orderId)
      ? options.orderId
      : orders[0].id

    this.setData({
      station,
      orders,
      selectedOrderId,
    })
    this.updatePreview(selectedOrderId)
  },

  onSelectOrder(event) {
    const { id } = event.currentTarget.dataset
    this.setData({ selectedOrderId: id })
    this.updatePreview(id)
  },

  updatePreview(orderId) {
    const order = store.getOrderById(orderId)
    if (!order) {
      return
    }

    const fee = store.previewReturnFee(orderId)
    this.setData({
      feeText: formatMoney(fee),
      durationText: formatDuration(order.borrowTime, Date.now()),
    })
  },

  onConfirmReturn() {
    if (this.data.submitting) {
      return
    }

    this.setData({ submitting: true })

    wx.showModal({
      title: 'Confirm Payment',
      content: 'Confirm return and settle ' + this.data.feeText + '?',
      confirmText: 'OK',
      success: (res) => {
        if (!res.confirm) {
          this.setData({ submitting: false })
          return
        }

        const result = store.returnBags({
          orderId: this.data.selectedOrderId,
          stationId: this.data.station.id,
        })

        this.setData({ submitting: false })

        if (!result.success) {
          wx.showToast({ title: result.message, icon: 'none' })
          return
        }

        const { order, overdue } = result
        const lines = overdue
          ? ['Usage fee: ' + formatMoney(order.fee), 'Deposit forfeited due to overdue.']
          : [
            'Usage fee: ' + formatMoney(order.fee),
            'Deposit refunded: ' + formatMoney(order.deposit),
          ]

        wx.showModal({
          title: overdue ? 'Return Completed (Overdue)' : 'Return Successful',
          content: lines.join('\n'),
          showCancel: false,
          success: () => {
            wx.switchTab({ url: '/pages/orders/orders' })
          },
        })
      },
    })
  },
})
