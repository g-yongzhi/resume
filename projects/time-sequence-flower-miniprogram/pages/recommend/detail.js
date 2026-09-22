const mock = require('../../utils/mock')

Page({
  data: { feed: null },
  onLoad(options) {
    const id = Number(options.id)
    const feed = mock.feeds.find(f => f.id === id) || mock.feeds[0]
    this.setData({ feed })
    wx.setNavigationBarTitle({ title: feed.tag + '详情' })
  },
  onLike() {
    wx.showToast({ title: '已点赞', icon: 'success' })
  },
  onCollect() {
    wx.showToast({ title: '已收藏', icon: 'success' })
  }
})
