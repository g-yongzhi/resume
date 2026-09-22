const mock = require('../../utils/mock')

Page({
  data: { scenics: mock.scenics },
  goDetail(e) {
    wx.navigateTo({ url: '/pages/scenic/detail?id=' + e.currentTarget.dataset.id })
  }
})
