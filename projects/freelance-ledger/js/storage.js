const STORAGE_KEY = 'freelance-ledger-records';
const EXPENSES_KEY = 'freelance-ledger-expenses';
const PAYOUTS_KEY = 'freelance-ledger-payouts';
const SETTINGS_KEY = 'freelance-ledger-settings';

const DEFAULT_PLATFORMS = ['闲鱼', '淘宝', '微信', '支付宝', '对公转账', 'Upwork', 'Fiverr', '猪八戒', '其他'];
const DEFAULT_PAYMENTS = ['微信', '支付宝', '银行卡', '对公', 'PayPal', 'USDT', '现金', '其他'];
const DEFAULT_CATEGORIES = ['软件订阅', '设备采购', '办公耗材', '交通差旅', '营销推广', '外包分包', '税费', '生活开销', '其他'];
const DEFAULT_PARTNERS = [
  { id: 'p1', name: '成员 A', ratio: 50 },
  { id: 'p2', name: '成员 B', ratio: 50 },
];

const STATUS_LABELS = {
  in_progress: '进行中',
  pending: '待收款',
  partial: '部分到账',
  paid: '已结清',
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    platforms: [...DEFAULT_PLATFORMS],
    payments: [...DEFAULT_PAYMENTS],
    categories: [...DEFAULT_CATEGORIES],
    partners: DEFAULT_PARTNERS.map(p => ({ ...p })),
  };
}

function ensurePartners(settings) {
  if (!settings.partners || !settings.partners.length) {
    settings.partners = DEFAULT_PARTNERS.map(p => ({ ...p }));
  }
  return settings;
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function safeLoadArray(key, requiredField) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      backupCorrupted(key, raw, 'not an array');
      return [];
    }
    const valid = parsed.filter(item => item && typeof item === 'object' && item[requiredField]);
    if (valid.length !== parsed.length) {
      console.warn(`[Ledger] ${key}: ${parsed.length - valid.length} invalid record(s) filtered`);
    }
    return valid;
  } catch (e) {
    const raw = localStorage.getItem(key);
    if (raw) backupCorrupted(key, raw, e.message);
    return [];
  }
}

function backupCorrupted(key, raw, reason) {
  const backupKey = `${key}-corrupted-${Date.now()}`;
  try {
    localStorage.setItem(backupKey, raw);
    console.error(`[Ledger] Corrupted data in "${key}" (${reason}), backed up to "${backupKey}"`);
  } catch (_) {}
}

function loadRecords() {
  return safeLoadArray(STORAGE_KEY, 'id');
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function loadExpenses() {
  return safeLoadArray(EXPENSES_KEY, 'id');
}

function saveExpenses(expenses) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

function loadPayouts() {
  return safeLoadArray(PAYOUTS_KEY, 'id');
}

function savePayouts(payouts) {
  localStorage.setItem(PAYOUTS_KEY, JSON.stringify(payouts));
}

function daysInPeriod(periodKey) {
  const { year, month } = parseMonthKey(periodKey);
  if (periodKey === currentMonthKey()) {
    return new Date().getDate();
  }
  return new Date(year, month, 0).getDate();
}

function calcPeriodFinance(records, expenses, periodKey, isYearly) {
  const filterFn = isYearly
    ? (r) => isYear(r.date, parseMonthKey(periodKey).year)
    : (r) => isMonth(r.date, periodKey);
  const periodRecords = records.filter(r => filterFn(r));
  const periodExpenses = expenses.filter(e => filterFn(e));
  const received = periodRecords.reduce((s, r) => s + (r.received || 0), 0);
  const expense = periodExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const pending = periodRecords.reduce((s, r) => s + getPending(r), 0);
  const net = received - expense;
  const days = isYearly
    ? (parseMonthKey(periodKey).year === new Date().getFullYear()
        ? Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 86400000) + 1
        : 365)
    : daysInPeriod(periodKey);
  return { received, expense, net, pending, days };
}

