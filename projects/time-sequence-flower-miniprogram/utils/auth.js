/**
 * 纯前端登录/注册认证服务
 * 使用 wx.setStorageSync 本地存储用户账号和会话
 */

const STORAGE_KEY = {
  USERS: 'app_users',       // 所有注册用户 { username: { password, nickname, avatar, createdAt } }
  SESSION: 'app_session'    // 当前登录用户 username | null
}

// ============ helpers ============

function _read(key, fallback) {
  try {
    const raw = wx.getStorageSync(key)
    if (!raw) return fallback
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch (_) {
    return fallback
  }
}

function _write(key, value) {
  try {
    wx.setStorageSync(key, JSON.stringify(value))
    return true
  } catch (_) {
    return false
  }
}

// ============ 注册 ============

/**
 * @param {{ username, password, nickname }} data
 * @returns {{ ok: boolean, msg: string }}
 */
function register(data) {
  if (!data.username || !data.username.trim()) {
    return { ok: false, msg: '请输入用户名' }
  }
  if (!data.password || data.password.length < 4) {
    return { ok: false, msg: '密码至少4位' }
  }

  const username = data.username.trim()
  const users = _read(STORAGE_KEY.USERS, {})

  if (users[username]) {
    return { ok: false, msg: '该用户名已被注册' }
  }

  users[username] = {
    username,
    password: data.password,
    nickname: data.nickname || username,
    avatar: '',
    createdAt: Date.now()
  }

  if (!_write(STORAGE_KEY.USERS, users)) {
    return { ok: false, msg: '注册失败，请重试' }
  }

  // 注册后自动登录
  _write(STORAGE_KEY.SESSION, username)
  return { ok: true, msg: '注册成功', user: users[username] }
}

// ============ 登录 ============

/**
 * @param {{ username, password }} data
 * @returns {{ ok: boolean, msg: string, user?: object }}
 */
function login(data) {
  if (!data.username || !data.password) {
    return { ok: false, msg: '请输入用户名和密码' }
  }

  const username = data.username.trim()
  const users = _read(STORAGE_KEY.USERS, {})

  const user = users[username]
  if (!user) {
    return { ok: false, msg: '用户不存在，请先注册' }
  }
  if (user.password !== data.password) {
    return { ok: false, msg: '密码错误' }
  }

  _write(STORAGE_KEY.SESSION, username)
  return { ok: true, msg: '登录成功', user }
}

// ============ 登出 ============

function logout() {
  _write(STORAGE_KEY.SESSION, null)
}

// ============ 会话 ============

/** 获取当前登录用户，未登录返回 null */
function getCurrentUser() {
  const username = _read(STORAGE_KEY.SESSION, null)
  if (!username) return null
  const users = _read(STORAGE_KEY.USERS, {})
  return users[username] || null
}

/** 是否已登录 */
function isLoggedIn() {
  return getCurrentUser() !== null
}

/** 更新当前用户信息 */
function updateProfile(data) {
  const user = getCurrentUser()
  if (!user) return { ok: false, msg: '未登录' }
  const users = _read(STORAGE_KEY.USERS, {})
  if (data.nickname !== undefined) user.nickname = data.nickname
  if (data.avatar !== undefined) user.avatar = data.avatar
  users[user.username] = user
  _write(STORAGE_KEY.USERS, users)
  return { ok: true, user }
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  isLoggedIn,
  updateProfile
}
