const img = require('./images')

const hotels = [
  { id: 1, name: '东湖花间度度假酒店', image: img.hotelDonghu, rating: '4.9', reviews: '2386', location: '东湖风景区', tags: ['赏花推荐', '花期特惠'], price: 688, oldPrice: 888, facilities: ['WIFI', '停车场', '早餐', '花园'] },
  { id: 2, name: '梅园雅舍民宿', image: img.hotelMeiyuan, rating: '4.8', reviews: '1523', location: '磨山梅园', tags: ['赏花推荐', '文艺民宿'], price: 358, oldPrice: 428, facilities: ['WIFI', '早餐', '花园'] },
  { id: 3, name: '春山居山景别墅', image: img.hotelChunshan, rating: '4.9', reviews: '672', location: '黄陂木兰山', tags: ['山居度假', '花期特惠'], price: 1288, oldPrice: 1588, facilities: ['WIFI', '停车场', 'SPA'] },
  { id: 4, name: '樱华精品酒店', image: img.hotelJingpin, rating: '4.7', reviews: '987', location: '武汉大学周边', tags: ['樱花季热销'], price: 428, oldPrice: null, facilities: ['WIFI', '早餐', '餐厅'] },
  { id: 5, name: '墨韵文化主题酒店', image: img.hotelMoyun, rating: '4.6', reviews: '1105', location: '汉口江滩', tags: ['文化体验', '江景房'], price: 398, oldPrice: null, facilities: ['WIFI', '餐厅', 'SPA'] }
]

const foods = [
  { id: 1, title: '楚味轩火锅', image: img.foodChuwei, category: '正餐', badges: ['必吃榜', '花期特惠'], rating: 4.8, reviews: 3256, zone: '汉口江滩', avgPrice: 88, dishes: ['花语鸳鸯锅', '长江鲜鱼片'] },
  { id: 2, title: '花城热干面馆', image: img.foodRegan, category: '小吃', badges: ['老字号'], rating: 4.7, reviews: 5890, zone: '户部巷', avgPrice: 18, dishes: ['经典热干面', '樱花热干面'] },
  { id: 3, title: '荷塘点心坊', image: img.foodHetang, category: '甜品', badges: ['网红打卡'], rating: 4.9, reviews: 2134, zone: '东湖风景区', avgPrice: 52, dishes: ['荷花酥', '樱花大福'] },
  { id: 4, title: '江鲜渔家', image: img.foodJiangxian, category: '正餐', badges: ['江鲜必吃'], rating: 4.7, reviews: 2890, zone: '汉口江滩', avgPrice: 128, dishes: ['清蒸长江鲜鱼', '红烧武昌鱼'] },
  { id: 5, title: '花食糕点铺', image: img.foodGd, category: '花食', badges: ['非遗传承'], rating: 4.6, reviews: 1876, zone: '黄鹤楼周边', avgPrice: 35, dishes: ['立春迎春糕', '清明艾草青团'] }
]

const scenics = [
  { id: 1, name: '樱花', place: '武汉大学樱花大道', city: '湖北·武汉', image: img.scenicSakura, status: '盛放中', season: '春分', desc: '三月樱雪落珞珈，一笔诗意绕廊檐。', views: '12.8w', type: 'sakura' },
  { id: 2, name: '牡丹', place: '洛阳国色牡丹园', city: '河南·洛阳', image: img.scenicPeony, status: '盛放中', season: '谷雨', desc: '千年古都，一城花语。', views: '9.6w', type: 'peony' },
  { id: 3, name: '荷花', place: '杭州西湖曲院风荷', city: '浙江·杭州', image: img.scenicLotus2, status: '初绽', season: '夏至', desc: '一湖烟波，半池清荷。', views: '15.2w', type: 'lotus' },
  { id: 4, name: '梅花', place: '南京梅花山', city: '江苏·南京', image: img.nanjingPlum, status: '花落时', season: '立春', desc: '春寒料峭时，梅骨最铮铮。', views: '7.3w', type: 'plum' }
]

const cities = [
  { id: 1, name: '武汉', flower: '樱花', image: img.wuhanSakura, desc: '江城三月樱如雪' },
  { id: 2, name: '洛阳', flower: '牡丹', image: img.luoyangPeony, desc: '国色天香牡丹城' },
  { id: 3, name: '成都', flower: '桂花', image: img.chengduOsmanthus, desc: '桂香满城的慢生活' },
  { id: 4, name: '南京', flower: '梅花', image: img.nanjingPlum, desc: '金陵梅山报春来' }
]

