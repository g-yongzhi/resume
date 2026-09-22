const mock = require('../../utils/mock')

// 与列表页相同的扩充逻辑
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

Page({
  data: { hotel: null },
  onLoad(options) {
    const id = Number(options.id)
    const raw = mock.hotels.find(h => h.id === id) || mock.hotels[0]
    const hotel = enrichHotel(raw)
    this.setData({ hotel })
    wx.setNavigationBarTitle({ title: hotel.name })
  },
  onBook() {
    wx.showToast({ title: '演示项目，暂不支持预订', icon: 'none' })
  }
})
