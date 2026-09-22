const store = require('../../services/store')
const storage = require('../../utils/storage')
const { STATION_STATUS, STORAGE_KEYS } = store.constants

const DEFAULT_CENTER = {
  latitude: 31.2304,
  longitude: 121.4737,
}

Page({
  data: {
    latitude: DEFAULT_CENTER.latitude,
    longitude: DEFAULT_CENTER.longitude,
    scale: 14,
    markers: [],
    stations: [],
    selectedId: '',
    selectedStation: null,
  },

  onShow() {
    const selectedId = storage.get(STORAGE_KEYS.SELECTED_STATION, 'st_001')
    this.loadStations(selectedId)
    this.initMapCenter()
  },

  loadStations(selectedId) {
    const stations = store.getStations().map((item, index) => ({
      ...item,
      markerId: index,
      isOnline: item.status === STATION_STATUS.ONLINE,
      statusText: item.status === STATION_STATUS.ONLINE ? 'Online' : 'Offline',
    }))

    const markers = stations.map((item) => ({
      id: item.markerId,
      latitude: item.lat,
      longitude: item.lng,
      title: item.name,
      width: 28,
      height: 28,
      callout: {
        content: `${item.name}\n${item.availableBags} bags available`,
        color: '#333333',
        fontSize: 12,
        borderRadius: 8,
        bgColor: '#ffffff',
        padding: 8,
        display: item.id === selectedId ? 'ALWAYS' : 'BYCLICK',
      },
    }))

    const selectedStation = stations.find((item) => item.id === selectedId) || stations[0] || null

    this.setData({
      stations,
      markers,
      selectedId: selectedStation?.id || '',
      selectedStation,
    })
  },

  initMapCenter() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })
      },
      fail: () => {
        const stations = store.getStations()
        if (stations.length > 0) {
          const lat = stations.reduce((sum, item) => sum + item.lat, 0) / stations.length
          const lng = stations.reduce((sum, item) => sum + item.lng, 0) / stations.length
          this.setData({ latitude: lat, longitude: lng })
        }
      },
    })
  },

  selectStation(stationId) {
    const station = this.data.stations.find((item) => item.id === stationId)
    if (!station) {
      return
    }

    const prevSelectedId = this.data.selectedId
    const markers = this.data.markers.map((marker) => {
      const stationItem = this.data.stations.find((s) => s.markerId === marker.id)
      if (!stationItem) return marker

      const isNowSelected = stationItem.id === stationId
      const wasSelected = stationItem.id === prevSelectedId

      if (isNowSelected === wasSelected) return marker

      return {
        ...marker,
        callout: {
          ...marker.callout,
          display: isNowSelected ? 'ALWAYS' : 'BYCLICK',
        },
      }
    })

    this.setData({
      selectedId: stationId,
      selectedStation: station,
      markers,
      latitude: station.lat,
      longitude: station.lng,
      scale: 15,
    })
  },

  onMarkerTap(event) {
    const { markerId } = event.detail
    const station = this.data.stations.find((item) => item.markerId === markerId)
    if (station) {
      this.selectStation(station.id)
    }
  },

  onSelectStation(event) {
    const { id } = event.currentTarget.dataset
    this.selectStation(id)
  },

  onConfirmStation() {
    if (!this.data.selectedId) {
      return
    }

    storage.set(STORAGE_KEYS.SELECTED_STATION, this.data.selectedId)
    wx.showToast({ title: 'Station selected', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 500)
  },

  onRecenter() {
    this.initMapCenter()
  },

  onNavigate() {
    const station = this.data.selectedStation
    if (!station) {
      return
    }

    wx.openLocation({
      latitude: station.lat,
      longitude: station.lng,
      name: station.name,
      address: station.address,
      scale: 16,
    })
  },
})
