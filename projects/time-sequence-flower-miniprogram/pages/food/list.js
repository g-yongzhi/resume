const mock = require('../../utils/mock')

Page({
  data: {
    foods: mock.foods,
    categories: ['全部', '正餐', '小吃', '甜品', '花食'],
    activeCategory: '全部'
  },
  onCategoryTap(e) {
    const cat = e.currentTarget.dataset.cat
    const foods = cat === '全部' ? mock.foods : mock.foods.filter(f => f.category === cat)
    this.setData({ activeCategory: cat, foods })
  },
  goDetail(e) {
    wx.navigateTo({ url: '/pages/food/detail?id=' + e.currentTarget.dataset.id })
  }
})
