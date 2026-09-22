const storage = require('../../utils/storage')
const img = require('../../utils/images')

Page({
  data: {
    trips: [],
    billTop: img.billTop,
    hasTrips: false,
    totalTrips: 0,
    totalAmount: 0
  },

  onShow() {
    // 确保演示数据（首次）
    storage.seedDemoData()
    this.loadTrips()
  },

  loadTrips() {
    const trips = storage.getTrips()
    // 计算每个行程的总消费
    const enriched = trips.map(trip => {
      const expenses = storage.getExpenses(trip.id)
      const total = expenses.reduce((s, e) => s + e.amount, 0)
      const settlements = storage.getSettlements(trip.id)
      const settled = settlements.reduce((s, st) => s + st.amount, 0)
      return {
        ...trip,
        totalExpense: total,
        settledAmount: settled,
        expenseCount: expenses.length,
        isFullySettled: total > 0 && settled >= total
      }
    })

    const grandTotal = enriched.reduce((s, t) => s + t.totalExpense, 0)

    this.setData({
      trips: enriched,
      hasTrips: enriched.length > 0,
      totalTrips: enriched.length,
      totalAmount: grandTotal
    })
  },

  // 进入行程详情
  onTripTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/bill/trip?id=${id}` })
  },

  // 创建新行程
  onCreateTap() {
    wx.navigateTo({ url: '/pages/bill/create' })
  },

  // 长按删除行程
  onTripLongPress(e) {
    const trip = e.currentTarget.dataset.item
    wx.showActionSheet({
      itemList: ['删除行程'],
      itemColor: '#e57373',
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showModal({
            title: '确认删除',
            content: `确定删除「${trip.name}」及其所有消费记录吗？此操作不可恢复。`,
            confirmColor: '#e57373',
            success: (modalRes) => {
              if (modalRes.confirm) {
                storage.deleteTrip(trip.id)
                wx.showToast({ title: '已删除', icon: 'success' })
                this.loadTrips()
              }
            }
          })
        }
      }
    })
  }
})