function calcSplitSummary(records, expenses, payouts, partners, periodKey, isYearly) {
  const finance = calcPeriodFinance(records, expenses, periodKey, isYearly);
  const year = parseMonthKey(periodKey).year;
  const periodPayouts = payouts.filter(p => {
    if (isYearly) return isYear(p.date, year);
    return p.period === periodKey;
  });
  const totalPaidOut = periodPayouts.reduce((s, p) => s + (p.amount || 0), 0);

  const members = partners.map(partner => {
    const share = finance.net * (partner.ratio / 100);
    const paidOut = periodPayouts
      .filter(p => p.partnerId === partner.id)
      .reduce((s, p) => s + (p.amount || 0), 0);
    const dailyShare = finance.days > 0 ? share / finance.days : 0;
    const dailyNet = finance.days > 0 ? finance.net / finance.days / partners.length : 0;
    return {
      ...partner,
      share,
      paidOut,
      remaining: share - paidOut,
      dailyShare,
      dailyNet,
    };
  });

  return {
    ...finance,
    totalPaidOut,
    totalRemaining: finance.net - totalPaidOut,
    teamDailyNet: finance.days > 0 ? finance.net / finance.days : 0,
    members,
    payouts: periodPayouts.slice().sort((a, b) => b.date.localeCompare(a.date)),
  };
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatMoney(n) {
  return '¥' + Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getPending(record) {
  return Math.max(0, (record.amount || 0) - (record.received || 0));
}

function autoStatus(record) {
  const pending = getPending(record);
  const received = record.received || 0;
  const amount = record.amount || 0;
  if (amount === 0 && received === 0) return record.status || 'in_progress';
  if (pending <= 0 && amount > 0) return 'paid';
  if (received > 0 && pending > 0) return 'partial';
  if (received === 0 && amount > 0) return 'pending';
  return record.status || 'in_progress';
}

function isThisMonth(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function monthKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(key) {
  const [y, m] = key.split('-');
  const now = new Date();
  const isCurrent = key === currentMonthKey();
  if (isCurrent) return '本月';
  return `${y}年${parseInt(m, 10)}月`;
}

function formatPeriodLabel(key, isYearly) {
  if (isYearly) {
    const year = parseMonthKey(key).year;
    if (year === new Date().getFullYear()) return '今年';
    return `${year}年`;
  }
  return formatMonthLabel(key);
}

function parseMonthKey(key) {
  const [y, m] = key.split('-').map(Number);
  return { year: y, month: m };
}

function shiftMonthKey(key, delta) {
  const { year, month } = parseMonthKey(key);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function isMonth(dateStr, key) {
  return monthKey(dateStr) === key;
}

function yearKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return String(d.getFullYear());
}

function isYear(dateStr, year) {
  return yearKey(dateStr) === String(year);
}

function isCurrentYear() {
  return String(new Date().getFullYear());
}

function exportJSON(records, expenses, payouts) {
  const data = {
    version: 3,
    exportedAt: new Date().toISOString(),
    records,
    expenses: expenses || loadExpenses(),
    payouts: payouts || loadPayouts(),
    settings: loadSettings(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `接单记账-${new Date().toISOString().slice(0, 10)}.json`);
}

function exportCSV(records, expenses) {
  const incomeHeaders = ['类型', '项目名称', '客户', '开始日期', '结束日期', '工时', '合同金额', '已到账', '未到账', '平台', '支付方式', '状态', '备注'];
  const incomeRows = records.map(r => [
    '收入', r.name, r.client || '', r.date, r.endDate || '', r.hours || 0,
    r.amount, r.received || 0, getPending(r), r.platform || '', r.paymentMethod || '',
    STATUS_LABELS[autoStatus(r)] || r.status, (r.notes || '').replace(/"/g, '""'),
  ]);
  const expenseRows = (expenses || loadExpenses()).map(e => [
    '支出', e.title, '', e.date, '', '', e.amount, '', '', '', e.paymentMethod || '',
    e.category || '', (e.notes || '').replace(/"/g, '""'),
  ]);
  const csv = [incomeHeaders, ...incomeRows, ...expenseRows]
    .map(row => row.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `接单记账-${new Date().toISOString().slice(0, 10)}.csv`);
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const CHART_COLORS = ['#a1a1aa', '#86efac', '#93c5fd', '#fda4af', '#c4b5fd', '#fcd34d', '#67e8f9', '#f87171'];
