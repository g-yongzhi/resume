const store = require('../../services/store')
const { formatMoney } = require('../../utils/format')
const { DEPOSIT } = store.constants

Page({
  data: {
    station: null,
    bagCount: 1,
    maxBags: 1,
    depositPaid: false,
    depositText: formatMoney(DEPOSIT),
    paying: false,
  },

  onLoad(options) {
    const station = store.getStationById(options.stationId)
    const user = store.getUser()
    if (!station || !user) {
      wx.navigateBack()
      return
    }

    this.setData({
      station,
      maxBags: Math.min(station.availableBags, 3),
      depositPaid: user.depositPaid,
    })
  },

  onChangeCount(event) {
    const { type } = event.currentTarget.dataset
    let { bagCount, maxBags } = this.data

    if (type === 'minus' && bagCount > 1) {
      bagCount -= 1
    }
    if (type === 'plus' && bagCount < maxBags) {
      bagCount += 1
    }

    this.setData({ bagCount })
  },

  onConfirmBorrow() {
    if (this.data.paying) {
      return
    }

    const { station, bagCount, depositPaid, depositText } = this.data
    const content = depositPaid
      ? 'Borrow ' + bagCount + ' bag(s) at ' + station.name + '?'
      : 'Pay deposit ' + depositText + ' and borrow ' + bagCount + ' bag(s)?\n\nDeposit is refunded after you return the bag.'

    wx.showModal({
      title: 'Confirm Borrow',
      content,
      confirmText: depositPaid ? 'OK' : 'Pay',
      cancelText: 'Cancel',
      success: (res) => {
        if (!res.confirm) {
          return
        }

        this.setData({ paying: true })

        if (!this.data.depositPaid) {
          const depositResult = store.payDeposit()
          if (!depositResult.success) {
            this.setData({ paying: false })
            wx.showToast({ title: depositResult.message, icon: 'none' })
            return
          }
          this.setData({ depositPaid: true })
        }

        const result = store.borrowBags({
          stationId: station.id,
          bagCount,
        })

        this.setData({ paying: false })

        if (!result.success) {
          wx.showToast({ title: result.message, icon: 'none' })
          return
        }

        wx.showModal({
          title: 'Borrow Successful',
          content: 'Order ' + result.order.id.slice(-6).toUpperCase() + ' created. Return within 12 min to avoid usage fees.',
          showCancel: false,
          confirmText: 'OK',
          success: () => {
            wx.switchTab({ url: '/pages/orders/orders' })
          },
        })
      },
      fail: () => {
        this.setData({ paying: false })
      },
    })
  },
})
