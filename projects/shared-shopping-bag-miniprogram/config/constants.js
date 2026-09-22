module.exports = {
  DEPOSIT: 9.9,
  FEE_PER_USE: 0.5,
  FREE_HOURS: 0.2,
  FREE_MS: 0.2 * 60 * 60 * 1000,
  DAILY_CAP: 10,
  MEMBERSHIP_PRICE: 15,
  OVERDUE_DAYS: 3,
  OVERDUE_MS: 3 * 24 * 60 * 60 * 1000,

  ORDER_STATUS: {
    ONGOING: 'ongoing',
    RETURNED: 'returned',
    OVERDUE: 'overdue',
  },

  MEMBERSHIP_TYPE: {
    NONE: 'none',
    MONTHLY: 'monthly',
  },

  STATION_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
  },

  STORAGE_KEYS: {
    INITIALIZED: 'ecobag_initialized',
    USER: 'ecobag_user',
    ORDERS: 'ecobag_orders',
    STATIONS: 'ecobag_stations',
    HELP: 'ecobag_help',
    SCAN_MODE: 'ecobag_scan_mode',
    SELECTED_STATION: 'ecobag_selected_station',
  },
}
