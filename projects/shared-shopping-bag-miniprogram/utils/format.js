const formatMoney = (amount) => `¥${Number(amount).toFixed(2)}`

const formatDateTime = (timestamp) => {
  if (!timestamp) {
    return '-'
  }
  const date = new Date(timestamp)
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const formatDuration = (start, end) => {
  const minutes = Math.max(Math.floor((end - start) / 60000), 0)
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`
}

module.exports = {
  formatMoney,
  formatDateTime,
  formatDuration,
}
