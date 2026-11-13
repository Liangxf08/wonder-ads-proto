/* 投放系统 · 用户管理
 * 查询才刷表；重置立即重查。账号 / 昵称 / 部门只读。
 * 飞书离职直接禁用并保留部门、角色、数据组。审核勾选提交后同步清空这些关联。
 */
(function () {
  'use strict';

  var UI = window.ProductUI;
  if (!UI) return;

  var $ = UI.$;
  var escapeHtml = UI.escapeHtml;

  var DEPARTMENTS = [
    '人力行政部', '财务部', '总经办', '商务+直播+漫剧', '海外发行', '国内发行',
    '苹果组', '无花果', '奇异果', '坚果组', '硕果组', '研发组', '发行组'
  ];
  var ROLES = ['管理员', '海外负责人', '海外投放', '海外素材', '财务审计', '数据管理', '开发测试'];
  var DATA_GROUPS = [
    '全部账户', 'APP投放一组', 'APP投放二组', 'APP投放三组',
    'TT投放一组', 'TT投放二组', 'TT投放三组', '素材组', '开发测试'
  ];
  var ASSIGN_ROLES = ROLES.filter(function (name) { return name !== '开发测试'; });
  var ASSIGN_GROUPS = DATA_GROUPS.filter(function (name) { return name !== '开发测试'; });
  var NICKNAMES = Array.from({ length: 24 }, function (_, i) {
    return '用户' + String.fromCharCode(65 + i);
  });
  var SAMPLE_LOGS = [
    { operator: '用户A', time: '2026-08-10 09:30:00', type: '编辑角色', from: '-', to: '海外投放' },
    { operator: '用户A', time: '2026-08-11 09:30:00', type: '编辑数据组', from: '-', to: 'APP投放一组' },
    { operator: '用户A', time: '2026-08-12 09:30:00', type: '扮演用户', from: '-', to: '-' },
    { operator: '用户A', time: '2026-08-13 09:30:00', type: '编辑角色', from: '海外投放', to: '海外投放,权限配置' },
    { operator: '用户A', time: '2026-08-14 09:30:00', type: '编辑数据组', from: 'APP投放一组', to: '全部账户' },
    { operator: '用户A', time: '2026-08-15 09:30:00', type: '同步状态', from: '启用', to: '禁用' }
  ];

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function formatDateTime(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function pick(arr, i) {
    return arr[((i % arr.length) + arr.length) % arr.length];
  }

  function makeAccount(i) {
    var base = String(100033445740015 + i * 137 + (i % 9) * 1000003);
    if (base.length < 14) base = (base + '00000000000000').slice(0, 14);
    if (base.length > 16) base = base.slice(0, 16);
    return '01' + base;
  }

  function joinList(list) {
    return (list && list.length) ? list.join(', ') : '-';
  }

  function sameList(a, b) {
    var left = (a || []).slice().sort().join('\u0001');
    var right = (b || []).slice().sort().join('\u0001');
    return left === right;
  }

  function displayList(list) {
    return (list && list.length) ? list.join(', ') : '空';
  }

  function buildMockRows(count) {
    var list = [];
    var i;
    for (i = 0; i < count; i++) {
      var depts = [pick(DEPARTMENTS, i)];
      if (i % 5 === 2) depts.push(pick(DEPARTMENTS, i + 3));
      var roles = i % 4 === 1 ? [] : [pick(ASSIGN_ROLES, i)];
      if (i % 7 === 0 && roles.length) roles.push(pick(ASSIGN_ROLES, i + 2));
      var groups = i % 4 === 0 ? [] : [pick(ASSIGN_GROUPS, i)];
      if (i % 11 === 0) groups = [pick(ASSIGN_GROUPS, i), pick(ASSIGN_GROUPS, i + 3)];
      var updated = new Date(2026, 7, 10, 9, 30, 4);
      updated.setMinutes(updated.getMinutes() - i * 17);
      updated.setSeconds((i * 7) % 60);
      var created = new Date(updated.getTime());
      created.setDate(created.getDate() - (12 + (i % 20)));
      created.setHours(10, (i * 3) % 60, (i * 11) % 60);
      var employment = '在职';
      var status = '启用';
      var pendingSync = false;
      var syncedAt = '';
      if (i % 8 === 3) {
        status = '禁用';
        employment = '离职';
        pendingSync = true;
        var pendingAt = new Date(updated.getTime());
        pendingAt.setHours(pendingAt.getHours() - 6);
        syncedAt = formatDateTime(pendingAt);
      } else if (i % 9 === 0) {
        status = '禁用';
        depts = [];
        roles = [];
        groups = [];
        if (i % 18 === 0) {
          employment = '离职';
          var approvedSync = new Date(updated.getTime());
          approvedSync.setHours(approvedSync.getHours() - 30);
          syncedAt = formatDateTime(approvedSync);
        }
      }
      list.push({
        id: 'u-' + (i + 1),
        nickname: pick(NICKNAMES, i),
        account: makeAccount(i),
        departments: depts,
        roles: roles,
        dataGroups: groups,
        employment: employment,
        employmentSyncedAt: syncedAt,
        pendingSync: pendingSync,
        status: status,
        updatedAt: formatDateTime(updated),
        createdAt: formatDateTime(created)
      });
    }
    return list;
  }

  var ALL_ROWS = buildMockRows(24);
  var EDIT_LOGS = {};
  var LOG_STORE_KEY = 'delivery.user-logs';

  function currentOperator() {
    var shell = window.DeliveryShell;
    var user = shell && shell.currentUser ? shell.currentUser() : null;
    return (user && user.nickname) || '用户A';
  }

  function navigationType() {
    var entries = window.performance && performance.getEntriesByType
      ? performance.getEntriesByType('navigation')
      : [];
    return entries[0] && entries[0].type;
  }

  function readSessionLogs() {
    try {
      var raw = sessionStorage.getItem(LOG_STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      return {};
    }
  }

  function writeSessionLogs(data) {
    try { sessionStorage.setItem(LOG_STORE_KEY, JSON.stringify(data)); } catch (err) {}
  }

  function clearSessionLogsIfReload() {
    if (navigationType() !== 'reload') return;
    try { sessionStorage.removeItem(LOG_STORE_KEY); } catch (err) {}
  }

  function saveSessionLog(userId, entry) {
    var data = readSessionLogs();
    if (!data[userId]) data[userId] = [];
    data[userId].unshift(entry);
    writeSessionLogs(data);
  }

  function restoreSessionLogs() {
    var data = readSessionLogs();
    Object.keys(data).forEach(function (userId) {
      var list = data[userId] || [];
      if (!EDIT_LOGS[userId]) EDIT_LOGS[userId] = [];
      var i;
      for (i = list.length - 1; i >= 0; i -= 1) EDIT_LOGS[userId].unshift(list[i]);
    });
  }

  function logText(value) {
    if (value == null || value === '' || value === '空') return '-';
    return String(value);
  }

  function pushEditLog(userId, type, from, to, operator, time, persist) {
    var entry = {
      time: time || formatDateTime(new Date()),
      operator: operator || currentOperator(),
      type: type,
      from: logText(from),
      to: logText(to)
    };
    if (!EDIT_LOGS[userId]) EDIT_LOGS[userId] = [];
    EDIT_LOGS[userId].unshift(entry);
    if (persist) saveSessionLog(userId, entry);
  }

  function seedSampleLogs(row) {
    SAMPLE_LOGS.forEach(function (item) {
      pushEditLog(row.id, item.type, item.from, item.to, item.operator, item.time);
    });
  }

  clearSessionLogsIfReload();
  ALL_ROWS.forEach(seedSampleLogs);
  restoreSessionLogs();

  var state = {
    draft: {
      nickname: '',
      departments: [],
      roles: [],
      dataGroups: [],
      status: ''
    },
    applied: null,
    page: 1,
    pageSize: 20,
    editId: null,
    editRoles: [],
    editDataGroups: [],
    impersonateId: null,
    reviewSelected: {},
    logUserId: null,
    logType: '',
    logPage: 1,
    logPageSize: 20,
    paginationBound: false,
    logPaginationBound: false
  };

  function applyFilters() {
    state.applied = {
      nickname: (state.draft.nickname || '').trim(),
      departments: (state.draft.departments || []).slice(),
      roles: (state.draft.roles || []).slice(),
      dataGroups: (state.draft.dataGroups || []).slice(),
      status: state.draft.status || ''
    };
    state.page = 1;
  }

  function byCreatedDesc(a, b) {
    if (a.createdAt === b.createdAt) return 0;
    return a.createdAt < b.createdAt ? 1 : -1;
  }

  function getFilteredRows() {
    var f = state.applied;
    var rows = !f ? ALL_ROWS.slice() : ALL_ROWS.filter(function (row) {
      if (f.nickname && row.nickname.indexOf(f.nickname) === -1) return false;
      if (f.departments.length && !f.departments.some(function (d) { return row.departments.indexOf(d) !== -1; })) return false;
      if (f.roles.length && !f.roles.some(function (r) { return row.roles.indexOf(r) !== -1; })) return false;
      if (f.dataGroups.length && !f.dataGroups.some(function (g) { return row.dataGroups.indexOf(g) !== -1; })) return false;
      if (f.status && row.status !== f.status) return false;
      return true;
    });
    return rows.sort(byCreatedDesc);
  }

  var deptFilter = UI.bindMultiSelect({
    wrapId: 'deptWrap',
    triggerId: 'deptTrigger',
    panelId: 'deptPanel',
    labelId: 'deptLabel',
    listId: 'deptList',
    selectedId: 'deptSelected',
    searchId: 'deptSearch',
    countId: 'deptCount',
    selectAllId: 'deptSelectAll',
    clearId: 'deptPanelClear',
    prefix: '部门：',
    getOptions: function () { return DEPARTMENTS; },
    getSelected: function () { return state.draft.departments; },
    setSelected: function (arr) { state.draft.departments = arr; }
  });
  $('deptClear').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    state.draft.departments = [];
    if (deptFilter && deptFilter.render) deptFilter.render();
  });

  var roleFilter = UI.bindMultiSelect({
    wrapId: 'roleWrap',
    triggerId: 'roleTrigger',
    panelId: 'rolePanel',
    labelId: 'roleLabel',
    listId: 'roleList',
    clearId: 'roleClear',
    prefix: '角色：',
    getOptions: function () { return ROLES; },
    getSelected: function () { return state.draft.roles; },
    setSelected: function (arr) { state.draft.roles = arr; }
  });

  var dataGroupFilter = UI.bindMultiSelect({
    wrapId: 'dataGroupWrap',
    triggerId: 'dataGroupTrigger',
    panelId: 'dataGroupPanel',
    labelId: 'dataGroupLabel',
    listId: 'dataGroupList',
    selectedId: 'dataGroupSelected',
    searchId: 'dataGroupSearch',
    countId: 'dataGroupCount',
    selectAllId: 'dataGroupSelectAll',
    clearId: 'dataGroupPanelClear',
    prefix: '数据组：',
    getOptions: function () { return DATA_GROUPS; },
    getSelected: function () { return state.draft.dataGroups; },
    setSelected: function (arr) { state.draft.dataGroups = arr; }
  });
  $('dataGroupClear').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    state.draft.dataGroups = [];
    if (dataGroupFilter && dataGroupFilter.render) dataGroupFilter.render();
  });

  var logTypeSelect = UI.bindSingleSelect({
    wrapId: 'logTypeWrap',
    triggerId: 'logTypeTrigger',
    panelId: 'logTypePanel',
    labelId: 'logTypeLabel',
    clearId: 'logTypeClear',
    prefix: '操作类型：',
    getValue: function () { return state.logType; },
    onChange: function (value) {
      state.logType = value || '';
      state.logPage = 1;
      if (state.logUserId) renderLogDrawer();
    }
  });

  var statusFilter = UI.bindSingleSelect({
    wrapId: 'statusWrap',
    triggerId: 'statusTrigger',
    panelId: 'statusPanel',
    labelId: 'statusLabel',
    clearId: 'statusClear',
    prefix: '状态：',
    getValue: function () { return state.draft.status; },
    onChange: function (v) { state.draft.status = v || ''; }
  });

  var nicknameClear = UI.bindInputClearable({ wrapId: 'nicknameWrap', inputId: 'filterNickname', clearId: 'nicknameClear' });

  var editRoleSelect = UI.bindMultiSelect({
    wrapId: 'editRoleWrap',
    triggerId: 'editRoleTrigger',
    panelId: 'editRolePanel',
    labelId: 'editRoleLabel',
    listId: 'editRoleList',
    clearId: 'editRoleClear',
    getOptions: function () { return ROLES; },
    getSelected: function () { return state.editRoles; },
    setSelected: function (arr) { state.editRoles = arr; }
  });

  var editDataGroupSelect = UI.bindMultiSelect({
    wrapId: 'editDataGroupWrap',
    triggerId: 'editDataGroupTrigger',
    panelId: 'editDataGroupPanel',
    labelId: 'editDataGroupLabel',
    listId: 'editDataGroupList',
    selectedId: 'editDataGroupSelected',
    searchId: 'editDataGroupSearch',
    countId: 'editDataGroupCount',
    selectAllId: 'editDataGroupSelectAll',
    clearId: 'editDataGroupPanelClear',
    getOptions: function () { return DATA_GROUPS; },
    getSelected: function () { return state.editDataGroups; },
    setSelected: function (arr) { state.editDataGroups = arr; }
  });
  $('editDataGroupClear').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    state.editDataGroups = [];
    if (editDataGroupSelect && editDataGroupSelect.render) editDataGroupSelect.render();
  });

  $('filterNickname').addEventListener('input', function () {
    state.draft.nickname = this.value || '';
  });

  function pendingRows() {
    return ALL_ROWS.filter(function (row) { return row.pendingSync; });
  }

  function renderReviewBadge() {
    var badge = $('reviewBadge');
    var btn = $('reviewBtn');
    if (!badge || !btn) return;
    var count = pendingRows().length;
    badge.hidden = count === 0;
    badge.textContent = String(count);
    btn.setAttribute('aria-label', count ? ('审核，' + count + ' 个账号待同步') : '审核');
  }

  function renderTable() {
    if (!state.applied) applyFilters();
    renderReviewBadge();
    var rows = getFilteredRows();
    var total = rows.length;
    var totalPages = Math.max(1, Math.ceil(total / state.pageSize) || 1);
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * state.pageSize;
    var pageRows = rows.slice(start, start + state.pageSize);
    var body = $('tableBody');
    var empty = $('emptyTip');

    if (!pageRows.length) {
      body.innerHTML = '';
      if (empty) empty.hidden = false;
    } else {
      if (empty) empty.hidden = true;
      body.innerHTML = pageRows.map(function (row) {
        return '<tr data-id="' + escapeHtml(row.id) + '">' +
          '<td><span class="user-cell"><span class="user-cell__avatar" aria-hidden="true"></span><span class="user-cell__name">' + escapeHtml(row.nickname) + '</span></span></td>' +
          '<td class="col-account">' + escapeHtml(row.account) + '</td>' +
          '<td title="' + escapeHtml(joinList(row.departments)) + '">' + escapeHtml(joinList(row.departments)) + '</td>' +
          '<td title="' + escapeHtml(joinList(row.roles)) + '">' + escapeHtml(joinList(row.roles)) + '</td>' +
          '<td title="' + escapeHtml(joinList(row.dataGroups)) + '">' + escapeHtml(joinList(row.dataGroups)) + '</td>' +
          '<td>' + UI.statusTag(row.status) + '</td>' +
          '<td>' + escapeHtml(row.updatedAt) + '</td>' +
          '<td>' + escapeHtml(row.createdAt) + '</td>' +
          '<td class="col-action"><span class="action-links">' +
            '<button class="link" type="button" data-action="edit">编辑</button>' +
            '<button class="link" type="button" data-action="impersonate">扮演</button>' +
            '<button class="link" type="button" data-action="log">日志</button>' +
          '</span></td>' +
        '</tr>';
      }).join('');
    }

    UI.renderPagination({
      containerId: 'pagination',
      total: total,
      page: state.page,
      pageSize: state.pageSize
    });
    if (!state.paginationBound) {
      state.paginationBound = true;
      UI.bindPagination({
        containerId: 'pagination',
        getPage: function () { return state.page; },
        getPageSize: function () { return state.pageSize; },
        getTotal: function () { return getFilteredRows().length; },
        onPageChange: function (p) {
          state.page = p;
          renderTable();
        },
        onPageSizeChange: function (size) {
          state.pageSize = size;
          state.page = 1;
          renderTable();
        }
      });
    }

    if (window.ColResize) ColResize.refresh($('userTable'));
  }

  function findRow(id) {
    return ALL_ROWS.find(function (r) { return r.id === id; });
  }

  function openEdit(row) {
    if (!row) return;
    state.editId = row.id;
    state.editRoles = (row.roles || []).slice();
    state.editDataGroups = (row.dataGroups || []).slice();
    $('editAccount').value = row.account;
    $('editNickname').value = row.nickname;
    $('editDept').value = (row.departments || []).join(', ');
    if (editRoleSelect && editRoleSelect.render) editRoleSelect.render();
    if (editDataGroupSelect && editDataGroupSelect.render) editDataGroupSelect.render();
    UI.openModal('editModal');
  }

  function submitEdit() {
    var row = findRow(state.editId);
    if (!row) return;
    var nextRoles = (state.editRoles || []).slice();
    var nextGroups = (state.editDataGroups || []).slice();
    var operator = currentOperator();
    var now = formatDateTime(new Date());
    var changed = false;

    if (!sameList(row.roles, nextRoles)) {
      pushEditLog(row.id, '编辑角色', displayList(row.roles), displayList(nextRoles), operator, now, true);
      row.roles = nextRoles;
      changed = true;
    }
    if (!sameList(row.dataGroups, nextGroups)) {
      pushEditLog(row.id, '编辑数据组', displayList(row.dataGroups), displayList(nextGroups), operator, now, true);
      row.dataGroups = nextGroups;
      changed = true;
    }

    if (changed) {
      row.updatedAt = now;
      UI.showToast('提交成功', 'success');
    } else {
      UI.showToast('未修改任何内容', 'info');
    }
    UI.closeModal('editModal');
    renderTable();
  }

  function openImpersonate(row) {
    if (!row) return;
    state.impersonateId = row.id;
    $('impersonateBody').textContent = '确认以 [ ' + row.nickname + ' ] 的身份登录系统？';
    UI.openModal('impersonateModal');
  }

  function confirmImpersonate() {
    var row = findRow(state.impersonateId);
    state.impersonateId = null;
    UI.closeModal('impersonateModal');
    if (!row || !window.DeliveryShell || !window.DeliveryShell.startImpersonation) return;
    var operator = currentOperator();
    pushEditLog(row.id, '扮演用户', '-', '-', operator, formatDateTime(new Date()), true);
    window.DeliveryShell.startImpersonation({
      nickname: row.nickname,
      account: row.account
    });
  }

  function logsForDrawer() {
    var logs = state.logUserId ? (EDIT_LOGS[state.logUserId] || []) : [];
    var sorted = logs.slice().sort(function (a, b) {
      return String(b.time).localeCompare(String(a.time));
    });
    if (!state.logType) return sorted;
    return sorted.filter(function (log) { return log.type === state.logType; });
  }

  function renderLogDrawer() {
    var body = $('logDrawerBody');
    var pager = $('logPagination');
    var row = findRow(state.logUserId);
    var logs = logsForDrawer();
    $('logDrawerTitle').textContent = row ? ('日志 · ' + row.nickname) : '日志';

    if (!logs.length) {
      body.innerHTML = '<div class="log-table__empty">暂无日志</div>';
      if (pager) {
        pager.hidden = true;
        pager.innerHTML = '';
      }
      return;
    }

    var total = logs.length;
    var totalPages = Math.max(1, Math.ceil(total / state.logPageSize));
    if (state.logPage > totalPages) state.logPage = totalPages;
    var start = (state.logPage - 1) * state.logPageSize;
    var pageLogs = logs.slice(start, start + state.logPageSize);

    body.innerHTML =
      '<div class="log-table-shell"><table class="log-table">' +
        '<colgroup><col style="width:88px"/><col style="width:180px"/><col style="width:120px"/><col/><col/></colgroup>' +
        '<thead><tr><th>操作人</th><th>操作时间</th><th>操作类型</th><th>变更前</th><th>变更后</th></tr></thead>' +
        '<tbody>' +
        pageLogs.map(function (log) {
          return '<tr>' +
            '<td>' + escapeHtml(log.operator) + '</td>' +
            '<td>' + escapeHtml(log.time) + '</td>' +
            '<td>' + escapeHtml(log.type) + '</td>' +
            '<td class="log-table__value">' + escapeHtml(log.from) + '</td>' +
            '<td class="log-table__value">' + escapeHtml(log.to) + '</td>' +
          '</tr>';
        }).join('') +
        '</tbody></table></div>';

    if (pager) {
      pager.hidden = false;
      UI.renderPagination({
        containerId: 'logPagination',
        total: total,
        page: state.logPage,
        pageSize: state.logPageSize
      });
      if (!state.logPaginationBound) {
        state.logPaginationBound = true;
        UI.bindPagination({
          containerId: 'logPagination',
          getPage: function () { return state.logPage; },
          getPageSize: function () { return state.logPageSize; },
          getTotal: function () { return logsForDrawer().length; },
          onPageChange: function (p) {
            state.logPage = p;
            renderLogDrawer();
          },
          onPageSizeChange: function (size) {
            state.logPageSize = size;
            state.logPage = 1;
            renderLogDrawer();
          }
        });
      }
    }
  }

  function openLogDrawer(row) {
    if (!row) return;
    state.logUserId = row.id;
    state.logType = '';
    state.logPage = 1;
    if (logTypeSelect && logTypeSelect.syncLabel) logTypeSelect.syncLabel('');
    renderLogDrawer();
    UI.openDrawer('logDrawer');
  }

  function closeLogDrawer() {
    UI.closeDrawer('logDrawer');
    state.logUserId = null;
  }

  function setReviewError(on) {
    var tip = $('reviewTip');
    if (tip) tip.classList.toggle('is-error', !!on);
  }

  function syncReviewCheckAll(rows) {
    var box = $('reviewCheckAll');
    if (!box) return;
    var list = rows || pendingRows();
    var picked = list.filter(function (row) { return state.reviewSelected[row.id]; }).length;
    box.disabled = !list.length;
    box.checked = list.length > 0 && picked === list.length;
    box.indeterminate = picked > 0 && picked < list.length;
  }

  function renderReviewTable() {
    var rows = pendingRows();
    var body = $('reviewTableBody');
    if (!rows.length) {
      body.innerHTML = '<tr class="review-table__empty"><td colspan="7">暂无待同步账号</td></tr>';
    } else {
      body.innerHTML = rows.map(function (row) {
        var checked = state.reviewSelected[row.id] ? ' checked' : '';
        return '<tr data-id="' + escapeHtml(row.id) + '">' +
          '<td class="col-check"><label class="cell-check"><input type="checkbox" data-review-check' + checked + ' aria-label="选择' + escapeHtml(row.nickname) + '" /></label></td>' +
          '<td><span class="user-cell"><span class="user-cell__avatar" aria-hidden="true"></span><span class="user-cell__name">' + escapeHtml(row.nickname) + '</span></span></td>' +
          '<td class="col-account">' + escapeHtml(row.account) + '</td>' +
          '<td title="' + escapeHtml(joinList(row.departments)) + '">' + escapeHtml(joinList(row.departments)) + '</td>' +
          '<td title="' + escapeHtml(joinList(row.roles)) + '">' + escapeHtml(joinList(row.roles)) + '</td>' +
          '<td title="' + escapeHtml(joinList(row.dataGroups)) + '">' + escapeHtml(joinList(row.dataGroups)) + '</td>' +
          '<td>' + escapeHtml(row.updatedAt) + '</td>' +
        '</tr>';
      }).join('');
    }
    syncReviewCheckAll(rows);
  }

  function openReview() {
    state.reviewSelected = {};
    setReviewError(false);
    renderReviewTable();
    UI.openModal('reviewModal');
  }

  function closeReview() {
    UI.closeModal('reviewModal');
    state.reviewSelected = {};
    setReviewError(false);
  }

  function submitReview() {
    var ids = Object.keys(state.reviewSelected).filter(function (id) { return state.reviewSelected[id]; });
    if (!ids.length) {
      setReviewError(true);
      return;
    }
    var now = formatDateTime(new Date());
    ids.forEach(function (id) {
      var row = findRow(id);
      if (!row || !row.pendingSync) return;
      pushEditLog(row.id, '同步状态', '未交接', '已交接', currentOperator(), now, true);
      row.departments = [];
      row.roles = [];
      row.dataGroups = [];
      row.pendingSync = false;
      row.updatedAt = now;
    });
    closeReview();
    UI.showToast('已同步', 'success');
    renderTable();
  }

  $('queryBtn').addEventListener('click', function () {
    applyFilters();
    renderTable();
  });

  $('resetBtn').addEventListener('click', function () {
    state.draft = {
      nickname: '',
      departments: [],
      roles: [],
      dataGroups: [],
      status: ''
    };
    $('filterNickname').value = '';
    if (nicknameClear && nicknameClear.sync) nicknameClear.sync();
    if (deptFilter && deptFilter.render) deptFilter.render();
    if (roleFilter && roleFilter.render) roleFilter.render();
    if (dataGroupFilter && dataGroupFilter.render) dataGroupFilter.render();
    if (statusFilter && statusFilter.syncLabel) statusFilter.syncLabel('');
    applyFilters();
    renderTable();
  });

  $('tableBody').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var tr = btn.closest('tr[data-id]');
    if (!tr) return;
    var row = findRow(tr.getAttribute('data-id'));
    if (!row) return;
    var action = btn.getAttribute('data-action');
    if (action === 'edit') openEdit(row);
    else if (action === 'impersonate') openImpersonate(row);
    else if (action === 'log') openLogDrawer(row);
  });

  document.querySelectorAll('[data-close="editModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      UI.closeModal('editModal');
    });
  });
  $('editSubmit').addEventListener('click', submitEdit);

  document.querySelectorAll('[data-close="impersonateModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.impersonateId = null;
      UI.closeModal('impersonateModal');
    });
  });
  $('impersonateOk').addEventListener('click', confirmImpersonate);

  $('logDrawerClose').addEventListener('click', closeLogDrawer);
  $('reviewBtn').addEventListener('click', openReview);
  document.querySelectorAll('[data-close="reviewModal"]').forEach(function (btn) {
    btn.addEventListener('click', closeReview);
  });
  $('reviewSubmit').addEventListener('click', submitReview);
  $('reviewCheckAll').addEventListener('change', function () {
    var on = this.checked;
    pendingRows().forEach(function (row) {
      state.reviewSelected[row.id] = on;
    });
    if (on) setReviewError(false);
    renderReviewTable();
  });
  $('reviewTableBody').addEventListener('change', function (e) {
    var box = e.target.closest('[data-review-check]');
    if (!box) return;
    var tr = box.closest('tr[data-id]');
    if (!tr) return;
    state.reviewSelected[tr.getAttribute('data-id')] = box.checked;
    if (box.checked) setReviewError(false);
    syncReviewCheckAll();
  });

  applyFilters();
  renderTable();
})();
