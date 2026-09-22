const store = require('../services/store')

const requireLogin = (message = 'Please sign in to continue.') => {
  if (store.getUser()) {
    return true
  }

  wx.showModal({
    title: 'Sign In Required',
    content: message,
    confirmText: 'Go',
    cancelText: 'Cancel',
    success: (res) => {
      if (res.confirm) {
        wx.navigateTo({ url: '/pages/login/login' })
      }
    },
  })
  return false
}

module.exports = {
  requireLogin,
}
