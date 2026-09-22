const store = require('../../services/store')

Page({
  data: {
    article: null,
  },

  onLoad(options) {
    const articles = store.getHelpArticles()
    const article = articles.find((item) => item.id === options.id)
    if (!article) {
      wx.showToast({ title: 'Article not found', icon: 'none' })
      this._backTimer = setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    this.setData({ article })
    wx.setNavigationBarTitle({ title: article.category })
  },

  onUnload() {
    if (this._backTimer) {
      clearTimeout(this._backTimer)
      this._backTimer = null
    }
  },
})
