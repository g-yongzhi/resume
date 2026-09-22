const auth = require('../../utils/auth')
const img = require('../../utils/images')

const levels = [
  { name: '花间客', min: 0, color: '#999' },
  { name: '节气游', min: 500, color: '#2D5A43' },
  { name: '花城旅人', min: 2000, color: '#e88d67' },
  { name: '时叙会员', min: 5000, color: '#2D5A43' }
]

const perks = [
  { title: '花期专属折扣', desc: '酒店美食享 9 折', icon: 'ticket' },
  { title: '优先赏花资讯', desc: '盛花期提醒推送', icon: 'flower-2' },
  { title: '专属客服', desc: '行程规划一对一', icon: 'message-circle' },
  { title: '积分兑换', desc: '消费积分兑好礼', icon: 'sparkles' }
]

Page({
  data: {
    userName: '花城旅人',
    avatar: img.avatar,
    level: levels[2],
    points: 2680,
    nextLevel: levels[3],
    perks,
    progress: 54
  },
  onShow() {
    const user = auth.getCurrentUser()
    if (user) {
      this.setData({ userName: user.nickname || user.username })
    }
  },
  onUpgrade() {
    wx.showToast({ title: '演示项目，暂不支持开通', icon: 'none' })
  }
})
