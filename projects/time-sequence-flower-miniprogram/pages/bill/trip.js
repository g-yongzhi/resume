const storage = require('../../utils/storage')

Page({
  data: {
    tripId: '',
    trip: null,
    expenses: [],
    members: [],
    balances: {},
    debts: [],
    settlements: [],
    totalExpense: 0,
    perPerson: 0,
    expenseCount: 0,
    // 分组后的消费
    groupedExpenses: [],
    // 成员管理弹窗
    showMemberModal: false,
    newMemberName: '',
    // 结算相关
    showSettleModal: false,
    settleTarget: null
  },

  onLoad(options) {
    if (!options.id) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }
    this.setData({ tripId: options.id })
  },

  onShow() {
    this.reload()
  },

  reload() {
    const tripId = this.data.tripId
    const trip = storage.getTrip(tripId)
    if (!trip) {
      wx.showToast({ title: '行程不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }
    const rawExpenses = storage.getExpenses(tripId)
    const settlements = storage.getSettlements(tripId)
    // 附加成员姓名
    const enrichedSettlements = settlements.map(s => {
      const fromM = members.find(m => m.id === s.fromMemberId)
      const toM = members.find(m => m.id === s.toMemberId)
      return { ...s, fromName: fromM ? fromM.name : '未知', toName: toM ? toM.name : '未知' }
    })
    const members = trip.members || []
    // 为每条消费附加付款人/分摊人姓名，便于 WXML 直接渲染
    const expenses = rawExpenses.map(e => {
      const payer = members.find(m => m.id === e.paidBy)
      return { ...e, paidByName: payer ? payer.name : '未知' }
    })
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)
    const expenseCount = expenses.length
    const perPerson = storage.computePerPerson(totalExpense, members.length)
    const balances = storage.computeBalances(members, expenses, settlements)
    const debts = storage.computeDebts(members, expenses, settlements)
    const groupedExpenses = this.groupByDate(expenses)

    this.setData({
      trip,
      expenses,
      members,
      balances,
      debts,
      settlements: enrichedSettlements,
      totalExpense,
      perPerson,
      expenseCount,
      groupedExpenses
    })

    // 动态设置导航标题
    wx.setNavigationBarTitle({ title: trip.name || '行程详情' })
  },

  // 按日期分组
  groupByDate(expenses) {
    const map = {}
    expenses.forEach(e => {
      const d = e.date || '未知日期'
      if (!map[d]) map[d] = []
      map[d].push(e)
    })
    const keys = Object.keys(map).sort((a, b) => b.localeCompare(a))
    return keys.map(date => ({
      date,
      items: map[date],
      dayTotal: map[date].reduce((s, e) => s + e.amount, 0)
    }))
  },

  // 获取分类信息
  getCategoryInfo(category) {
    return storage.CATEGORY_MAP[category] || storage.CATEGORY_MAP.other
  },

  getMemberById(id) {
    return this.data.members.find(m => m.id === id) || { name: '未知', color: '#bbb' }
  },

  // 日期格式化
  formatDateLabel(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const m = d.getMonth() + 1
    const day = d.getDate()
    const wd = weekDays[d.getDay()] || ''
    return `${m}月${day}日 ${wd}`
  },

  // 添加消费
  onAddExpense() {
    wx.navigateTo({ url: `/pages/bill/expense?tripId=${this.data.tripId}` })
  },

  // 编辑消费
  onExpenseTap(e) {
    const expenseId = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/bill/expense?tripId=${this.data.tripId}&expenseId=${expenseId}` })
  },

  // 长按删除消费
  onExpenseLongPress(e) {
    const expenseId = e.currentTarget.dataset.id
    wx.showActionSheet({
      itemList: ['删除此消费'],
      itemColor: '#e57373',
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showModal({
            title: '确认删除',
            content: '确定删除这笔消费记录吗？',
            confirmColor: '#e57373',
            success: (modalRes) => {
              if (modalRes.confirm) {
                storage.deleteExpense(this.data.tripId, expenseId)
                wx.showToast({ title: '已删除', icon: 'success' })
                this.reload()
              }
            }
          })
        }
      }
    })
  },

  // ====== 成员管理 ======

  onManageMembers() {
    this.setData({ showMemberModal: true, newMemberName: '' })
  },

  closeMemberModal() {
    this.setData({ showMemberModal: false })
  },

  onNewMemberInput(e) {
    this.setData({ newMemberName: e.detail.value })
  },

  addMember() {
    const name = this.data.newMemberName.trim()
    if (!name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    if (this.data.members.find(m => m.name === name)) {
      wx.showToast({ title: '该成员已存在', icon: 'none' })
      return
    }
    storage.addMember(this.data.tripId, { name })
    this.setData({ newMemberName: '' })
    this.reload()
  },

  removeMemberConfirm(e) {
    const memberId = e.currentTarget.dataset.id
    const result = storage.removeMember(this.data.tripId, memberId)
    if (!result.ok) {
      wx.showToast({ title: result.reason, icon: 'none' })
      return
    }
    wx.showToast({ title: '已移除', icon: 'success' })
    this.reload()
  },

  // ====== 结算 ======

  onSettleDebt(e) {
    const { from, to, amount } = e.currentTarget.dataset
    const fromM = this.getMemberById(from)
    const toM = this.getMemberById(to)
    this.setData({
      showSettleModal: true,
      settleTarget: { fromId: from, toId: to, fromName: fromM.name, toName: toM.name, amount }
    })
  },

  closeSettleModal() {
    this.setData({ showSettleModal: false, settleTarget: null })
  },

  confirmSettle() {
    const t = this.data.settleTarget
    if (!t) return
    const today = new Date().toISOString().split('T')[0]
    storage.addSettlement(this.data.tripId, {
      fromMemberId: t.fromId,
      toMemberId: t.toId,
      amount: t.amount,
      date: today
    })
    wx.showToast({ title: '已标记结清', icon: 'success' })
    this.closeSettleModal()
    this.reload()
  },

  // 全部结清 / 删除行程
  onMoreActions() {
    const tripId = this.data.tripId
    wx.showActionSheet({
      itemList: ['标记全部结清', '删除本行程'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 全部结清
          wx.showModal({
            title: '全部结清',
            content: '确认已和所有同行人完成结算吗？',
            confirmColor: '#2D5A43',
            success: (modalRes) => {
              if (modalRes.confirm) {
                storage.updateTrip(tripId, { status: 'settled' })
                wx.showToast({ title: '行程已结清', icon: 'success' })
                this.reload()
              }
            }
          })
        } else if (res.tapIndex === 1) {
          // 删除行程
          wx.showModal({
            title: '确认删除',
            content: `确定删除「${this.data.trip.name}」及其所有数据吗？`,
            confirmColor: '#e57373',
            success: (modalRes) => {
              if (modalRes.confirm) {
                storage.deleteTrip(tripId)
                wx.showToast({ title: '已删除', icon: 'success' })
                setTimeout(() => wx.navigateBack(), 1000)
              }
            }
          })
        }
      }
    })
  }
})
