const mock = require('../../utils/mock')

const terms = [
  { id: '07', name: '立夏', flower: '石榴', emoji: '🌺', status: '进行中' },
  { id: '08', name: '小满', flower: '麦花', emoji: '🌾', status: '待开启' },
  { id: '09', name: '芒种', flower: '栀子', emoji: '🤍', status: '待开启' },
  { id: '10', name: '夏至', flower: '荷花', emoji: '🪷', status: '初绽' },
  { id: '11', name: '小暑', flower: '茉莉', emoji: '🌼', status: '待开启' }
]

Page({
  data: {
    banners: mock.banners,
    navIcons: mock.navIcons,
    hotWords: mock.hotWords,
    terms,
    leftFeeds: [],
    rightFeeds: [],
    bannerIndex: 0
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    const left = []
    const right = []
    mock.feeds.forEach((item, i) => (i % 2 === 0 ? left : right).push(item))
    this.setData({ leftFeeds: left, rightFeeds: right })
  },
  onBannerChange(e) {
    this.setData({ bannerIndex: e.detail.current })
  },
  onSearch() {
    wx.showToast({ title: '搜索功能演示', icon: 'none' })
  },
  onHotTap(e) {
    wx.showToast({ title: '搜索：' + e.currentTarget.dataset.word, icon: 'none' })
  },
  goDestination() {
    wx.switchTab({ url: '/pages/destination/destination' })
  },
  onNavTap(e) {
    const path = e.currentTarget.dataset.path
    const isTab = path.includes('/pages/forum/index') ||
      path.includes('/pages/destination/') ||
      path.includes('/pages/profile/')
    if (isTab) {
      wx.switchTab({ url: path.split('?')[0] })
    } else {
      wx.navigateTo({ url: path })
    }
  },
  onFeedTap(e) {
    wx.navigateTo({ url: '/pages/recommend/detail?id=' + e.currentTarget.dataset.id })
  }
})
