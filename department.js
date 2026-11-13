/* 投放系统 · 数据组管理
 * 查询才刷表；重置立即重查。ID 只在列表展示。
 * 账户权限为全部账户时，后续新增广告账户自动授权，权限页无需勾选用户。
 * 部分账户选择用户，将其名下广告账户授予数据组。关联用户单独维护。
 * 有关联用户时禁止删除。
 */
(function () {
  'use strict';

  var UI = window.ProductUI;
  if (!UI) return;

  var $ = UI.$;
  var escapeHtml = UI.escapeHtml;

  var ALL_USER_POOL = Array.from({ length: 24 }, function (_, i) {
    return {
      id: 'user-' + (i + 1),
      name: '用户' + String.fromCharCode(65 + i)
    };
  });

  var USER_ACCOUNT_IDS = {};
  ALL_USER_POOL.forEach(function (user, i) {
    var count = 1 + (i % 3);
    var ids = [];
    var k;
    for (k = 0; k < count; k++) ids.push('acc-' + user.id + '-' + (k + 1));
    USER_ACCOUNT_IDS[user.id] = ids;
  });

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function formatDateTime(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function userIds(indexes) {
    return indexes.map(function (n) { return 'user-' + n; });
  }

  function countAccounts(ids) {
    var seen = {};
    var total = 0;
    (ids || []).forEach(function (id) {
      (USER_ACCOUNT_IDS[id] || []).forEach(function (acc) {
        if (!seen[acc]) {
          seen[acc] = true;
          total += 1;
        }
      });
    });
    return total;
  }

  var ALL_ACCOUNT_COUNT = countAccounts(ALL_USER_POOL.map(function (user) { return user.id; }));

  function accountCount(row) {
    if (!row) return 0;
    if (row.scope === 'all') return ALL_ACCOUNT_COUNT;
    return countAccounts(row.permUserIds);
  }

  var GROUP_SEED = [
    { id: '1001', name: '全部账户', remark: '新增账户默认授权，请勿修改', status: '启用', scope: 'all', members: [1, 23], perms: [] },
    { id: '1002', name: 'APP投放一组', remark: '', status: '启用', members: [3, 11, 19], perms: [3, 11, 19] },
    { id: '1003', name: 'APP投放二组', remark: '', status: '启用', members: [1, 4, 20], perms: [4, 20] },
    { id: '1004', name: 'APP投放三组', remark: '', status: '启用', members: [12], perms: [12, 5] },
    { id: '1005', name: 'TT投放一组', remark: '', status: '启用', members: [6, 14, 22], perms: [6, 14] },
    { id: '1006', name: 'TT投放二组', remark: '', status: '启用', members: [7, 12, 15, 23], perms: [7, 15, 23] },
    { id: '1007', name: 'TT投放三组', remark: '', status: '启用', members: [8, 16, 24], perms: [8, 16] },
    { id: '1008', name: '素材组', remark: '', status: '启用', members: [6, 13, 21], perms: [6, 13] },
    { id: '1009', name: '开发测试', remark: '', status: '禁用', members: [], perms: [] }
  ];

  function buildRows() {
    return GROUP_SEED.map(function (item, i) {
      var created = new Date(2026, 6, 2, 9, 0, 0);
      created.setDate(created.getDate() + i * 4);
      created.setMinutes((i * 5) % 60);
      created.setSeconds((i * 17) % 60);
      var updated = new Date(2026, 7, 10, 11, 20, 6);
      updated.setMinutes(updated.getMinutes() - i * 41);
      updated.setSeconds((i * 9) % 60);
      return {
        id: item.id,
        name: item.name,
        remark: item.remark || '',
        scope: item.scope || 'partial',
        permUserIds: userIds(item.perms),
        userIds: userIds(item.members),
        status: item.status,
        updatedAt: formatDateTime(updated),
        createdAt: formatDateTime(created)
      };
    });
  }

  var ALL_ROWS = buildRows();

  var state = {
    draft: { name: '', status: '' },
    applied: null,
    page: 1,
    pageSize: 20,
    paginationBound: false,
    editMode: 'edit',
    editId: null,
    editScope: 'partial',
    editStatus: '启用',
    permId: null,
    userId: null,
    deleteId: null,
    deleteBlocked: false
  };

  function applyFilters() {
    state.applied = {
      name: (state.draft.name || '').trim(),
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
      if (f.name && row.name.indexOf(f.name) === -1) return false;
      if (f.status && row.status !== f.status) return false;
      return true;
    });
    return rows.sort(byCreatedDesc);
  }

  function findRow(id) {
    return ALL_ROWS.find(function (r) { return r.id === id; });
  }

  function getUserById(id) {
    return ALL_USER_POOL.find(function (u) { return u.id === id; });
  }

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

  UI.bindSeg('editScopeSeg', function (v) {
    state.editScope = v || 'partial';
  });
  UI.bindSeg('editStatusSeg', function (v) {
    state.editStatus = v || '启用';
  });

  var nameClear = UI.bindInputClearable({ wrapId: 'nameWrap', inputId: 'filterName', clearId: 'nameClear' });
  var editNameClear = UI.bindInputClearable({ wrapId: 'editNameWrap', inputId: 'editName', clearId: 'editNameClear' });
  var editRemarkClear = UI.bindInputClearable({ wrapId: 'editRemarkWrap', inputId: 'editRemark', clearId: 'editRemarkClear' });

  $('filterName').addEventListener('input', function () {
    state.draft.name = this.value || '';
  });
  $('filterName').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      $('queryBtn').click();
    }
  });

  function clearEditErrors() {
    var el = $('editNameItem');
    if (el) el.classList.remove('is-error');
  }

  function setItemError(id, on, msg) {
    var el = $(id);
    if (!el) return;
    el.classList.toggle('is-error', !!on);
    if (on && msg) {
      var err = el.querySelector('.form-item__error');
      if (err) err.textContent = msg;
    }
  }

  $('editName').addEventListener('input', function () {
    if ((this.value || '').trim()) setItemError('editNameItem', false);
  });

  function renderTable() {
    if (!state.applied) applyFilters();
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
          '<td class="col-id">' + escapeHtml(row.id) + '</td>' +
          '<td>' + escapeHtml(row.name) + '</td>' +
          '<td title="' + escapeHtml(row.remark || '') + '">' + escapeHtml(row.remark || '-') + '</td>' +
          '<td>' + accountCount(row) + '</td>' +
          '<td>' + (row.userIds ? row.userIds.length : 0) + '</td>' +
          '<td>' + UI.statusTag(row.status) + '</td>' +
          '<td>' + escapeHtml(row.updatedAt) + '</td>' +
          '<td>' + escapeHtml(row.createdAt) + '</td>' +
          '<td class="col-action"><span class="action-links">' +
            '<button class="link" type="button" data-action="edit">编辑</button>' +
            '<button class="link" type="button" data-action="perm">权限</button>' +
            '<button class="link" type="button" data-action="users">用户</button>' +
            '<button class="link link--danger" type="button" data-action="delete">删除</button>' +
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
    if (window.ColResize) ColResize.refresh($('groupTable'));
  }

  function nextGroupId() {
    var max = 1000;
    ALL_ROWS.forEach(function (r) {
      var n = parseInt(r.id, 10);
      if (isFinite(n) && n > max) max = n;
    });
    return String(max + 1);
  }

  function syncEditClears() {
    if (editNameClear && editNameClear.sync) editNameClear.sync();
    if (editRemarkClear && editRemarkClear.sync) editRemarkClear.sync();
  }

  function openAdd() {
    state.editMode = 'add';
    state.editId = null;
    state.editScope = 'partial';
    state.editStatus = '启用';
    clearEditErrors();
    $('editModalTitle').textContent = '添加数据组';
    $('editName').value = '';
    $('editRemark').value = '';
    syncEditClears();
    UI.setSegValue('editScopeSeg', 'partial');
    UI.setSegValue('editStatusSeg', '启用');
    UI.openModal('editModal');
  }

  function openEdit(row) {
    state.editMode = 'edit';
    state.editId = row.id;
    state.editScope = row.scope === 'all' ? 'all' : 'partial';
    state.editStatus = row.status || '启用';
    clearEditErrors();
    $('editModalTitle').textContent = '编辑数据组';
    $('editName').value = row.name;
    $('editRemark').value = row.remark || '';
    syncEditClears();
    UI.setSegValue('editScopeSeg', state.editScope);
    UI.setSegValue('editStatusSeg', state.editStatus);
    UI.openModal('editModal');
  }

  function submitEdit() {
    clearEditErrors();
    var name = ($('editName').value || '').trim();
    var remark = ($('editRemark').value || '').trim();
    var status = state.editStatus || '启用';
    var scope = state.editScope === 'all' ? 'all' : 'partial';

    if (!name) {
      setItemError('editNameItem', true, '请输入数据组名称');
      return;
    }

    var duplicated = ALL_ROWS.some(function (r) {
      if (state.editMode === 'edit' && r.id === state.editId) return false;
      return r.name === name;
    });
    if (duplicated) {
      setItemError('editNameItem', true, '数据组名称已存在');
      return;
    }

    var now = formatDateTime(new Date());
    if (state.editMode === 'add') {
      ALL_ROWS.unshift({
        id: nextGroupId(),
        name: name,
        remark: remark,
        scope: scope,
        permUserIds: [],
        userIds: [],
        status: status,
        updatedAt: now,
        createdAt: now
      });
      UI.showToast('添加成功', 'success');
    } else {
      var row = findRow(state.editId);
      if (!row) return;
      row.name = name;
      row.remark = remark;
      row.scope = scope;
      row.status = status;
      row.updatedAt = now;
      UI.showToast('提交成功', 'success');
    }
    UI.closeModal('editModal');
    applyFilters();
    renderTable();
  }

  function bindTransfer(cfg) {
    var selectedIds = [];
    var availChecked = {};
    var selectedChecked = {};
    var availKw = '';
    var selectedKw = '';

    function render() {
      var selectedSet = {};
      selectedIds.forEach(function (id) { selectedSet[id] = true; });
      var availAll = ALL_USER_POOL.filter(function (u) { return !selectedSet[u.id]; });
      var selectedAll = selectedIds.map(getUserById).filter(Boolean);
      var availVisible = availAll.filter(function (u) {
        return !availKw || u.name.toLowerCase().indexOf(availKw) !== -1;
      });
      var selectedVisible = selectedAll.filter(function (u) {
        return !selectedKw || u.name.toLowerCase().indexOf(selectedKw) !== -1;
      });
      var availCheckedCount = availVisible.filter(function (u) { return availChecked[u.id]; }).length;
      var selectedCheckedCount = selectedVisible.filter(function (u) { return selectedChecked[u.id]; }).length;

      $(cfg.availCountId).textContent = availCheckedCount + ' / ' + availAll.length;
      $(cfg.selectedCountId).textContent = selectedCheckedCount + ' / ' + selectedAll.length;

      var availAllBox = $(cfg.availCheckId);
      availAllBox.checked = availVisible.length > 0 && availCheckedCount === availVisible.length;
      availAllBox.indeterminate = availCheckedCount > 0 && availCheckedCount < availVisible.length;
      var selectedAllBox = $(cfg.selectedCheckId);
      selectedAllBox.checked = selectedVisible.length > 0 && selectedCheckedCount === selectedVisible.length;
      selectedAllBox.indeterminate = selectedCheckedCount > 0 && selectedCheckedCount < selectedVisible.length;

      function listHtml(list, checkedMap, emptyText) {
        if (!list.length) return '<div class="transfer__empty">' + emptyText + '</div>';
        return list.map(function (u) {
          return '<label class="transfer__item">' +
            '<input type="checkbox" value="' + escapeHtml(u.id) + '"' + (checkedMap[u.id] ? ' checked' : '') + ' />' +
            '<span title="' + escapeHtml(u.name) + '">' + escapeHtml(u.name) + '</span>' +
          '</label>';
        }).join('');
      }

      $(cfg.availListId).innerHTML = listHtml(availVisible, availChecked, '暂无数据');
      $(cfg.selectedListId).innerHTML = listHtml(selectedVisible, selectedChecked, '暂无已选');
      $(cfg.toSelectedId).disabled = availCheckedCount === 0;
      $(cfg.toAvailId).disabled = selectedCheckedCount === 0;
    }

    function open(ids) {
      selectedIds = (ids || []).slice();
      availChecked = {};
      selectedChecked = {};
      availKw = '';
      selectedKw = '';
      $(cfg.availSearchId).value = '';
      $(cfg.selectedSearchId).value = '';
      render();
    }

    $(cfg.availListId).addEventListener('change', function (e) {
      var input = e.target.closest('input[type="checkbox"]');
      if (!input) return;
      if (input.checked) availChecked[input.value] = true;
      else delete availChecked[input.value];
      render();
    });
    $(cfg.selectedListId).addEventListener('change', function (e) {
      var input = e.target.closest('input[type="checkbox"]');
      if (!input) return;
      if (input.checked) selectedChecked[input.value] = true;
      else delete selectedChecked[input.value];
      render();
    });
    $(cfg.availCheckId).addEventListener('change', function () {
      var checked = this.checked;
      var selectedSet = {};
      selectedIds.forEach(function (id) { selectedSet[id] = true; });
      ALL_USER_POOL.forEach(function (u) {
        if (selectedSet[u.id]) return;
        if (availKw && u.name.toLowerCase().indexOf(availKw) === -1) return;
        if (checked) availChecked[u.id] = true;
        else delete availChecked[u.id];
      });
      render();
    });
    $(cfg.selectedCheckId).addEventListener('change', function () {
      var checked = this.checked;
      selectedIds.forEach(function (id) {
        var u = getUserById(id);
        if (!u) return;
        if (selectedKw && u.name.toLowerCase().indexOf(selectedKw) === -1) return;
        if (checked) selectedChecked[id] = true;
        else delete selectedChecked[id];
      });
      render();
    });
    $(cfg.availSearchId).addEventListener('input', function () {
      availKw = (this.value || '').trim().toLowerCase();
      render();
    });
    $(cfg.selectedSearchId).addEventListener('input', function () {
      selectedKw = (this.value || '').trim().toLowerCase();
      render();
    });
    $(cfg.toSelectedId).addEventListener('click', function () {
      Object.keys(availChecked).forEach(function (id) {
        if (!availChecked[id]) return;
        if (selectedIds.indexOf(id) === -1) selectedIds.push(id);
        delete availChecked[id];
      });
      render();
    });
    $(cfg.toAvailId).addEventListener('click', function () {
      var moving = Object.keys(selectedChecked).filter(function (id) { return selectedChecked[id]; });
      selectedIds = selectedIds.filter(function (id) { return moving.indexOf(id) === -1; });
      moving.forEach(function (id) { delete selectedChecked[id]; });
      render();
    });

    return {
      open: open,
      getIds: function () { return selectedIds.slice(); }
    };
  }

  var permTransfer = bindTransfer({
    availCountId: 'permAvailCount',
    selectedCountId: 'permSelectedCount',
    availCheckId: 'permAvailCheckAll',
    selectedCheckId: 'permSelectedCheckAll',
    availListId: 'permAvailList',
    selectedListId: 'permSelectedList',
    availSearchId: 'permAvailSearch',
    selectedSearchId: 'permSelectedSearch',
    toSelectedId: 'permMoveToSelected',
    toAvailId: 'permMoveToAvail'
  });

  var userTransfer = bindTransfer({
    availCountId: 'availCount',
    selectedCountId: 'selectedCount',
    availCheckId: 'availCheckAll',
    selectedCheckId: 'selectedCheckAll',
    availListId: 'availList',
    selectedListId: 'selectedList',
    availSearchId: 'availSearch',
    selectedSearchId: 'selectedSearch',
    toSelectedId: 'moveToSelected',
    toAvailId: 'moveToAvail'
  });

  function openPerm(row) {
    state.permId = row.id;
    var auto = row.scope === 'all';
    $('permTransfer').hidden = auto;
    $('permAuto').hidden = !auto;
    if (!auto) permTransfer.open(row.permUserIds || []);
    UI.openModal('permModal');
  }

  function submitPerm() {
    var row = findRow(state.permId);
    if (!row) return;
    if (row.scope === 'all') {
      UI.closeModal('permModal');
      UI.showToast('系统会自动处理', 'success');
      return;
    }
    row.permUserIds = permTransfer.getIds();
    row.updatedAt = formatDateTime(new Date());
    UI.closeModal('permModal');
    UI.showToast('提交成功', 'success');
    renderTable();
  }

  function openUsers(row) {
    state.userId = row.id;
    userTransfer.open(row.userIds || []);
    $('userModalTitle').textContent = '关联用户 · ' + row.name;
    UI.openModal('userModal');
  }

  function submitUsers() {
    var row = findRow(state.userId);
    if (!row) return;
    row.userIds = userTransfer.getIds();
    row.updatedAt = formatDateTime(new Date());
    UI.closeModal('userModal');
    UI.showToast('提交成功', 'success');
    renderTable();
  }

  function openDelete(row) {
    state.deleteId = row.id;
    var count = row.userIds ? row.userIds.length : 0;
    state.deleteBlocked = count > 0;
    $('deleteTitle').textContent = '删除确认';
    $('deleteBody').textContent = state.deleteBlocked
      ? '当前数据组存在关联用户，请移除后再执行删除。'
      : '此操作不可撤销，确认删除吗？';
    UI.openModal('deleteModal');
  }

  function confirmDelete() {
    var id = state.deleteId;
    var blocked = state.deleteBlocked;
    state.deleteId = null;
    state.deleteBlocked = false;
    UI.closeModal('deleteModal');
    if (!id) return;
    if (blocked) {
      UI.showToast('请先移除关联用户', 'warning');
      return;
    }
    ALL_ROWS = ALL_ROWS.filter(function (r) { return r.id !== id; });
    UI.showToast('删除成功', 'success');
    renderTable();
  }

  $('queryBtn').addEventListener('click', function () {
    applyFilters();
    renderTable();
  });

  $('resetBtn').addEventListener('click', function () {
    state.draft = { name: '', status: '' };
    $('filterName').value = '';
    if (nameClear && nameClear.sync) nameClear.sync();
    if (statusFilter && statusFilter.syncLabel) statusFilter.syncLabel('');
    applyFilters();
    renderTable();
  });

  $('addBtn').addEventListener('click', openAdd);
  $('editSubmit').addEventListener('click', submitEdit);
  $('permSubmit').addEventListener('click', submitPerm);
  $('userSubmit').addEventListener('click', submitUsers);
  $('deleteOk').addEventListener('click', confirmDelete);

  $('tableBody').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var tr = btn.closest('tr[data-id]');
    if (!tr) return;
    var row = findRow(tr.getAttribute('data-id'));
    if (!row) return;
    var action = btn.getAttribute('data-action');
    if (action === 'edit') openEdit(row);
    else if (action === 'perm') openPerm(row);
    else if (action === 'users') openUsers(row);
    else if (action === 'delete') openDelete(row);
  });

  document.querySelectorAll('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-close');
      if (id === 'deleteModal') {
        state.deleteId = null;
        state.deleteBlocked = false;
      }
      UI.closeModal(id);
    });
  });

  if (UI.bindFormHelp) UI.bindFormHelp(document);

  applyFilters();
  renderTable();
})();
