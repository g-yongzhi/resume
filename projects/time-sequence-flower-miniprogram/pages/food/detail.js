const mock = require('../../utils/mock')

Page({
  data: { food: null },
  onLoad(options) {
    const id = Number(options.id)
    const food = mock.foods.find(f => f.id === id) || mock.foods[0]
    this.setData({ food })
    wx.setNavigationBarTitle({ title: food.title })
  },
  onOrder() {
    wx.showToast({ title: '演示项目，暂不支持点餐', icon: 'none' })
  }
})
