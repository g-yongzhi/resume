const { STATION_STATUS } = require('../config/constants')

const stations = [
  {
    id: 'st_001',
    name: 'Wanda Plaza Station',
    address: '128 Wanda Plaza, Downtown',
    lat: 31.2304,
    lng: 121.4737,
    totalBags: 80,
    availableBags: 56,
    status: STATION_STATUS.ONLINE,
  },
  {
    id: 'st_002',
    name: 'Central Park Station',
    address: '45 Central Park Road',
    lat: 31.2280,
    lng: 121.4690,
    totalBags: 60,
    availableBags: 32,
    status: STATION_STATUS.ONLINE,
  },
  {
    id: 'st_003',
    name: 'Metro Hub Station',
    address: '88 Metro Avenue',
    lat: 31.2345,
    lng: 121.4780,
    totalBags: 100,
    availableBags: 71,
    status: STATION_STATUS.ONLINE,
  },
  {
    id: 'st_004',
    name: 'Green Mall Station',
    address: '12 Green Mall, West District',
    lat: 31.2260,
    lng: 121.4650,
    totalBags: 50,
    availableBags: 18,
    status: STATION_STATUS.OFFLINE,
  },
]

const helpArticles = [
  {
    id: 'help_001',
    title: 'How to borrow a bag?',
    content: 'Tap Scan on the bottom bar, then tap "Demo Scan" to borrow a bag at the nearest station. A deposit of ¥9.90 is required unless you have an active membership.',
    category: 'Getting Started',
  },
  {
    id: 'help_002',
    title: 'How to return a bag?',
    content: 'Scan any available station and confirm return. Your deposit will be refunded after the bag is returned. Usage within 12 minutes is free.',
    category: 'Getting Started',
  },
  {
    id: 'help_003',
    title: 'What are the fees?',
    content: 'Each use costs ¥0.50 after the 12-minute free period. Daily charges are capped at ¥10.00. Overdue returns after 3 days will forfeit the full deposit.',
    category: 'Billing',
  },
  {
    id: 'help_004',
    title: 'How does membership work?',
    content: 'The monthly membership costs ¥15.00 and allows unlimited borrows during the valid period. Deposit is still required but will be refunded upon return.',
    category: 'Membership',
  },
  {
    id: 'help_005',
    title: 'Contact Support',
    content: 'Email: support@ecobag.demo\nPhone: 400-888-0000\nHours: Mon–Fri 9:00–18:00',
    category: 'Support',
  },
]

module.exports = {
  stations,
  helpArticles,
}
