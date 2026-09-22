const STORAGE_KEY = 'campus_lost_found_items'

const CATEGORIES = [
  { id: 'card', name: '证件', image: '/images/cat-card.jpg' },
  { id: 'digital', name: '数码', image: '/images/cat-digital.jpg' },
  { id: 'book', name: '书籍', image: '/images/cat-book.jpg' },
  { id: 'clothes', name: '衣物', image: '/images/cat-clothes.jpg' },
  { id: 'key', name: '钥匙', image: '/images/cat-key.jpg' },
  { id: 'other', name: '其他', image: '/images/cat-other.jpg' }
]

const MOCK_ITEMS = [
  {
    id: 'mock_1',
    type: 'lost',
    category: 'digital',
    title: '黑色无线耳机',
    description: '在图书馆三楼阅览室遗失，充电盒上有小熊贴纸，右耳偶尔断连。',
    location: '图书馆三楼',
    contact: '微信：campus_find_01',
    image: '',
    time: '2026-06-20 14:30',
    status: 'active'
  },
  {
    id: 'mock_2',
    type: 'found',
    category: 'card',
    title: '校园一卡通',
    description: '在食堂二楼捡到，卡面为蓝色，姓名已遮挡，请失主联系认领。',
    location: '第二食堂二楼',
    contact: '手机：138****5678',
    image: '',
    time: '2026-06-21 12:05',
    status: 'active'
  },
  {
    id: 'mock_3',
    type: 'found',
    category: 'key',
    title: '一串宿舍钥匙',
    description: '钥匙串上有小型玩偶挂件，共三把钥匙，在操场看台附近捡到。',
    location: '田径场看台',
    contact: 'QQ：88291034',
    image: '',
    time: '2026-06-22 18:40',
    status: 'active'
  },
  {
    id: 'mock_4',
    type: 'lost',
    category: 'book',
    title: '高等数学教材',
    description: '封面有姓名标注，内页夹有复习笔记，在教学楼 B 座遗失。',
    location: '教学楼 B 座 302',
    contact: '微信：math_study_26',
    image: '',
    time: '2026-06-19 09:15',
    status: 'active'
  }
]

function getCategoryMap() {
  const map = {}
  CATEGORIES.forEach((c) => {
    map[c.id] = c
  })
  return map
}

