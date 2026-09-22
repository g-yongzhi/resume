const storage = require('../../utils/storage')

Page({
  data: {
    tripId: '',
    expenseId: '',         // 编辑模式时存在
    isEdit: false,
    members: [],

    // 表单数据
    category: 'food',
    amount: '',
    date: '',
    desc: '',
    paidBy: '',
    splitMembers: [],

    // 分类列表
    categories: [
      { key: 'food', label: '餐饮', icon: 'utensils' },
      { key: 'transport', label: '交通', icon: 'compass' },
      { key: 'hotel', label: '住宿', icon: 'hotel' },
      { key: 'tickets', label: '门票', icon: 'ticket' },
      { key: 'other', label: '其他', icon: 'sparkles' }
    ],

    // 计算的分摊金额
    splitPreview: {},
    canSave: false
  },

  onLoad(options) {
    if (!options.tripId) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1000)
      return
    }

    const tripId = options.tripId
    const trip = storage.getTrip(tripId)
    if (!trip) {
      wx.showToast({ title: '行程不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1000)
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const members = trip.members || []

    let isEdit = false
    let formData = {
      category: 'food',
      amount: '',
      date: today,
      desc: '',
      paidBy: members.length > 0 ? members[0].id : '',
      splitMembers: members.map(m => m.id)
    }

    // 编辑模式
    if (options.expenseId) {
      const expenses = storage.getExpenses(tripId)
      const expense = expenses.find(e => e.id === options.expenseId)
      if (expense) {
        isEdit = true
        formData = {
          category: expense.category,
          amount: String(expense.amount),
          date: expense.date,
          desc: expense.desc || '',
          paidBy: expense.paidBy,
          splitMembers: expense.splitMembers || []
        }
      }
    }

    this.setData({
      tripId,
      expenseId: options.expenseId || '',
      isEdit,
      ...formData
    }, () => {
      this.syncMemberChecked(members, formData.splitMembers)
      this.updateSplitPreview()
      this.checkCanSave()
    })

    wx.setNavigationBarTitle({ title: isEdit ? '编辑消费' : '记录消费' })
  },

  // 分类选择
  onCategoryTap(e) {
    this.setData({ category: e.currentTarget.dataset.key })
  },

  // 金额输入
  onAmountInput(e) {
    const val = e.detail.value
    // 只允许数字
    const filtered = val.replace(/[^\d]/g, '')
    this.setData({ amount: filtered })
    this.updateSplitPreview()
    this.checkCanSave()
  },

  // 日期
  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  // 描述
  onDescInput(e) {
    this.setData({ desc: e.detail.value })
  },

  // 付款人
  onPayerTap(e) {
    this.setData({ paidBy: e.currentTarget.dataset.id })
  },

  // 为成员附加 checked 标记
  syncMemberChecked(members, splitMembers) {
    const enriched = members.map(m => ({
      ...m,
      checked: splitMembers.indexOf(m.id) > -1
    }))
    this.setData({ members: enriched, splitMembers })
  },

  // 分摊成员切换
  onSplitToggle(e) {
    const memberId = e.currentTarget.dataset.id
    let splitMembers = [...this.data.splitMembers]
    const idx = splitMembers.indexOf(memberId)
    if (idx > -1) {
      if (splitMembers.length <= 1) {
        wx.showToast({ title: '至少选择一位', icon: 'none' })
        return
      }
      splitMembers.splice(idx, 1)
    } else {
      splitMembers.push(memberId)
    }
    this.syncMemberChecked(this.data.members, splitMembers)
    this.updateSplitPreview()
    this.checkCanSave()
  },

  // 全选/取消全选
  onSelectAll() {
    const allIds = this.data.members.map(m => m.id)
    const selectedAll = allIds.every(id => this.data.splitMembers.includes(id))
    const splitMembers = selectedAll ? [this.data.members[0].id] : allIds
    this.syncMemberChecked(this.data.members, splitMembers)
    this.updateSplitPreview()
    this.checkCanSave()
  },

  // 更新分摊预览
  updateSplitPreview() {
    const amount = parseInt(this.data.amount, 10) || 0
    const splitMembers = this.data.splitMembers
    if (amount > 0 && splitMembers.length > 0) {
      const preview = storage.computeSplitAmounts(amount, splitMembers)
      this.setData({ splitPreview: preview })
    } else {
      this.setData({ splitPreview: {} })
    }
  },

  checkCanSave() {
    const { category, amount, paidBy, splitMembers } = this.data
    const num = parseInt(amount, 10)
    this.setData({
      canSave: !!category && num > 0 && !!paidBy && splitMembers.length > 0
    })
  },

  // 保存
  onSave() {
    const { tripId, expenseId, isEdit, category, amount, date, desc, paidBy, splitMembers } = this.data
    const num = parseInt(amount, 10)
    if (!num || num <= 0) {
      wx.showToast({ title: '请输入金额', icon: 'none' })
      return
    }
    if (!paidBy) {
      wx.showToast({ title: '请选择付款人', icon: 'none' })
      return
    }
    if (!splitMembers.length) {
      wx.showToast({ title: '请选择分摊人', icon: 'none' })
      return
    }

    const payload = {
      category,
      amount: num,
      date: date || '',
      desc: desc.trim(),
      paidBy,
      splitMembers
    }

    if (isEdit) {
      storage.updateExpense(tripId, expenseId, payload)
      wx.showToast({ title: '已更新', icon: 'success' })
    } else {
      storage.addExpense(tripId, payload)
      wx.showToast({ title: '已记录', icon: 'success' })
    }
    setTimeout(() => wx.navigateBack(), 800)
  },

  // 删除（仅编辑模式）
  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定删除这笔消费记录吗？',
      confirmColor: '#e57373',
      success: (res) => {
        if (res.confirm) {
          storage.deleteExpense(this.data.tripId, this.data.expenseId)
          wx.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => wx.navigateBack(), 800)
        }
      }
    })
  }
})
