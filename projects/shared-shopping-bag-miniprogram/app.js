const store = require('./services/store')

App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
  },

  onLaunch() {
    store.init()
    store.syncOverdueOrders()

    const user = store.getUser()
    if (user) {
      this.globalData.userInfo = user
      this.globalData.isLoggedIn = true
    }
  },
})
