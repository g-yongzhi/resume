const storage = require('../../utils/storage')

Page({
  data: {
    tripName: '',
    destination: '',
    startDate: '',
    endDate: '',
    members: [],        // { id, name, color } — only local IDs for form editing
    memberInput: '',    // 当前输入的成员名
    dateText: '请选择出行日期',
    canSubmit: false
  },

  // 行程名称
  onNameInput(e) {
    const tripName = e.detail.value
    this.setData({ tripName })
    this.checkCanSubmit()
  },

  onDestInput(e) {
    this.setData({ destination: e.detail.value })
  },

  // 日期选择
  onDateTap() {
    wx.showModal({
      title: '选择日期',
      content: '请先选择开始日期，再选择结束日期',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  onStartDateChange(e) {
    const startDate = e.detail.value
    this.setData({ startDate, dateText: startDate + (this.data.endDate ? ' - ' + this.data.endDate : '') })
    this.checkCanSubmit()
  },

  onEndDateChange(e) {
    const endDate = e.detail.value
    const dateText = this.data.startDate ? this.data.startDate + ' - ' + endDate : endDate
    this.setData({ endDate, dateText })
    this.checkCanSubmit()
  },

  // 成员输入
  onMemberInput(e) {
    this.setData({ memberInput: e.detail.value })
  },

  addMember() {
    const name = this.data.memberInput.trim()
    if (!name) {
      wx.showToast({ title: '请输入成员姓名', icon: 'none' })
      return
    }
    if (this.data.members.find(m => m.name === name)) {
      wx.showToast({ title: '该成员已存在', icon: 'none' })
      return
    }
    const COLORS = storage.MEMBER_COLORS
    const idx = this.data.members.length
    const member = {
      id: 'm_new_' + Date.now() + '_' + idx,
      name,
      color: COLORS[idx % COLORS.length]
    }
    const members = [...this.data.members, member]
    this.setData({ members, memberInput: '' })
    this.checkCanSubmit()
  },

  removeMember(e) {
    const idx = e.currentTarget.dataset.index
    const members = this.data.members.filter((_, i) => i !== idx)
    this.setData({ members })
    this.checkCanSubmit()
  },

  confirmMemberInput() {
    this.addMember()
  },

  // 校验
  checkCanSubmit() {
    const { tripName, startDate, members } = this.data
    this.setData({ canSubmit: !!tripName.trim() && !!startDate && members.length >= 1 })
  },

  // 提交
  onSubmit() {
    const { tripName, destination, startDate, endDate, members } = this.data
    if (!tripName.trim()) {
      wx.showToast({ title: '请输入行程名称', icon: 'none' })
      return
    }
    if (!startDate) {
      wx.showToast({ title: '请选择出行日期', icon: 'none' })
      return
    }
    if (members.length === 0) {
      wx.showToast({ title: '请至少添加一位同行人', icon: 'none' })
      return
    }

    // 清洗成员数据（确保每人有唯一 ID）
    const cleanMembers = members.map((m, i) => ({
      ...m,
      id: m.id.startsWith('m_new_') ? storage.generateId('m') : m.id
    }))

    storage.createTrip({
      name: tripName.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      members: cleanMembers
    })

    wx.showToast({ title: '行程创建成功', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1000)
  }
})
