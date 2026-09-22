const constants = require('../config/constants')
const storage = require('../utils/storage')
const { stations, helpArticles } = require('../mock/seed')

const { STORAGE_KEYS, DEPOSIT, ORDER_STATUS, MEMBERSHIP_TYPE } = constants

const createId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`

const init = () => {
  if (storage.get(STORAGE_KEYS.INITIALIZED)) {
    return
  }

  storage.set(STORAGE_KEYS.STATIONS, stations)
  storage.set(STORAGE_KEYS.HELP, helpArticles)
  storage.set(STORAGE_KEYS.ORDERS, [])
  storage.set(STORAGE_KEYS.INITIALIZED, true)
}

const getUser = () => storage.get(STORAGE_KEYS.USER)

const saveUser = (user) => {
  storage.set(STORAGE_KEYS.USER, user)
  return user
}

const login = (profile) => {
  const existing = getUser()
  const user = {
    id: existing?.id || createId('user'),
    nickname: profile.nickname || 'Eco User',
    avatar: profile.avatar || '/assets/images/logo-icon.png',
    phone: profile.phone || '',
    depositPaid: existing?.depositPaid || false,
    depositAmount: DEPOSIT,
    membershipType: existing?.membershipType || MEMBERSHIP_TYPE.NONE,
    membershipExpiresAt: existing?.membershipExpiresAt || null,
  }
  return saveUser(user)
}

const logout = () => {
  storage.remove(STORAGE_KEYS.USER)
}

const updateProfile = (patch) => {
  const user = getUser()
  if (!user) {
    return null
  }
  return saveUser({ ...user, ...patch })
}

const getStations = () => storage.get(STORAGE_KEYS.STATIONS, [])

const getStationById = (stationId) => getStations().find((item) => item.id === stationId) || null

const updateStation = (stationId, patch) => {
  const list = getStations().map((item) => (
    item.id === stationId ? { ...item, ...patch } : item
  ))
  storage.set(STORAGE_KEYS.STATIONS, list)
  return getStationById(stationId)
}

const getOrders = () => storage.get(STORAGE_KEYS.ORDERS, [])

const getOrdersByUser = (userId) => getOrders().filter((item) => item.userId === userId)

const getActiveOrders = (userId) => (
  getOrdersByUser(userId).filter((item) => item.status === ORDER_STATUS.ONGOING)
)

const getHistoryOrders = (userId) => (
  getOrdersByUser(userId).filter((item) => item.status !== ORDER_STATUS.ONGOING)
)

const getOrderById = (orderId) => getOrders().find((item) => item.id === orderId) || null

const saveOrders = (orders) => {
  storage.set(STORAGE_KEYS.ORDERS, orders)
}

const getHelpArticles = () => storage.get(STORAGE_KEYS.HELP, [])

const getHelpByCategory = () => {
  const grouped = {}
  getHelpArticles().forEach((item) => {
    if (!grouped[item.category]) {
      grouped[item.category] = []
    }
    grouped[item.category].push(item)
  })
  return grouped
}

const payDeposit = () => {
  const user = getUser()
  if (!user) {
    return { success: false, message: 'Please sign in first.' }
  }
  if (user.depositPaid) {
    return { success: false, message: 'Deposit already paid.' }
  }
  saveUser({ ...user, depositPaid: true })
  return { success: true }
}

const refundDeposit = () => {
  const user = getUser()
  if (!user) {
    return { success: false, message: 'Please sign in first.' }
  }
  if (!user.depositPaid) {
    return { success: false, message: 'No deposit to refund.' }
  }
  const activeOrders = getActiveOrders(user.id)
  if (activeOrders.length > 0) {
    return { success: false, message: 'Please return all bags before refunding deposit.' }
  }
  saveUser({ ...user, depositPaid: false })
  return { success: true }
}

const purchaseMembership = () => {
  const user = getUser()
  if (!user) {
    return { success: false, message: 'Please sign in first.' }
  }
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000
  saveUser({
    ...user,
    membershipType: MEMBERSHIP_TYPE.MONTHLY,
    membershipExpiresAt: expiresAt,
  })
  return { success: true, expiresAt }
}

const hasActiveMembership = (user) => (
  user?.membershipType === MEMBERSHIP_TYPE.MONTHLY
  && user?.membershipExpiresAt
  && user.membershipExpiresAt > Date.now()
)

const calculateFee = (borrowTime, returnTime, user) => {
  if (hasActiveMembership(user)) {
    return 0
  }

  const durationMs = returnTime - borrowTime
  if (durationMs <= constants.FREE_MS) {
    return 0
  }

  const dayStart = new Date(returnTime)
  dayStart.setHours(0, 0, 0, 0)
  const dayOrders = getOrdersByUser(user.id).filter((order) => {
    if (order.status === ORDER_STATUS.ONGOING) {
      return false
    }
    const returnedAt = order.returnTime || 0
    return returnedAt >= dayStart.getTime() && returnedAt <= returnTime
  })

  const dailyUsed = dayOrders.reduce((sum, order) => sum + (order.fee || 0), 0)
  const remainingCap = Math.max(constants.DAILY_CAP - dailyUsed, 0)
  return Math.min(constants.FEE_PER_USE, remainingCap)
}

const borrowBags = ({ stationId, bagCount = 1 }) => {
  const user = getUser()
  if (!user) {
    return { success: false, message: 'Please sign in first.' }
  }
  if (!user.depositPaid) {
    return { success: false, message: 'Please pay the deposit first.' }
  }

  const station = getStationById(stationId)
  if (!station) {
    return { success: false, message: 'Station not found.' }
  }
  if (station.status !== constants.STATION_STATUS.ONLINE) {
    return { success: false, message: 'Station is currently offline.' }
  }
  if (station.availableBags < bagCount) {
    return { success: false, message: 'Not enough bags available.' }
  }

  const freshStation = getStationById(stationId)
  updateStation(stationId, {
    availableBags: freshStation.availableBags - bagCount,
  })

  const order = {
    id: createId('order'),
    userId: user.id,
    stationId,
    stationName: station.name,
    status: ORDER_STATUS.ONGOING,
    borrowTime: Date.now(),
    returnTime: null,
    bagCount,
    deposit: DEPOSIT,
    fee: 0,
    totalCharge: 0,
  }

  saveOrders([order, ...getOrders()])
  return { success: true, order }
}

const returnBags = ({ orderId, stationId }) => {
  const user = getUser()
  if (!user) {
    return { success: false, message: 'Please sign in first.' }
  }

  const order = getOrderById(orderId)
  if (!order || order.userId !== user.id) {
    return { success: false, message: 'Order not found.' }
  }
  if (order.status !== ORDER_STATUS.ONGOING) {
    return { success: false, message: 'Order is already closed.' }
  }

  const station = getStationById(stationId)
  if (!station) {
    return { success: false, message: 'Station not found.' }
  }

  const returnTime = Date.now()
  const overdue = returnTime - order.borrowTime > constants.OVERDUE_MS
  const fee = overdue ? 0 : calculateFee(order.borrowTime, returnTime, user)
  const totalCharge = overdue ? DEPOSIT : fee

  const freshStation = getStationById(stationId)
  updateStation(stationId, {
    availableBags: freshStation.availableBags + order.bagCount,
  })

  const updatedOrder = {
    ...order,
    status: overdue ? ORDER_STATUS.OVERDUE : ORDER_STATUS.RETURNED,
    returnTime,
    returnStationId: stationId,
    returnStationName: station.name,
    fee,
    totalCharge,
    depositRefunded: !overdue,
  }

  saveOrders(getOrders().map((item) => (item.id === orderId ? updatedOrder : item)))

  if (overdue) {
    saveUser({ ...user, depositPaid: false })
  }

  return { success: true, order: updatedOrder, overdue }
}

const syncOverdueOrders = () => {
  const user = getUser()
  if (!user) {
    return
  }

  const now = Date.now()
  let hasNewOverdue = false

  const orders = getOrders().map((order) => {
    if (
      order.userId === user.id
      && order.status === ORDER_STATUS.ONGOING
      && now - order.borrowTime > constants.OVERDUE_MS
    ) {
      hasNewOverdue = true
      return {
        ...order,
        status: ORDER_STATUS.OVERDUE,
        totalCharge: DEPOSIT,
        depositRefunded: false,
      }
    }
    return order
  })

  saveOrders(orders)

  if (hasNewOverdue) {
    saveUser({ ...user, depositPaid: false })
  }
}

const previewReturnFee = (orderId) => {
  const user = getUser()
  const order = getOrderById(orderId)
  if (!order || !user || order.status !== ORDER_STATUS.ONGOING) {
    return 0
  }
  return calculateFee(order.borrowTime, Date.now(), user)
}

module.exports = {
  init,
  getUser,
  saveUser,
  login,
  logout,
  updateProfile,
  getStations,
  getStationById,
  updateStation,
  getOrders,
  getOrdersByUser,
  getActiveOrders,
  getHistoryOrders,
  getOrderById,
  getHelpArticles,
  getHelpByCategory,
  payDeposit,
  refundDeposit,
  purchaseMembership,
  hasActiveMembership,
  calculateFee,
  borrowBags,
  returnBags,
  syncOverdueOrders,
  previewReturnFee,
  constants,
}
