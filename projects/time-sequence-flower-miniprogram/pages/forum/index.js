const mock = require('../../utils/mock')

Page({
  data: { posts: mock.forumPosts },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },
  onPublish() {
    wx.showToast({ title: '演示项目，暂不支持发帖', icon: 'none' })
  }
})
