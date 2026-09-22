const store = require('../../services/store')

const DEFAULT_AVATAR = '/assets/images/logo-icon.png'

Page({
  data: {
    logging: false,
  },

  onShow() {
    if (getApp().globalData.isLoggedIn) {
      wx.switchTab({ url: '/pages/home/home' })
    }
  },

  onLogin() {
    if (this.data.logging) return
    this.setData({ logging: true })

    wx.login({
      success: () => {
        wx.getUserProfile({
          desc: 'Used to display your profile in EcoBag',
          success: (res) => {
            this.completeLogin({
              nickname: res.userInfo.nickName,
              avatar: res.userInfo.avatarUrl,
            })
          },
          fail: () => {
            this.completeLogin({
              nickname: 'Eco User',
              avatar: DEFAULT_AVATAR,
            })
          },
        })
      },
      fail: () => {
        this.completeLogin({
          nickname: 'Eco User',
          avatar: DEFAULT_AVATAR,
        })
      },
    })
  },

  completeLogin(profile) {
    const user = store.login(profile)
    getApp().globalData.userInfo = user
    getApp().globalData.isLoggedIn = true
    this.setData({ logging: false })
    wx.switchTab({ url: '/pages/home/home' })
  },
})
