Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/home/home', text: '首页', icon: 'home' },
      { pagePath: '/pages/destination/destination', text: '目的地', icon: 'map-pin' },
      { pagePath: '/pages/forum/index', text: '攻略', icon: 'book-open' },
      { pagePath: '/pages/profile/profile', text: '我的', icon: 'user' }
    ]
  },
  methods: {
    switchTab(e) {
      wx.switchTab({ url: this.data.list[e.currentTarget.dataset.index].pagePath })
    }
  }
})
