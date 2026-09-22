const img = require('../../utils/images')

const flowerMap = {
  sakura: {
    name: '樱花', city: '武汉', season: '春分', status: '盛放中',
    image: img.wuhanSakura, desc: '三月樱雪落珞珈，江城最美花期。',
    spots: ['武汉大学樱花大道', '东湖磨山樱园', '汉口江滩'],
    tips: '建议工作日清晨前往，避开人流高峰。'
  },
  peony: {
    name: '牡丹', city: '洛阳', season: '谷雨', status: '盛放中',
    image: img.luoyangPeony, desc: '国色天香，千年古都的花事盛典。',
    spots: ['国色牡丹园', '白马寺', '隋唐城遗址植物园'],
    tips: '谷雨前后为最佳观赏期，建议预留半天。'
  },
  lotus: {
    name: '荷花', city: '杭州', season: '夏至', status: '初绽',
    image: img.scenicLotus2, desc: '一湖烟波，半池清荷，夏日最宜。',
    spots: ['西湖曲院风荷', '北山街', '断桥残雪'],
    tips: '清晨光线柔和，适合拍摄荷叶露珠。'
  },
  plum: {
    name: '梅花', city: '南京', season: '立春', status: '花落时',
    image: img.nanjingPlum, desc: '春寒料峭时，梅骨最铮铮。',
    spots: ['梅花山', '明孝陵', '玄武湖'],
    tips: '立春至雨水为盛花期，暗香浮动。'
  },
  osmanthus: {
    name: '桂花', city: '成都', season: '秋分', status: '待开启',
    image: img.chengduOsmanthus, desc: '桂香满城的慢生活，秋意最浓。',
    spots: ['桂湖公园', '宽窄巷子', '人民公园'],
    tips: '中秋前后香气最盛，可品桂花糕。'
  }
}

const types = ['sakura', 'peony', 'lotus', 'plum', 'osmanthus']

Page({
  data: {
    flower: null,
    types,
    activeType: 'sakura'
  },
  onLoad(options) {
    const type = options.type || 'sakura'
    this.setFlower(type)
  },
  setFlower(type) {
    const flower = flowerMap[type] || flowerMap.sakura
    this.setData({ flower, activeType: type })
    wx.setNavigationBarTitle({ title: flower.name + '花历' })
  },
  onTypeTap(e) {
    this.setFlower(e.currentTarget.dataset.type)
  },
  onPlan() {
    wx.showToast({ title: '花期规划演示', icon: 'none' })
  }
})
