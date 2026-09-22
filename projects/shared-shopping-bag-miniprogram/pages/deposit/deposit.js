const store = require('../../services/store')
const { formatMoney, formatDateTime } = require('../../utils/format')
const { DEPOSIT, MEMBERSHIP_PRICE } = store.constants

Page({
  data: {
    depositPaid: false,
    depositText: formatMoney(DEPOSIT),
    membershipPrice: formatMoney(MEMBERSHIP_PRICE),
    hasMembership: false,
    membershipExpiresText: '',
    processing: false,
  },

  onShow() {
    this.loadDeposit()
  },

  onUnload() {
    if (this._backTimer) {
      clearTimeout(this._backTimer)
      this._backTimer = null
    }
  },

  loadDeposit() {
    const user = store.getUser()
    if (!user) {
      wx.showToast({ title: 'Please sign in first', icon: 'none' })
      this._backTimer = setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const hasMembership = store.hasActiveMembership(user)
    this.setData({
      depositPaid: user.depositPaid,
      hasMembership,
      membershipExpiresText: hasMembership
        ? formatDateTime(user.membershipExpiresAt)
        : '',
      processing: false,
    })
  },

  mockConfirm(content, onConfirm, confirmText) {
    wx.showModal({
      title: 'Confirm Payment',
      content,
      confirmText: confirmText || 'Confirm',
      cancelText: 'Cancel',
      success: (res) => {
        if (!res.confirm) {
          return
        }
        this.setData({ processing: true })
        onConfirm()
      },
    })
  },

  onPayDeposit() {
    if (this.data.processing || this.data.depositPaid) {
      return
    }

    this.mockConfirm('Pay deposit ' + this.data.depositText + '?', () => {
      const result = store.payDeposit()
      this.setData({ processing: false })
      if (result.success) {
        wx.showToast({ title: 'Deposit paid', icon: 'success' })
        this.loadDeposit()
      } else {
        wx.showToast({ title: result.message, icon: 'none' })
      }
    })
  },

  onRefundDeposit() {
    if (this.data.processing || !this.data.depositPaid) {
      return
    }

    this.mockConfirm('Refund deposit ' + this.data.depositText + '?', () => {
      const result = store.refundDeposit()
      this.setData({ processing: false })
      if (result.success) {
        wx.showToast({ title: 'Deposit refunded', icon: 'success' })
        this.loadDeposit()
      } else {
        wx.showToast({ title: result.message, icon: 'none' })
      }
    }, 'OK')
  },

  onBuyMembership() {
    if (this.data.processing || this.data.hasMembership) {
      return
    }

    this.mockConfirm('Purchase monthly membership for ' + this.data.membershipPrice + '?', () => {
      const result = store.purchaseMembership()
      this.setData({ processing: false })
      if (result.success) {
        wx.showToast({ title: 'Membership activated', icon: 'success' })
        this.loadDeposit()
      } else {
        wx.showToast({ title: result.message, icon: 'none' })
      }
    })
  },
})
