const store = require('../../services/store')
const { formatMoney } = require('../../utils/format')
const { MEMBERSHIP_TYPE } = store.constants

Page({
  data: {
    user: null,
    orderCount: 0,
    membershipText: 'No membership',
    depositStatusShort: '--',
    membershipShort: '--',
    depositPaid: false,
    hasMembership: false,
  },

  onShow() {
    this.loadProfile()
  },

  loadProfile() {
    const user = store.getUser()
    if (!user) {
      this.setData({
        user: null,
        orderCount: 0,
        membershipText: 'No membership',
        depositStatusShort: '--',
        membershipShort: '--',
        depositPaid: false,
        hasMembership: false,
      })
      return
    }

    const orders = store.getOrdersByUser(user.id)
    let membershipText = 'No membership'
    if (store.hasActiveMembership(user)) {
      const date = new Date(user.membershipExpiresAt)
      const pad = (n) => (n < 10 ? '0' + n : '' + n)
      membershipText = 'Active until ' + date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
    }

    const hasMembership = store.hasActiveMembership(user)

    this.setData({
      user: {
        ...user,
        depositText: user.depositPaid ? 'Paid' : 'Not Paid',
        depositAmountText: formatMoney(user.depositAmount),
      },
      orderCount: orders.length,
      membershipText,
      depositStatusShort: user.depositPaid ? 'Paid' : 'Unpaid',
      membershipShort: hasMembership ? 'Active' : 'None',
      depositPaid: user.depositPaid,
      hasMembership,
    })
  },

  onOrders() {
    wx.switchTab({ url: '/pages/orders/orders' })
  },

  onDeposit() {
    wx.navigateTo({ url: '/pages/deposit/deposit' })
  },

  onHelp() {
    wx.navigateTo({ url: '/pages/help/help' })
  },

  onSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  },

  onNearbyStations() {
    wx.navigateTo({ url: '/pages/stations/stations' })
  },

  onScan() {
    wx.switchTab({ url: '/pages/scan/scan' })
  },

  onSignIn() {
    wx.reLaunch({ url: '/pages/login/login' })
  },
})
