const get = (key, defaultValue = null) => {
  try {
    const value = wx.getStorageSync(key)
    if (value === '' || value === undefined || value === null) {
      return defaultValue
    }
    return value
  } catch (error) {
    return defaultValue
  }
}

const set = (key, value) => {
  wx.setStorageSync(key, value)
}

const remove = (key) => {
  wx.removeStorageSync(key)
}

module.exports = {
  get,
  set,
  remove,
}
