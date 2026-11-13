/* 投放系统 · 角色管理
 * 查询才刷表；重置立即重查。
 * ID 仅在列表展示，添加与编辑表单都不带。提交后系统生成。名称必填且全局唯一。
 * 有关联用户时禁止删除。权限树取自当前菜单目录。
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

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function formatDateTime(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function userIds(indexes) {
    return indexes.map(function (n) { return 'user-' + n; });
  }

  function buildPermTree() {
    var list = (window.DeliveryMenu && window.DeliveryMenu.rows) || [];
    var byParent = {};
    list.forEach(function (row) {
      if (row.status === '禁用') return;
      var pid = row.parentId || '';
      if (!byParent[pid]) byParent[pid] = [];
      byParent[pid].push(row);
    });
    function toNode(row) {
      var kids = (byParent[row.id] || []).map(toNode);
      var node = { id: 'm' + row.id, menuId: String(row.id), name: row.name };
      if (kids.length) node.children = kids;
      return node;
    }
    return (byParent[''] || []).map(toNode);
  }

  var PERM_TREE = buildPermTree();

  function walkPerm(nodes, fn) {
    (nodes || []).forEach(function (n) {
      fn(n);
      if (n.children) walkPerm(n.children, fn);
    });
  }

  function collectLeafIds(nodes, out) {
    out = out || [];
    (nodes || []).forEach(function (n) {
      if (n.children && n.children.length) collectLeafIds(n.children, out);
      else out.push(n.id);
    });
    return out;
  }

  function findPermNode(nodes, id) {
    var found = null;
    walkPerm(nodes, function (n) {
      if (n.id === id) found = n;
    });
    return found;
  }

  function getDescendantLeafIds(node) {
    if (!node.children || !node.children.length) return [node.id];
    return collectLeafIds(node.children);
  }

  function chainHas(chain, menuId) {
    return chain.some(function (n) { return n.menuId === String(menuId); });
  }

  function leavesWhere(pred) {
    var out = [];
    function walk(nodes, chain) {
      (nodes || []).forEach(function (n) {
        var next = chain.concat([n]);
        if (n.children && n.children.length) walk(n.children, next);
        else if (pred(n, next)) out.push(n.id);
      });
    }
    walk(PERM_TREE, []);
    return out;
  }

  function permsFor(name) {
    if (name === '管理员') return collectLeafIds(PERM_TREE);
    if (name === '海外负责人') {
      return leavesWhere(function (n, chain) { return !chainHas(chain, '3'); });
    }
    if (name === '海外投放') {
      return leavesWhere(function (n, chain) {
        return chainHas(chain, '1') || chainHas(chain, '8') || chainHas(chain, '19') ||
          chainHas(chain, '31') || chainHas(chain, '42') || chainHas(chain, '49');
      });
    }
    if (name === '海外素材') {
      return leavesWhere(function (n, chain) {
        return chainHas(chain, '1') || chainHas(chain, '22') || chainHas(chain, '28') || chainHas(chain, '29');
      });
    }
    if (name === '财务审计' || name === '数据管理') {
      return leavesWhere(function (n, chain) {
        return chainHas(chain, '1') || chainHas(chain, '49');
      });
    }
    return leavesWhere(function (n, chain) {
      return chainHas(chain, '1') || chainHas(chain, '19') || chainHas(chain, '23') || chainHas(chain, '49');
    });
  }

  var ROLE_SEED = [
    { id: '1001', name: '管理员', remark: '超管', users: userIds([1, 7, 13, 20]), status: '启用' },
    { id: '1002', name: '海外负责人', remark: '', users: userIds([8, 21]), status: '启用' },
    { id: '1003', name: '海外投放', remark: '', users: userIds([1, 3, 9, 15]), status: '启用' },
    { id: '1004', name: '海外素材', remark: '', users: userIds([4, 8, 16, 23]), status: '启用' },
    { id: '1005', name: '财务审计', remark: '', users: userIds([5, 11, 15, 17, 24]), status: '启用' },
    { id: '1006', name: '数据管理', remark: '', users: userIds([6, 14]), status: '启用' },
    { id: '1007', name: '开发测试', remark: '', users: [], status: '禁用' }
  ];

  function buildRoles() {
    return ROLE_SEED.map(function (item, i) {
      var created = new Date(2026, 6, 8, 10, 0, 0);
      created.setDate(created.getDate() + i * 4);
      created.setMinutes((i * 7) % 60);
      created.setSeconds((i * 13) % 60);
      var updated = new Date(2026, 7, 10, 14, 20, 8);
      updated.setMinutes(updated.getMinutes() - i * 37);
      updated.setSeconds((i * 11) % 60);
      return {
        id: item.id,
        name: item.name,
        remark: item.remark || '',
        userIds: item.users.slice(),
        status: item.status,
        updatedAt: formatDateTime(updated),
        createdAt: formatDateTime(created),
        permIds: permsFor(item.name)
      };
    });
  }

  var ALL_ROWS = buildRoles();

  var state = {
    draft: { name: '', status: '' },
    applied: null,
    page: 1,
    pageSize: 20,
    paginationBound: false,
    editMode: 'edit',
    editId: null,
    editStatus: '启用',
    permRoleId: null,
    permChecked: {},
    permCollapsed: {},
    permKeyword: '',
    permAppliedKw: '',
    userRoleId: null,
    selectedIds: [],
    availChecked: {},
    selectedChecked: {},
    availKw: '',
    selectedKw: '',
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
        var count = row.userIds ? row.userIds.length : 0;
        return '<tr data-id="' + escapeHtml(row.id) + '">' +
          '<td class="col-id">' + escapeHtml(row.id) + '</td>' +
          '<td>' + escapeHtml(row.name) + '</td>' +
          '<td title="' + escapeHtml(row.remark || '') + '">' + escapeHtml(row.remark || '-') + '</td>' +
          '<td>' + count + '</td>' +
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
    if (window.ColResize) ColResize.refresh($('roleTable'));
  }

  function nextRoleId() {
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
    state.editStatus = '启用';
    clearEditErrors();
    $('editModalTitle').textContent = '添加角色';
    $('editName').value = '';
    $('editRemark').value = '';
    syncEditClears();
    UI.setSegValue('editStatusSeg', '启用');
    UI.openModal('editModal');
  }

  function openEdit(row) {
    state.editMode = 'edit';
    state.editId = row.id;
    state.editStatus = row.status || '启用';
    clearEditErrors();
    $('editModalTitle').textContent = '编辑角色';
    $('editName').value = row.name;
    $('editRemark').value = row.remark || '';
    syncEditClears();
    UI.setSegValue('editStatusSeg', state.editStatus);
    UI.openModal('editModal');
  }

  function submitEdit() {
    clearEditErrors();
    var name = ($('editName').value || '').trim();
    var remark = ($('editRemark').value || '').trim();
    var status = state.editStatus || '启用';

    if (!name) {
      setItemError('editNameItem', true, '请输入角色名称');
      return;
    }

    var duplicated = ALL_ROWS.some(function (r) {
      if (state.editMode === 'edit' && r.id === state.editId) return false;
      return r.name === name;
    });
    if (duplicated) {
      setItemError('editNameItem', true, '角色名称已存在');
      return;
    }

    var now = formatDateTime(new Date());
    if (state.editMode === 'add') {
      ALL_ROWS.unshift({
        id: nextRoleId(),
        name: name,
        remark: remark,
        userIds: [],
        status: status,
        updatedAt: now,
        createdAt: now,
        permIds: ['m1']
      });
      UI.showToast('添加成功', 'success');
    } else {
      var row = findRow(state.editId);
      if (!row) return;
      row.name = name;
      row.remark = remark;
      row.status = status;
      row.updatedAt = now;
      UI.showToast('提交成功', 'success');
    }
    UI.closeModal('editModal');
    applyFilters();
    renderTable();
  }

  function nodeVisible(node, kw) {
    if (!kw) return true;
    if (node.name.toLowerCase().indexOf(kw) !== -1) return true;
    return (node.children || []).some(function (c) { return nodeVisible(c, kw); });
  }

  function syncPermCheckState(node) {
    var leaves = getDescendantLeafIds(node);
    var checkedCount = leaves.filter(function (id) { return !!state.permChecked[id]; }).length;
    return {
      checked: checkedCount === leaves.length && leaves.length > 0,
      indeterminate: checkedCount > 0 && checkedCount < leaves.length
    };
  }

  function renderPermTree() {
    var kw = (state.permAppliedKw || '').trim().toLowerCase();
    var root = $('permTree');

    function renderNode(node) {
      if (!nodeVisible(node, kw)) return '';
      var hasChildren = !!(node.children && node.children.length);
      var collapsed = kw ? false : !!state.permCollapsed[node.id];
      var st = syncPermCheckState(node);
      var toggleCls = hasChildren ? '' : ' is-leaf';
      var nodeCls = 'perm-node' + (collapsed ? ' is-collapsed' : '');
      var childrenHtml = '';
      if (hasChildren) {
        childrenHtml = '<ul class="perm-node__children">' +
          node.children.map(function (c) { return renderNode(c); }).join('') +
        '</ul>';
      }
      return '<li class="' + nodeCls + '" data-id="' + escapeHtml(node.id) + '">' +
        '<div class="perm-node__row">' +
          '<button class="perm-node__toggle' + toggleCls + '" type="button" data-toggle="' + escapeHtml(node.id) + '" aria-label="展开收起">' +
            '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
          '</button>' +
          '<label class="perm-node__label">' +
            '<input type="checkbox" data-perm="' + escapeHtml(node.id) + '"' +
              (st.checked ? ' checked' : '') + ' />' +
            '<span>' + escapeHtml(node.name) + '</span>' +
          '</label>' +
        '</div>' +
        childrenHtml +
      '</li>';
    }

    var html = PERM_TREE.map(function (n) { return renderNode(n); }).join('');
    if (!html) {
      root.innerHTML = '<div class="perm-tree__empty">暂无匹配权限</div>';
      return;
    }
    root.innerHTML = '<ul class="perm-node">' + html + '</ul>';

    root.querySelectorAll('input[data-perm]').forEach(function (input) {
      var id = input.getAttribute('data-perm');
      var node = findPermNode(PERM_TREE, id);
      if (!node) return;
      var st = syncPermCheckState(node);
      input.checked = st.checked;
      input.indeterminate = st.indeterminate;
    });
  }

  function setPermLeaves(leafIds, checked) {
    leafIds.forEach(function (id) {
      if (checked) state.permChecked[id] = true;
      else delete state.permChecked[id];
    });
  }

  function openPerm(row) {
    state.permRoleId = row.id;
    state.permChecked = {};
    (row.permIds || []).forEach(function (id) { state.permChecked[id] = true; });
    state.permCollapsed = {};
    state.permKeyword = '';
    state.permAppliedKw = '';
    $('permSearch').value = '';
    $('permModalTitle').textContent = '角色权限 · ' + row.name;
    renderPermTree();
    UI.openModal('permModal');
  }

  function submitPerm() {
    var row = findRow(state.permRoleId);
    if (!row) return;
    row.permIds = Object.keys(state.permChecked).filter(function (id) { return state.permChecked[id]; });
    row.updatedAt = formatDateTime(new Date());
    UI.closeModal('permModal');
    UI.showToast('提交成功', 'success');
    renderTable();
  }

  $('permTree').addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-toggle]');
    if (!toggle || toggle.classList.contains('is-leaf')) return;
    var tid = toggle.getAttribute('data-toggle');
    state.permCollapsed[tid] = !state.permCollapsed[tid];
    renderPermTree();
  });

  $('permTree').addEventListener('change', function (e) {
    var input = e.target.closest('input[data-perm]');
    if (!input) return;
    var id = input.getAttribute('data-perm');
    var node = findPermNode(PERM_TREE, id);
    if (!node) return;
    setPermLeaves(getDescendantLeafIds(node), input.checked);
    renderPermTree();
  });

  $('permSearchBtn').addEventListener('click', function () {
    state.permAppliedKw = ($('permSearch').value || '').trim();
    renderPermTree();
  });
  $('permSearch').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      $('permSearchBtn').click();
    }
  });

  function getUserById(id) {
    return ALL_USER_POOL.find(function (u) { return u.id === id; });
  }

  function renderTransfer() {
    var selectedSet = {};
    state.selectedIds.forEach(function (id) { selectedSet[id] = true; });

    var availAll = ALL_USER_POOL.filter(function (u) { return !selectedSet[u.id]; });
    var selectedAll = state.selectedIds.map(getUserById).filter(Boolean);

    var availKw = (state.availKw || '').trim().toLowerCase();
    var selectedKw = (state.selectedKw || '').trim().toLowerCase();
    var availVisible = availAll.filter(function (u) {
      return !availKw || u.name.toLowerCase().indexOf(availKw) !== -1;
    });
    var selectedVisible = selectedAll.filter(function (u) {
      return !selectedKw || u.name.toLowerCase().indexOf(selectedKw) !== -1;
    });

    var availCheckedCount = availVisible.filter(function (u) { return state.availChecked[u.id]; }).length;
    var selectedCheckedCount = selectedVisible.filter(function (u) { return state.selectedChecked[u.id]; }).length;

    $('availCount').textContent = availCheckedCount + ' / ' + availAll.length;
    $('selectedCount').textContent = selectedCheckedCount + ' / ' + selectedAll.length;

    var availAllBox = $('availCheckAll');
    availAllBox.checked = availVisible.length > 0 && availCheckedCount === availVisible.length;
    availAllBox.indeterminate = availCheckedCount > 0 && availCheckedCount < availVisible.length;

    var selectedAllBox = $('selectedCheckAll');
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

    $('availList').innerHTML = listHtml(availVisible, state.availChecked, '暂无数据');
    $('selectedList').innerHTML = listHtml(selectedVisible, state.selectedChecked, '暂无已选');

    $('moveToSelected').disabled = availCheckedCount === 0;
    $('moveToAvail').disabled = selectedCheckedCount === 0;
  }

  function openUsers(row) {
    state.userRoleId = row.id;
    state.selectedIds = (row.userIds || []).slice();
    state.availChecked = {};
    state.selectedChecked = {};
    state.availKw = '';
    state.selectedKw = '';
    $('availSearch').value = '';
    $('selectedSearch').value = '';
    $('userModalTitle').textContent = '关联用户 · ' + row.name;
    renderTransfer();
    UI.openModal('userModal');
  }

  function submitUsers() {
    var row = findRow(state.userRoleId);
    if (!row) return;
    row.userIds = state.selectedIds.slice();
    row.updatedAt = formatDateTime(new Date());
    UI.closeModal('userModal');
    UI.showToast('提交成功', 'success');
    renderTable();
  }

  $('availList').addEventListener('change', function (e) {
    var input = e.target.closest('input[type="checkbox"]');
    if (!input) return;
    if (input.checked) state.availChecked[input.value] = true;
    else delete state.availChecked[input.value];
    renderTransfer();
  });

  $('selectedList').addEventListener('change', function (e) {
    var input = e.target.closest('input[type="checkbox"]');
    if (!input) return;
    if (input.checked) state.selectedChecked[input.value] = true;
    else delete state.selectedChecked[input.value];
    renderTransfer();
  });

  $('availCheckAll').addEventListener('change', function () {
    var checked = this.checked;
    var selectedSet = {};
    state.selectedIds.forEach(function (id) { selectedSet[id] = true; });
    var availKw = (state.availKw || '').trim().toLowerCase();
    ALL_USER_POOL.forEach(function (u) {
      if (selectedSet[u.id]) return;
      if (availKw && u.name.toLowerCase().indexOf(availKw) === -1) return;
      if (checked) state.availChecked[u.id] = true;
      else delete state.availChecked[u.id];
    });
    renderTransfer();
  });

  $('selectedCheckAll').addEventListener('change', function () {
    var checked = this.checked;
    var selectedKw = (state.selectedKw || '').trim().toLowerCase();
    state.selectedIds.forEach(function (id) {
      var u = getUserById(id);
      if (!u) return;
      if (selectedKw && u.name.toLowerCase().indexOf(selectedKw) === -1) return;
      if (checked) state.selectedChecked[id] = true;
      else delete state.selectedChecked[id];
    });
    renderTransfer();
  });

  $('availSearch').addEventListener('input', function () {
    state.availKw = this.value || '';
    renderTransfer();
  });
  $('selectedSearch').addEventListener('input', function () {
    state.selectedKw = this.value || '';
    renderTransfer();
  });

  $('moveToSelected').addEventListener('click', function () {
    var moving = Object.keys(state.availChecked).filter(function (id) { return state.availChecked[id]; });
    moving.forEach(function (id) {
      if (state.selectedIds.indexOf(id) === -1) state.selectedIds.push(id);
      delete state.availChecked[id];
    });
    renderTransfer();
  });

  $('moveToAvail').addEventListener('click', function () {
    var moving = Object.keys(state.selectedChecked).filter(function (id) { return state.selectedChecked[id]; });
    state.selectedIds = state.selectedIds.filter(function (id) { return moving.indexOf(id) === -1; });
    moving.forEach(function (id) { delete state.selectedChecked[id]; });
    renderTransfer();
  });

  function openDelete(row) {
    state.deleteId = row.id;
    var count = row.userIds ? row.userIds.length : 0;
    state.deleteBlocked = count > 0;
    $('deleteTitle').textContent = '删除确认';
    $('deleteBody').textContent = state.deleteBlocked
      ? '当前角色存在关联用户，请移除后再执行删除。'
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

  document.querySelectorAll('[data-close="editModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () { UI.closeModal('editModal'); });
  });
  $('editSubmit').addEventListener('click', submitEdit);

  document.querySelectorAll('[data-close="permModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () { UI.closeModal('permModal'); });
  });
  $('permSubmit').addEventListener('click', submitPerm);

  document.querySelectorAll('[data-close="userModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () { UI.closeModal('userModal'); });
  });
  $('userSubmit').addEventListener('click', submitUsers);

  document.querySelectorAll('[data-close="deleteModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.deleteId = null;
      state.deleteBlocked = false;
      UI.closeModal('deleteModal');
    });
  });
  $('deleteOk').addEventListener('click', confirmDelete);

  applyFilters();
  renderTable();
})();
