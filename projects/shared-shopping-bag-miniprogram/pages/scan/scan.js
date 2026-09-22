const store = require('../../services/store')
const storage = require('../../utils/storage')
const { requireLogin } = require('../../utils/auth')
const { STORAGE_KEYS } = store.constants

Page({
  data: {
    mode: 'borrow',
    stationName: '',
    activeCount: 0,
  },

  onShow() {
    const mode = storage.get(STORAGE_KEYS.SCAN_MODE, 'borrow')
    const stationId = storage.get(STORAGE_KEYS.SELECTED_STATION, 'st_001')
    const station = store.getStationById(stationId)
    const user = store.getUser()
    const activeOrders = user ? store.getActiveOrders(user.id) : []

        this.setData({
      mode,
      stationName: station ? station.name : 'Unknown Station',
      activeCount: activeOrders.length,
    })
  },

  onSwitchMode(event) {
    const { mode } = event.currentTarget.dataset
    storage.set(STORAGE_KEYS.SCAN_MODE, mode)
    this.setData({ mode })
  },

  onSimulateScan() {
    if (!requireLogin('Sign in to borrow or return a bag.')) {
      return
    }

    if (this.data.mode === 'return' && this.data.activeCount === 0) {
      const app = getApp()
      wx.showToast({ title: 'No active rental to return', icon: 'none' })
      return
    }

    const stationId = storage.get(STORAGE_KEYS.SELECTED_STATION, 'st_001')
    wx.navigateTo({
      url: `/pages/scan-result/scan-result?stationId=${stationId}&mode=${this.data.mode}`,
    })
  },

  onChangeStation() {
    wx.navigateTo({ url: '/pages/stations/stations' })
  },
})
