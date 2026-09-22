/**
 * AA 记账数据存储服务
 * 使用 wx.setStorageSync / wx.getStorageSync 持久化
 * 3 个固定 key: aa_trips, aa_expenses, aa_settlements
 */
const mock = require('./mock')
const img = require('./images')

const KEYS = {
  TRIPS: 'aa_trips',
  EXPENSES: 'aa_expenses',
  SETTLEMENTS: 'aa_settlements'
}

const MEMBER_COLORS = ['#2D5A43', '#e88d67', '#4a90d9', '#7b68ee', '#20b2aa', '#e57373']

const CATEGORY_MAP = {
  food:      { label: '餐饮',  icon: 'utensils',   color: '#e88d67' },
  transport: { label: '交通',  icon: 'compass',     color: '#4a90d9' },
  hotel:     { label: '住宿',  icon: 'hotel',       color: '#2D5A43' },
  tickets:   { label: '门票',  icon: 'ticket',      color: '#e57373' },
  other:     { label: '其他',  icon: 'sparkles',    color: '#7b68ee' }
}

// ============ helpers ============

/** 生成唯一 ID: prefix + base36(timestamp) + 5位随机 */
function generateId(prefix) {
  const ts = Date.now().toString(36)
  const rnd = Math.random().toString(36).substring(2, 7)
  return `${prefix}_${ts}_${rnd}`
}

/** 安全读 */
function _read(key, fallback) {
  try {
    const raw = wx.getStorageSync(key)
    if (raw === '' || raw === undefined || raw === null) return fallback
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return parsed
  } catch (_) {
    return fallback
  }
}

/** 安全写 */
function _write(key, value) {
  try {
    wx.setStorageSync(key, JSON.stringify(value))
    return true
  } catch (_) {
    return false
  }
}

// ============ Trip ============

function getTrips() {
  return _read(KEYS.TRIPS, [])
}

function getTrip(tripId) {
  const trips = getTrips()
  return trips.find(t => t.id === tripId) || null
}

function createTrip(data) {
  const trips = getTrips()
  const now = Date.now()
  const trip = {
    id: generateId('t'),
    name: data.name || '未命名行程',
    destination: data.destination || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    members: data.members || [],
    status: 'active',
    createdAt: now
  }
  trips.unshift(trip)
  _write(KEYS.TRIPS, trips)
  return trip
}

function updateTrip(tripId, data) {
  const trips = getTrips()
  const idx = trips.findIndex(t => t.id === tripId)
  if (idx === -1) return null
  const allowed = ['name', 'destination', 'startDate', 'endDate', 'status']
  allowed.forEach(k => {
    if (data[k] !== undefined) trips[idx][k] = data[k]
  })
  _write(KEYS.TRIPS, trips)
  return trips[idx]
}

function deleteTrip(tripId) {
  const trips = getTrips().filter(t => t.id !== tripId)
  _write(KEYS.TRIPS, trips)
  // cascade
  const allExpenses = _read(KEYS.EXPENSES, {})
  delete allExpenses[tripId]
  _write(KEYS.EXPENSES, allExpenses)
  const allSettlements = _read(KEYS.SETTLEMENTS, {})
  delete allSettlements[tripId]
  _write(KEYS.SETTLEMENTS, allSettlements)
}

// ============ Member (inline in trip) ============

function addMember(tripId, memberData) {
  const trips = getTrips()
  const trip = trips.find(t => t.id === tripId)
  if (!trip) return null
  const idx = trip.members.length
  const member = {
    id: generateId('m'),
    name: memberData.name || '成员',
    avatar: memberData.avatar || '',
    color: memberData.color || MEMBER_COLORS[idx % MEMBER_COLORS.length]
  }
  trip.members.push(member)
  _write(KEYS.TRIPS, trips)
  return member
}

