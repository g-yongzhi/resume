const store = require('../../services/store')
const storage = require('../../utils/storage')
const { requireLogin } = require('../../utils/auth')
const {
  DEPOSIT, FEE_PER_USE, DAILY_CAP, FREE_HOURS, STATION_STATUS, STORAGE_KEYS, MEMBERSHIP_PRICE,
} = store.constants

const DEFAULT_STATION_ID = 'st_001'
const FREE_MINUTES = Math.round(FREE_HOURS * 60)

Page({
  data: {
    station: null,
    isOnline: false,
    depositText: '',
    feeText: '',
    membershipHint: '',
    hasMembership: false,
  },

  onShow() {
    this.loadPageData()
  },

  loadPageData() {
    const stations = store.getStations()
    const selectedId = storage.get(STORAGE_KEYS.SELECTED_STATION, DEFAULT_STATION_ID)
    const station = store.getStationById(selectedId) || stations[0]
    const user = store.getUser()
    const hasMembership = user ? store.hasActiveMembership(user) : false

    this.setData({
      station,
      isOnline: station.status === STATION_STATUS.ONLINE,
      depositText: 'Deposit ¥' + DEPOSIT.toFixed(2) + ' · refunded after return',
      feeText: FREE_MINUTES + ' min free · ¥' + FEE_PER_USE.toFixed(2) + '/use · max ¥' + DAILY_CAP.toFixed(2) + '/day',
      hasMembership,
      membershipHint: hasMembership
        ? 'Membership active — usage fees waived'
        : 'Members ¥' + MEMBERSHIP_PRICE + '/mo — fees waived',
    })
  },

  onRentNow() {
    if (!requireLogin('Sign in to borrow a reusable bag.')) {
      return
    }

    if (!this.data.station) {
      wx.showToast({ title: 'No station available', icon: 'none' })
      return
    }

    if (!this.data.isOnline) {
      wx.showToast({ title: 'Station is offline', icon: 'none' })
      return
    }

    storage.set(STORAGE_KEYS.SCAN_MODE, 'borrow')
    storage.set(STORAGE_KEYS.SELECTED_STATION, this.data.station.id)
    wx.switchTab({ url: '/pages/scan/scan' })
  },

  onRentalHistory() {
    wx.switchTab({ url: '/pages/orders/orders' })
  },

  onNearbyStations() {
    wx.navigateTo({ url: '/pages/stations/stations' })
  },

  onScanEntry() {
    if (!requireLogin('Sign in to scan and borrow a bag.')) {
      return
    }

    storage.set(STORAGE_KEYS.SCAN_MODE, 'borrow')
    wx.switchTab({ url: '/pages/scan/scan' })
  },

  onBillingHelp() {
    wx.navigateTo({ url: '/pages/help-detail/help-detail?id=help_003' })
  },

  onMembershipTap() {
    if (!requireLogin('Sign in to manage deposit and membership.')) {
      return
    }
    wx.navigateTo({ url: '/pages/deposit/deposit' })
  },
})
