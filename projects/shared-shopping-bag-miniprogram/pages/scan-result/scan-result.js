const store = require('../../services/store')
const { formatMoney } = require('../../utils/format')
const { DEPOSIT, FEE_PER_USE, FREE_HOURS, DAILY_CAP, STATION_STATUS } = store.constants

Page({
  data: {
    mode: 'borrow',
    station: null,
    isOnline: false,
    depositText: '',
    feeText: '',
  },

  onLoad(options) {
    const station = store.getStationById(options.stationId)
    if (!station) {
      wx.showToast({ title: 'Station not found', icon: 'none' })
      this._backTimer = setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    this.setData({
      mode: options.mode || 'borrow',
      station,
      isOnline: station.status === STATION_STATUS.ONLINE,
      depositText: formatMoney(DEPOSIT),
      feeText: 'Free ' + FREE_HOURS * 60 + ' min, then ' + formatMoney(FEE_PER_USE) + '/use (max ' + formatMoney(DAILY_CAP) + '/day)',
    })
  },

  onUnload() {
    if (this._backTimer) {
      clearTimeout(this._backTimer)
      this._backTimer = null
    }
  },

  onContinue() {
    const { station, mode, isOnline } = this.data
    if (!isOnline) {
      wx.showToast({ title: 'Station is offline', icon: 'none' })
      return
    }

    if (mode === 'borrow') {
      wx.navigateTo({
        url: '/pages/borrow-confirm/borrow-confirm?stationId=' + station.id,
      })
      return
    }

    wx.navigateTo({
      url: '/pages/return-confirm/return-confirm?stationId=' + station.id,
    })
  },
})
