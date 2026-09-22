(function () {
  let records = loadRecords();
  let expenses = loadExpenses();
  let payouts = loadPayouts();
  let settings = loadSettings();
  settings = ensurePartners(settings);
  if (!settings.categories) settings.categories = [...DEFAULT_CATEGORIES];
  let currentView = 'dashboard';
  let dashboardPeriod = currentMonthKey();
  let isYearlyView = false;
  let searchTimer = null;
  let expenseSearchTimer = null;
  let pendingPaymentRecord = null;
  let formDirty = false;
  let currentFormType = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const pageTitles = {
    dashboard: ['概览', '今日与本月收支概况'],
    records: ['项目记录', '管理所有接单项目与收款状态'],
    expenses: ['支出记录', '记录与管理各项支出'],
    split: ['分账', '两人收益分配与提账记录'],
    analytics: ['统计分析', '收支趋势与分类分布'],
    settings: ['设置', '数据备份与自定义选项'],
  };

  function init() {
    bindNavigation();
    bindModal();
    bindExpenseModal();
    bindPayoutModal();
    bindPaymentModal();
    bindDrawer();
    bindConfirm();
    bindFilters();
    bindExpenseFilters();
    bindSettings();
    bindTopbar();
    bindKeyboard();
    bindFormDirtyTracking();
    bindPeriodPicker();
    bindSplitPeriodPicker();
    populateSelects();
    loadPartnerSettingsForm();
    renderAll();
    setDefaultDate();
    updateTopbar();
  }

  function updateTopbar() {
    const label = $('#btn-add-label');
    if (currentView === 'expenses') {
      label.textContent = '记一笔支出';
      $('#btn-add').title = '记一笔支出 (N)';
    } else {
      label.textContent = '新建项目';
      $('#btn-add').title = '新建项目 (N)';
    }
  }

  function openAddForCurrentView() {
    if (currentView === 'expenses') openExpenseModal();
    else openModal();
  }

  function setDefaultDate() {
    const today = new Date().toISOString().slice(0, 10);
    $('#field-date').value = today;
    $('#payment-date').value = today;
    $('#expense-date').value = today;
    $('#payout-date').value = today;
  }

  function bindNavigation() {
    $$('.nav-item, .mobile-nav-item[data-view]').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
    $$('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.goto));
    });
    $('#mobile-add')?.addEventListener('click', () => openAddForCurrentView());
  }

  function switchView(view) {
    if (!view) return;
    currentView = view;
    $$('.nav-item, .mobile-nav-item[data-view]').forEach(n => {
      n.classList.toggle('active', n.dataset.view === view);
    });
    $$('.view').forEach(v => {
      const isActive = v.id === `view-${view}`;
      v.classList.toggle('active', isActive);
      if (isActive) {
        v.style.animation = 'none';
        v.offsetHeight;
        v.style.animation = '';
      }
    });
    const [title, sub] = pageTitles[view];
    $('#page-title').textContent = title;
    $('#page-subtitle').textContent = sub;
    updateTopbar();
    if (view === 'records') renderRecords();
    else if (view === 'expenses') renderExpenses();
    else if (view === 'split') {
      syncSplitPeriodSelects();
      renderSplit();
    }
    else if (view === 'analytics') renderAnalytics();
    else if (view === 'dashboard') {
      syncPeriodSelects();
      renderDashboard();
    }
  }

  function bindPeriodPicker() {
    populatePeriodSelects();
    syncPeriodSelects();

    $('#period-year').addEventListener('change', () => {
      const m = $('#period-month').value;
      if (m === '0') {
        setDashboardPeriod(`${$('#period-year').value}-01`);
      } else {
        setDashboardPeriod(`${$('#period-year').value}-${String(m).padStart(2, '0')}`);
      }
    });

    $('#period-month').addEventListener('change', () => {
      const m = $('#period-month').value;
      if (m === '0') {
        setDashboardPeriod(`${$('#period-year').value}-01`);
      } else {
        setDashboardPeriod(`${$('#period-year').value}-${String(m).padStart(2, '0')}`);
      }
    });

    $('#period-prev').addEventListener('click', () => {
      setDashboardPeriod(shiftMonthKey(dashboardPeriod, isYearlyView ? -12 : -1));
    });

    $('#period-next').addEventListener('click', () => {
      setDashboardPeriod(shiftMonthKey(dashboardPeriod, isYearlyView ? 12 : 1));
    });

    $('#period-reset').addEventListener('click', () => {
      isYearlyView = false;
      setDashboardPeriod(currentMonthKey());
    });
  }

  function populatePeriodSelects() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const yearsFromRecords = [
      ...records.map(r => parseMonthKey(monthKey(r.date)).year),
      ...expenses.map(e => parseMonthKey(monthKey(e.date)).year),
    ];
    const dashYear = parseMonthKey(dashboardPeriod).year;
    const minYear = yearsFromRecords.length
      ? Math.min(...yearsFromRecords, dashYear)
      : Math.min(currentYear - 2, dashYear);

    const yearSelect = $('#period-year');
    const prevYear = yearSelect.value;
    yearSelect.innerHTML = '';
    for (let y = currentYear; y >= minYear; y--) {
      yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
    }
    if (prevYear && [...yearSelect.options].some(o => o.value === prevYear)) {
      yearSelect.value = prevYear;
    }

    const monthSelect = $('#period-month');
    const prevMonth = monthSelect.value;
    monthSelect.innerHTML = '<option value="0">全年</option>' +
      Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        return `<option value="${m}">${m}</option>`;
      }).join('');
    if (prevMonth && [...monthSelect.options].some(o => o.value === prevMonth)) {
      monthSelect.value = prevMonth;
    }

    const splitYear = $('#split-period-year');
    const splitMonth = $('#split-period-month');
    if (splitYear) {
      splitYear.innerHTML = yearSelect.innerHTML;
      if (splitMonth) {
        const cur = splitMonth.value;
        splitMonth.innerHTML = monthSelect.innerHTML;
        if (cur) splitMonth.value = cur;
      }
    }
  }

  function syncSplitPeriodSelects() {
    const { year, month } = parseMonthKey(dashboardPeriod);
    if ($('#split-period-year')) $('#split-period-year').value = year;
    if ($('#split-period-month')) $('#split-period-month').value = isYearlyView ? '0' : month;
    const isCurrentPeriod = !isYearlyView && dashboardPeriod === currentMonthKey();
    $('#split-period-reset')?.classList.toggle('hidden', isCurrentPeriod);
    $$('.split-period-next').forEach(btn => { btn.disabled = isCurrentPeriod; });
  }

  function bindSplitPeriodPicker() {
    $$('.split-period-prev').forEach(btn => {
      btn.addEventListener('click', () => setDashboardPeriod(shiftMonthKey(dashboardPeriod, isYearlyView ? -12 : -1), true));
    });
    $$('.split-period-next').forEach(btn => {
      btn.addEventListener('click', () => setDashboardPeriod(shiftMonthKey(dashboardPeriod, isYearlyView ? 12 : 1), true));
    });
    $('#split-period-reset')?.addEventListener('click', () => {
      isYearlyView = false;
      setDashboardPeriod(currentMonthKey(), true);
    });

    $('#split-period-year')?.addEventListener('change', () => {
      const m = $('#split-period-month')?.value || '1';
      if (m === '0') {
        setDashboardPeriod(`${$('#split-period-year').value}-01`, true);
      } else {
        setDashboardPeriod(`${$('#split-period-year').value}-${String(m).padStart(2, '0')}`, true);
      }
    });
    $('#split-period-month')?.addEventListener('change', () => {
      const m = $('#split-period-month')?.value || '1';
      if (m === '0') {
        setDashboardPeriod(`${$('#split-period-year').value}-01`, true);
      } else {
        setDashboardPeriod(`${$('#split-period-year').value}-${String(m).padStart(2, '0')}`, true);
      }
    });
  }

  function getSplitData(period) {
    return calcSplitSummary(records, expenses, payouts, settings.partners, period || dashboardPeriod, isYearlyView);
  }

  function syncPeriodSelects() {
    const { year, month } = parseMonthKey(dashboardPeriod);
    $('#period-year').value = year;
    $('#period-month').value = isYearlyView ? '0' : month;

    const periodLabel = formatPeriodLabel(dashboardPeriod, isYearlyView);
    $('#stat-income-label').textContent = `${periodLabel}总收入`;
    $('#stat-expense-label').textContent = `${periodLabel}支出`;
    $('#stat-net-label').textContent = `${periodLabel}净收益`;
    $('#stat-hours-label').textContent = `${periodLabel}工时`;

    const isCurrentPeriod = !isYearlyView && dashboardPeriod === currentMonthKey();
    $('#period-reset').classList.toggle('hidden', isCurrentPeriod);
    $('#period-next').disabled = isCurrentPeriod;

    if (isYearlyView) {
      $('#recent-panel-title').textContent = `${periodLabel}项目`;
      $('#recent-expense-title').textContent = `${periodLabel}支出`;
      $('#stat-pending-count').textContent = '';
      if (currentView === 'dashboard') {
        const isThisYear = year === new Date().getFullYear();
        $('#page-subtitle').textContent = isThisYear ? '今年收支概况' : `${year}年收支概况`;
      }
    } else {
      const isCurrent = dashboardPeriod === currentMonthKey();
      $('#recent-panel-title').textContent = isCurrent ? '近期项目' : `${periodLabel}项目`;
      $('#recent-expense-title').textContent = isCurrent ? '近期支出' : `${periodLabel}支出`;
      if (currentView === 'dashboard') {
        $('#page-subtitle').textContent = isCurrent
          ? '今日与本月收支概况'
          : `${year}年${month}月收支概况`;
      }
    }
  }

  function setDashboardPeriod(key, fromSplit) {
    const now = currentMonthKey();
    if (key > now) key = now;
    // 检查月下拉是否选了"全年"
    const monthVal = fromSplit ? $('#split-period-month')?.value : $('#period-month').value;
    isYearlyView = (monthVal === '0');
    if (isYearlyView) {
      // 年模式下，dashboardPeriod 统一使用该年1月
      const year = parseMonthKey(key).year;
      key = `${year}-01`;
    }
    dashboardPeriod = key;
    populatePeriodSelects();
    syncPeriodSelects();
    syncSplitPeriodSelects();
    renderDashboard();
    if (fromSplit || currentView === 'split') renderSplit();
  }

  function bindTopbar() {
    $('#btn-add').addEventListener('click', () => openAddForCurrentView());
    $('#btn-add-empty')?.addEventListener('click', () => openModal());
    $('#btn-add-expense-empty')?.addEventListener('click', () => openExpenseModal());
    $('#btn-export').addEventListener('click', () => {
      exportJSON(records, expenses, payouts);
      toast('数据已导出', 'success');
    });
  }

  function bindFormDirtyTracking() {
    document.addEventListener('input', (e) => {
      const form = e.target.closest('form');
      if (!form) return;
      const type = form.id;
      if (type === 'record-form') markFormDirty('record');
      else if (type === 'expense-form') markFormDirty('expense');
      else if (type === 'payout-form') markFormDirty('payout');
      else if (type === 'payment-form') markFormDirty('payment');
    });
    document.addEventListener('change', (e) => {
      const form = e.target.closest('form');
      if (!form) return;
      const type = form.id;
      if (type === 'record-form') markFormDirty('record');
      else if (type === 'expense-form') markFormDirty('expense');
      else if (type === 'payout-form') markFormDirty('payout');
      else if (type === 'payment-form') markFormDirty('payment');
    });
  }

  function bindKeyboard() {
    document.addEventListener('keydown', async (e) => {
      const tag = e.target.tagName;
      const editable = e.target.isContentEditable || e.target.contentEditable === 'true';
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || editable || e.isComposing;

      if (e.key === 'Escape') {
        if (!$('#confirm-overlay').classList.contains('hidden')) closeConfirm(false);
        else if (!$('#drawer-overlay').classList.contains('hidden')) closeDrawer();
        else if (!$('#payment-modal-overlay').classList.contains('hidden')) { e.preventDefault(); await closePaymentModal(); }
        else if (!$('#payout-modal-overlay').classList.contains('hidden')) { e.preventDefault(); await closePayoutModal(); }
        else if (!$('#expense-modal-overlay').classList.contains('hidden')) { e.preventDefault(); await closeExpenseModal(); }
        else if (!$('#modal-overlay').classList.contains('hidden')) { e.preventDefault(); await closeModal(); }
        return;
      }

      if (typing) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openAddForCurrentView();
      }
      if (e.key === '/') {
        e.preventDefault();
        switchView('records');
        setTimeout(() => $('#filter-search').focus(), 100);
      }
    });
  }

  function bindModal() {
    const overlay = $('#modal-overlay');
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal-cancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    $('#record-form').addEventListener('submit', (e) => {
      e.preventDefault();
      saveRecord();
    });

    ['field-amount', 'field-received', 'field-hours'].forEach(id => {
      $(`#${id}`).addEventListener('input', updateFormPreview);
    });
  }

  function bindExpenseModal() {
    const overlay = $('#expense-modal-overlay');
    $('#expense-modal-close').addEventListener('click', closeExpenseModal);
    $('#expense-modal-cancel').addEventListener('click', closeExpenseModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeExpenseModal(); });

    $('#expense-form').addEventListener('submit', (e) => {
      e.preventDefault();
      saveExpense();
    });
  }

  function bindExpenseFilters() {
    $('#expense-search').addEventListener('input', () => {
      clearTimeout(expenseSearchTimer);
      expenseSearchTimer = setTimeout(renderExpenses, 200);
    });
    ['expense-filter-category', 'expense-filter-month', 'expense-filter-sort'].forEach(id => {
      $(`#${id}`).addEventListener('change', renderExpenses);
    });
    $('#btn-clear-expense-filters').addEventListener('click', () => {
      $('#expense-search').value = '';
      $('#expense-filter-category').value = '';
      $('#expense-filter-month').value = '';
      $('#expense-filter-sort').value = 'date-desc';
      renderExpenses();
    });
  }

  function openExpenseModal(expense) {
    closeDrawer();
    $('#expense-form').reset();
    $('#expense-date').value = new Date().toISOString().slice(0, 10);

    if (expense) {
      $('#expense-modal-title').textContent = '编辑支出';
      $('#expense-id').value = expense.id;
      $('#expense-title').value = expense.title;
      $('#expense-amount').value = expense.amount;
      $('#expense-date').value = expense.date;
      $('#expense-category').value = expense.category || settings.categories[0];
      $('#expense-payment').value = expense.paymentMethod || settings.payments[0];
      $('#expense-notes').value = expense.notes || '';
    } else {
      $('#expense-modal-title').textContent = '记一笔支出';
      $('#expense-id').value = '';
      $('#expense-category').value = settings.categories[0];
      $('#expense-payment').value = settings.payments[0];
    }

    markFormClean();
    lockScroll(true);
    $('#expense-modal-overlay').classList.remove('hidden');
    setTimeout(() => $('#expense-title').focus(), 100);
  }

  async function closeExpenseModal() {
    if (!await confirmDirtyClose()) return;
    markFormClean();
    $('#expense-modal-overlay').classList.add('hidden');
    lockScroll(false);
  }

  function saveExpense() {
    const id = $('#expense-id').value;
    const data = {
      title: $('#expense-title').value.trim(),
      amount: parseFloat($('#expense-amount').value) || 0,
      date: $('#expense-date').value,
      category: $('#expense-category').value,
      paymentMethod: $('#expense-payment').value,
      notes: $('#expense-notes').value.trim(),
    };

    if (!data.title || !data.date || data.amount <= 0) {
      toast('请填写完整的支出信息', 'error');
      return;
    }

    if (id) {
      const idx = expenses.findIndex(e => e.id === id);
      if (idx >= 0) {
        expenses[idx] = { ...expenses[idx], ...data, updatedAt: new Date().toISOString() };
      }
    } else {
      expenses.unshift({
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    markFormClean();
    persist();
    closeExpenseModal();
    toast(id ? '支出已更新' : '支出已记录', 'success');
  }

  async function deleteExpense(id) {
    const e = expenses.find(x => x.id === id);
    const ok = await showConfirm('删除支出', `确定删除「${e?.title || '此支出'}」？`);
    if (!ok) return;
    expenses = expenses.filter(x => x.id !== id);
    persist();
    toast('支出已删除', 'success');
  }

  function bindPayoutModal() {
    const overlay = $('#payout-modal-overlay');
    $('#payout-modal-close').addEventListener('click', closePayoutModal);
    $('#payout-modal-cancel').addEventListener('click', closePayoutModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePayoutModal(); });

    $('#payout-form').addEventListener('submit', (e) => {
      e.preventDefault();
      savePayout();
    });
  }

  function openPayoutModal(partnerId, period) {
    const partner = settings.partners.find(p => p.id === partnerId);
    if (!partner) return;
    const data = getSplitData(period || dashboardPeriod);
    const member = data.members.find(m => m.id === partnerId);
    const remaining = member?.remaining || 0;

    $('#payout-id').value = '';
    $('#payout-partner-id').value = partnerId;
    $('#payout-period').value = period || dashboardPeriod;
    $('#payout-partner-label').textContent = `${partner.name} · 待提 ${formatMoney(Math.max(0, remaining))}`;
    $('#payout-amount').value = Math.max(0, remaining) > 0 ? Math.max(0, remaining) : '';
    $('#payout-date').value = new Date().toISOString().slice(0, 10);
    $('#payout-notes').value = '';

    markFormClean();
    lockScroll(true);
    $('#payout-modal-overlay').classList.remove('hidden');
    setTimeout(() => $('#payout-amount').focus(), 100);
  }

  async function closePayoutModal() {
    if (!await confirmDirtyClose()) return;
    markFormClean();
    $('#payout-modal-overlay').classList.add('hidden');
    lockScroll(false);
  }

  function savePayout() {
    const partnerId = $('#payout-partner-id').value;
    const period = $('#payout-period').value;
    const amount = parseFloat($('#payout-amount').value) || 0;
    if (amount <= 0) {
      toast('请输入有效金额', 'error');
      return;
    }

    const data = getSplitData(period);
    const member = data.members.find(m => m.id === partnerId);
    const remaining = member?.remaining || 0;
    if (amount > remaining + 0.01) {
      toast(`提账金额不能超过待提金额 ${formatMoney(Math.max(0, remaining))}`, 'error');
      return;
    }

    payouts.unshift({
      id: generateId(),
      partnerId,
      period,
      amount,
      date: $('#payout-date').value,
      notes: $('#payout-notes').value.trim(),
      createdAt: new Date().toISOString(),
    });

    markFormClean();
    persist();
    closePayoutModal();
    toast('提账已记录', 'success');
  }

  async function deletePayout(id) {
    const ok = await showConfirm('删除提账记录', '确定删除这条提账记录？');
    if (!ok) return;
    payouts = payouts.filter(p => p.id !== id);
    persist();
    toast('提账记录已删除', 'success');
  }

  function bindPaymentModal() {
    const overlay = $('#payment-modal-overlay');
    $('#payment-modal-close').addEventListener('click', closePaymentModal);
    $('#payment-cancel').addEventListener('click', closePaymentModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePaymentModal(); });

    $('#payment-form').addEventListener('submit', (e) => {
      e.preventDefault();
      confirmPayment();
    });

    $('#payment-full').addEventListener('click', () => {
      if (pendingPaymentRecord) $('#payment-amount').value = getPending(pendingPaymentRecord);
    });

    $('#payment-half').addEventListener('click', () => {
      if (pendingPaymentRecord) {
        const half = Math.round(getPending(pendingPaymentRecord) / 2 * 100) / 100;
        $('#payment-amount').value = half;
      }
    });
  }

  function bindDrawer() {
    $('#drawer-close').addEventListener('click', closeDrawer);
    $('#drawer-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'drawer-overlay') closeDrawer();
    });
  }

  function bindConfirm() {
    $('#confirm-cancel').addEventListener('click', () => closeConfirm(false));
    $('#confirm-ok').addEventListener('click', () => closeConfirm(true));
    $('#confirm-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'confirm-overlay') closeConfirm(false);
    });
  }

  let confirmResolve = null;

  function showConfirm(title, message) {
    return new Promise(resolve => {
      confirmResolve = resolve;
      $('#confirm-title').textContent = title;
      $('#confirm-message').textContent = message;
      lockScroll(true);
      $('#confirm-overlay').classList.remove('hidden');
      $('#confirm-ok').focus();
    });
  }

  function closeConfirm(result) {
    $('#confirm-overlay').classList.add('hidden');
    lockScroll(false);
    if (confirmResolve) confirmResolve(result);
    confirmResolve = null;
  }

  function markFormClean() {
    formDirty = false;
    currentFormType = null;
  }

  function markFormDirty(type) {
    formDirty = true;
    currentFormType = type;
  }

  async function confirmDirtyClose() {
    if (!formDirty) return true;
    if (confirmResolve) return false; // 已有确认框显示中
    const ok = await showConfirm('放弃修改', '表单中有未保存的内容，确定关闭？');
    if (!ok) lockScroll(true); // 用户取消：重新锁定滚动
    return ok;
  }

  function bindFilters() {
    $('#filter-search').addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(renderRecords, 200);
    });
    ['filter-status', 'filter-platform', 'filter-month', 'filter-sort'].forEach(id => {
      $(`#${id}`).addEventListener('change', renderRecords);
    });
    $('#btn-clear-filters').addEventListener('click', clearFilters);
  }

  function clearFilters() {
    $('#filter-search').value = '';
    $('#filter-status').value = '';
    $('#filter-platform').value = '';
    $('#filter-month').value = '';
    $('#filter-sort').value = 'date-desc';
    renderRecords();
  }

  function hasActiveFilters() {
    return $('#filter-search').value ||
      $('#filter-status').value ||
      $('#filter-platform').value ||
      $('#filter-month').value ||
      $('#filter-sort').value !== 'date-desc';
  }

  function bindSettings() {
    loadPartnerSettingsForm();

    $('#custom-platforms').value = settings.platforms.join(', ');
    $('#custom-payments').value = settings.payments.join(', ');
    $('#custom-categories').value = (settings.categories || DEFAULT_CATEGORIES).join(', ');

    ['partner-1-ratio', 'partner-2-ratio'].forEach(id => {
      $(`#${id}`)?.addEventListener('input', updateRatioHint);
    });

    $('#btn-save-settings').addEventListener('click', () => {
      settings.platforms = parseList($('#custom-platforms').value, DEFAULT_PLATFORMS);
      settings.payments = parseList($('#custom-payments').value, DEFAULT_PAYMENTS);
      settings.categories = parseList($('#custom-categories').value, DEFAULT_CATEGORIES);

      const p1ratio = parseFloat($('#partner-1-ratio').value) || 0;
      const p2ratio = parseFloat($('#partner-2-ratio').value) || 0;
      if (Math.round(p1ratio + p2ratio) !== 100) {
        toast('分成比例之和须为 100%', 'error');
        return;
      }
      settings.partners = [
        { id: 'p1', name: $('#partner-1-name').value.trim() || '成员 A', ratio: p1ratio },
        { id: 'p2', name: $('#partner-2-name').value.trim() || '成员 B', ratio: p2ratio },
      ];

      saveSettings(settings);
      populateSelects();
      renderSplit();
      renderSplitDashboard();
      toast('设置已保存', 'success');
    });

    $('#btn-export-json').addEventListener('click', () => exportJSON(records, expenses, payouts));
    $('#btn-export-csv').addEventListener('click', () => exportCSV(records, expenses));

    $('#btn-import').addEventListener('click', () => $('#import-file').click());
    $('#import-file').addEventListener('change', importData);

    $('#btn-clear').addEventListener('click', async () => {
      const ok = await showConfirm('清空所有数据', '确定清空所有收入、支出与分账数据？此操作不可恢复，建议先导出备份。');
      if (ok) {
        records = [];
        expenses = [];
        payouts = [];
        saveRecords(records);
        saveExpenses(expenses);
        savePayouts(payouts);
        persist();
        toast('数据已清空', 'success');
      }
    });
  }

  function loadPartnerSettingsForm() {
    const p = settings.partners || DEFAULT_PARTNERS;
    if ($('#partner-1-name')) $('#partner-1-name').value = p[0]?.name || '成员 A';
    if ($('#partner-1-ratio')) $('#partner-1-ratio').value = p[0]?.ratio ?? 50;
    if ($('#partner-2-name')) $('#partner-2-name').value = p[1]?.name || '成员 B';
    if ($('#partner-2-ratio')) $('#partner-2-ratio').value = p[1]?.ratio ?? 50;
    updateRatioHint();
  }

  function updateRatioHint() {
    const el = $('#ratio-hint');
    if (!el) return;
    const sum = (parseFloat($('#partner-1-ratio')?.value) || 0) + (parseFloat($('#partner-2-ratio')?.value) || 0);
    el.textContent = `当前比例合计：${sum}%`;
    el.classList.toggle('warn', sum !== 100);
  }

  function parseList(str, fallback) {
    const list = str.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    return list.length ? list : fallback;
  }

  function populateSelects() {
    const cats = settings.categories || DEFAULT_CATEGORIES;
    fillSelect('#field-platform', settings.platforms);
    fillSelect('#field-payment', settings.payments);
    fillSelect('#payment-method', settings.payments);
    fillSelect('#filter-platform', ['', ...settings.platforms], true);
    fillSelect('#expense-category', cats);
    fillSelect('#expense-payment', settings.payments);
    fillSelect('#expense-filter-category', ['', ...cats], true, '全部分类');

    const allDates = [...records.map(r => r.date), ...expenses.map(e => e.date)];
    const months = [...new Set(allDates.map(d => monthKey(d)))].sort().reverse();
    const monthHtml = '<option value="">全部月份</option>' +
      months.map(m => `<option value="${m}">${m.replace('-', '年')}月</option>`).join('');

    ['filter-month', 'expense-filter-month'].forEach(id => {
      const el = $(`#${id}`);
      const cur = el.value;
      el.innerHTML = monthHtml;
      if (cur) el.value = cur;
    });
  }

  function fillSelect(sel, options, skipFirst, firstLabel) {
    const el = $(sel);
    const current = el.value;
    el.innerHTML = options.map((o, i) => {
      if (skipFirst && i === 0) return `<option value="">${firstLabel || '全部平台'}</option>`;
      return `<option value="${o}">${o}</option>`;
    }).join('');
    if (current) el.value = current;
  }

  function isOverlayOpen() {
    return !$('#modal-overlay').classList.contains('hidden') ||
      !$('#expense-modal-overlay').classList.contains('hidden') ||
      !$('#payout-modal-overlay').classList.contains('hidden') ||
      !$('#payment-modal-overlay').classList.contains('hidden') ||
      !$('#drawer-overlay').classList.contains('hidden') ||
      !$('#confirm-overlay').classList.contains('hidden');
  }

  function lockScroll(lock) {
    if (lock) document.body.classList.add('modal-open');
    else if (!isOverlayOpen()) document.body.classList.remove('modal-open');
  }

  function openModal(record) {
    closeDrawer();
    const form = $('#record-form');
    form.reset();
    setDefaultDate();

    if (record) {
      $('#modal-title').textContent = '编辑项目';
      $('#record-id').value = record.id;
      $('#field-name').value = record.name;
      $('#field-client').value = record.client || '';
      $('#field-date').value = record.date;
      $('#field-end-date').value = record.endDate || '';
      $('#field-hours').value = record.hours || '';
      $('#field-amount').value = record.amount;
      const hasPayments = Array.isArray(record.payments) && record.payments.length > 0;
      const computedReceived = hasPayments
        ? record.payments.reduce((sum, p) => sum + (p.amount || 0), 0)
        : (record.received || 0);
      $('#field-received').value = computedReceived;
      $('#field-received').readOnly = hasPayments;
      $('#field-received').title = hasPayments ? '已到账金额由到账记录自动计算，不可手动修改' : '';
      $('#field-received').style.opacity = hasPayments ? '0.6' : '';
      $('#field-platform').value = record.platform || settings.platforms[0];
      $('#field-payment').value = record.paymentMethod || settings.payments[0];
      $('#field-notes').value = record.notes || '';
    } else {
      $('#modal-title').textContent = '新建项目';
      $('#record-id').value = '';
      $('#field-received').readOnly = false;
      $('#field-received').title = '';
      $('#field-received').style.opacity = '';
      $('#field-platform').value = settings.platforms[0];
      $('#field-payment').value = settings.payments[0];
    }

    updateFormPreview();
    markFormClean();
    lockScroll(true);
    $('#modal-overlay').classList.remove('hidden');
    setTimeout(() => $('#field-name').focus(), 100);
  }

  async function closeModal() {
    if (!await confirmDirtyClose()) return;
    markFormClean();
    $('#modal-overlay').classList.add('hidden');
    lockScroll(false);
  }

  function updateFormPreview() {
    const amount = parseFloat($('#field-amount').value) || 0;
    const received = parseFloat($('#field-received').value) || 0;
    const hours = parseFloat($('#field-hours').value) || 0;
    const pending = Math.max(0, amount - received);
    $('#preview-pending').textContent = formatMoney(pending);
    $('#preview-hourly').textContent = hours > 0 ? formatMoney(amount / hours) + '/h' : '—';

    const st = autoStatus({ amount, received, status: 'in_progress' });
    $('#status-preview').innerHTML = `<span class="badge badge-${st}">${STATUS_LABELS[st]}</span>`;
  }

  function saveRecord() {
    const id = $('#record-id').value;
    const data = {
      name: $('#field-name').value.trim(),
      client: $('#field-client').value.trim(),
      date: $('#field-date').value,
      endDate: $('#field-end-date').value || null,
      hours: parseFloat($('#field-hours').value) || 0,
      amount: parseFloat($('#field-amount').value) || 0,
      received: parseFloat($('#field-received').value) || 0,
      platform: $('#field-platform').value,
      paymentMethod: $('#field-payment').value,
      notes: $('#field-notes').value.trim(),
    };

    if (!data.name || !data.date) {
      toast('请填写项目名称和日期', 'error');
      return;
    }

    if (data.received > data.amount) {
      toast('已到账不能超过合同金额', 'error');
      return;
    }

    data.status = autoStatus(data);

    if (id) {
      const idx = records.findIndex(r => r.id === id);
      if (idx >= 0) {
        const existing = records[idx];
        const hasPayments = Array.isArray(existing.payments) && existing.payments.length > 0;
        const computedReceived = hasPayments
          ? existing.payments.reduce((sum, p) => sum + (p.amount || 0), 0)
          : data.received;
        records[idx] = { ...existing, ...data, received: computedReceived, updatedAt: new Date().toISOString() };
      }
    } else {
      records.unshift({
        ...data,
        id: generateId(),
        payments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    markFormClean();
    persist();
    closeModal();
    toast(id ? '项目已更新' : '项目已创建', 'success');
  }

  function openPaymentModal(record) {
    closeDrawer();
    pendingPaymentRecord = record;
    $('#payment-record-id').value = record.id;
    $('#payment-project-name').textContent = `${record.name} · 待收 ${formatMoney(getPending(record))}`;
    $('#payment-amount').value = getPending(record);
    $('#payment-date').value = new Date().toISOString().slice(0, 10);
    $('#payment-method').value = record.paymentMethod || settings.payments[0];
    markFormClean();
    lockScroll(true);
    $('#payment-modal-overlay').classList.remove('hidden');
    setTimeout(() => $('#payment-amount').focus(), 100);
  }

  async function closePaymentModal() {
    if (!await confirmDirtyClose()) return;
    markFormClean();
    $('#payment-modal-overlay').classList.add('hidden');
    pendingPaymentRecord = null;
    lockScroll(false);
  }

  function confirmPayment() {
    const id = $('#payment-record-id').value;
    const record = records.find(r => r.id === id);
    if (!record) return;

    const payAmount = parseFloat($('#payment-amount').value) || 0;
    if (payAmount <= 0) {
      toast('请输入有效金额', 'error');
      return;
    }

    const maxPending = getPending(record);
    if (payAmount > maxPending + 0.001) {
      toast(`最多可收 ${formatMoney(maxPending)}`, 'error');
      return;
    }

    if (!record.payments) record.payments = [];
    record.payments.push({
      amount: payAmount,
      date: $('#payment-date').value,
      method: $('#payment-method').value,
    });

    record.received = (record.received || 0) + payAmount;
    record.paymentMethod = $('#payment-method').value;
    record.status = autoStatus(record);
    record.updatedAt = new Date().toISOString();

    markFormClean();
    persist();
    closePaymentModal();
    toast(`到账 ${formatMoney(payAmount)} 已记录`, 'success');
  }

  async function deleteRecord(id) {
    const r = records.find(x => x.id === id);
    const ok = await showConfirm('删除项目', `确定删除「${r?.name || '此项目'}」？此操作不可恢复。`);
    if (!ok) return;
    records = records.filter(r => r.id !== id);
    closeDrawer();
    persist();
    toast('记录已删除', 'success');
  }

  function openDrawer(record) {
    const st = autoStatus(record);
    $('#drawer-title').textContent = record.name;
    const badge = $('#drawer-badge');
    badge.className = `badge badge-${st}`;
    badge.textContent = STATUS_LABELS[st];

    const pending = getPending(record);
    const hourly = record.hours > 0 ? formatMoney(record.amount / record.hours) : '—';

    $('#drawer-body').innerHTML = `
      <div class="detail-grid">
        <div class="detail-item"><label>客户</label><span>${esc(record.client || '—')}</span></div>
        <div class="detail-item"><label>平台</label><span>${esc(record.platform || '—')}</span></div>
        <div class="detail-item"><label>开始日期</label><span>${formatDate(record.date)}</span></div>
        <div class="detail-item"><label>结束日期</label><span>${record.endDate ? formatDate(record.endDate) : '—'}</span></div>
        <div class="detail-item"><label>工时</label><span>${record.hours || 0} 小时</span></div>
        <div class="detail-item"><label>时薪</label><span>${hourly}</span></div>
        <div class="detail-item"><label>合同金额</label><span>${formatMoney(record.amount)}</span></div>
        <div class="detail-item"><label>支付方式</label><span>${esc(record.paymentMethod || '—')}</span></div>
        <div class="detail-item"><label>已到账</label><span class="amount-received">${formatMoney(record.received || 0)}</span></div>
        <div class="detail-item"><label>未到账</label><span class="amount-pending">${formatMoney(pending)}</span></div>
      </div>
      ${record.notes ? `<div class="detail-notes">${esc(record.notes)}</div>` : ''}
      <div class="payment-history">
        <h4>到账记录</h4>
        ${renderPaymentHistory(record)}
      </div>
    `;

    const footer = $('#drawer-footer');
    footer.innerHTML = `
      ${pending > 0 ? `<button class="btn btn-primary" id="drawer-pay">记录到账</button>` : ''}
      <button class="btn btn-secondary" id="drawer-edit">编辑</button>
      <button class="btn btn-danger" id="drawer-delete">删除</button>
    `;

    footer.querySelector('#drawer-pay')?.addEventListener('click', () => openPaymentModal(record));
    footer.querySelector('#drawer-edit')?.addEventListener('click', () => openModal(record));
    footer.querySelector('#drawer-delete')?.addEventListener('click', () => deleteRecord(record.id));

    lockScroll(true);
    $('#drawer-overlay').classList.remove('hidden');
  }

  function renderPaymentHistory(record) {
    const payments = record.payments || [];
    if (!payments.length) {
      return '<p style="color:var(--text-muted);font-size:0.85rem">暂无到账记录</p>';
    }
    return payments.slice().reverse().map(p => `
      <div class="payment-history-item">
        <span>${formatDate(p.date)} · ${esc(p.method || '—')}</span>
        <strong class="amount-received">${formatMoney(p.amount)}</strong>
      </div>
    `).join('');
  }

  function closeDrawer() {
    $('#drawer-overlay').classList.add('hidden');
    lockScroll(false);
  }

  function persist() {
    saveRecords(records);
    saveExpenses(expenses);
    savePayouts(payouts);
    populateSelects();
    populatePeriodSelects();
    syncPeriodSelects();
    syncSplitPeriodSelects();
    renderCurrentView();
    flashSyncBadge();
  }

  function renderCurrentView() {
    if (currentView === 'records') renderRecords();
    else if (currentView === 'expenses') renderExpenses();
    else if (currentView === 'split') renderSplit();
    else if (currentView === 'analytics') renderAnalytics();
    else renderDashboard();
  }

  function renderAll() {
    renderDashboard();
    renderRecords();
    renderExpenses();
    renderSplit();
    renderAnalytics();
  }

  function getMonthRecords(period) {
    const key = period || dashboardPeriod;
    if (isYearlyView) {
      const year = parseMonthKey(key).year;
      return records.filter(r => isYear(r.date, year));
    }
    return records.filter(r => isMonth(r.date, key));
  }

  function getMonthExpenses(period) {
    const key = period || dashboardPeriod;
    if (isYearlyView) {
      const year = parseMonthKey(key).year;
      return expenses.filter(e => isYear(e.date, year));
    }
    return expenses.filter(e => isMonth(e.date, key));
  }

  function animateValue(el, target, formatter) {
    const start = parseFloat(el.dataset.animate) || 0;
    if (start === target) {
      el.textContent = formatter(target);
      return;
    }
    const duration = 600;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      el.textContent = formatter(current);
      if (progress < 1) requestAnimationFrame(tick);
      else {
        el.dataset.animate = target;
        el.textContent = formatter(target);
      }
    }
    requestAnimationFrame(tick);
  }

  function renderDashboard() {
    const periodRecords = getMonthRecords();
    const periodExpenses = getMonthExpenses();
    const totalIncome = periodRecords.reduce((s, r) => s + (r.amount || 0), 0);
    const totalReceived = periodRecords.reduce((s, r) => s + (r.received || 0), 0);
    const totalPending = periodRecords.reduce((s, r) => s + getPending(r), 0);
    const totalExpense = periodExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const netIncome = totalReceived - totalExpense;
    const totalHours = periodRecords.reduce((s, r) => s + (r.hours || 0), 0);
    const pendingCount = periodRecords.filter(r => getPending(r) > 0).length;
    const rate = totalIncome > 0 ? Math.round((totalReceived / totalIncome) * 100) : 0;
    const hourly = totalHours > 0 ? totalReceived / totalHours : 0;

    animateValue($('#stat-month-income'), totalIncome, v => formatMoney(v));
    $('#stat-month-projects').textContent = `${periodRecords.length} 个项目`;
    $('#stat-received').textContent = formatMoney(totalReceived);
    $('#stat-received-rate').textContent = `到账率 ${rate}%`;
    $('#stat-pending').textContent = formatMoney(totalPending);
    $('#stat-pending-count').textContent = isYearlyView ? '' : `${pendingCount} 笔待收`;
    $('#stat-expenses').textContent = formatMoney(totalExpense);
    $('#stat-expense-count').textContent = `${periodExpenses.length} 笔支出`;

    const netEl = $('#stat-net');
    netEl.textContent = formatMoney(netIncome);
    netEl.className = 'stat-value ' + (netIncome >= 0 ? 'net-positive' : 'net-negative');
    $('.stat-net').classList.toggle('negative', netIncome < 0);

    $('#stat-hours').textContent = totalHours + 'h';
    $('#stat-hourly').textContent = `时薪 ${formatMoney(hourly)}`;
    $('#stat-progress-fill').style.width = rate + '%';

    renderRecentList();
    renderPendingList();
    renderRecentExpenses();
    renderSplitDashboard();
  }

  function renderSplitDashboard() {
    const el = $('#split-dashboard-body');
    if (!el) return;
    const label = formatPeriodLabel(dashboardPeriod, isYearlyView);
    $('#split-dashboard-title').textContent = `两人分账 · ${label}`;

    const data = getSplitData();
    const [m1, m2] = data.members;

    el.innerHTML = `
      <div class="split-dashboard-stat">
        <div class="label">团队日均净收益</div>
        <div class="value">${formatMoney(data.teamDailyNet)}</div>
      </div>
      <div class="split-dashboard-stat">
        <div class="label">${esc(m1?.name || '成员 A')} 日均</div>
        <div class="value net-positive">${formatMoney(m1?.dailyShare || 0)}</div>
      </div>
      <div class="split-dashboard-stat">
        <div class="label">${esc(m2?.name || '成员 B')} 日均</div>
        <div class="value net-positive">${formatMoney(m2?.dailyShare || 0)}</div>
      </div>
    `;
  }

  function renderSplit() {
    if (!$('#split-members-grid')) return;

    const label = formatPeriodLabel(dashboardPeriod, isYearlyView);
    const data = getSplitData();
    const dayLabel = isYearlyView
      ? `共 ${data.days} 天`
      : (dashboardPeriod === currentMonthKey()
        ? `本月前 ${data.days} 天`
        : `共 ${data.days} 天`);

    $('#split-summary-bar').innerHTML = `
      <div class="split-summary-item">
        <div class="label">可分配净收益</div>
        <div class="value ${data.net >= 0 ? 'net-positive' : 'net-negative'}">${formatMoney(data.net)}</div>
        <div class="meta">已到账 ${formatMoney(data.received)} − 支出 ${formatMoney(data.expense)}</div>
      </div>
      <div class="split-summary-item">
        <div class="label">团队日均</div>
        <div class="value">${formatMoney(data.teamDailyNet)}</div>
        <div class="meta">${dayLabel}</div>
      </div>
      <div class="split-summary-item">
        <div class="label">已提账</div>
        <div class="value">${formatMoney(data.totalPaidOut)}</div>
        <div class="meta">待提 ${formatMoney(data.totalRemaining)}</div>
      </div>
      <div class="split-summary-item">
        <div class="label">待收款（不分账）</div>
        <div class="value pending">${formatMoney(data.pending)}</div>
        <div class="meta">到账后再参与分配</div>
      </div>
    `;

    $('#split-members-grid').innerHTML = data.members.map(m => `
      <article class="split-member-card">
        <div class="split-member-header">
          <h4>${esc(m.name)}</h4>
          <span class="split-member-ratio">${m.ratio}%</span>
        </div>
        <div class="split-member-stats">
          <div class="split-member-stat">
            <label>应得（${label}）</label>
            <span class="highlight ${m.share >= 0 ? 'net-positive' : 'net-negative'}">${formatMoney(m.share)}</span>
          </div>
          <div class="split-member-stat">
            <label>日均应得</label>
            <span class="highlight">${formatMoney(m.dailyShare)}</span>
          </div>
          <div class="split-member-stat">
            <label>已提账</label>
            <span>${formatMoney(m.paidOut)}</span>
          </div>
          <div class="split-member-stat">
            <label>待提</label>
            <span class="${m.remaining > 0 ? 'amount-pending' : ''}">${formatMoney(m.remaining)}</span>
          </div>
        </div>
        <div class="split-member-actions">
          <button class="btn btn-primary btn-sm" data-payout="${m.id}">记录提账</button>
        </div>
      </article>
    `).join('');

    $('#split-members-grid').querySelectorAll('[data-payout]').forEach(btn => {
      btn.addEventListener('click', () => openPayoutModal(btn.dataset.payout, dashboardPeriod));
    });

    const payoutEl = $('#payout-list');
    const partnerMap = Object.fromEntries(settings.partners.map(p => [p.id, p.name]));

    if (!data.payouts.length) {
      payoutEl.innerHTML = '<div class="empty-mini">暂无提账记录</div>';
      return;
    }

    payoutEl.innerHTML = data.payouts.map(p => `
      <div class="payout-item">
        <div class="payout-item-info">
          <strong>${esc(partnerMap[p.partnerId] || '—')} · ${formatMoney(p.amount)}</strong>
          <span>${formatDate(p.date)}${p.notes ? ' · ' + esc(p.notes) : ''}</span>
        </div>
        <button class="icon-btn danger" data-delete-payout="${p.id}" title="删除">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `).join('');

    payoutEl.querySelectorAll('[data-delete-payout]').forEach(btn => {
      btn.addEventListener('click', () => deletePayout(btn.dataset.deletePayout));
    });
  }

  function renderRecentList() {
    const el = $('#recent-list');
    const periodRecords = getMonthRecords();
    const recent = [...periodRecords].sort((a, b) => b.date.localeCompare(a.date));
    const label = formatPeriodLabel(dashboardPeriod, isYearlyView);
    if (!recent.length) {
      el.innerHTML = `<div class="empty-mini">${periodRecords.length === 0 && records.length > 0 ? `${label}暂无项目` : '暂无项目，点击「新建项目」开始记录'}</div>`;
      return;
    }
    el.innerHTML = recent.map(r => `
      <div class="recent-item" data-id="${r.id}" tabindex="0">
        <div class="item-info">
          <h4>${esc(r.name)}</h4>
          <p>${formatDate(r.date)} · ${r.hours || 0}h · ${esc(r.platform || '—')}</p>
        </div>
        <div class="item-amount">
          <strong>${formatMoney(r.amount)}</strong>
          <span>${STATUS_LABELS[autoStatus(r)]}</span>
        </div>
      </div>
    `).join('');

    bindListItems(el, '.recent-item', (r) => openDrawer(r));
  }

  function renderPendingList() {
    const el = $('#pending-list');
    const year = parseMonthKey(dashboardPeriod).year;
    const filterFn = isYearlyView
      ? (r) => getPending(r) > 0 && isYear(r.date, year)
      : (r) => getPending(r) > 0;
    const pending = records.filter(filterFn).sort((a, b) => b.date.localeCompare(a.date));
    if (!pending.length) {
      el.innerHTML = '<div class="empty-mini">暂无待收款项目 🎉</div>';
      return;
    }
    el.innerHTML = pending.map(r => `
      <div class="pending-item" data-id="${r.id}" tabindex="0">
        <div class="item-info">
          <h4>${esc(r.name)}</h4>
          <p>${esc(r.client || '—')} · ${formatDate(r.date)}</p>
        </div>
        <div class="item-amount">
          <strong class="amount-pending">${formatMoney(getPending(r))}</strong>
          <span>待收</span>
        </div>
      </div>
    `).join('');

    bindListItems(el, '.pending-item', (r) => openPaymentModal(r));
  }

  function renderRecentExpenses() {
    const el = $('#recent-expenses');
    const periodExpenses = getMonthExpenses();
    const recent = [...periodExpenses].sort((a, b) => b.date.localeCompare(a.date));
    const label = formatPeriodLabel(dashboardPeriod, isYearlyView);
    if (!recent.length) {
      el.innerHTML = `<div class="empty-mini">${periodExpenses.length === 0 && expenses.length > 0 ? `${label}暂无支出` : '暂无支出，点击「记一笔支出」'}</div>`;
      return;
    }
    el.innerHTML = recent.map(e => `
      <div class="recent-item expense-item" data-id="${e.id}" tabindex="0">
        <div class="item-info">
          <h4>${esc(e.title)}</h4>
          <p>${formatDate(e.date)} · ${esc(e.category || '—')}</p>
        </div>
        <div class="item-amount">
          <strong class="amount-expense">${formatMoney(e.amount)}</strong>
          <span>${esc(e.paymentMethod || '')}</span>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('.expense-item').forEach(item => {
      item.addEventListener('click', () => {
        const e = expenses.find(x => x.id === item.dataset.id);
        if (e) openExpenseModal(e);
      });
    });
  }

  function bindListItems(container, selector, handler) {
    container.querySelectorAll(selector).forEach(item => {
      const click = () => {
        const r = records.find(x => x.id === item.dataset.id);
        if (r) handler(r);
      };
      item.addEventListener('click', click);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') click();
      });
    });
  }

  function flashSyncBadge() {
    const dot = $('.sync-dot');
    if (!dot) return;
    dot.style.animation = 'none';
    dot.offsetHeight;
    dot.style.animation = 'pulse 0.6s ease 2';
  }

  function getFilteredRecords() {
    const search = $('#filter-search').value.toLowerCase();
    const status = $('#filter-status').value;
    const platform = $('#filter-platform').value;
    const month = $('#filter-month').value;
    const sort = $('#filter-sort').value;

    let filtered = records.filter(r => {
      if (search && !`${r.name} ${r.client} ${r.notes}`.toLowerCase().includes(search)) return false;
      if (status && autoStatus(r) !== status) {
        if (status === 'pending' && autoStatus(r) === 'partial') { /* 含部分到账：仍有待收款 */ }
        else return false;
      }
      if (platform && r.platform !== platform) return false;
      if (month && monthKey(r.date) !== month) return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (sort) {
        case 'date-asc': return a.date.localeCompare(b.date);
        case 'amount-desc': return (b.amount || 0) - (a.amount || 0);
        case 'pending-desc': return getPending(b) - getPending(a);
        default: return b.date.localeCompare(a.date);
      }
    });

    return filtered;
  }

  function renderRecordRow(r) {
    const st = autoStatus(r);
    return `
      <tr data-id="${r.id}">
        <td class="cell-project">
          <strong>${esc(r.name)}</strong>
          <span>${esc(r.client || '')}</span>
        </td>
        <td>${formatDate(r.date)}${r.endDate ? '<br><small style="color:var(--text-muted)">至 ' + formatDate(r.endDate) + '</small>' : ''}</td>
        <td>${r.hours || 0}h</td>
        <td>${formatMoney(r.amount)}</td>
        <td class="amount-received">${formatMoney(r.received || 0)}</td>
        <td class="amount-pending">${formatMoney(getPending(r))}</td>
        <td class="cell-platform">${esc(r.platform || '—')}<small>${esc(r.paymentMethod || '')}</small></td>
        <td><span class="badge badge-${st}">${STATUS_LABELS[st]}</span></td>
        <td>
          <div class="row-actions">
            ${getPending(r) > 0 ? `<button title="记录到账" data-action="pay"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></button>` : ''}
            <button title="编辑" data-action="edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button title="删除" data-action="delete" class="danger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
        </td>
      </tr>
    `;
  }

  function renderRecordCard(r) {
    const st = autoStatus(r);
    return `
      <div class="record-card" data-id="${r.id}" tabindex="0">
        <div class="record-card-top">
          <div>
            <h4>${esc(r.name)}</h4>
            <p>${esc(r.client || '—')} · ${formatDate(r.date)}</p>
          </div>
          <span class="badge badge-${st}">${STATUS_LABELS[st]}</span>
        </div>
        <div class="record-card-amounts">
          <div><label>合同</label><span>${formatMoney(r.amount)}</span></div>
          <div><label>已收</label><span class="amount-received">${formatMoney(r.received || 0)}</span></div>
          <div><label>待收</label><span class="amount-pending">${formatMoney(getPending(r))}</span></div>
        </div>
        <div class="record-card-footer">
          <span>${r.hours || 0}h · ${esc(r.platform || '—')}</span>
          <span>${esc(r.paymentMethod || '')}</span>
        </div>
      </div>
    `;
  }

  function bindRecordActions(container) {
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.closest('[data-id]').dataset.id;
        const r = records.find(x => x.id === id);
        if (!r) return;
        if (btn.dataset.action === 'edit') openModal(r);
        else if (btn.dataset.action === 'delete') deleteRecord(id);
        else if (btn.dataset.action === 'pay') openPaymentModal(r);
      });
    });

    container.querySelectorAll('tr[data-id], .record-card[data-id]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]')) return;
        const r = records.find(x => x.id === row.dataset.id);
        if (r) openDrawer(r);
      });
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const r = records.find(x => x.id === row.dataset.id);
          if (r) openDrawer(r);
        }
      });
    });
  }

  function renderRecords() {
    const filtered = getFilteredRecords();
    const tbody = $('#records-body');
    const cards = $('#records-cards');
    const empty = $('#records-empty');
    const tableWrap = $('.records-table-wrap');
    const hasFilters = hasActiveFilters();

    $('#btn-clear-filters').classList.toggle('hidden', !hasFilters);
    $('#records-count').textContent = records.length
      ? (filtered.length === records.length ? `共 ${records.length} 条` : `显示 ${filtered.length} / ${records.length} 条`)
      : '共 0 条';

    if (!records.length) {
      tbody.innerHTML = '';
      cards.innerHTML = '';
      tableWrap.classList.add('hidden');
      cards.classList.add('hidden');
      empty.classList.remove('hidden');
      $('#records-empty-text').textContent = '暂无项目记录，开始记录你的第一单吧';
      return;
    }

    if (!filtered.length) {
      tbody.innerHTML = '';
      cards.innerHTML = '';
      tableWrap.classList.add('hidden');
      cards.classList.add('hidden');
      empty.classList.remove('hidden');
      $('#records-empty-text').textContent = '没有匹配的筛选结果';
      return;
    }

    empty.classList.add('hidden');
    tableWrap.classList.remove('hidden');
    cards.classList.remove('hidden');

    tbody.innerHTML = filtered.map(renderRecordRow).join('');
    cards.innerHTML = filtered.map(renderRecordCard).join('');

    bindRecordActions(tbody);
    bindRecordActions(cards);
  }

  function getFilteredExpenses() {
    const search = $('#expense-search').value.toLowerCase();
    const category = $('#expense-filter-category').value;
    const month = $('#expense-filter-month').value;
    const sort = $('#expense-filter-sort').value;

    let filtered = expenses.filter(e => {
      if (search && !`${e.title} ${e.notes} ${e.category}`.toLowerCase().includes(search)) return false;
      if (category && e.category !== category) return false;
      if (month && monthKey(e.date) !== month) return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (sort) {
        case 'date-asc': return a.date.localeCompare(b.date);
        case 'amount-desc': return (b.amount || 0) - (a.amount || 0);
        default: return b.date.localeCompare(a.date);
      }
    });

    return filtered;
  }

  function hasActiveExpenseFilters() {
    return $('#expense-search').value ||
      $('#expense-filter-category').value ||
      $('#expense-filter-month').value ||
      $('#expense-filter-sort').value !== 'date-desc';
  }

  function renderExpenseRow(e) {
    return `
      <tr data-id="${e.id}">
        <td class="cell-project"><strong>${esc(e.title)}</strong></td>
        <td>${formatDate(e.date)}</td>
        <td><span class="badge-category">${esc(e.category || '—')}</span></td>
        <td class="amount-expense">${formatMoney(e.amount)}</td>
        <td>${esc(e.paymentMethod || '—')}</td>
        <td style="color:var(--text-muted);font-size:0.82rem;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.notes || '—')}</td>
        <td>
          <div class="row-actions">
            <button title="编辑" data-action="edit-expense"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button title="删除" data-action="delete-expense" class="danger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
        </td>
      </tr>
    `;
  }

  function renderExpenseCard(e) {
    return `
      <div class="record-card" data-id="${e.id}" tabindex="0">
        <div class="record-card-top">
          <div>
            <h4>${esc(e.title)}</h4>
            <p>${formatDate(e.date)} · ${esc(e.paymentMethod || '—')}</p>
          </div>
          <span class="badge-category">${esc(e.category || '—')}</span>
        </div>
        <div class="record-card-amounts" style="grid-template-columns:1fr">
          <div style="text-align:left"><label>金额</label><span class="amount-expense">${formatMoney(e.amount)}</span></div>
        </div>
        ${e.notes ? `<div class="record-card-footer"><span>${esc(e.notes)}</span></div>` : ''}
      </div>
    `;
  }

  function bindExpenseActions(container) {
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const id = btn.closest('[data-id]').dataset.id;
        const e = expenses.find(x => x.id === id);
        if (!e) return;
        if (btn.dataset.action === 'edit-expense') openExpenseModal(e);
        else if (btn.dataset.action === 'delete-expense') deleteExpense(id);
      });
    });
    container.querySelectorAll('tr[data-id], .record-card[data-id]').forEach(row => {
      row.addEventListener('click', (ev) => {
        if (ev.target.closest('[data-action]')) return;
        const e = expenses.find(x => x.id === row.dataset.id);
        if (e) openExpenseModal(e);
      });
    });
  }

  function renderExpenses() {
    const filtered = getFilteredExpenses();
    const tbody = $('#expenses-body');
    const cards = $('#expenses-cards');
    const empty = $('#expenses-empty');
    const tableWrap = $('#view-expenses .records-table-wrap');

    $('#btn-clear-expense-filters').classList.toggle('hidden', !hasActiveExpenseFilters());

    const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);
    $('#expenses-count').textContent = expenses.length
      ? (filtered.length === expenses.length ? `共 ${expenses.length} 条` : `显示 ${filtered.length} / ${expenses.length} 条`)
      : '共 0 条';
    $('#expenses-total').textContent = filtered.length ? `合计 ${formatMoney(total)}` : '';

    if (!expenses.length) {
      tbody.innerHTML = '';
      cards.innerHTML = '';
      tableWrap.classList.add('hidden');
      cards.classList.add('hidden');
      empty.classList.remove('hidden');
      $('#expenses-empty-text').textContent = '暂无支出记录，开始记录你的第一笔支出吧';
      return;
    }

    if (!filtered.length) {
      tbody.innerHTML = '';
      cards.innerHTML = '';
      tableWrap.classList.add('hidden');
      cards.classList.add('hidden');
      empty.classList.remove('hidden');
      $('#expenses-empty-text').textContent = '没有匹配的筛选结果';
      return;
    }

    empty.classList.add('hidden');
    tableWrap.classList.remove('hidden');
    cards.classList.remove('hidden');

    tbody.innerHTML = filtered.map(renderExpenseRow).join('');
    cards.innerHTML = filtered.map(renderExpenseCard).join('');
    bindExpenseActions(tbody);
    bindExpenseActions(cards);
  }

  function renderAnalytics() {
    renderMonthlyChart();
    renderDonutChart('#chart-platform', groupBy(records, 'platform'), '平台');
    renderDonutChart('#chart-payment', groupBy(records, 'paymentMethod'), '支付方式');
    renderDonutChart('#chart-expense', groupByExpenses(expenses, 'category'), '支出');
    renderYearSummary();
  }

  function groupByExpenses(arr, key) {
    const map = {};
    arr.forEach(e => {
      const k = e[key] || '未分类';
      map[k] = (map[k] || 0) + (e.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }

  function groupBy(arr, key) {
    const map = {};
    arr.forEach(r => {
      const k = r[key] || '未指定';
      map[k] = (map[k] || 0) + (r.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }

  function renderMonthlyChart() {
    const el = $('#chart-monthly');
    const now = new Date();
    const months = [];
    if (isYearlyView) {
      const year = parseMonthKey(dashboardPeriod).year;
      for (let m = 1; m <= 12; m++) {
        months.push(`${year}-${String(m).padStart(2, '0')}`);
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    }

    const data = months.map(m => {
      const monthRecords = records.filter(r => monthKey(r.date) === m);
      const monthExpenses = expenses.filter(e => monthKey(e.date) === m);
      const received = monthRecords.reduce((s, r) => s + (r.received || 0), 0);
      const pending = monthRecords.reduce((s, r) => s + getPending(r), 0);
      const expenseTotal = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
      return { month: m, received, pending, expenseTotal, total: received + pending + expenseTotal };
    });

    const maxTotal = Math.max(...data.map(d => Math.max(d.received + d.pending, d.expenseTotal)), 1);

    if (!data.some(d => d.received + d.pending + d.expenseTotal > 0)) {
      el.innerHTML = '<div class="empty-mini">暂无收支数据，添加记录后这里会显示趋势</div>';
      return;
    }

    el.innerHTML = `<div class="bar-chart">${data.map((d, i) => {
      const recH = (d.received / maxTotal) * 100;
      const penH = (d.pending / maxTotal) * 100;
      const expH = (d.expenseTotal / maxTotal) * 100;
      const label = months.length > 6
        ? parseInt(d.month.slice(5)) + '月'
        : d.month.slice(5) + '月';
      const incomeStack = d.received + d.pending;
      return `
        <div class="bar-group" style="animation: fadeUp 0.4s ease ${i * 0.06}s both">
          <div class="bar-value">${d.received + d.pending + d.expenseTotal > 0 ? formatMoney(d.received + d.pending - d.expenseTotal) : ''}</div>
          <div style="display:flex;gap:4px;align-items:flex-end;height:100%;justify-content:center;width:100%">
            <div class="bar-stack" style="height:${Math.max(recH + penH, incomeStack > 0 ? 4 : 0)}%;max-width:22px">
              ${d.received > 0 ? `<div class="bar-received" style="height:${recH / (recH + penH || 1) * 100}%"></div>` : ''}
              ${d.pending > 0 ? `<div class="bar-pending" style="height:${penH / (recH + penH || 1) * 100}%"></div>` : ''}
            </div>
            ${d.expenseTotal > 0 ? `<div class="bar-stack" style="height:${Math.max(expH, 4)}%;max-width:22px"><div class="bar-expense" style="height:100%"></div></div>` : ''}
          </div>
          <div class="bar-label">${label}</div>
        </div>
      `;
    }).join('')}</div>`;
  }

  function renderDonutChart(selector, data, emptyLabel) {
    const el = $(selector);
    if (!data.length) {
      el.innerHTML = `<div class="empty-mini">暂无${emptyLabel}数据</div>`;
      return;
    }
    const total = data.reduce((s, [, v]) => s + v, 0);
    el.innerHTML = `<div class="donut-list">${data.map(([label, value], i) => {
      const pct = Math.round((value / total) * 100);
      const color = CHART_COLORS[i % CHART_COLORS.length];
      return `
        <div class="donut-item" style="animation: fadeUp 0.35s ease ${i * 0.05}s both">
          <span class="donut-label">${esc(label)}</span>
          <div class="donut-bar"><div class="donut-fill" style="width:${pct}%;background:${color}"></div></div>
          <span class="donut-value">${formatMoney(value)}</span>
          <span class="donut-percent">${pct}%</span>
        </div>
      `;
    }).join('')}</div>`;
  }

  function renderYearSummary() {
    const el = $('#year-summary');
    const year = isYearlyView ? parseMonthKey(dashboardPeriod).year : new Date().getFullYear();
    const yearRecords = records.filter(r => isYear(r.date, year));
    const yearExpenses = expenses.filter(e => isYear(e.date, year));

    const totalAmount = yearRecords.reduce((s, r) => s + (r.amount || 0), 0);
    const totalReceived = yearRecords.reduce((s, r) => s + (r.received || 0), 0);
    const totalExpense = yearExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const net = totalReceived - totalExpense;
    const totalHours = yearRecords.reduce((s, r) => s + (r.hours || 0), 0);
    const avgHourly = totalHours > 0 ? totalReceived / totalHours : 0;

    el.innerHTML = `
      <div class="year-stat"><div class="label">${year} 已到账</div><div class="value" style="color:var(--received)">${formatMoney(totalReceived)}</div></div>
      <div class="year-stat"><div class="label">总支出</div><div class="value" style="color:var(--expense)">${formatMoney(totalExpense)}</div></div>
      <div class="year-stat"><div class="label">净收益</div><div class="value" style="color:${net >= 0 ? 'var(--received)' : 'var(--expense)'}">${formatMoney(net)}</div></div>
      <div class="year-stat"><div class="label">平均时薪</div><div class="value">${formatMoney(avgHourly)}</div></div>
    `;
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) {
          records = data;
          expenses = [];
          payouts = [];
        } else if (data && Array.isArray(data.records)) {
          records = data.records;
          expenses = Array.isArray(data.expenses) ? data.expenses : [];
          payouts = Array.isArray(data.payouts) ? data.payouts : [];
          if (data.settings) {
            settings = ensurePartners({ ...settings, ...data.settings });
            saveSettings(settings);
            loadPartnerSettingsForm();
          }
        } else {
          throw new Error('invalid');
        }
        saveRecords(records);
        saveExpenses(expenses);
        savePayouts(payouts);
        persist();
        toast(`已导入 ${records.length} 条收入、${expenses.length} 条支出`, 'success');
      } catch (_) {
        toast('导入失败，请检查文件格式', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function toast(msg, type = '') {
    const container = $('#toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '·';
    el.innerHTML = `<span>${icon}</span><span>${esc(msg)}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast-out');
      setTimeout(() => el.remove(), 250);
    }, 2800);
  }

  function esc(str) {
    if (str == null || str === '') return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
