const mock = require('../../utils/mock')

Page({
  data: {
    cities: mock.cities.map(c => ({
      ...c,
      type: c.flower === '樱花' ? 'sakura' : c.flower === '牡丹' ? 'peony' : c.flower === '桂花' ? 'osmanthus' : 'plum'
    })),
    scenics: mock.scenics
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },
  goScenic(e) {
    wx.navigateTo({ url: '/pages/scenic/detail?id=' + e.currentTarget.dataset.id })
  },
  goFlower(e) {
    wx.navigateTo({ url: '/pages/flower/detail?type=' + e.currentTarget.dataset.type })
  }
})
