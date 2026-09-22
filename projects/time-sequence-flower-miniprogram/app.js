const storage = require('./utils/storage')
const auth = require('./utils/auth')

App({
  onLaunch() {
    this.restoreSession()
    storage.seedDemoData()
  },

  restoreSession() {
    const user = auth.getCurrentUser()
    if (user) {
      this.globalData.userInfo = {
        nickName: user.nickname || user.username,
        avatar: '/assets/img/wuhan-sakura.jpg',
        level: '花期旅人'
      }
    }
  },

  globalData: {
    userInfo: {
      nickName: '花城旅人',
      avatar: '/assets/img/wuhan-sakura.jpg',
      level: '点击登录，开启花期旅程'
    }
  }
})
