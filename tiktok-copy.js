/* 投放系统 · 素材 / 文案库 / TikTok
 * 文案、标题包两个 Tab。字符按中文/日文 2、其余 1 计算。
 */
(function () {
  'use strict';

  var UI = window.ProductUI;
  if (!UI) return;

  var $ = UI.$;
  var escapeHtml = UI.escapeHtml;
  var MAX_UNITS = 100;
  var PACK_MAX = 5;

  var copies = [
    row('c1', 'Play free and beat every level today', '英语区促活', '用户A', '2026-11-16 10:12:08'),
    row('c2', '今すぐ無料で遊ぼう', '日文开玩', '用户B', '2026-11-15 18:06:12'),
    row('c3', '免费下载，马上开玩', '短剧引流', '用户A', '2026-11-14 09:30:00'),
    row('c4', 'Download now！限时奖励', '中英混合', '用户C', '2026-11-13 14:22:41'),
    row('c5', 'Sort the coins and win big rewards', '', '用户A', '2026-11-12 11:08:33'),
    row('c6', 'レベルをクリアして報酬をゲット', '日文奖励', '用户B', '2026-11-11 20:16:05'),
    row('c7', 'New levels every Friday', '每周更新', '用户C', '2026-11-10 08:45:19'),
    row('c8', '通关就送钻石，快来挑战', '', '用户A', '2026-11-09 16:02:57'),
    row('c9', 'Tap to start your next win', '英语区按钮', '用户B', '2026-11-08 13:27:40'),
    row('c10', '本日限定、ダイヤ2倍', '日文限时', '用户C', '2026-11-07 19:51:22'),
    row('c11', 'Clear the stage in one try', '', '用户A', '2026-11-06 10:33:15'),
    row('c12', '失敗しても、もう一回', '日文重试', '用户B', '2026-11-05 15:18:46')
  ];

  var packs = [
    pack('p1', '英文促活包', ['Play free and beat every level today', 'Sort the coins and win big rewards', 'Tap to start your next win'], '投放英语区', '用户A', '2026-11-16 10:20:00'),
    pack('p2', '日文开玩包', ['今すぐ無料で遊ぼう', 'レベルをクリアして報酬をゲット'], '', '用户B', '2026-11-15 18:06:12'),
    pack('p3', '中文下载包', ['免费下载，马上开玩', '通关就送钻石，快来挑战'], '短剧引流', '用户A', '2026-11-14 09:30:00'),
    pack('p4', '混合测试包', ['Download now！限时奖励'], '中英混合', '用户C', '2026-11-12 21:15:44'),
    pack('p5', '满额标题包', ['Play free and beat every level today', '免费下载，马上开玩', 'Sort the coins and win big rewards', 'New levels every Friday', 'Clear the stage in one try'], '已到五条上限', '用户B', '2026-11-10 11:00:00'),
    pack('p6', '日文挑战包', ['本日限定、ダイヤ2倍', '失敗しても、もう一回'], '', '用户C', '2026-11-08 16:42:18')
  ];

  function row(id, text, remark, creator, createdAt) {
    return { id: id, text: text, remark: remark, creator: creator, createdAt: createdAt };
  }

  function pack(id, name, texts, remark, creator, createdAt) {
    return { id: id, name: name, texts: texts.slice(), remark: remark, creator: creator, createdAt: createdAt };
  }

  var copySeq = 12;
  var packSeq = 6;
  var tab = 'copy';
  var editingCopyId = null;
  var editingPackId = null;
  var pendingDelete = null;

  var copyDraft = { text: '', creators: [] };
  var copyApplied = { text: '', creators: [] };
  var copyPage = 1;
  var copyPageSize = 20;

  var packDraft = { name: '', creators: [] };
  var packApplied = { name: '', creators: [] };
  var packPage = 1;
  var packPageSize = 20;
  var packExpanded = {};

  function currentCreator() {
    var user = window.DeliveryShell && DeliveryShell.currentUser && DeliveryShell.currentUser();
    return (user && user.nickname) || '用户A';
  }

  function nowText() {
    var d = new Date();
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  function isWideChar(code) {
    if (code >= 0x3040 && code <= 0x30FF) return true;
    if (code >= 0x31F0 && code <= 0x31FF) return true;
    if (code >= 0x3400 && code <= 0x4DBF) return true;
    if (code >= 0x4E00 && code <= 0x9FFF) return true;
    if (code >= 0xF900 && code <= 0xFAFF) return true;
    if (code >= 0x3000 && code <= 0x303F) return true;
    if (code >= 0xFF01 && code <= 0xFF60) return true;
    if (code >= 0xFF61 && code <= 0xFF9F) return true;
    if (code >= 0xFFE0 && code <= 0xFFE6) return true;
    return false;
  }

  function copyUnits(text) {
    var units = 0;
    var i = 0;
    var value = String(text || '');
    while (i < value.length) {
      var code = value.codePointAt(i);
      units += isWideChar(code) ? 2 : 1;
      i += code > 0xFFFF ? 2 : 1;
    }
    return units;
  }

  function copyLines(value) {
    var raw = String(value || '').replace(/\r\n/g, '\n').replace(/^\n+|\n+$/g, '');
    if (!raw.trim()) return [];
    return raw.split('\n');
  }

  function contentUnits(value) {
    var lines = copyLines(value);
    return lines.reduce(function (sum, line) { return sum + copyUnits(line); }, 0);
  }

  function includesText(source, keyword) {
    if (!keyword) return true;
    return String(source || '').toLowerCase().indexOf(keyword) !== -1;
  }

  function matchCreators(creator, selected) {
    if (!selected || !selected.length) return true;
    return selected.indexOf(creator) !== -1;
  }

  function creatorOptions() {
    var set = { '用户A': true, '用户B': true, '用户C': true };
    copies.forEach(function (item) { if (item.creator) set[item.creator] = true; });
    packs.forEach(function (item) { if (item.creator) set[item.creator] = true; });
    var me = currentCreator();
    if (me) set[me] = true;
    return Object.keys(set).sort();
  }

  function sorted(list) {
    return list.slice().sort(function (a, b) {
      if (a.createdAt === b.createdAt) return a.id < b.id ? 1 : -1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }

  function filteredCopies() {
    var text = copyApplied.text.trim().toLowerCase();
    return sorted(copies.filter(function (item) {
      return includesText(item.text, text) &&
        matchCreators(item.creator, copyApplied.creators);
    }));
  }

  function filteredPacks() {
    var name = packApplied.name.trim().toLowerCase();
    return sorted(packs.filter(function (item) {
      return includesText(item.name, name) &&
        matchCreators(item.creator, packApplied.creators);
    }));
  }

  function actionCell(id) {
    return '<td class="col-action"><span class="action-links">' +
      '<button class="link" type="button" data-action="edit" data-id="' + escapeHtml(id) + '">编辑</button>' +
      '<button class="link link--danger" type="button" data-action="delete" data-id="' + escapeHtml(id) + '">删除</button>' +
    '</span></td>';
  }

  function renderCopyTable() {
    var list = filteredCopies();
    var totalPages = Math.max(1, Math.ceil(list.length / copyPageSize) || 1);
    if (copyPage > totalPages) copyPage = totalPages;
    var start = (copyPage - 1) * copyPageSize;
    var pageRows = list.slice(start, start + copyPageSize);
    var body = $('copyBody');
    var empty = $('copyEmpty');
    if (!pageRows.length) {
      body.innerHTML = '';
      empty.hidden = false;
    } else {
      empty.hidden = true;
      body.innerHTML = pageRows.map(function (item) {
        return '<tr>' +
          '<td title="' + escapeHtml(item.text) + '">' + escapeHtml(item.text) + '</td>' +
          '<td>' + contentUnits(item.text) + '</td>' +
          '<td>' + escapeHtml(item.creator) + '</td>' +
          '<td>' + escapeHtml(item.createdAt) + '</td>' +
          actionCell(item.id) +
        '</tr>';
      }).join('');
    }
    UI.renderPagination({
      containerId: 'copyPagination',
      total: list.length,
      page: copyPage,
      pageSize: copyPageSize
    });
    if (window.ColResize) ColResize.refresh($('copyTable'));
  }

  function renderPackTable() {
    var list = filteredPacks();
    var totalPages = Math.max(1, Math.ceil(list.length / packPageSize) || 1);
    if (packPage > totalPages) packPage = totalPages;
    var start = (packPage - 1) * packPageSize;
    var pageRows = list.slice(start, start + packPageSize);
    var body = $('packBody');
    var empty = $('packEmpty');
    if (!pageRows.length) {
      body.innerHTML = '';
      empty.hidden = false;
    } else {
      empty.hidden = true;
      body.innerHTML = pageRows.map(function (item) {
        var texts = item.texts || [];
        var open = !!packExpanded[item.id] && texts.length > 0;
        var lines = open ? '<tr class="pack-detail"><td colspan="5"><div class="pack-lines">' +
          texts.map(function (text) {
            return '<div class="pack-lines__item">' + escapeHtml(text) + '</div>';
          }).join('') +
        '</div></td></tr>' : '';
        return '<tr>' +
          '<td><div class="pack-name">' +
            '<button class="pack-expand' + (open ? ' is-open' : '') + '" type="button" data-expand="' + escapeHtml(item.id) + '" aria-expanded="' + (open ? 'true' : 'false') + '" aria-label="' + (open ? '收起' : '展开') + '"' + (texts.length ? '' : ' disabled') + '>' +
              '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.5 2.5L8 6L4.5 9.5"/></svg>' +
            '</button>' +
            '<span class="pack-name__text" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</span>' +
          '</div></td>' +
          '<td>' + texts.length + '</td>' +
          '<td>' + escapeHtml(item.creator) + '</td>' +
          '<td>' + escapeHtml(item.createdAt) + '</td>' +
          actionCell(item.id) +
        '</tr>' + lines;
      }).join('');
    }
    UI.renderPagination({
      containerId: 'packPagination',
      total: list.length,
      page: packPage,
      pageSize: packPageSize
    });
    if (window.ColResize) ColResize.refresh($('packTable'));
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

  function copyTextError(value) {
    if (!String(value || '').trim()) return '请输入文案';
    if (copyUnits(value) > MAX_UNITS) return '文案不能超过100个字符';
    return '';
  }

  var LINE_PLACEHOLDER = '单行限制 1-100 字符，添加多行请回车换行';
  var LINE_CLEAR_ICON = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l6 6M9 3L3 9"/></svg>';
  var copyEditor = null;
  var packEditor = null;

  function bindLineEditor(editorId, options) {
    var state = [''];
    var max = options.max || 0;
    var root = $(editorId);

    function render(focusIndex, caret) {
      root.innerHTML = state.map(function (text, index) {
        var over = copyUnits(text) > MAX_UNITS;
        return '<div class="line-editor__row' + (over ? ' is-over' : '') + '">' +
          '<span class="line-editor__no">' + (index + 1) + '</span>' +
          '<div class="line-editor__field">' +
            '<input class="line-editor__input" type="text" data-index="' + index + '" value="' + escapeHtml(text) + '" placeholder="' + escapeHtml(LINE_PLACEHOLDER) + '" autocomplete="off" />' +
            '<button class="line-editor__clear" type="button" data-clear="' + index + '" aria-label="清除"' + (text ? '' : ' hidden') + '>' + LINE_CLEAR_ICON + '</button>' +
          '</div>' +
        '</div>';
      }).join('');
      if (options.onSync) options.onSync();
      if (focusIndex == null) return;
      var input = root.querySelector('.line-editor__input[data-index="' + focusIndex + '"]');
      if (!input) return;
      input.focus();
      var pos = caret == null ? input.value.length : Math.min(caret, input.value.length);
      input.setSelectionRange(pos, pos);
    }

    root.addEventListener('input', function (e) {
      var input = e.target.closest('.line-editor__input');
      if (!input || !root.contains(input)) return;
      var index = Number(input.getAttribute('data-index'));
      var text = input.value;
      var row = input.closest('.line-editor__row');
      var clear = row.querySelector('.line-editor__clear');
      state[index] = text;
      row.classList.toggle('is-over', copyUnits(text) > MAX_UNITS);
      if (clear) clear.hidden = !text;
      if (options.onSync) options.onSync();
    });

    root.addEventListener('keydown', function (e) {
      var input = e.target.closest('.line-editor__input');
      if (!input || !root.contains(input)) return;
      var index = Number(input.getAttribute('data-index'));
      if (e.key === 'Enter') {
        e.preventDefault();
        if (max && state.length >= max) {
          if (options.onLimit) options.onLimit();
          return;
        }
        var caret = input.selectionStart || 0;
        state[index] = input.value.slice(0, caret);
        state.splice(index + 1, 0, input.value.slice(caret));
        render(index + 1, 0);
        return;
      }
      if (e.key === 'Backspace' && input.selectionStart === 0 && input.selectionEnd === 0 && index > 0) {
        e.preventDefault();
        var prev = state[index - 1];
        state[index - 1] = prev + input.value;
        state.splice(index, 1);
        render(index - 1, prev.length);
      }
    });

    root.addEventListener('paste', function (e) {
      var input = e.target.closest('.line-editor__input');
      if (!input || !root.contains(input)) return;
      var pasted = (e.clipboardData || window.clipboardData).getData('text') || '';
      if (pasted.indexOf('\n') === -1 && pasted.indexOf('\r') === -1) return;
      e.preventDefault();
      var index = Number(input.getAttribute('data-index'));
      var start = input.selectionStart || 0;
      var end = input.selectionEnd || 0;
      var merged = input.value.slice(0, start) + pasted.replace(/\r\n/g, '\n').replace(/\r/g, '\n') + input.value.slice(end);
      var parts = merged.split('\n');
      var next = state.slice(0, index).concat(parts, state.slice(index + 1));
      var limited = false;
      if (max && next.length > max) {
        next = next.slice(0, max);
        limited = true;
      }
      state = next;
      var focus = Math.min(index + parts.length - 1, state.length - 1);
      render(focus, state[focus].length);
      if (limited && options.onLimit) options.onLimit();
    });

    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-clear]');
      if (!btn || !root.contains(btn)) return;
      var index = Number(btn.getAttribute('data-clear'));
      if (state.length <= 1) {
        state[0] = '';
        render(0, 0);
        return;
      }
      state.splice(index, 1);
      render(Math.min(index, state.length - 1), 0);
    });

    return {
      getLines: function () { return state.slice(); },
      setLines: function (lines) {
        var next = lines && lines.length ? lines.slice() : [''];
        if (max && next.length > max) next = next.slice(0, max);
        state = next;
      },
      render: render
    };
  }

  function filledLines(lines) {
    return lines.reduce(function (list, line) {
      var text = String(line || '').trim();
      if (text) list.push(text);
      return list;
    }, []);
  }

  function editorLinesError(lines) {
    var filled = filledLines(lines);
    var i;
    if (!filled.length) return '请输入文案';
    for (i = 0; i < filled.length; i += 1) {
      if (copyUnits(filled[i]) > MAX_UNITS) return '文案不能超过100个字符';
    }
    return '';
  }

  function firstBadLine(lines) {
    var i;
    for (i = 0; i < lines.length; i += 1) {
      var text = String(lines[i] || '').trim();
      if (text && copyUnits(text) > MAX_UNITS) return i;
    }
    return 0;
  }

  function syncLineEditorError() {
    var lines = copyEditor.getLines();
    var over = lines.some(function (line) { return copyUnits(line) > MAX_UNITS; });
    if (over) setItemError('copyTextItem', true, '文案不能超过100个字符');
    else if (lines.some(function (line) { return String(line).trim(); })) setItemError('copyTextItem', false);
  }

  function renderCopyLines(focusIndex, caret) {
    copyEditor.render(focusIndex, caret);
  }

  function singleLine(value) {
    return String(value || '').replace(/\r\n/g, '\n').replace(/[\r\n]/g, '');
  }

  function syncEditField() {
    var value = $('copyEditText').value || '';
    var units = copyUnits(value);
    $('copyEditCount').textContent = units + '/' + MAX_UNITS;
    $('copyEditBox').classList.toggle('is-over', units > MAX_UNITS);
    if (units > MAX_UNITS) setItemError('copyTextItem', true, '文案不能超过100个字符');
    else if (value.trim()) setItemError('copyTextItem', false);
  }

  function openCopyModal(item) {
    var editing = !!item;
    var text = item ? singleLine(item.text) : '';
    editingCopyId = item ? item.id : null;
    $('copyModalTitle').textContent = editing ? '编辑文案' : '添加文案';
    $('copyLineEditor').hidden = editing;
    $('copyEditBox').hidden = !editing;
    setItemError('copyTextItem', false);
    if (editing) {
      $('copyEditText').value = text;
      syncEditField();
    } else {
      copyEditor.setLines(['']);
      renderCopyLines(0, 0);
    }
    UI.closePanels();
    UI.openModal('copyModal');
    if (editing) $('copyEditText').focus();
  }

  function closeCopyModal() {
    UI.closeModal('copyModal');
    editingCopyId = null;
  }

  function submitCopy() {
    var message;
    if (editingCopyId) {
      var saved = singleLine($('copyEditText').value || '').trim();
      message = copyTextError(saved);
      if (message) {
        setItemError('copyTextItem', true, message);
        $('copyEditText').focus();
        return;
      }
      var target = copies.find(function (item) { return item.id === editingCopyId; });
      if (target) target.text = saved;
      UI.showToast('提交成功', 'success');
    } else {
      var draftLines = copyEditor.getLines();
      message = editorLinesError(draftLines);
      if (message) {
        setItemError('copyTextItem', true, message);
        renderCopyLines(firstBadLine(draftLines), 0);
        return;
      }
      var lines = filledLines(draftLines);
      var createdAt = nowText();
      var i;
      for (i = lines.length - 1; i >= 0; i -= 1) {
        copySeq += 1;
        copies.push(row('c' + copySeq, lines[i], '', currentCreator(), createdAt));
      }
      copyPage = 1;
      UI.showToast('添加成功', 'success');
    }
    closeCopyModal();
    if (copyCreatorMulti) copyCreatorMulti.render();
    if (packCreatorMulti) packCreatorMulti.render();
    renderCopyTable();
  }

  function syncPackLineError() {
    var lines = packEditor.getLines();
    var over = lines.some(function (line) { return copyUnits(line) > MAX_UNITS; });
    if (over) setItemError('packCopiesItem', true, '文案不能超过100个字符');
    else if (lines.length < PACK_MAX && lines.some(function (line) { return String(line).trim(); })) {
      setItemError('packCopiesItem', false);
    }
  }

  function openPackModal(item) {
    editingPackId = item ? item.id : null;
    $('packModalTitle').textContent = item ? '编辑标题包' : '添加标题包';
    $('packName').value = item ? item.name : '';
    packEditor.setLines(item && item.texts && item.texts.length ? item.texts.slice() : ['']);
    setItemError('packNameItem', false);
    setItemError('packCopiesItem', false);
    packEditor.render(0, 0);
    if (packNameClear) packNameClear.sync();
    UI.closePanels();
    UI.openModal('packModal');
    $('packName').focus();
  }

  function closePackModal() {
    UI.closeModal('packModal');
    editingPackId = null;
  }

  function packNameError(name) {
    var value = String(name || '').trim();
    if (!value) return '请输入标题包名称';
    var duplicated = packs.some(function (item) {
      return item.name === value && item.id !== editingPackId;
    });
    if (duplicated) return '标题包名称已存在';
    return '';
  }

  function submitPack() {
    var name = $('packName').value || '';
    var lines = packEditor.getLines();
    var nameMessage = packNameError(name);
    var lineMessage = editorLinesError(lines);
    setItemError('packNameItem', !!nameMessage, nameMessage);
    if (filledLines(lines).length > PACK_MAX) lineMessage = '一个标题包只能添加1-5条文案';
    setItemError('packCopiesItem', !!lineMessage, lineMessage || '请输入文案');
    if (nameMessage) {
      $('packName').focus();
      return;
    }
    if (lineMessage) {
      packEditor.render(firstBadLine(lines), 0);
      return;
    }
    var savedTexts = filledLines(lines);
    if (editingPackId) {
      var target = packs.find(function (item) { return item.id === editingPackId; });
      if (target) {
        target.name = name.trim();
        target.texts = savedTexts;
      }
      UI.showToast('提交成功', 'success');
    } else {
      packSeq += 1;
      packs.push(pack('p' + packSeq, name.trim(), savedTexts, '', currentCreator(), nowText()));
      packPage = 1;
      UI.showToast('添加成功', 'success');
    }
    closePackModal();
    if (copyCreatorMulti) copyCreatorMulti.render();
    if (packCreatorMulti) packCreatorMulti.render();
    renderPackTable();
  }

  function askDelete(kind, id) {
    pendingDelete = { kind: kind, id: id };
    UI.closePanels();
    UI.openModal('deleteModal');
  }

  function closeDelete() {
    UI.closeModal('deleteModal');
    pendingDelete = null;
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'copy') {
      copies = copies.filter(function (item) { return item.id !== pendingDelete.id; });
      renderCopyTable();
    } else {
      packs = packs.filter(function (item) { return item.id !== pendingDelete.id; });
      renderPackTable();
    }
    closeDelete();
    UI.showToast('删除成功', 'success');
  }

  function switchTab(next) {
    tab = next === 'pack' ? 'pack' : 'copy';
    document.querySelectorAll('.page-tabs__item').forEach(function (btn) {
      var on = btn.getAttribute('data-tab') === tab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $('copyFilterBar').hidden = tab !== 'copy';
    $('packFilterBar').hidden = tab !== 'pack';
    $('copyPanel').hidden = tab !== 'copy';
    $('packPanel').hidden = tab !== 'pack';
    UI.closePanels();
    if (tab === 'copy') renderCopyTable();
    else renderPackTable();
  }

  function bindCreator(prefix, draft) {
    return UI.bindMultiSelect({
      wrapId: prefix + 'CreatorWrap',
      triggerId: prefix + 'CreatorTrigger',
      panelId: prefix + 'CreatorPanel',
      labelId: prefix + 'CreatorLabel',
      listId: prefix + 'CreatorList',
      clearId: prefix + 'CreatorClear',
      prefix: '创建人：',
      getOptions: creatorOptions,
      getSelected: function () { return draft.creators; },
      setSelected: function (arr) { draft.creators = arr.slice(); }
    });
  }

  var copyCreatorMulti = bindCreator('copy', copyDraft);
  var packCreatorMulti = bindCreator('pack', packDraft);
  var packNameClear = UI.bindInputClearable({ wrapId: 'packNameWrap' });

  UI.bindInputClearable({ wrapId: 'copyTextFilterWrap' });
  UI.bindInputClearable({ wrapId: 'packNameFilterWrap' });
  if (UI.bindFormHelp) UI.bindFormHelp(document);

  function bindQueryInput(id, apply) {
    $(id).addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        apply();
      }
    });
  }

  function applyCopyQuery() {
    copyDraft.text = $('copyTextFilter').value || '';
    copyApplied = {
      text: copyDraft.text,
      creators: copyDraft.creators.slice()
    };
    copyPage = 1;
    renderCopyTable();
  }

  function resetCopyQuery() {
    copyDraft.text = '';
    copyDraft.creators = [];
    $('copyTextFilter').value = '';
    $('copyTextFilter').dispatchEvent(new Event('input', { bubbles: true }));
    if (copyCreatorMulti) copyCreatorMulti.render();
    applyCopyQuery();
  }

  function applyPackQuery() {
    packDraft.name = $('packNameFilter').value || '';
    packApplied = {
      name: packDraft.name,
      creators: packDraft.creators.slice()
    };
    packPage = 1;
    renderPackTable();
  }

  function resetPackQuery() {
    packDraft.name = '';
    packDraft.creators = [];
    $('packNameFilter').value = '';
    $('packNameFilter').dispatchEvent(new Event('input', { bubbles: true }));
    if (packCreatorMulti) packCreatorMulti.render();
    applyPackQuery();
  }

  UI.bindPagination({
    containerId: 'copyPagination',
    getTotal: function () { return filteredCopies().length; },
    getPage: function () { return copyPage; },
    getPageSize: function () { return copyPageSize; },
    onPageChange: function (page) { copyPage = page; renderCopyTable(); },
    onPageSizeChange: function (size) { copyPageSize = size; copyPage = 1; renderCopyTable(); }
  });

  UI.bindPagination({
    containerId: 'packPagination',
    getTotal: function () { return filteredPacks().length; },
    getPage: function () { return packPage; },
    getPageSize: function () { return packPageSize; },
    onPageChange: function (page) { packPage = page; renderPackTable(); },
    onPageSizeChange: function (size) { packPageSize = size; packPage = 1; renderPackTable(); }
  });

  $('copyQueryBtn').addEventListener('click', applyCopyQuery);
  $('copyResetBtn').addEventListener('click', resetCopyQuery);
  $('copyAddBtn').addEventListener('click', function () { openCopyModal(null); });
  $('packQueryBtn').addEventListener('click', applyPackQuery);
  $('packResetBtn').addEventListener('click', resetPackQuery);
  $('packAddBtn').addEventListener('click', function () { openPackModal(null); });
  bindQueryInput('copyTextFilter', applyCopyQuery);
  bindQueryInput('packNameFilter', applyPackQuery);

  copyEditor = bindLineEditor('copyLineEditor', { onSync: syncLineEditorError });
  packEditor = bindLineEditor('packLineEditor', {
    max: PACK_MAX,
    onSync: syncPackLineError,
    onLimit: function () {
      setItemError('packCopiesItem', true, '一个标题包只能添加1-5条文案');
    }
  });

  document.querySelectorAll('.page-tabs__item').forEach(function (btn) {
    btn.addEventListener('click', function () { switchTab(btn.getAttribute('data-tab')); });
  });

  $('copyEditText').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') e.preventDefault();
  });
  $('copyEditText').addEventListener('input', function () {
    var field = $('copyEditText');
    var flat = singleLine(field.value);
    if (flat !== field.value) {
      var caret = field.selectionStart || 0;
      field.value = flat;
      field.setSelectionRange(caret, caret);
    }
    syncEditField();
  });
  $('copyModalClose').addEventListener('click', closeCopyModal);
  $('copyCancelBtn').addEventListener('click', closeCopyModal);
  $('copySubmitBtn').addEventListener('click', submitCopy);

  $('packName').addEventListener('input', function () {
    var message = ($('packName').value || '').trim() ? packNameError($('packName').value) : '';
    if (!message) setItemError('packNameItem', false);
    else if (message === '标题包名称已存在') setItemError('packNameItem', true, message);
  });
  $('packModalClose').addEventListener('click', closePackModal);
  $('packCancelBtn').addEventListener('click', closePackModal);
  $('packSubmitBtn').addEventListener('click', submitPack);

  $('copyBody').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var item = copies.find(function (rowItem) { return rowItem.id === id; });
    if (!item) return;
    if (btn.getAttribute('data-action') === 'edit') openCopyModal(item);
    if (btn.getAttribute('data-action') === 'delete') askDelete('copy', id);
  });

  $('packBody').addEventListener('click', function (e) {
    var expand = e.target.closest('[data-expand]');
    if (expand) {
      var expandId = expand.getAttribute('data-expand');
      packExpanded[expandId] = !packExpanded[expandId];
      renderPackTable();
      return;
    }
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var item = packs.find(function (rowItem) { return rowItem.id === id; });
    if (!item) return;
    if (btn.getAttribute('data-action') === 'edit') openPackModal(item);
    if (btn.getAttribute('data-action') === 'delete') askDelete('pack', id);
  });

  $('deleteClose').addEventListener('click', closeDelete);
  $('deleteCancel').addEventListener('click', closeDelete);
  $('deleteOk').addEventListener('click', confirmDelete);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if ($('deleteModal').classList.contains('is-open')) {
      closeDelete();
      return;
    }
    if ($('copyModal').classList.contains('is-open')) closeCopyModal();
    else if ($('packModal').classList.contains('is-open')) closePackModal();
  });

  renderCopyTable();
  renderPackTable();
})();
