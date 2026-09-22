const auth = require('../../utils/auth')

Page({
  data: {
    username: '',
    password: '',
    showPwd: false,
    canSubmit: false
  },

  onLoad() {
    if (auth.isLoggedIn()) {
      wx.switchTab({ url: '/pages/profile/profile' })
    }
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
    this.checkCanSubmit()
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
    this.checkCanSubmit()
  },

  togglePwd() {
    this.setData({ showPwd: !this.data.showPwd })
  },

  checkCanSubmit() {
    const { username, password } = this.data
    this.setData({ canSubmit: !!username.trim() && password.length >= 4 })
  },

  onLogin() {
    const { username, password } = this.data
    if (!this.data.canSubmit) return

    const result = auth.login({ username: username.trim(), password })
    if (result.ok) {
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => wx.switchTab({ url: '/pages/profile/profile' }), 800)
    } else {
      wx.showToast({ title: result.msg, icon: 'none' })
    }
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' })
  }
})