function removeMember(tripId, memberId) {
  // Check if member has expenses
  const expenses = getExpenses(tripId)
  const hasExpense = expenses.some(e => e.paidBy === memberId || e.splitMembers.includes(memberId))
  if (hasExpense) return { ok: false, reason: '该成员有关联的消费记录，请先删除相关消费' }

  const trips = getTrips()
  const trip = trips.find(t => t.id === tripId)
  if (!trip) return { ok: false, reason: '行程不存在' }
  if (trip.members.length <= 1) return { ok: false, reason: '至少保留一位成员' }

  trip.members = trip.members.filter(m => m.id !== memberId)
  _write(KEYS.TRIPS, trips)
  return { ok: true }
}

// ============ Expense ============

function getExpenses(tripId) {
  const all = _read(KEYS.EXPENSES, {})
  return all[tripId] || []
}

function addExpense(tripId, data) {
  const all = _read(KEYS.EXPENSES, {})
  const list = all[tripId] || []
  const expense = {
    id: generateId('e'),
    tripId,
    category: data.category || 'food',
    amount: data.amount || 0,
    paidBy: data.paidBy || '',
    date: data.date || '',
    desc: data.desc || '',
    splitMembers: data.splitMembers || [],
    createdAt: Date.now()
  }
  list.unshift(expense)
  all[tripId] = list
  _write(KEYS.EXPENSES, all)
  return expense
}

function updateExpense(tripId, expenseId, data) {
  const all = _read(KEYS.EXPENSES, {})
  const list = all[tripId] || []
  const idx = list.findIndex(e => e.id === expenseId)
  if (idx === -1) return null
  const allowed = ['category', 'amount', 'paidBy', 'date', 'desc', 'splitMembers']
  allowed.forEach(k => {
    if (data[k] !== undefined) list[idx][k] = data[k]
  })
  all[tripId] = list
  _write(KEYS.EXPENSES, all)
  return list[idx]
}

function deleteExpense(tripId, expenseId) {
  const all = _read(KEYS.EXPENSES, {})
  const list = all[tripId] || []
  all[tripId] = list.filter(e => e.id !== expenseId)
  _write(KEYS.EXPENSES, all)
}

// ============ Settlement ============

function getSettlements(tripId) {
  const all = _read(KEYS.SETTLEMENTS, {})
  return all[tripId] || []
}

function addSettlement(tripId, data) {
  const all = _read(KEYS.SETTLEMENTS, {})
  const list = all[tripId] || []
  const settlement = {
    id: generateId('s'),
    tripId,
    fromMemberId: data.fromMemberId || '',
    toMemberId: data.toMemberId || '',
    amount: data.amount || 0,
    date: data.date || '',
    createdAt: Date.now()
  }
  list.unshift(settlement)
  all[tripId] = list
  _write(KEYS.SETTLEMENTS, all)
  return settlement
}

function deleteSettlement(tripId, settlementId) {
  const all = _read(KEYS.SETTLEMENTS, {})
  const list = all[tripId] || []
  all[tripId] = list.filter(s => s.id !== settlementId)
  _write(KEYS.SETTLEMENTS, all)
}

// ============ 计算 ============

/** 均分金额（防浮点误差） */
function computeSplitAmounts(amount, memberIds) {
  if (!memberIds.length) return {}
  const count = memberIds.length
  const perPerson = Math.floor(amount / count)
  const remainder = amount - perPerson * count
  const split = {}
  memberIds.forEach((id, i) => {
    split[id] = perPerson + (i < remainder ? 1 : 0)
  })
  return split
}

/** 计算成员余额 */
function computeBalances(members, expenses, settlements) {
  const balances = {}
  members.forEach(m => { balances[m.id] = { member: m, net: 0 } })

  expenses.forEach(exp => {
    if (!exp.amount) return
    const payer = exp.paidBy
    const splitIds = exp.splitMembers || []
    if (!splitIds.length) return

    const splitAmounts = computeSplitAmounts(exp.amount, splitIds)

    // payer 获得全额 credit
    if (balances[payer]) balances[payer].net += exp.amount

    // 每个分摊人 debited
    Object.entries(splitAmounts).forEach(([id, amt]) => {
      if (balances[id]) balances[id].net -= amt
    })
  })

  settlements.forEach(s => {
    if (balances[s.fromMemberId]) balances[s.fromMemberId].net += s.amount
    if (balances[s.toMemberId])   balances[s.toMemberId].net   -= s.amount
  })

  Object.keys(balances).forEach(k => {
    balances[k].net = Math.round(balances[k].net * 100) / 100
  })
  return balances
}

