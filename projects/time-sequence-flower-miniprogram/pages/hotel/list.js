const mock = require('../../utils/mock')

function enrichHotel(h) {
  const rating = parseFloat(h.rating) || 0
  let stars = 3
  if (rating >= 4.8 && h.price >= 600) stars = 5
  else if (rating >= 4.7) stars = 4
  else if (rating >= 4.5) stars = 3

  const roomTypes = []
  if (h.price >= 800) roomTypes.push('套房', '大床房', '双床房')
  else if (h.price >= 400) roomTypes.push('大床房', '双床房')
  else roomTypes.push('双床房', '单人间')

  const starArray = [1, 2, 3, 4, 5].map(s => s <= stars)
  return { ...h, stars, roomTypes, starArray }
}

const BASE_FACILITIES = [
  { value: 'WIFI', label: 'WIFI' },
  { value: '停车场', label: '停车场' },
  { value: '早餐', label: '含早餐' },
  { value: 'SPA', label: 'SPA' },
  { value: '花园', label: '花园' },
  { value: '餐厅', label: '餐厅' }
]

const FILTERS = {
  stars: [
    { value: 0, label: '不限星级' },
    { value: 5, label: '五星/豪华' },
    { value: 4, label: '四星/高档' },
    { value: 3, label: '三星/舒适' }
  ],
  priceRange: [
    { value: 'all', label: '不限价格' },
    { value: '0-400', label: '¥400以下', min: 0, max: 400 },
    { value: '400-700', label: '¥400-700', min: 400, max: 700 },
    { value: '700-1000', label: '¥700-1000', min: 700, max: 1000 },
    { value: '1000+', label: '¥1000以上', min: 1000, max: Infinity }
  ],
  sort: [
    { value: 'default', label: '默认排序' },
    { value: 'price-asc', label: '价格从低到高' },
    { value: 'price-desc', label: '价格从高到低' },
    { value: 'rating-desc', label: '评分最高' }
  ]
}

// 生成带 checked 属性的设施列表
function buildFacilityList(selected) {
  return BASE_FACILITIES.map(f => ({
    ...f,
    checked: selected.indexOf(f.value) > -1
  }))
}

Page({
  data: {
    allHotels: [],
    hotels: [],
    filters: FILTERS,

    starFilter: 0,
    priceFilter: 'all',
    facilityFilter: [],
    sortBy: 'default',

    // 设施弹窗数据（带 checked 字段，WXML 直接用 item.checked）
    facilityList: buildFacilityList([]),

    showPanel: '',
    filterCount: 0
  },

  onLoad() {
    const enriched = mock.hotels.map(enrichHotel)
    this.setData({ allHotels: enriched })
    this.applyFilters()
  },

  // ===== 面板开关 =====
  togglePanel(e) {
    const panel = e.currentTarget.dataset.panel
    if (this.data.showPanel === panel) {
      this.setData({ showPanel: '' })
      return
    }
    // 打开设施面板时同步 checked 状态
    if (panel === 'facility') {
      this.setData({ facilityList: buildFacilityList(this.data.facilityFilter) })
    }
    this.setData({ showPanel: panel })
  },

  closePanel() {
    this.setData({ showPanel: '' })
  },

  // 星级
  selectStar(e) {
    this.setData({ starFilter: e.currentTarget.dataset.value, showPanel: '' })
    this.applyFilters()
  },

  // 价格
  selectPrice(e) {
    this.setData({ priceFilter: e.currentTarget.dataset.value, showPanel: '' })
    this.applyFilters()
  },

  // 排序
  selectSort(e) {
    this.setData({ sortBy: e.currentTarget.dataset.value, showPanel: '' })
    this.applyFilters()
  },

  // ===== 设施多选 =====
  toggleFacility(e) {
    const val = e.currentTarget.dataset.value
    const list = this.data.facilityList.map(f => {
      if (f.value === val) f.checked = !f.checked
      return f
    })
    this.setData({ facilityList: list })
  },

  // 全选 / 取消全选
  toggleAllFacility() {
    const allChecked = this.data.facilityList.every(f => f.checked)
    const list = this.data.facilityList.map(f => ({ ...f, checked: !allChecked }))
    this.setData({ facilityList: list })
  },

  // 确认设施选择
  confirmFacility() {
    const selected = this.data.facilityList.filter(f => f.checked).map(f => f.value)
    this.setData({
      facilityFilter: selected,
      showPanel: ''
    })
    this.applyFilters()
  },

  // 清除所有筛选
  clearAll() {
    this.setData({
      starFilter: 0,
      priceFilter: 'all',
      facilityFilter: [],
      sortBy: 'default',
      showPanel: ''
    })
    this.applyFilters()
  },

  // ===== 筛选逻辑 =====
  applyFilters() {
    let list = [...this.data.allHotels]
    const { starFilter, priceFilter, facilityFilter, sortBy } = this.data

    if (starFilter > 0) {
      list = list.filter(h => h.stars === starFilter)
    }

    if (priceFilter !== 'all') {
      const range = FILTERS.priceRange.find(r => r.value === priceFilter)
      if (range) {
        list = list.filter(h => h.price >= range.min && h.price < range.max)
      }
    }

    if (facilityFilter.length > 0) {
      list = list.filter(h =>
        h.facilities && facilityFilter.every(f => h.facilities.includes(f))
      )
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating-desc') {
      list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    }

    let count = 0
    if (starFilter > 0) count++
    if (priceFilter !== 'all') count++
    if (facilityFilter.length > 0) count++
    if (sortBy !== 'default') count++

    this.setData({ hotels: list, filterCount: count })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/hotel/detail?id=' + e.currentTarget.dataset.id })
  }
})
