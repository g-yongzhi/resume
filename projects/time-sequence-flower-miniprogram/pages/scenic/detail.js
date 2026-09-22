const mock = require('../../utils/mock')

Page({
  data: { scenic: null },
  onLoad(options) {
    const id = Number(options.id)
    const scenic = mock.scenics.find(s => s.id === id) || mock.scenics[0]
    this.setData({ scenic })
    wx.setNavigationBarTitle({ title: scenic.place })
  },
  onGo() {
    wx.navigateTo({ url: '/pages/map/index' })
  }
})
