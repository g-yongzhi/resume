const mock = require('../../utils/mock')

Page({
  data: {
    latitude: 30.551,
    longitude: 114.410,
    scale: 13,
    markers: [],
    markerList: mock.mapMarkers
  },
  onLoad() {
    const markers = mock.mapMarkers.map(m => ({
      id: m.id,
      latitude: m.latitude,
      longitude: m.longitude,
      title: m.name,
      width: 32,
      height: 32,
      callout: {
        content: m.name,
        display: 'ALWAYS',
        padding: 8,
        borderRadius: 8,
        fontSize: 12,
        color: '#2D3A3A',
        bgColor: '#fff'
      }
    }))
    this.setData({ markers })
  },
  onMarkerTap(e) {
    const id = e.detail.markerId
    const item = mock.mapMarkers.find(m => m.id === id)
    if (item) {
      wx.showToast({ title: item.name, icon: 'none' })
    }
  },
  onSpotTap(e) {
    const id = Number(e.currentTarget.dataset.id)
    const item = mock.mapMarkers.find(m => m.id === id)
    if (item) {
      this.setData({
        latitude: item.latitude,
        longitude: item.longitude,
        scale: 15
      })
    }
  }
})
