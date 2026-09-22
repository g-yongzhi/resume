const auth = require('../../utils/auth')

Page({
  data: {
    username: '',
    nickname: '',
    password: '',
    confirmPwd: '',
    canSubmit: false
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
    this.checkCanSubmit()
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
    this.checkCanSubmit()
  },

  onConfirmInput(e) {
    this.setData({ confirmPwd: e.detail.value })
    this.checkCanSubmit()
  },

  checkCanSubmit() {
    const { username, password, confirmPwd } = this.data
    this.setData({
      canSubmit: !!username.trim() && password.length >= 4 && password === confirmPwd
    })
  },

  onRegister() {
    const { username, nickname, password, confirmPwd } = this.data

    if (!username.trim()) {
      wx.showToast({ title: '请输入用户名', icon: 'none' })
      return
    }
    if (password.length < 4) {
      wx.showToast({ title: '密码至少4位', icon: 'none' })
      return
    }
    if (password !== confirmPwd) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }

    const result = auth.register({
      username: username.trim(),
      nickname: nickname.trim() || username.trim(),
      password
    })

    if (result.ok) {
      wx.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => wx.switchTab({ url: '/pages/profile/profile' }), 800)
    } else {
      wx.showToast({ title: result.msg, icon: 'none' })
    }
  },

  goLogin() {
    wx.navigateBack()
  }
})
