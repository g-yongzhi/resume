const store = require("../../services/store")

Page({
  data: {
    categories: [],
  },

  onShow() {
    const grouped = store.getHelpByCategory()
    const categories = Object.keys(grouped).map((name) => ({
      name,
      articles: grouped[name],
    }))
    this.setData({ categories })
  },

  onArticleTap(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: "/pages/help-detail/help-detail?id=" + id })
  },

  onContact() {
    wx.showModal({
      title: "Contact Support",
      content: 'Email: support@ecobag.demo\nPhone: 400-888-0000\nHours: Mon-Fri 9:00-18:00',
      showCancel: false,
    })
  },
})