/** 生成债务关系（贪心匹配最小转账） */
function computeDebts(members, expenses, settlements) {
  const balances = computeBalances(members, expenses, settlements)

  // 分离债权人和债务人
  const creditors = Object.values(balances)
    .filter(b => b.net > 0.01)
    .sort((a, b) => b.net - a.net)
  const debtors = Object.values(balances)
    .filter(b => b.net < -0.01)
    .sort((a, b) => a.net - b.net)

  const debts = []
  let ci = 0, di = 0
  // 深拷贝 net 以避免修改原对象
  const credits = creditors.map(c => ({ ...c, net: c.net }))
  const debts_list = debtors.map(d => ({ ...d, net: -d.net }))

  while (ci < credits.length && di < debts_list.length) {
    const amount = Math.min(credits[ci].net, debts_list[di].net)
    if (amount > 0.01) {
      debts.push({
        fromMember: debts_list[di].member,
        toMember: credits[ci].member,
        amount: Math.round(amount * 100) / 100
      })
    }
    credits[ci].net -= amount
    debts_list[di].net -= amount
    if (credits[ci].net < 0.01) ci++
    if (debts_list[di].net < 0.01) di++
  }
  return debts
}

/** 计算成员人均消费 */
function computePerPerson(total, memberCount) {
  if (!memberCount) return 0
  return Math.round((total / memberCount) * 100) / 100
}

// ============ Demo 数据播种 ============

function hasDemoData() {
  return getTrips().length > 0
}

function seedDemoData() {
  if (hasDemoData()) return false

  // 使用 mock 数据和当前用户创建演示行程
  const tripId = generateId('t')
  const now = Date.now()

  // 成员：从 app globalData 获取当前用户名，fallback 用硬编码
  const app = getApp()
  const currentUserName = (app && app.globalData && app.globalData.userInfo && app.globalData.userInfo.nickName) || '花城旅人'

  const userMemberId = generateId('m')
  const friendMemberId = generateId('m')

  const trip = {
    id: tripId,
    name: '武汉赏樱之旅',
    destination: '湖北·武汉',
    startDate: '2026-03-25',
    endDate: '2026-03-27',
    members: [
      { id: userMemberId, name: currentUserName, avatar: '', color: MEMBER_COLORS[0] },
      { id: friendMemberId, name: '张三', avatar: '', color: MEMBER_COLORS[1] }
    ],
    status: 'active',
    createdAt: now
  }

  // 复用原 mock.bills 数据创建消费
  const billTemplates = [
    { category: 'transport', desc: '高铁往返票', date: '2026-03-25' },
    { category: 'hotel',     desc: '东湖酒店两晚', date: '2026-03-26' },
    { category: 'food',      desc: '楚味轩晚餐', date: '2026-03-27' },
    { category: 'tickets',   desc: '樱花园门票', date: '2026-03-27' }
  ]
  const bills = mock.bills || []
  const expenses = billTemplates.map((tpl, i) => ({
    id: generateId('e'),
    tripId,
    category: tpl.category,
    amount: bills[i] ? bills[i].amount : 100,
    paidBy: i % 2 === 0 ? userMemberId : friendMemberId,
    date: tpl.date,
    desc: tpl.desc,
    splitMembers: [userMemberId, friendMemberId],
    createdAt: now + (i + 1) * 1000
  }))

  _write(KEYS.TRIPS, [trip])
  _write(KEYS.EXPENSES, { [tripId]: expenses })
  _write(KEYS.SETTLEMENTS, { [tripId]: [] })

  return true
}

module.exports = {
  // constants
  MEMBER_COLORS,
  CATEGORY_MAP,
  KEYS,

  // trip
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  addMember,
  removeMember,

  // expense
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,

  // settlement
  getSettlements,
  addSettlement,
  deleteSettlement,

  // compute
  computeSplitAmounts,
  computeBalances,
  computeDebts,
  computePerPerson,

  // helpers
  generateId,

  // demo
  seedDemoData,
  hasDemoData
}