function formatNow() {
  const d = new Date()
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function enrichItem(item) {
  const cat = getCategoryMap()[item.category] || CATEGORIES[5]
  return {
    ...item,
    categoryName: cat.name,
    cover: item.image || cat.image,
    typeLabel: item.type === 'lost' ? '失物' : '招领',
    statusLabel: item.status === 'resolved' ? '已解决' : '进行中'
  }
}

Page({
  data: {
    categories: CATEGORIES,
    categoryNames: CATEGORIES.map((c) => c.name),
    allItems: [],
    displayItems: [],
    searchKey: '',
    activeType: 'all',
    activeCategory: 'all',
    lostCount: 0,
    foundCount: 0,
    resolvedCount: 0,
    showDetail: false,
    showPublish: false,
    currentItem: null,
    form: {
      type: 'lost',
      typeIndex: 0,
      categoryIndex: 0,
      title: '',
      description: '',
      location: '',
      contact: '',
      image: ''
    },
    typeOptions: ['失物', '招领']
  },

  onLoad() {
    this.loadItems()
  },

  loadItems() {
    let items = wx.getStorageSync(STORAGE_KEY)
    if (!items || !items.length) {
      items = MOCK_ITEMS
      wx.setStorageSync(STORAGE_KEY, items)
    }
    this.applyItems(items)
  },

  saveItems(items) {
    wx.setStorageSync(STORAGE_KEY, items)
    this.applyItems(items)
  },

  applyItems(items) {
    const enriched = items.map(enrichItem)
    const lostCount = items.filter((i) => i.type === 'lost' && i.status === 'active').length
    const foundCount = items.filter((i) => i.type === 'found' && i.status === 'active').length
    const resolvedCount = items.filter((i) => i.status === 'resolved').length
    this.setData({
      allItems: enriched,
      lostCount,
      foundCount,
      resolvedCount
    })
    this.filterItems()
  },

  filterItems() {
    const { allItems, activeType, activeCategory, searchKey } = this.data
    const key = searchKey.trim().toLowerCase()
    const list = allItems.filter((item) => {
      if (activeType !== 'all' && item.type !== activeType) return false
      if (activeCategory !== 'all' && item.category !== activeCategory) return false
      if (!key) return true
      const text = `${item.title}${item.description}${item.location}${item.categoryName}`.toLowerCase()
      return text.includes(key)
    })
    this.setData({ displayItems: list })
  },

  onSearchInput(e) {
    this.setData({ searchKey: e.detail.value })
    this.filterItems()
  },

  onSearchClear() {
    this.setData({ searchKey: '' })
    this.filterItems()
  },

  onTypeTap(e) {
    this.setData({ activeType: e.currentTarget.dataset.type })
    this.filterItems()
  },

  onCategoryTap(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.id })
    this.filterItems()
  },

  openDetail(e) {
    const { id } = e.currentTarget.dataset
    const currentItem = this.data.allItems.find((i) => i.id === id)
    if (currentItem) {
      this.setData({ showDetail: true, currentItem })
    }
  },

  closeDetail() {
    this.setData({ showDetail: false, currentItem: null })
  },

  openPublish() {
    this.setData({
      showPublish: true,
      form: {
        type: 'lost',
        typeIndex: 0,
        categoryIndex: 0,
        title: '',
        description: '',
        location: '',
        contact: '',
        image: ''
      }
    })
  },

  closePublish() {
    this.setData({ showPublish: false })
  },

  onFormTypeChange(e) {
    const typeIndex = Number(e.detail.value)
    this.setData({
      'form.typeIndex': typeIndex,
      'form.type': typeIndex === 0 ? 'lost' : 'found'
    })
  },

  onFormCategoryChange(e) {
    this.setData({ 'form.categoryIndex': Number(e.detail.value) })
  },

  onFormInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFiles[0].tempFilePath
        this.setData({ 'form.image': path })
      }
    })
  },

  removeImage() {
    this.setData({ 'form.image': '' })
  },

  submitPublish() {
    const { form } = this.data
    if (!form.title.trim()) {
      wx.showToast({ title: '请填写物品名称', icon: 'none' })
      return
    }
    if (!form.location.trim()) {
      wx.showToast({ title: '请填写地点', icon: 'none' })
      return
    }
    if (!form.contact.trim()) {
      wx.showToast({ title: '请填写联系方式', icon: 'none' })
      return
    }

    const category = CATEGORIES[form.categoryIndex] || CATEGORIES[0]
    const newItem = {
      id: `item_${Date.now()}`,
      type: form.type,
      category: category.id,
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      contact: form.contact.trim(),
      image: form.image,
      time: formatNow(),
      status: 'active'
    }

    const raw = wx.getStorageSync(STORAGE_KEY) || []
    raw.unshift(newItem)
    this.saveItems(raw)
    this.setData({ showPublish: false })
    wx.showToast({ title: '发布成功', icon: 'success' })
  },

  copyContact() {
    const { currentItem } = this.data
    if (!currentItem) return
    wx.setClipboardData({
      data: currentItem.contact,
      success: () => {
        wx.showToast({ title: '联系方式已复制', icon: 'success' })
      }
    })
  },

  markResolved() {
    const { currentItem } = this.data
    if (!currentItem) return
    wx.showModal({
      title: '标记为已解决',
      content: '确认该物品已找回或完成交接？',
      confirmColor: '#1A7F6E',
      success: (res) => {
        if (res.confirm) {
          const raw = wx.getStorageSync(STORAGE_KEY) || []
          const idx = raw.findIndex((i) => i.id === currentItem.id)
          if (idx > -1) {
            raw[idx].status = 'resolved'
            this.saveItems(raw)
            this.setData({ showDetail: false, currentItem: null })
            wx.showToast({ title: '已标记解决', icon: 'success' })
          }
        }
      }
    })
  },

  deleteItem() {
    const { currentItem } = this.data
    if (!currentItem) return
    wx.showModal({
      title: '删除信息',
      content: '删除后无法恢复，确定删除吗？',
      confirmColor: '#E76F51',
      success: (res) => {
        if (res.confirm) {
          const raw = wx.getStorageSync(STORAGE_KEY) || []
          const next = raw.filter((i) => i.id !== currentItem.id)
          this.saveItems(next)
          this.setData({ showDetail: false, currentItem: null })
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  preventBubble() {}
})
