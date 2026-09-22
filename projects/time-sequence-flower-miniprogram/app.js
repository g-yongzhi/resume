const storage = require('./utils/storage')
const auth = require('./utils/auth')

App({
  onLaunch() {
    // 恢复登录会话
    this.restoreSession()
    // 首次启动时播种 AA 记账演示数据
    storage.seedDemoData()
  },

  restoreSession() {
    const user = auth.getCurrentUser()
    if (user) {
      this.globalData.userInfo = {
        nickName: user.nickname || user.username,
        avatar: user.avatar || '/assets/img/wuhan-sakura.jpg',
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
