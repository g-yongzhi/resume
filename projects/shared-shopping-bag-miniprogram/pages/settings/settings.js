const store = require('../../services/store')

Page({
  data: {
    user: null,
    nickname: '',
  },

  onShow() {
    const user = store.getUser()
    if (!user) {
      wx.reLaunch({ url: '/pages/login/login' })
      return
    }

    this.setData({
      user,
      nickname: user.nickname,
    })
  },

  onNicknameInput(event) {
    this.setData({ nickname: event.detail.value })
  },

  onSaveNickname() {
    const nickname = this.data.nickname.trim()
    if (!nickname) {
      wx.showToast({ title: 'Nickname cannot be empty', icon: 'none' })
      return
    }

    const user = store.updateProfile({ nickname })
    getApp().globalData.userInfo = user
    wx.showToast({ title: 'Saved', icon: 'success' })
  },

  onAbout() {
    wx.showModal({
      title: 'About EcoBag',
      content: 'EcoBag - A Reusable Bag Solution\n\nVersion 1.0.0\nDemo project for shared shopping bag rental.',
      showCancel: false,
    })
  },

  onLogout() {
    wx.showModal({
      title: 'Sign Out',
      content: 'Are you sure you want to sign out?',
      confirmText: 'Sign Out',
      success: (res) => {
        if (!res.confirm) {
          return
        }

        store.logout()
        getApp().globalData.userInfo = null
        getApp().globalData.isLoggedIn = false
        wx.reLaunch({ url: '/pages/login/login' })
      },
    })
  },
})