const banners = [
  { id: 1, image: img.bannerSpring, title: '春日赏花季' },
  { id: 2, image: img.bannerSummer, title: '夏日荷塘趣' },
  { id: 3, image: img.bannerAutumn, title: '秋日赏枫游' },
  { id: 4, image: img.bannerWinter, title: '冬日温泉行' }
]

const feeds = [
  { id: 1, title: '武大樱花季最全攻略，三天两夜这样玩', image: img.scenicSakura, author: '花城旅人', likes: 2341, tag: '攻略', content: 'Day1 上午武大樱顶，下午东湖绿道；Day2 磨山樱园 + 户部巷；Day3 黄鹤楼远眺江城花景。' },
  { id: 2, title: '洛阳牡丹文化节避坑指南', image: img.scenicPeony, author: '节气行者', likes: 1892, tag: '攻略', content: '谷雨前后为盛花期，国色牡丹园建议预留半天。' },
  { id: 3, title: '东湖绿道骑行 + 樱园一日游', image: img.scenicLotus, author: '武汉本地宝', likes: 956, tag: '游记', content: '从梨园入口进入绿道，骑行至磨山樱园约40分钟。' },
  { id: 4, title: '夏日荷塘古寺，周末轻徒步', image: img.scenicLotus, author: '慢旅日记', likes: 723, tag: '游记', content: '清晨从荷塘边出发，沿古寺石阶缓行。' },
  { id: 5, title: '秋日红枫古桥拍照机位分享', image: img.scenicMaple, author: '摄影小白', likes: 612, tag: '摄影', content: '推荐在日出后一小时拍摄，侧光打在枫叶与古桥上层次最好。' },
  { id: 6, title: '花灯古街夜游，氛围感拉满', image: img.scenicLantern, author: '夜猫子', likes: 1088, tag: '夜游', content: '入夜后古街灯笼次第亮起，适合慢逛拍照。' }
]

const forumPosts = [
  { id: 1, title: '立夏时节，武汉看荷去哪里？', content: '推荐东湖磨山荷园，清晨人最少，光线也最好。', author: '花间客', image: img.scenicLotus, likes: 128, comments: 32 },
  { id: 2, title: '第一次来洛阳看牡丹，求路线', content: '国色牡丹园 + 白马寺一日游，住宿建议住在老城区。', author: '节气游', image: img.scenicPeony, likes: 256, comments: 45 },
  { id: 3, title: '分享我的花期旅行账单', content: '三天两夜武汉赏樱，人均约1800元，含住宿和餐饮。', author: '记账达人', image: img.billTop, likes: 89, comments: 17 }
]

const reviews = [
  { id: 1, spot: '东湖樱花园', score: 5, content: '樱花季真的太美了，建议工作日早上去！', image: img.wuhanSakura, date: '2026-03-28' },
  { id: 2, spot: '楚味轩火锅', score: 4.5, content: '花语鸳鸯锅很有特色，江景位视野棒。', image: img.foodChuwei, date: '2026-04-12' },
  { id: 3, spot: '洛阳国色牡丹园', score: 5, content: '谷雨时节牡丹盛开，值得专程来一趟。', image: img.luoyangPeony, date: '2026-04-20' }
]

const bills = [
  { id: 1, title: '交通', amount: 520, date: '2026-03-25' },
  { id: 2, title: '住宿', amount: 1376, date: '2026-03-26' },
  { id: 3, title: '餐饮', amount: 386, date: '2026-03-27' },
  { id: 4, title: '门票', amount: 120, date: '2026-03-27' }
]

const mapMarkers = [
  { id: 1, name: '东湖樱花园', latitude: 30.551, longitude: 114.410 },
  { id: 2, name: '黄鹤楼', latitude: 30.544, longitude: 114.302 },
  { id: 3, name: '户部巷', latitude: 30.548, longitude: 114.309 }
]

const navIcons = [
  { name: '攻略', icon: 'book-open', path: '/pages/forum/index' },
  { name: '酒店', icon: 'hotel', path: '/pages/hotel/list' },
  { name: '美食', icon: 'utensils', path: '/pages/food/list' },
  { name: '景点', icon: 'landmark', path: '/pages/scenic/list' },
  { name: '地图', icon: 'map', path: '/pages/map/index' },
  { name: '花历', icon: 'flower-2', path: '/pages/flower/detail?type=sakura' },
  { name: '评价', icon: 'star', path: '/pages/review/index' },
  { name: '账单', icon: 'wallet', path: '/pages/bill/index' }
]

const hotWords = ['武汉樱花', '洛阳牡丹', '西湖荷花', '南京梅花']

module.exports = {
  hotels, foods, scenics, cities, banners, feeds, forumPosts, reviews, bills, mapMarkers, navIcons, hotWords
}
