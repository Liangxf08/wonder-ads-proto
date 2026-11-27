/* 素材库 · 参考结构：左树 + 右工作区 */
(function () {
  'use strict';

  var UI = window.ProductUI;
  if (!UI) return;

  var $ = UI.$;
  var escapeHtml = UI.escapeHtml;

  var CURRENT_USER = '用户A';
  var USERS = Array.from({ length: 10 }, function (_, i) {
    return '用户' + String.fromCharCode(65 + i);
  });

  /** 与标签管理定版示例数据对齐（素材迭代组无标签，筛选树不展示） */
  var TAG_TREE = [
    { id: 'sys', label: '系统标签', system: true, children: ['衍生', '未使用', '已使用', '无消耗', '有消耗'] },
    { id: 'lang', label: '语言', children: ['英语', '日语', '繁中'] },
    { id: 'mix', label: '混合玩法', children: ['消消乐', '清理', '保护系列'] },
    { id: 'feat', label: '素材特点', children: ['CTR', '副玩法', 'DOGE'] },
    { id: 'fest', label: '节日限定', children: ['圣诞节', '夏日'] }
  ];
  var FORM_TAG_TREE = TAG_TREE.filter(function (g) { return g.id !== 'sys'; });

  var XMP_FOLDERS = [
    '短剧/竖版',
    '短剧/横版',
    '投放素材',
    '测试文件夹',
    '品牌素材',
    '竞品参考',
    '海外投放/TT',
    '海外投放/FB'
  ];
  function pathsToFolderTree(paths) {
    var roots = [];
    function ensure(nodes, name, id) {
      var i;
      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) return nodes[i];
      }
      var node = { id: id, name: name, children: [] };
      nodes.push(node);
      return node;
    }
    (paths || []).forEach(function (p) {
      var parts = String(p).split('/');
      var acc = '';
      var cur = roots;
      parts.forEach(function (part) {
        acc = acc ? acc + '/' + part : part;
        var node = ensure(cur, part, acc);
        cur = node.children;
      });
    });
    return roots;
  }
  var XMP_FOLDER_TREE = pathsToFolderTree(XMP_FOLDERS);
  var DEFAULT_XMP_FOLDER_NAME = '{创意人}_{YYYYMMDD}';

  var TYPE_TREE = [
    { id: 'video', label: '视频', children: ['mp4', 'mov', 'avi', 'mpeg'] },
    { id: 'image', label: '图片', children: ['jpg', 'jpeg', 'png', 'bmp', 'gif'] }
  ];

  var SIZE_TREE = [
    { id: 'portrait', label: '竖版(9:16)', children: ['1080x1920', '720x1280'] },
    { id: 'landscape', label: '横版(16:9)', children: ['1920x1080', '1280x720'] },
    { id: 'square', label: '方形(1:1)', children: ['1080x1080', '800x800', '512x512', '300x300', '180x180'] }
  ];

  function flattenTreeLeaves(tree) {
    var out = [];
    (tree || []).forEach(function (g) {
      (g.children || []).forEach(function (c) {
        if (out.indexOf(c) === -1) out.push(c);
      });
    });
    return out;
  }

  var TAG_OPTIONS = flattenTreeLeaves(TAG_TREE);

  var SYSTEM_TAG_NAMES = [];
  TAG_TREE.forEach(function (g) {
    if (!g.system) return;
    (g.children || []).forEach(function (c) {
      if (SYSTEM_TAG_NAMES.indexOf(c) === -1) SYSTEM_TAG_NAMES.push(c);
    });
  });

  function isSystemTagName(name) {
    return SYSTEM_TAG_NAMES.indexOf(name) !== -1;
  }

  function withoutSystemTags(arr) {
    return (arr || []).filter(function (t) { return !isSystemTagName(t); });
  }

  function keepSystemTags(next, prev) {
    var sys = (prev || []).filter(isSystemTagName);
    return sys.concat(withoutSystemTags(next).filter(function (t) { return sys.indexOf(t) === -1; }));
  }

  function sortTagsForDisplay(tags) {
    var list = (tags || []).slice();
    list.sort(function (a, b) {
      var ia = SYSTEM_TAG_NAMES.indexOf(a);
      var ib = SYSTEM_TAG_NAMES.indexOf(b);
      var aSys = ia !== -1;
      var bSys = ib !== -1;
      if (aSys && bSys) return ia - ib;
      if (aSys) return -1;
      if (bSys) return 1;
      return 0;
    });
    return list;
  }

  var ALL_FILTERS = [
    { key: 'date', label: '上传时间', kind: 'date' },
    { key: 'name', label: '素材名称', kind: 'keyword', inputId: 'filterName', placeholder: '请输入' },
    { key: 'creator', label: '创意人', kind: 'multi', options: USERS },
    { key: 'sysTag', label: '系统标签', kind: 'multi', options: SYSTEM_TAG_NAMES },
    { key: 'manualTag', label: '手动标签', kind: 'cascade', tree: FORM_TAG_TREE },
    { key: 'type', label: '类型', kind: 'cascade', tree: TYPE_TREE },
    { key: 'size', label: '尺寸', kind: 'cascade', tree: SIZE_TREE },
    { key: 'duration', label: '时长', kind: 'multi', options: ['0-6s', '7-15s', '16-30s', '31-60s', '>60s'] },
    { key: 'source', label: '来源', kind: 'single', options: ['本地上传', '外部采集'] },
    { key: 'xmp', label: '同步XMP', kind: 'single', options: ['是', '否'] },
    { key: 'mediaId', label: '媒体素材ID', kind: 'keyword', inputId: 'filterMediaId', placeholder: '请输入' }
  ];
  var DEFAULT_VISIBLE_FILTERS = ['date', 'name', 'creator', 'sysTag'];
  var DURATION_OPTIONS = ['0-6s', '7-15s', '16-30s', '31-60s', '>60s'];
  var SOURCE_OPTIONS = ['本地上传', '外部采集'];
  var TT_COLLECTED_FOLDER_ID = 'tt_collected';

  /** 自定义列：属性 / 数据（弹窗与列表均展示已选；数据列值需勾选「显示投放数据」并查询后填充） */
  var COLUMN_GROUPS = ['属性', '数据'];
  function colDef(key, name, group, kind, width, def, frozen, copy, sortable) {
    return {
      key: key,
      name: name,
      group: group,
      kind: kind,
      width: width,
      def: !!def,
      defaultFrozen: !!frozen,
      copy: !!copy,
      sortable: !!sortable
    };
  }
  var COLUMNS = [
    colDef('id', 'ID', '属性', 'text', 88, true, true, false, false),
    colDef('name', '素材', '属性', 'text', 280, true, true, false, false),
    colDef('tags', '标签', '属性', 'text', 200, true, false, false, false),
    colDef('creator', '创意人', '属性', 'text', 100, true, false, false, false),
    colDef('file_type', '类型', '属性', 'text', 100, false, false, false, false),
    colDef('file_format', '格式', '属性', 'text', 100, false, false, false, false),
    colDef('width_height', '尺寸', '属性', 'text', 100, false, false, false, false),
    colDef('duration', '时长 (秒)', '属性', 'int', 100, false, false, false, false),
    colDef('source', '来源', '属性', 'text', 100, true, false, false, false),
    colDef('uploaded_at', '上传时间', '属性', 'datetime', 180, true, false, false, true),
    colDef('xmp_synced', '同步XMP', '属性', 'text', 100, false, false, false, false),
    colDef('ad_count', '关联广告数', '属性', 'int', 120, true, false, false, true),
    colDef('reject_count', '拒审次数', '属性', 'int', 120, true, false, false, true),
    colDef('spend', '总消耗', '数据', 'float', 120, true, false, false, true),
    colDef('impressions', '展示数', '数据', 'int', 120, true, false, false, true),
    colDef('clicks', '点击数', '数据', 'int', 120, true, false, false, true),
    colDef('ctr', '点击率', '数据', 'percent', 120, true, false, false, true),
    colDef('cpc', '单次点击成本', '数据', 'float', 120, false, false, false, true),
    colDef('cpm', '千次展示成本', '数据', 'float', 120, false, false, false, true),
    colDef('conversions', '转化数', '数据', 'int', 120, true, false, false, true),
    colDef('cvr', '转化率', '数据', 'percent', 120, false, false, false, true),
    colDef('cpa', '转化成本', '数据', 'float', 120, false, false, false, true),
    colDef('video_views', '播放数', '数据', 'int', 120, true, false, false, true),
    colDef('video_p100', '完播数', '数据', 'int', 120, true, false, false, true),
    colDef('video_p100_rate', '完播率', '数据', 'percent', 120, true, false, false, true),
    colDef('video_p75', '75%播放数', '数据', 'int', 120, false, false, false, true),
    colDef('video_p75_rate', '75%播放率', '数据', 'percent', 120, false, false, false, true),
    colDef('video_p50', '50%播放数', '数据', 'int', 120, false, false, false, true),
    colDef('video_p50_rate', '50%播放率', '数据', 'percent', 120, false, false, false, true),
    colDef('video_p25', '25%播放数', '数据', 'int', 120, false, false, false, true),
    colDef('video_p25_rate', '25%播放率', '数据', 'percent', 120, false, false, false, true)
  ];
  var COLUMN_MAP = {};
  COLUMNS.forEach(function (col) { COLUMN_MAP[col.key] = col; });
  var ACTION_COL_WIDTH = 180;
  var sortApi = null;

  var CASCADE_ARROW = '<svg class="cascade-option__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.5 3L7.5 6L4.5 9"/></svg>';
  var CLEAR_ICON = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l6 6M9 3L3 9"/></svg>';

  var SYNC_CLASS = {
    '未同步': 'sync-tag--pending',
    '同步中': 'sync-tag--syncing',
    '已同步': 'sync-tag--done',
    '同步失败': 'sync-tag--fail'
  };

  var PLATFORMS = [
    { key: 'tt', label: 'TT' },
    { key: 'fb', label: 'FB' },
    { key: 'gg', label: 'GG' },
    { key: 'ap', label: 'AP' }
  ];

  /** 详情抽屉 · 渠道下拉（推送 / 关联广告 / 拒审） */
  var DETAIL_CHANNEL_DEFAULT = 'TikTok';
  var DETAIL_CHANNELS = ['TikTok', 'Meta', 'Google', 'Mintegral', 'AppLovin', 'Unity'];

  var folderSeq = 200;
  var materialSeq = 1000001;

  var FOLDER_ICON = '<img class="tree-node__icon" src="素材/文件夹.png" width="16" height="16" alt="" />';
  var TOGGLE_SVG = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>';
  var EDIT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
  var MORE_SVG = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>';

  /** 系统文件夹：存放/展示全部素材，不可删改 */
  var SYSTEM_FOLDER = (window.MaterialFolderData && window.MaterialFolderData.SYSTEM_FOLDER) || {
    id: 'system_all',
    name: '全部素材',
    system: true,
    children: []
  };

  /**
   * 自定义文件夹树（与 XMP 无关）
   * 与「全部素材」平级 · 真源：material-folder-data.js
   */
  var CUSTOM_FOLDERS = (window.MaterialFolderData && window.MaterialFolderData.CUSTOM_FOLDERS) || [];

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function formatDateTime(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function formatDateYMD(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function formatDateCompact(d) {
    return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate());
  }

  function stripExt(name) {
    var s = String(name || '');
    var i = s.lastIndexOf('.');
    return i > 0 ? s.slice(0, i) : s;
  }

  function fileExt(name) {
    var s = String(name || '');
    var i = s.lastIndexOf('.');
    return i > 0 ? s.slice(i + 1).toLowerCase() : '';
  }

  function buildOssUrl(name, created, id, format) {
    var stem = stripExt(name);
    var day = formatDateCompact(created instanceof Date ? created : new Date());
    var seed = String(1786526512228 + ((Number(id) || 0) % 900000000));
    var ext = format || fileExt(name) || 'mp4';
    return 'https://static-oss-us.wondergame.net/materials/' + day + '/' +
      encodeURIComponent(stem) + '_' + seed + '_' + id + '.' + ext;
  }

  function formatDuration(sec) {
    var s = Math.max(0, Math.floor(sec));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var r = s % 60;
    return pad2(h) + ':' + pad2(m) + ':' + pad2(r);
  }

  function pick(arr, i) { return arr[i % arr.length]; }

  function startOfDay(d) {
    var x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function isSystemFolder(id) {
    return id === SYSTEM_FOLDER.id;
  }

  function walkFolders(nodes, parentPath, fn) {
    (nodes || []).forEach(function (node) {
      var path = parentPath ? parentPath + ' / ' + node.name : node.name;
      fn(node, path);
      if (node.children && node.children.length) walkFolders(node.children, path, fn);
    });
  }

  function findFolderNode(id, nodes) {
    if (id === SYSTEM_FOLDER.id) return SYSTEM_FOLDER;
    var list = nodes || CUSTOM_FOLDERS;
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
      var found = findFolderNode(id, list[i].children || []);
      if (found) return found;
    }
    return null;
  }

  function getFolderPath(id) {
    if (isSystemFolder(id)) return SYSTEM_FOLDER.name;
    var result = '';
    walkFolders(CUSTOM_FOLDERS, '', function (node, path) {
      if (node.id === id) result = path;
    });
    return result;
  }

  /** 从根到当前的文件夹链路（不含系统库） */
  function getFolderTrail(id) {
    if (isSystemFolder(id)) return [{ id: SYSTEM_FOLDER.id, name: SYSTEM_FOLDER.name }];
    var trail = [];
    function walk(nodes, stack) {
      var i;
      for (i = 0; i < (nodes || []).length; i++) {
        var n = nodes[i];
        var next = stack.concat([{ id: n.id, name: n.name }]);
        if (n.id === id) {
          trail = next;
          return true;
        }
        if (walk(n.children || [], next)) return true;
      }
      return false;
    }
    walk(CUSTOM_FOLDERS, []);
    if (trail.length) return trail;
    var node = findFolderNode(id);
    return node ? [{ id: node.id, name: node.name }] : [];
  }

  /** 收集某节点及全部子孙 id */
  function collectFolderIds(node, out) {
    out = out || [];
    if (!node || isSystemFolder(node.id)) return out;
    out.push(node.id);
    (node.children || []).forEach(function (c) { collectFolderIds(c, out); });
    return out;
  }

  function listCustomFolderIds() {
    var ids = [];
    walkFolders(CUSTOM_FOLDERS, '', function (node) { ids.push(node.id); });
    return ids;
  }

  function getSiblingNames(parentId) {
    if (!parentId || isSystemFolder(parentId)) {
      return CUSTOM_FOLDERS.map(function (n) { return n.name; });
    }
    var parent = findFolderNode(parentId);
    return (parent && parent.children ? parent.children : []).map(function (n) { return n.name; });
  }

  /** 同级重名时自动加 (1)(2)…；不同父级可同名 */
  function allocateSiblingFolderName(desiredName, occupiedNames) {
    var names = occupiedNames || [];
    var base = String(desiredName || '').trim();
    if (!base) return base;
    if (names.indexOf(base) === -1) return base;
    var n = 1;
    var candidate;
    do {
      candidate = base + '(' + n + ')';
      n += 1;
    } while (names.indexOf(candidate) !== -1);
    return candidate;
  }

  function notifyFolderAutoRename(desiredName, finalName) {
    if (!finalName || finalName === desiredName) return;
    UI.showToast('已存在同名文件夹，已命名为 ' + finalName, 'success');
  }

  function isDescendantFolder(childId, ancestorId) {
    if (!childId || !ancestorId || isSystemFolder(ancestorId) || isSystemFolder(childId)) return false;
    var path = getFolderPath(childId);
    var ancestorPath = getFolderPath(ancestorId);
    if (!path || !ancestorPath) return false;
    return path.indexOf(ancestorPath + ' / ') === 0;
  }

  function isTtCollectedFolder(folderId) {
    if (!folderId) return false;
    if (folderId === TT_COLLECTED_FOLDER_ID) return true;
    return isDescendantFolder(folderId, TT_COLLECTED_FOLDER_ID);
  }

  function sourceForFolder(folderId) {
    return isTtCollectedFolder(folderId) ? '外部采集' : '本地上传';
  }

  function rowSource(row) {
    return (row && row.source) || sourceForFolder(row && row.folderId) || '本地上传';
  }

  function countMaterialsInFolder(folderId) {
    if (isSystemFolder(folderId)) return ALL_ROWS.length;
    return ALL_ROWS.filter(function (r) {
      return r.folderId === folderId || isDescendantFolder(r.folderId, folderId);
    }).length;
  }

  function folderCountBadgeHtml(folderId) {
    var n = countMaterialsInFolder(folderId);
    var text = n > 99 ? '99+' : String(n);
    return '<span class="folder-count-badge" title="素材数：' + n + '">' + escapeHtml(text) + '</span>';
  }

  function isFolderEmpty(nodeId) {
    if (isSystemFolder(nodeId)) return false;
    var node = findFolderNode(nodeId);
    if (!node) return true;
    if (node.children && node.children.length) return false;
    return countMaterialsInFolder(nodeId) === 0;
  }

  function buildMockRows() {
    if (window.MaterialSeedData && typeof window.MaterialSeedData.buildRows === 'function') {
      return window.MaterialSeedData.buildRows();
    }
    return [];
  }

  var ALL_ROWS = buildMockRows();
  if (ALL_ROWS.length) {
    var maxId = 0;
    ALL_ROWS.forEach(function (r) {
      var n = Number(r.id) || 0;
      if (n > maxId) maxId = n;
    });
    materialSeq = maxId + 1;
  }

  function buildDefaultCollapsed() {
    var map = {};
    walkFolders(CUSTOM_FOLDERS, '', function (node) {
      if (node.children && node.children.length) map[node.id] = true;
    });
    return map;
  }

  var state = {
    folderId: SYSTEM_FOLDER.id,
    folderKw: '',
    collapsed: buildDefaultCollapsed(),
    draft: { creator: [], sysTag: [], manualTag: [], type: [], size: [], duration: [], source: '', xmp: '' },
    dateCleared: false,
    visibleFilters: DEFAULT_VISIBLE_FILTERS.slice(),
    filterVisibleDraft: null,
    filterSettingsSnapshot: null,
    applied: null,
    page: 1,
    pageSize: 20,
    paginationBound: false,
    selected: {},
    /** 网格视图勾选的文件夹 id */
    selectedFolders: {},
    view: 'list',
    /** false：仅当前文件夹素材 + 子文件夹行；true：含子文件夹素材平铺 */
    showSubfolderMaterials: false,
    /** 勾选后显示「数据时间」；需再点查询才填充数据指标 */
    showDeliveryData: false,
    deliveryDateCleared: false,
    deliveryDataReady: false,
    columns: COLUMNS.filter(function (col) { return col.def; }).map(function (col) { return col.key; }),
    frozenCount: COLUMNS.filter(function (col) { return col.def && col.defaultFrozen; }).length,
    sortSpecs: [],
    columnDraft: [],
    draftFrozenCount: 0,
    metricCat: COLUMN_GROUPS[0],
    metricAnchorLock: false,
    dragMetric: null,
    upload: {
      folderId: '',
      creator: CURRENT_USER,
      tags: [],
      deriveDup: true,
      items: [],
      selected: {},
      uploading: false
    },
    nameEditId: null,
    deleteIds: [],
    deleteFolderIds: [],
    batchTagIds: [],
    batchTags: [],
    batchMoveIds: [],
    batchMoveTarget: '',
    batchXmp: {
      ids: [],
      filterDup: true,
      folderMode: '已有文件夹',
      targetFolder: '',
      parentFolder: '',
      folderName: '{创意人}_{YYYYMMDD}'
    },
    detail: {
      id: null,
      nameBase: '',
      format: '',
      folderId: '',
      tags: [],
      creator: '',
      tab: 'info',
      push: {
        draftChannel: DETAIL_CHANNEL_DEFAULT,
        channel: DETAIL_CHANNEL_DEFAULT,
        draftKw: '',
        draftStatus: '',
        kw: '',
        status: '',
        page: 1,
        pageSize: 20,
        selected: {},
        paginationBound: false
      },
      ads: {
        draftChannel: DETAIL_CHANNEL_DEFAULT,
        channel: DETAIL_CHANNEL_DEFAULT,
        draftKw: '',
        kw: '',
        draftStatus: '',
        status: '',
        page: 1,
        pageSize: 20,
        paginationBound: false
      },
      reject: {
        draftChannel: DETAIL_CHANNEL_DEFAULT,
        channel: DETAIL_CHANNEL_DEFAULT,
        draftKw: '',
        kw: '',
        page: 1,
        pageSize: 20,
        paginationBound: false
      }
    },
    folderModal: {
      mode: 'create', /* create | rename */
      parentId: '',
      targetId: null
    },
    pushChannel: {
      materialIds: [],
      channel: DETAIL_CHANNEL_DEFAULT,
      accounts: [],
      selectedIds: {},
      checkedAvail: {},
      checkedSelected: {},
      availKw: '',
      selectedKw: ''
    },
    deleteFolderId: null,
    folderMoreId: null,
    materialMoreId: null,
    moveFolderId: null,
    moveFolderParentId: '',
    dragFolderId: null
  };

  function bindSearchSelect(cfg) {
    var wrap = $(cfg.wrapId);
    var trigger = $(cfg.triggerId);
    var panel = $(cfg.panelId);
    var label = $(cfg.labelId);
    var list = $(cfg.listId);
    var search = cfg.searchId ? $(cfg.searchId) : null;
    if (!wrap || !trigger || !panel || !label || !list) return null;

    function getValue() { return cfg.getValue ? cfg.getValue() : ''; }

    function syncLabel() {
      var value = getValue();
      var prefix = cfg.prefix || '';
      if (!value) {
        label.innerHTML = prefix + '<span class="muted">请选择</span>';
        wrap.classList.remove('has-value');
      } else {
        label.innerHTML = prefix + escapeHtml(value);
        wrap.classList.add('has-value');
      }
    }

    function render() {
      var kw = search ? (search.value || '').trim().toLowerCase() : '';
      var options = (cfg.getOptions ? cfg.getOptions() : []) || [];
      var value = getValue();
      list.innerHTML = options.filter(function (opt) {
        return !kw || String(opt).toLowerCase().indexOf(kw) !== -1;
      }).map(function (opt) {
        var active = opt === value ? ' is-active' : '';
        return '<button class="single-option' + active + '" type="button" data-value="' +
          escapeHtml(opt) + '">' + escapeHtml(opt) + '</button>';
      }).join('') || '<div class="empty-tip" style="padding:12px;display:block">无匹配项</div>';
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !panel.classList.contains('is-open');
      UI.closePanels();
      document.querySelectorAll('.search-select-panel.is-open').forEach(function (p) {
        p.classList.remove('is-open');
      });
      if (open) {
        panel.classList.add('is-open');
        trigger.classList.add('is-open');
        render();
        if (search) {
          search.value = '';
          search.focus();
        }
      }
    });

    list.addEventListener('click', function (e) {
      e.stopPropagation();
      var opt = e.target.closest('.single-option');
      if (!opt) return;
      if (cfg.onChange) cfg.onChange(opt.getAttribute('data-value') || '');
      syncLabel();
      panel.classList.remove('is-open');
      trigger.classList.remove('is-open');
    });

    if (search) {
      search.addEventListener('input', function () { render(); });
      search.addEventListener('click', function (e) { e.stopPropagation(); });
    }

    if (cfg.clearId) {
      var clearBtn = $(cfg.clearId);
      if (clearBtn) {
        clearBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (cfg.onChange) cfg.onChange('');
          syncLabel();
          panel.classList.remove('is-open');
        });
      }
    }

    wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    syncLabel();
    return { syncLabel: syncLabel };
  }

  document.addEventListener('click', function () {
    document.querySelectorAll('.search-select-panel.is-open').forEach(function (p) {
      p.classList.remove('is-open');
    });
  });

  function bindCascadeMultiSelect(cfg) {
    var wrap = $(cfg.wrapId);
    var trigger = $(cfg.triggerId);
    var panel = $(cfg.panelId);
    var label = $(cfg.labelId);
    var groupList = $(cfg.groupListId);
    var childList = $(cfg.childListId);
    var selectedEl = $(cfg.selectedId);
    var search = cfg.searchId ? $(cfg.searchId) : null;
    var countEl = cfg.countId ? $(cfg.countId) : null;
    if (!wrap || !trigger || !panel || !groupList || !childList) return null;

    var tree = cfg.tree || [];
    var activeGroupId = tree[0] ? tree[0].id : '';
    var CHEVRON = CASCADE_ARROW;

    function getSelected() {
      return (cfg.getSelected ? cfg.getSelected() : []).slice();
    }

    function setSelected(arr) {
      if (cfg.setSelected) cfg.setSelected(arr);
    }

    function allLeaves() {
      return flattenTreeLeaves(tree);
    }

    function findGroup(id) {
      var i;
      for (i = 0; i < tree.length; i++) {
        if (tree[i].id === id) return tree[i];
      }
      return null;
    }

    function groupState(group, selected) {
      var children = group.children || [];
      var hit = 0;
      children.forEach(function (c) {
        if (selected.indexOf(c) !== -1) hit += 1;
      });
      return {
        all: children.length > 0 && hit === children.length,
        some: hit > 0 && hit < children.length,
        hit: hit
      };
    }

    function syncLabel() {
      var selected = getSelected();
      var prefix = cfg.prefix || '';
      if (!selected.length) {
        label.innerHTML = prefix + '<span class="muted">请选择</span>';
        wrap.classList.remove('has-value');
      } else {
        label.innerHTML = prefix + '已选 ' + selected.length + ' 项';
        wrap.classList.add('has-value');
      }
      if (countEl) countEl.textContent = '已选 ' + selected.length + ' 项';
    }

    function matchesKw(text, kw) {
      if (!kw) return true;
      return String(text).toLowerCase().indexOf(kw) !== -1;
    }

    function render() {
      var kw = ((search && search.value) || '').trim().toLowerCase();
      var selected = getSelected();
      var visibleGroups = tree.filter(function (g) {
        if (matchesKw(g.label, kw)) return true;
        return (g.children || []).some(function (c) { return matchesKw(c, kw); });
      });
      if (!activeGroupId || !visibleGroups.some(function (g) { return g.id === activeGroupId; })) {
        activeGroupId = visibleGroups[0] ? visibleGroups[0].id : '';
      }

      if (!visibleGroups.length) {
        groupList.innerHTML = '<div class="cascade-panel__empty">暂无数据</div>';
      } else {
        groupList.innerHTML = visibleGroups.map(function (g) {
          var st = groupState(g, selected);
          var active = g.id === activeGroupId ? ' is-active' : '';
          return '<label class="cascade-option' + active + '" data-group="' + escapeHtml(g.id) + '">' +
            '<input type="checkbox" data-group-check="' + escapeHtml(g.id) + '"' + (st.all ? ' checked' : '') + ' />' +
            '<span class="cascade-option__label">' + escapeHtml(g.label) + '</span>' +
            CHEVRON +
          '</label>';
        }).join('');
        groupList.querySelectorAll('input[data-group-check]').forEach(function (input) {
          var g = findGroup(input.getAttribute('data-group-check'));
          if (!g) return;
          var st = groupState(g, selected);
          input.indeterminate = st.some;
        });
      }

      var activeGroup = findGroup(activeGroupId);
      var children = ((activeGroup && activeGroup.children) || []).filter(function (c) {
        return matchesKw(c, kw);
      });
      if (!activeGroup || !children.length) {
        childList.innerHTML = '<div class="cascade-panel__empty">' + (activeGroup ? '暂无数据' : '请选择分组') + '</div>';
      } else {
        childList.innerHTML = children.map(function (c) {
          var checked = selected.indexOf(c) !== -1 ? ' checked' : '';
          return '<label class="cascade-option">' +
            '<input type="checkbox" data-leaf="' + escapeHtml(c) + '"' + checked + ' />' +
            '<span class="cascade-option__label">' + escapeHtml(c) + '</span>' +
          '</label>';
        }).join('');
      }

      if (selectedEl) {
        if (!selected.length) {
          selectedEl.innerHTML = '';
        } else {
          selectedEl.innerHTML = selected.map(function (name) {
            return '<div class="multi-selected"><span class="multi-selected__name"><span title="' + escapeHtml(name) + '">' +
              escapeHtml(name) + '</span></span><button class="multi-selected__remove" type="button" data-remove="' +
              escapeHtml(name) + '" aria-label="移除">' + CLEAR_ICON + '</button></div>';
          }).join('');
        }
      }
      syncLabel();
    }

    function needsPortal() {
      return !!(wrap.closest('.drawer') || wrap.closest('.modal-mask'));
    }

    function unportalPanel() {
      panel.classList.remove('cascade-panel--portal');
      panel.style.position = '';
      panel.style.left = '';
      panel.style.top = '';
      panel.style.right = '';
      panel.style.bottom = '';
      panel.style.margin = '';
      panel.style.zIndex = '';
      var host = panel.__cascadeHost;
      if (host && panel.parentElement !== host) host.appendChild(panel);
    }

    function portalPanel() {
      if (!needsPortal()) return;
      if (!panel.__cascadeHost) panel.__cascadeHost = panel.parentElement;
      if (panel.parentElement !== document.body) {
        document.body.appendChild(panel);
      }
      panel.classList.add('cascade-panel--portal');
      var rect = trigger.getBoundingClientRect();
      var pw = panel.offsetWidth || 640;
      var ph = panel.offsetHeight || 280;
      var pad = 8;
      var left = rect.left;
      if (left + pw > window.innerWidth - pad) {
        left = Math.max(pad, window.innerWidth - pw - pad);
      }
      var top = rect.bottom + 4;
      if (top + ph > window.innerHeight - pad && rect.top - ph - 4 >= pad) {
        top = rect.top - ph - 4;
      }
      panel.style.position = 'fixed';
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
      panel.style.right = 'auto';
      panel.style.margin = '0';
      panel.style.zIndex = '1200';
    }

    function closeCascadePanel() {
      panel.classList.remove('is-open');
      trigger.classList.remove('is-open');
      unportalPanel();
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !panel.classList.contains('is-open');
      if (UI.closePanels) UI.closePanels();
      if (open) {
        panel.classList.add('is-open');
        trigger.classList.add('is-open');
        render();
        portalPanel();
        if (!panel.classList.contains('cascade-panel--portal') && UI.adjustDropdownPlacement) {
          UI.adjustDropdownPlacement(panel, trigger);
        }
      }
    });

    if (search) {
      search.addEventListener('input', render);
      search.addEventListener('click', function (e) { e.stopPropagation(); });
    }

    groupList.addEventListener('click', function (e) {
      var row = e.target.closest('[data-group]');
      if (!row) return;
      var gid = row.getAttribute('data-group');
      if (e.target.closest('input[type="checkbox"]')) return;
      activeGroupId = gid;
      render();
    });

    groupList.addEventListener('change', function (e) {
      var input = e.target.closest('input[data-group-check]');
      if (!input) return;
      var gid = input.getAttribute('data-group-check');
      var group = findGroup(gid);
      if (!group) return;
      activeGroupId = gid;
      var selected = getSelected();
      var children = group.children || [];
      if (input.checked) {
        children.forEach(function (c) {
          if (selected.indexOf(c) === -1) selected.push(c);
        });
      } else {
        selected = selected.filter(function (c) { return children.indexOf(c) === -1; });
      }
      setSelected(selected);
      render();
    });

    childList.addEventListener('change', function (e) {
      var input = e.target.closest('input[data-leaf]');
      if (!input) return;
      var name = input.getAttribute('data-leaf');
      var selected = getSelected();
      if (input.checked) {
        if (selected.indexOf(name) === -1) selected.push(name);
      } else {
        selected = selected.filter(function (n) { return n !== name; });
      }
      setSelected(selected);
      render();
    });

    if (selectedEl) {
      selectedEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-remove]');
        if (!btn) return;
        var name = btn.getAttribute('data-remove');
        setSelected(getSelected().filter(function (n) { return n !== name; }));
        render();
      });
    }

    if (cfg.selectAllId && $(cfg.selectAllId)) {
      $(cfg.selectAllId).addEventListener('click', function (e) {
        e.stopPropagation();
        var kw = ((search && search.value) || '').trim().toLowerCase();
        var selected = getSelected();
        allLeaves().forEach(function (name) {
          if (!matchesKw(name, kw)) return;
          if (selected.indexOf(name) === -1) selected.push(name);
        });
        setSelected(selected);
        render();
      });
    }

    if (cfg.clearAllId && $(cfg.clearAllId)) {
      $(cfg.clearAllId).addEventListener('click', function (e) {
        e.stopPropagation();
        setSelected([]);
        render();
      });
    }

    if (cfg.clearId && $(cfg.clearId)) {
      $(cfg.clearId).addEventListener('click', function (e) {
        e.stopPropagation();
        setSelected([]);
        render();
        closeCascadePanel();
      });
    }

    wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
    syncLabel();
    return { render: render, syncLabel: syncLabel, close: closeCascadePanel };
  }

  function cascadePanelHtml(prefix) {
    return '<div class="cascade-panel" id="fsPanel_' + prefix + '">' +
      '<div class="cascade-panel__left">' +
        '<div class="cascade-panel__search">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>' +
          '<input type="text" id="fsSearch_' + prefix + '" placeholder="搜索" autocomplete="off" />' +
        '</div>' +
        '<div class="cascade-panel__toolbar">' +
          '<button class="cascade-panel__link" type="button" id="fsSelectAll_' + prefix + '">全选</button>' +
        '</div>' +
        '<div class="cascade-panel__list" id="fsGroup_' + prefix + '"></div>' +
      '</div>' +
      '<div class="cascade-panel__mid">' +
        '<div class="cascade-panel__list" id="fsChild_' + prefix + '"></div>' +
      '</div>' +
      '<div class="cascade-panel__right">' +
        '<div class="cascade-panel__toolbar cascade-panel__toolbar--right">' +
          '<span id="fsCount_' + prefix + '">已选 0 项</span>' +
          '<button class="cascade-panel__link" type="button" id="fsClearAll_' + prefix + '">清空</button>' +
        '</div>' +
        '<div class="cascade-panel__list" id="fsSelected_' + prefix + '"></div>' +
      '</div>' +
    '</div>';
  }

  var dateApi = UI.bindDateRange({
    wrapId: 'dateRangeWrap',
    triggerId: 'dateRangeTrigger',
    labelId: 'dateRangeLabel',
    panelId: 'datePanel',
    shortcutsId: 'dateShortcuts',
    calLeftId: 'dateCalLeft',
    calRightId: 'dateCalRight',
    prefix: '上传时间：',
    defaultShortcut: 'last7',
    onChange: function () {
      state.dateCleared = false;
      var wrap = $('dateRangeWrap');
      if (wrap) wrap.classList.add('has-value');
    }
  });

  var dataDateApi = UI.bindDateRange({
    wrapId: 'dataDateWrap',
    triggerId: 'dataDateTrigger',
    labelId: 'dataDateLabel',
    panelId: 'dataDatePanel',
    shortcutsId: 'dataDateShortcuts',
    calLeftId: 'dataDateCalLeft',
    calRightId: 'dataDateCalRight',
    prefix: '数据时间：',
    defaultShortcut: 'last7',
    onChange: function () {
      state.deliveryDateCleared = false;
      var wrap = $('dataDateWrap');
      if (wrap) wrap.classList.add('has-value');
    }
  });

  function clearDateFilter() {
    state.dateCleared = true;
    var wrap = $('dateRangeWrap');
    var label = $('dateRangeLabel');
    if (label) label.innerHTML = '上传时间：<span class="muted">请选择</span>';
    if (wrap) wrap.classList.remove('has-value');
    if (UI.closePanels) UI.closePanels();
  }

  function clearDataDateFilter() {
    state.deliveryDateCleared = true;
    state.deliveryDataReady = false;
    var wrap = $('dataDateWrap');
    var label = $('dataDateLabel');
    if (label) label.innerHTML = '数据时间：<span class="muted">请选择</span>';
    if (wrap) wrap.classList.remove('has-value');
    if (UI.closePanels) UI.closePanels();
  }

  function syncDataDateVisibility() {
    var wrap = $('dataDateWrap');
    if (!wrap) return;
    var show = state.view === 'list' && !!state.showDeliveryData;
    wrap.hidden = !show;
    wrap.style.display = show ? '' : 'none';
  }

  if ($('dateRangeClear')) {
    $('dateRangeClear').addEventListener('click', function (e) {
      e.stopPropagation();
      clearDateFilter();
    });
  }

  if ($('dataDateClear')) {
    $('dataDateClear').addEventListener('click', function (e) {
      e.stopPropagation();
      clearDataDateFilter();
      renderAll();
    });
  }

  var manualTagSelect = bindCascadeMultiSelect({
    wrapId: 'manualTagWrap',
    triggerId: 'manualTagTrigger',
    panelId: 'manualTagPanel',
    labelId: 'manualTagLabel',
    groupListId: 'manualTagGroupList',
    childListId: 'manualTagChildList',
    selectedId: 'manualTagSelected',
    searchId: 'manualTagSearch',
    countId: 'manualTagCount',
    selectAllId: 'manualTagSelectAll',
    clearAllId: 'manualTagClearAll',
    clearId: 'manualTagClear',
    prefix: '手动标签：',
    tree: FORM_TAG_TREE,
    getSelected: function () { return state.draft.manualTag; },
    setSelected: function (arr) { state.draft.manualTag = arr; }
  });

  var typeSelect = bindCascadeMultiSelect({
    wrapId: 'typeWrap',
    triggerId: 'typeTrigger',
    panelId: 'typePanel',
    labelId: 'typeLabel',
    groupListId: 'typeGroupList',
    childListId: 'typeChildList',
    selectedId: 'typeSelected',
    searchId: 'typeSearch',
    countId: 'typeCount',
    selectAllId: 'typeSelectAll',
    clearAllId: 'typeClearAll',
    clearId: 'typeClear',
    prefix: '类型：',
    tree: TYPE_TREE,
    getSelected: function () { return state.draft.type; },
    setSelected: function (arr) { state.draft.type = arr; }
  });

  var sizeSelect = bindCascadeMultiSelect({
    wrapId: 'sizeWrap',
    triggerId: 'sizeTrigger',
    panelId: 'sizePanel',
    labelId: 'sizeLabel',
    groupListId: 'sizeGroupList',
    childListId: 'sizeChildList',
    selectedId: 'sizeSelected',
    searchId: 'sizeSearch',
    countId: 'sizeCount',
    selectAllId: 'sizeSelectAll',
    clearAllId: 'sizeClearAll',
    clearId: 'sizeClear',
    prefix: '尺寸：',
    tree: SIZE_TREE,
    getSelected: function () { return state.draft.size; },
    setSelected: function (arr) { state.draft.size = arr; }
  });

  var durationSelect = null;
  if (UI.bindMultiSelect) {
    durationSelect = UI.bindMultiSelect({
      wrapId: 'durationWrap',
      triggerId: 'durationTrigger',
      panelId: 'durationPanel',
      labelId: 'durationLabel',
      listId: 'durationList',
      clearId: 'durationClear',
      prefix: '时长：',
      getOptions: function () { return DURATION_OPTIONS; },
      getSelected: function () { return state.draft.duration || []; },
      setSelected: function (arr) { state.draft.duration = arr || []; }
    });
  }

  var creatorSelect = null;
  var sysTagSelect = null;
  if (UI.bindMultiSelect) {
    creatorSelect = UI.bindMultiSelect({
      wrapId: 'creatorWrap',
      triggerId: 'creatorTrigger',
      panelId: 'creatorPanel',
      labelId: 'creatorLabel',
      listId: 'creatorList',
      selectedId: 'creatorSelected',
      searchId: 'creatorSearch',
      countId: 'creatorCount',
      selectAllId: 'creatorSelectAll',
      clearId: 'creatorClear',
      prefix: '创意人：',
      getOptions: function () { return USERS; },
      getSelected: function () { return state.draft.creator || []; },
      setSelected: function (arr) { state.draft.creator = arr || []; }
    });
    if ($('creatorClearAll')) {
      $('creatorClearAll').addEventListener('click', function (e) {
        e.stopPropagation();
        state.draft.creator = [];
        if (creatorSelect && creatorSelect.render) creatorSelect.render();
      });
    }
    sysTagSelect = UI.bindMultiSelect({
      wrapId: 'sysTagWrap',
      triggerId: 'sysTagTrigger',
      panelId: 'sysTagPanel',
      labelId: 'sysTagLabel',
      listId: 'sysTagList',
      clearId: 'sysTagClear',
      prefix: '系统标签：',
      getOptions: function () { return SYSTEM_TAG_NAMES; },
      getSelected: function () { return state.draft.sysTag || []; },
      setSelected: function (arr) { state.draft.sysTag = arr || []; }
    });
  }

  var nameClearApi = null;
  var mediaClearApi = null;
  if (UI.bindInputClearable) {
    nameClearApi = UI.bindInputClearable({ wrapId: 'nameWrap', clearId: 'filterNameClear', inputId: 'filterName' });
    mediaClearApi = UI.bindInputClearable({ wrapId: 'mediaIdWrap', clearId: 'filterMediaIdClear', inputId: 'filterMediaId' });
  }

  if (UI.bindSingleSelect) {
    UI.bindSingleSelect({
      wrapId: 'xmpWrap',
      triggerId: 'xmpTrigger',
      panelId: 'xmpPanel',
      labelId: 'xmpLabel',
      clearId: 'xmpClear',
      prefix: '同步XMP：',
      getValue: function () { return state.draft.xmp; },
      onChange: function (v) { state.draft.xmp = v; }
    });
    UI.bindSingleSelect({
      wrapId: 'sourceWrap',
      triggerId: 'sourceTrigger',
      panelId: 'sourcePanel',
      labelId: 'sourceLabel',
      clearId: 'sourceClear',
      prefix: '来源：',
      getValue: function () { return state.draft.source; },
      onChange: function (v) { state.draft.source = v; }
    });
  }

  function isFilterVisible(key) {
    return state.visibleFilters.indexOf(key) >= 0;
  }

  function syncFilterBarVisibility() {
    ALL_FILTERS.forEach(function (f) {
      var el = document.querySelector('[data-filter-key="' + f.key + '"]');
      if (!el) return;
      if (isFilterVisible(f.key)) el.removeAttribute('hidden');
      else el.setAttribute('hidden', '');
    });
  }

  function syncMainFilterLabels() {
    if (manualTagSelect && manualTagSelect.syncLabel) manualTagSelect.syncLabel();
    if (typeSelect && typeSelect.syncLabel) typeSelect.syncLabel();
    if (sizeSelect && sizeSelect.syncLabel) sizeSelect.syncLabel();
    if (durationSelect && durationSelect.syncLabel) durationSelect.syncLabel();
    if (creatorSelect && creatorSelect.syncLabel) creatorSelect.syncLabel();
    if (sysTagSelect && sysTagSelect.syncLabel) sysTagSelect.syncLabel();
    ['xmp', 'source'].forEach(function (key) {
      var wrap = $(key + 'Wrap');
      var label = $(key + 'Label');
      if (!wrap || !label) return;
      var map = { xmp: '同步XMP：', source: '来源：' };
      var val = state.draft[key] || '';
      if (!val) {
        label.innerHTML = map[key] + '<span class="muted">请选择</span>';
        wrap.classList.remove('has-value');
      } else {
        label.innerHTML = map[key] + escapeHtml(val);
        wrap.classList.add('has-value');
      }
    });
    var dateWrap = $('dateRangeWrap');
    var dateLabel = $('dateRangeLabel');
    if (state.dateCleared) {
      if (dateLabel) dateLabel.innerHTML = '上传时间：<span class="muted">请选择</span>';
      if (dateWrap) dateWrap.classList.remove('has-value');
    } else if (dateWrap && dateApi && dateApi.getStart()) {
      dateWrap.classList.add('has-value');
    }
  }

  function filterSettingControlHtml(f) {
    var key = f.key;
    if (key === 'date') {
      return '<div class="filter-setting-control filter-setting-control--date filter-item--date has-value" id="fsDateWrap">' +
        '<button class="date-range-trigger" type="button" id="fsDateTrigger">' +
          '<span class="date-range-trigger__text" id="fsDateLabel">上传时间：-</span>' +
        '</button>' +
        '<button class="select-clear" type="button" id="fsDateClear" aria-label="清除">' + CLEAR_ICON + '</button>' +
        '<div class="date-panel" id="fsDatePanel">' +
          '<div class="date-panel__shortcuts" id="fsDateShortcuts">' +
            '<button class="date-shortcut" type="button" data-shortcut="today">今天</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="yesterday">昨天</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="last7">近7天</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="last30">近30天</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="thisWeek">本周</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="lastWeek">上周</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="thisMonth">本月</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="lastMonth">上月</button>' +
          '</div>' +
          '<div class="date-panel__calendars">' +
            '<div class="date-cal" id="fsDateCalLeft"></div>' +
            '<div class="date-cal" id="fsDateCalRight"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    if (f.kind === 'cascade') {
      return '<div class="filter-setting-control" id="fsWrap_' + key + '">' +
        '<button class="select-trigger" type="button" id="fsTrigger_' + key + '">' +
          '<span class="select-trigger__text" id="fsLabel_' + key + '">' + f.label + '：<span class="muted">请选择</span></span>' +
          '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
        '</button>' +
        '<button class="select-clear" type="button" id="fsClear_' + key + '" aria-label="清除">' + CLEAR_ICON + '</button>' +
        cascadePanelHtml(key) +
      '</div>';
    }
    if (f.kind === 'multi') {
      var opts = f.options || DURATION_OPTIONS;
      var dual = opts.length > 7;
      var searchBox = '<div class="multi-panel__search">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>' +
        '<input type="text" id="fsSearch_' + key + '" placeholder="搜索" autocomplete="off" />' +
      '</div>';
      var panel = dual
        ? ('<div class="multi-panel" id="fsPanel_' + key + '">' +
            '<div class="multi-panel__left">' +
              '<div class="multi-panel__search">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>' +
                '<input type="text" id="fsSearch_' + key + '" placeholder="搜索" autocomplete="off" />' +
              '</div>' +
              '<div class="multi-panel__toolbar"><button class="multi-panel__link" type="button" id="fsSelectAll_' + key + '">全选</button></div>' +
              '<div class="multi-panel__list" id="fsList_' + key + '"></div>' +
            '</div>' +
            '<div class="multi-panel__right">' +
              '<div class="multi-panel__toolbar multi-panel__toolbar--right"><span id="fsCount_' + key + '">已选择 0 项</span>' +
              '<button class="multi-panel__link" type="button" id="fsClearAll_' + key + '">清空</button></div>' +
              '<div class="multi-panel__list" id="fsSelected_' + key + '"></div>' +
            '</div>' +
          '</div>')
        : ('<div class="multi-panel multi-panel--simple" id="fsPanel_' + key + '">' +
            (f.search ? searchBox : '') +
            '<div class="multi-panel__list" id="fsList_' + key + '"></div>' +
          '</div>');
      return '<div class="filter-setting-control" id="fsWrap_' + key + '">' +
        '<button class="select-trigger" type="button" id="fsTrigger_' + key + '">' +
          '<span class="select-trigger__text" id="fsLabel_' + key + '">' + f.label + '：<span class="muted">请选择</span></span>' +
          '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
        '</button>' +
        '<button class="select-clear" type="button" id="fsClear_' + key + '" aria-label="清除">' + CLEAR_ICON + '</button>' +
        panel +
      '</div>';
    }
    if (f.kind === 'search') {
      return '<div class="filter-setting-control" id="fsWrap_' + key + '">' +
        '<button class="select-trigger" type="button" id="fsTrigger_' + key + '">' +
          '<span class="select-trigger__text" id="fsLabel_' + key + '">' + f.label + '：<span class="muted">请选择</span></span>' +
          '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
        '</button>' +
        '<button class="select-clear" type="button" id="fsClear_' + key + '" aria-label="清除">' + CLEAR_ICON + '</button>' +
        '<div class="search-select-panel" id="fsPanel_' + key + '">' +
          '<div class="search-select-panel__search">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>' +
            '<input type="text" id="fsSearch_' + key + '" placeholder="搜索" autocomplete="off" />' +
          '</div>' +
          '<div class="search-select-panel__list" id="fsList_' + key + '"></div>' +
        '</div>' +
      '</div>';
    }
    if (f.kind === 'keyword') {
      var inputId = f.inputId;
      var nameVal = ((inputId && $(inputId) && $(inputId).value) || '');
      return '<div class="filter-setting-control filter-item' + (nameVal ? ' has-value' : '') + '" id="fsWrap_' + key + '">' +
        '<label class="select-trigger select-trigger--input" for="fs_' + key + '">' +
          '<span class="select-trigger__prefix">' + escapeHtml(f.label) + '：</span>' +
          '<input class="select-trigger__field" type="text" id="fs_' + key + '" placeholder="请输入" value="' + escapeHtml(nameVal) + '" autocomplete="off" />' +
        '</label>' +
        '<button class="select-clear" type="button" id="fsClear_' + key + '" aria-label="清除">' + CLEAR_ICON + '</button>' +
      '</div>';
    }
    var options = (f.options || []).slice();
    return '<div class="filter-setting-control" id="fsWrap_' + key + '">' +
      '<button class="select-trigger" type="button" id="fsTrigger_' + key + '">' +
        '<span class="select-trigger__text" id="fsLabel_' + key + '">' + f.label + '：<span class="muted">请选择</span></span>' +
        '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
      '</button>' +
      '<button class="select-clear" type="button" id="fsClear_' + key + '" aria-label="清除">' + CLEAR_ICON + '</button>' +
      '<div class="single-panel" id="fsPanel_' + key + '">' +
        options.map(function (o) {
          return '<button class="single-option" type="button" data-value="' + escapeHtml(o) + '">' + escapeHtml(o) + '</button>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function bindFilterSettingsControls() {
    ALL_FILTERS.forEach(function (f) {
      var key = f.key;
      if (key === 'date') {
        var fsDate = UI.bindDateRange({
          wrapId: 'fsDateWrap',
          triggerId: 'fsDateTrigger',
          labelId: 'fsDateLabel',
          panelId: 'fsDatePanel',
          shortcutsId: 'fsDateShortcuts',
          calLeftId: 'fsDateCalLeft',
          calRightId: 'fsDateCalRight',
          prefix: '上传时间：',
          onChange: function (start, end, shortcut) {
            state.dateCleared = false;
            if (dateApi) dateApi.setRange(start, end, shortcut, true);
            var mainWrap = $('dateRangeWrap');
            if (mainWrap) mainWrap.classList.add('has-value');
            var fsWrap = $('fsDateWrap');
            if (fsWrap) fsWrap.classList.add('has-value');
          }
        });
        if (state.dateCleared) {
          var fsLabel = $('fsDateLabel');
          var fsWrapCleared = $('fsDateWrap');
          if (fsLabel) fsLabel.innerHTML = '上传时间：<span class="muted">请选择</span>';
          if (fsWrapCleared) fsWrapCleared.classList.remove('has-value');
        } else if (fsDate && dateApi && dateApi.getStart() && dateApi.getEnd()) {
          fsDate.setRange(dateApi.getStart(), dateApi.getEnd(), null, true);
        }
        if ($('fsDateClear')) {
          $('fsDateClear').addEventListener('click', function (e) {
            e.stopPropagation();
            clearDateFilter();
            var fsLabel2 = $('fsDateLabel');
            var fsWrap2 = $('fsDateWrap');
            if (fsLabel2) fsLabel2.innerHTML = '上传时间：<span class="muted">请选择</span>';
            if (fsWrap2) fsWrap2.classList.remove('has-value');
          });
        }
        return;
      }
      if (f.kind === 'cascade') {
        bindCascadeMultiSelect({
          wrapId: 'fsWrap_' + key,
          triggerId: 'fsTrigger_' + key,
          panelId: 'fsPanel_' + key,
          labelId: 'fsLabel_' + key,
          groupListId: 'fsGroup_' + key,
          childListId: 'fsChild_' + key,
          selectedId: 'fsSelected_' + key,
          searchId: 'fsSearch_' + key,
          countId: 'fsCount_' + key,
          selectAllId: 'fsSelectAll_' + key,
          clearAllId: 'fsClearAll_' + key,
          clearId: 'fsClear_' + key,
          prefix: f.label + '：',
          tree: f.tree,
          getSelected: function () { return state.draft[key] || []; },
          setSelected: function (arr) {
            state.draft[key] = arr;
            syncMainFilterLabels();
            var main = key === 'manualTag' ? manualTagSelect : key === 'type' ? typeSelect : key === 'size' ? sizeSelect : null;
            if (main && main.render) main.render();
          }
        });
        return;
      }
      if (f.kind === 'multi') {
        if (UI.bindMultiSelect) {
          var multiOpts = f.options || DURATION_OPTIONS;
          var dual = multiOpts.length > 7;
          var multiApi = UI.bindMultiSelect({
            wrapId: 'fsWrap_' + key,
            triggerId: 'fsTrigger_' + key,
            panelId: 'fsPanel_' + key,
            labelId: 'fsLabel_' + key,
            listId: 'fsList_' + key,
            selectedId: dual ? 'fsSelected_' + key : null,
            searchId: (dual || f.search) ? 'fsSearch_' + key : null,
            countId: dual ? 'fsCount_' + key : null,
            selectAllId: dual ? 'fsSelectAll_' + key : null,
            clearId: 'fsClear_' + key,
            prefix: f.label + '：',
            getOptions: function () { return f.options || DURATION_OPTIONS; },
            getSelected: function () { return state.draft[key] || []; },
            setSelected: function (arr) {
              state.draft[key] = arr || [];
              syncMainFilterLabels();
              var main = key === 'creator' ? creatorSelect : key === 'sysTag' ? sysTagSelect : key === 'duration' ? durationSelect : null;
              if (main && main.render) main.render();
            }
          });
          var panelClear = $('fsClearAll_' + key);
          if (panelClear) {
            panelClear.addEventListener('click', function (e) {
              e.stopPropagation();
              state.draft[key] = [];
              syncMainFilterLabels();
              if (multiApi && multiApi.render) multiApi.render();
              var main = key === 'creator' ? creatorSelect : key === 'sysTag' ? sysTagSelect : durationSelect;
              if (main && main.render) main.render();
            });
          }
        }
        return;
      }
      if (f.kind === 'search') {
        bindSearchSelect({
          wrapId: 'fsWrap_' + key,
          triggerId: 'fsTrigger_' + key,
          panelId: 'fsPanel_' + key,
          labelId: 'fsLabel_' + key,
          listId: 'fsList_' + key,
          searchId: 'fsSearch_' + key,
          clearId: 'fsClear_' + key,
          prefix: f.label + '：',
          getOptions: function () { return USERS; },
          getValue: function () { return state.draft[key] || ''; },
          onChange: function (v) {
            state.draft[key] = v;
            syncMainFilterLabels();
          }
        });
        return;
      }
      if (f.kind === 'keyword') {
        var fsInput = $('fs_' + key);
        var mainInput = $(f.inputId);
        var clearApi = key === 'mediaId' ? mediaClearApi : nameClearApi;
        if (fsInput) {
          fsInput.addEventListener('input', function () {
            if (mainInput) mainInput.value = fsInput.value;
            if (clearApi && clearApi.sync) clearApi.sync();
          });
          fsInput.addEventListener('click', function (e) { e.stopPropagation(); });
        }
        if (UI.bindInputClearable) {
          UI.bindInputClearable({
            wrapId: 'fsWrap_' + key,
            clearId: 'fsClear_' + key,
            inputId: 'fs_' + key,
            onClear: function () {
              if (mainInput) mainInput.value = '';
              if (clearApi && clearApi.sync) clearApi.sync();
            }
          });
        }
        return;
      }
      if (UI.bindSingleSelect) {
        UI.bindSingleSelect({
          wrapId: 'fsWrap_' + key,
          triggerId: 'fsTrigger_' + key,
          panelId: 'fsPanel_' + key,
          labelId: 'fsLabel_' + key,
          clearId: 'fsClear_' + key,
          prefix: f.label + '：',
          getValue: function () { return state.draft[key] || ''; },
          onChange: function (v) {
            state.draft[key] = v;
            syncMainFilterLabels();
          }
        });
      }
    });
  }

  function openFilterSettings() {
    if (!state.filterSettingsSnapshot) {
      state.filterSettingsSnapshot = {
        draft: {
          creator: (state.draft.creator || []).slice(),
          sysTag: (state.draft.sysTag || []).slice(),
          manualTag: (state.draft.manualTag || []).slice(),
          type: (state.draft.type || []).slice(),
          size: (state.draft.size || []).slice(),
          duration: (state.draft.duration || []).slice(),
          source: state.draft.source,
          xmp: state.draft.xmp,
          name: (($('filterName') && $('filterName').value) || ''),
          mediaId: (($('filterMediaId') && $('filterMediaId').value) || '')
        },
        dateStart: dateApi && dateApi.getStart() ? new Date(dateApi.getStart().getTime()) : null,
        dateEnd: dateApi && dateApi.getEnd() ? new Date(dateApi.getEnd().getTime()) : null,
        dateCleared: state.dateCleared
      };
    }

    var grid = $('filterCheckGrid');
    var preserveChecked = grid && grid.querySelector('.filter-setting-item > input[type="checkbox"]');
    if (preserveChecked) {
      state.filterVisibleDraft = [];
      grid.querySelectorAll('.filter-setting-item > input[type="checkbox"]').forEach(function (input) {
        if (input.checked) state.filterVisibleDraft.push(input.value);
      });
    } else {
      state.filterVisibleDraft = state.visibleFilters.slice();
    }

    function renderFilterSettingItem(f) {
      var checked = state.filterVisibleDraft.indexOf(f.key) >= 0;
      return '<div class="filter-setting-item" data-fs-key="' + f.key + '">' +
        '<input type="checkbox" value="' + f.key + '"' + (checked ? ' checked' : '') + ' />' +
        filterSettingControlHtml(f) +
      '</div>';
    }

    var rowsHtml = '';
    for (var i = 0; i < ALL_FILTERS.length; i += 3) {
      rowsHtml += '<div class="filter-setting-row">' +
        ALL_FILTERS.slice(i, i + 3).map(renderFilterSettingItem).join('') +
      '</div>';
    }
    grid.innerHTML = rowsHtml;
    bindFilterSettingsControls();
    UI.openModal('filterModal');
  }

  function restoreFilterSettingsSnapshot() {
    var snap = state.filterSettingsSnapshot;
    if (!snap) return;
    state.draft.creator = (snap.draft.creator || []).slice();
    state.draft.sysTag = (snap.draft.sysTag || []).slice();
    state.draft.manualTag = (snap.draft.manualTag || []).slice();
    state.draft.type = (snap.draft.type || []).slice();
    state.draft.size = (snap.draft.size || []).slice();
    state.draft.duration = (snap.draft.duration || []).slice();
    state.draft.source = snap.draft.source || '';
    state.draft.xmp = snap.draft.xmp || '';
    if ($('filterName')) {
      $('filterName').value = snap.draft.name || '';
      if (nameClearApi && nameClearApi.sync) nameClearApi.sync();
    }
    if ($('filterMediaId')) {
      $('filterMediaId').value = snap.draft.mediaId || '';
      if (mediaClearApi && mediaClearApi.sync) mediaClearApi.sync();
    }
    state.dateCleared = !!snap.dateCleared;
    if (!state.dateCleared && dateApi && snap.dateStart && snap.dateEnd) {
      dateApi.setRange(snap.dateStart, snap.dateEnd, null, true);
    }
    syncMainFilterLabels();
    if (manualTagSelect && manualTagSelect.render) manualTagSelect.render();
    if (typeSelect && typeSelect.render) typeSelect.render();
    if (sizeSelect && sizeSelect.render) sizeSelect.render();
    if (durationSelect && durationSelect.render) durationSelect.render();
    if (creatorSelect && creatorSelect.render) creatorSelect.render();
    if (sysTagSelect && sysTagSelect.render) sysTagSelect.render();
    state.filterSettingsSnapshot = null;
  }

  function submitFilterSettings() {
    var selected = [];
    $('filterCheckGrid').querySelectorAll('.filter-setting-item > input[type="checkbox"]').forEach(function (input) {
      if (input.checked) selected.push(input.value);
    });
    selected = ALL_FILTERS.map(function (f) { return f.key; }).filter(function (key) {
      return selected.indexOf(key) >= 0;
    });
    state.visibleFilters = selected;
    state.filterSettingsSnapshot = null;
    state.filterVisibleDraft = null;
    if (UI.closePanels) UI.closePanels();
    UI.closeModal('filterModal');
    syncFilterBarVisibility();
    syncMainFilterLabels();
    UI.showToast('筛选项已更新', 'success');
  }

  function cancelFilterSettings() {
    restoreFilterSettingsSnapshot();
    state.filterVisibleDraft = null;
    if (UI.closePanels) UI.closePanels();
    UI.closeModal('filterModal');
  }

  function syncXmpYesNo(row) {
    return row.syncStatus === '已同步' ? '是' : '否';
  }

  function xmpTag(val) {
    var ok = val === '是';
    return '<span class="tag tag--' + (ok ? 'enabled' : 'disabled') + '">' + escapeHtml(val) + '</span>';
  }

  function applyFilters() {
    var useDate = isFilterVisible('date') && !state.dateCleared;
    var useDeliveryDate = state.showDeliveryData && !state.deliveryDateCleared && dataDateApi;
    state.deliveryDataReady = !!useDeliveryDate;
    state.applied = {
      folderId: state.folderId,
      creator: isFilterVisible('creator') ? (state.draft.creator || []).slice() : [],
      sysTag: isFilterVisible('sysTag') ? (state.draft.sysTag || []).slice() : [],
      manualTag: isFilterVisible('manualTag') ? (state.draft.manualTag || []).slice() : [],
      xmp: isFilterVisible('xmp') ? (state.draft.xmp || '') : '',
      type: isFilterVisible('type') ? (state.draft.type || []).slice() : [],
      size: isFilterVisible('size') ? (state.draft.size || []).slice() : [],
      duration: isFilterVisible('duration') ? (state.draft.duration || []).slice() : [],
      source: isFilterVisible('source') ? (state.draft.source || '') : '',
      name: isFilterVisible('name') ? (($('filterName') && $('filterName').value) || '').trim() : '',
      mediaId: isFilterVisible('mediaId') ? (($('filterMediaId') && $('filterMediaId').value) || '').trim() : '',
      start: useDate && dateApi ? dateApi.getStart() : null,
      end: useDate && dateApi ? dateApi.getEnd() : null,
      deliveryStart: useDeliveryDate ? dataDateApi.getStart() : null,
      deliveryEnd: useDeliveryDate ? dataDateApi.getEnd() : null
    };
    state.page = 1;
    clearSelection();
    renderAll();
  }

  function resetFilters() {
    state.draft = { creator: [], sysTag: [], manualTag: [], type: [], size: [], duration: [], source: '', xmp: '' };
    state.dateCleared = false;
    if ($('filterName')) $('filterName').value = '';
    if ($('filterMediaId')) $('filterMediaId').value = '';
    if (nameClearApi && nameClearApi.sync) nameClearApi.sync();
    if (mediaClearApi && mediaClearApi.sync) mediaClearApi.sync();
    if (dateApi && dateApi.setRange) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var start = new Date(today);
      start.setDate(start.getDate() - 6);
      dateApi.setRange(start, today, 'last7', true);
      var dateWrap = $('dateRangeWrap');
      if (dateWrap) dateWrap.classList.add('has-value');
    }
    syncMainFilterLabels();
    if (manualTagSelect && manualTagSelect.render) manualTagSelect.render();
    if (typeSelect && typeSelect.render) typeSelect.render();
    if (sizeSelect && sizeSelect.render) sizeSelect.render();
    if (durationSelect && durationSelect.render) durationSelect.render();
    if (creatorSelect && creatorSelect.render) creatorSelect.render();
    if (sysTagSelect && sysTagSelect.render) sysTagSelect.render();
    applyFilters();
  }

  function inDateRange(row, start, end) {
    if (!start || !end) return true;
    var d = row.createdDate;
    function ymd(x) {
      return x.getFullYear() + '-' + pad2(x.getMonth() + 1) + '-' + pad2(x.getDate());
    }
    return d >= ymd(start) && d <= ymd(end);
  }

  function getCurrentFolderId() {
    var f = state.applied;
    return (f && f.folderId) ? f.folderId : state.folderId;
  }

  /** 当前目录下的直接子文件夹（默认库 → 自定义一级） */
  function getChildFolders(folderId) {
    if (!folderId || isSystemFolder(folderId)) return CUSTOM_FOLDERS.slice();
    var node = findFolderNode(folderId);
    return (node && node.children) ? node.children.slice() : [];
  }

  function matchDurationBuckets(sec, buckets) {
    if (!buckets || !buckets.length) return true;
    var s = Math.max(0, Number(sec) || 0);
    return buckets.some(function (b) {
      if (b === '0-6s') return s <= 6;
      if (b === '7-15s') return s >= 7 && s <= 15;
      if (b === '16-30s') return s >= 16 && s <= 30;
      if (b === '31-60s') return s >= 31 && s <= 60;
      if (b === '>60s') return s > 60;
      return false;
    });
  }

  function getFilteredRows() {
    var f = state.applied || {
      folderId: state.folderId,
      creator: [],
      sysTag: [],
      manualTag: [],
      xmp: '',
      type: [],
      size: [],
      duration: [],
      source: '',
      name: '',
      mediaId: '',
      start: (!state.dateCleared && dateApi) ? dateApi.getStart() : null,
      end: (!state.dateCleared && dateApi) ? dateApi.getEnd() : null
    };
    var folderId = f.folderId || state.folderId;
    var includeDesc = state.view === 'list' || !!state.showSubfolderMaterials;
    return ALL_ROWS.filter(function (row) {
      if (folderId) {
        if (isSystemFolder(folderId)) {
          if (!includeDesc && row.folderId !== SYSTEM_FOLDER.id) return false;
        } else if (includeDesc) {
          if (row.folderId !== folderId && !isDescendantFolder(row.folderId, folderId)) return false;
        } else if (row.folderId !== folderId) {
          return false;
        }
      }
      if (f.sysTag && f.sysTag.length) {
        if (!f.sysTag.some(function (t) { return row.tags.indexOf(t) !== -1; })) return false;
      }
      if (f.manualTag && f.manualTag.length) {
        if (!f.manualTag.some(function (t) { return row.tags.indexOf(t) !== -1; })) return false;
      }
      if (f.creator && f.creator.length && f.creator.indexOf(row.creator) === -1) return false;
      if (f.xmp && syncXmpYesNo(row) !== f.xmp) return false;
      if (f.type && f.type.length) {
        var fmt = String(row.format || '').toLowerCase();
        if (!f.type.some(function (x) { return String(x).toLowerCase() === fmt; })) return false;
      }
      if (f.size && f.size.length && f.size.indexOf(row.size) === -1) return false;
      if (f.duration && f.duration.length && !matchDurationBuckets(row.durationSec, f.duration)) return false;
      if (f.source && rowSource(row) !== f.source) return false;
      if (f.name) {
        var kw = f.name.toLowerCase();
        var nameHit = row.name.toLowerCase().indexOf(kw) !== -1;
        var idHit = String(row.id).toLowerCase().indexOf(kw) !== -1;
        if (!nameHit && !idHit) return false;
      }
      if (f.mediaId && String(row.mediaId || '').toLowerCase().indexOf(f.mediaId.toLowerCase()) === -1) return false;
      if (!inDateRange(row, f.start, f.end)) return false;
      return true;
    });
  }

  function isDataColumnKey(key) {
    var col = COLUMN_MAP[key];
    return !!(col && col.group === '数据');
  }

  function availableColumns() {
    return COLUMNS.slice();
  }

  /** 列表展示自定义列已选指标（含数据分组占位） */
  function visibleColumnDefs() {
    return state.columns.map(function (key) { return COLUMN_MAP[key]; }).filter(Boolean);
  }

  /** 数据指标是否已查询填充（勾选 + 点查询 + 数据时间有效） */
  function canFillDeliveryMetrics() {
    return !!(state.showDeliveryData && state.deliveryDataReady && !state.deliveryDateCleared);
  }

  function isDataGroupCol(col) {
    return !!(col && col.group === '数据');
  }

  function isDefaultFrozenKey(key) {
    var col = COLUMN_MAP[key];
    return !!(col && col.defaultFrozen);
  }

  function minFrozenCount(list) {
    var n = 0;
    (list || []).forEach(function (key) {
      if (isDefaultFrozenKey(key)) n += 1;
    });
    return n;
  }

  function safeDiv(a, b) {
    if (!b) return 0;
    return a / b;
  }

  function formatInt(n) {
    var num = Number(n);
    if (!isFinite(num)) return '-';
    return String(Math.round(num));
  }

  function formatFloat(n) {
    var num = Number(n);
    if (!isFinite(num)) return '-';
    return num.toFixed(2);
  }

  function formatPercent(ratio) {
    var num = Number(ratio);
    if (!isFinite(num)) return '-';
    return (num * 100).toFixed(2) + '%';
  }

  function columnRawValue(row, key) {
    if (!row) return null;
    switch (key) {
      case 'id': return row.id;
      case 'name': return stripExt(row.name);
      case 'tags': return (row.tags || []).join(',');
      case 'creator': return row.creator;
      case 'file_type': return row.type;
      case 'file_format': return row.format;
      case 'width_height': return row.size;
      case 'duration': return row.type === '视频' ? (row.durationSec || 0) : null;
      case 'source': return rowSource(row);
      case 'uploaded_at': return row.createdAt;
      case 'xmp_synced': return syncXmpYesNo(row);
      case 'ad_count': return row.adCount;
      case 'reject_count': return row.rejectCount;
      case 'spend': return row.spend;
      case 'impressions': return row.impressions;
      case 'clicks': return row.clicks;
      case 'ctr': return safeDiv(row.clicks, row.impressions);
      case 'cpc': return safeDiv(row.spend, row.clicks);
      case 'cpm': return safeDiv(row.spend, row.impressions) * 1000;
      case 'conversions': return row.conversions;
      case 'cvr': return safeDiv(row.conversions, row.clicks);
      case 'cpa': return safeDiv(row.spend, row.conversions);
      case 'video_views': return row.videoViews;
      case 'video_p100': return row.videoP100;
      case 'video_p100_rate': return safeDiv(row.videoP100, row.videoViews);
      case 'video_p75': return row.videoP75;
      case 'video_p75_rate': return safeDiv(row.videoP75, row.videoViews);
      case 'video_p50': return row.videoP50;
      case 'video_p50_rate': return safeDiv(row.videoP50, row.videoViews);
      case 'video_p25': return row.videoP25;
      case 'video_p25_rate': return safeDiv(row.videoP25, row.videoViews);
      default: return null;
    }
  }

  function compareSortValue(a, b, key, dir) {
    var va = columnRawValue(a, key);
    var vb = columnRawValue(b, key);
    var mul = dir === 'asc' ? 1 : -1;
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * mul;
    return String(va).localeCompare(String(vb), 'zh') * mul;
  }

  function sortMaterialRows(rows) {
    var list = rows.slice();
    var specs = state.sortSpecs || [];
    if (!specs.length) {
      return list.sort(function (a, b) { return b.createdTs - a.createdTs; });
    }
    var spec = specs[specs.length - 1];
    return list.sort(function (a, b) {
      var cmp = compareSortValue(a, b, spec.key, spec.dir);
      if (cmp !== 0) return cmp;
      return b.createdTs - a.createdTs;
    });
  }

  /** 列表：仅素材行（默认含子孙文件夹素材）。网格：未勾选「显示子文件夹素材」时先展示子文件夹卡片 */
  function getListEntries() {
    var materials = sortMaterialRows(getFilteredRows());
    if (state.view === 'list') {
      return materials.map(function (row) {
        return { kind: 'material', row: row };
      });
    }
    var folders = state.showSubfolderMaterials ? [] : getChildFolders(getCurrentFolderId());
    return folders.map(function (folder) {
      return { kind: 'folder', folder: folder };
    }).concat(materials.map(function (row) {
      return { kind: 'material', row: row };
    }));
  }

  function getPageEntries() {
    var entries = getListEntries();
    var total = entries.length;
    var totalPages = Math.max(1, Math.ceil(total / state.pageSize) || 1);
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * state.pageSize;
    return {
      entries: entries,
      pageEntries: entries.slice(start, start + state.pageSize),
      total: total
    };
  }

  function getPageMaterialRows() {
    return getPageEntries().pageEntries
      .filter(function (e) { return e.kind === 'material'; })
      .map(function (e) { return e.row; });
  }

  function expandFolderAncestors(folderId) {
    if (!folderId || isSystemFolder(folderId)) return;
    var trail = getFolderTrail(folderId);
    var i;
    for (i = 0; i < trail.length - 1; i++) {
      state.collapsed[trail[i].id] = false;
    }
  }

  function scrollActiveFolderIntoView() {
    var root = $('folderTree');
    if (!root) return;
    var active = root.querySelector('.tree-node__row.is-active');
    if (!active || typeof active.scrollIntoView !== 'function') return;
    active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  /** 切换当前文件夹：展开祖先、刷新列表，并定位左侧树选中项 */
  function navigateToFolder(folderId, opts) {
    opts = opts || {};
    if (!folderId) return;
    state.folderId = folderId;
    if (opts.clearFolderKw !== false && (state.folderKw || '').trim()) {
      state.folderKw = '';
      if ($('folderKw')) $('folderKw').value = '';
    }
    expandFolderAncestors(folderId);
    applyFilters();
    requestAnimationFrame(function () {
      scrollActiveFolderIntoView();
    });
  }

  function drillIntoFolder(folderId) {
    navigateToFolder(folderId);
  }

  function updateBreadcrumb() {
    var el = $('breadcrumb');
    if (!el) return;
    if (isSystemFolder(state.folderId)) {
      el.innerHTML =
        '<strong class="lib-breadcrumb__current">' + escapeHtml(SYSTEM_FOLDER.name) + '</strong>';
      return;
    }
    var trail = getFolderTrail(state.folderId);
    if (!trail.length) {
      el.innerHTML = '<strong class="lib-breadcrumb__current">' + escapeHtml(SYSTEM_FOLDER.name) + '</strong>';
      return;
    }
    el.innerHTML = trail.map(function (node, i) {
      var isLast = i === trail.length - 1;
      var item = isLast
        ? '<strong class="lib-breadcrumb__current">' + escapeHtml(node.name) + '</strong>'
        : '<button type="button" class="lib-breadcrumb__link" data-crumb="' + escapeHtml(node.id) + '">' +
            escapeHtml(node.name) +
          '</button>';
      if (i === 0) return item;
      return '<span class="lib-breadcrumb__sep" aria-hidden="true">/</span>' + item;
    }).join('');
  }

  function matchFolderKw(node) {
    var kw = (state.folderKw || '').trim().toLowerCase();
    if (!kw) return true;
    if (node.name.toLowerCase().indexOf(kw) !== -1) return true;
    return (node.children || []).some(matchFolderKw);
  }

  function renderFolderTree() {
    closeFolderMoreMenu();
    var root = $('folderTree');
    if (!root) return;

    function actionsHtml(node) {
      if (node.system) return '';
      return (
        '<button class="tree-node__more" type="button" data-folder-more="' + escapeHtml(node.id) + '"' +
          ' title="更多" aria-label="更多" aria-haspopup="menu">' + MORE_SVG + '</button>'
      );
    }

    function renderNode(node, depth, isCustom) {
      if (isCustom && !matchFolderKw(node)) return '';
      var hasChild = !!(node.children && node.children.length);
      var collapsed = !!state.collapsed[node.id];
      var active = state.folderId === node.id ? ' is-active' : '';
      var collapsedCls = collapsed ? ' is-collapsed' : '';
      var systemCls = node.system ? ' is-system' : '';
      var toggleCls = hasChild ? '' : ' is-leaf';
      var canDrag = isCustom && !(state.folderKw || '').trim();
      return (
        '<div class="tree-node' + collapsedCls + systemCls + '" data-id="' + escapeHtml(node.id) + '">' +
          '<div class="tree-node__row' + active + '" data-select="' + escapeHtml(node.id) + '" data-depth="' + depth + '"' +
            ' data-folder-drop="' + escapeHtml(node.id) + '"' +
            (canDrag ? ' draggable="true" data-folder-drag="' + escapeHtml(node.id) + '"' : '') +
            ' style="padding-left:' + (8 + depth * 20) + 'px">' +
            '<button class="tree-node__toggle' + toggleCls + '" type="button" data-toggle="' + escapeHtml(node.id) + '" aria-label="展开">' +
              TOGGLE_SVG +
            '</button>' +
            FOLDER_ICON +
            '<span class="tree-node__name" title="' + escapeHtml(node.name) + (node.system ? '（系统）' : '') + '">' +
              escapeHtml(node.name) +
            '</span>' +
            actionsHtml(node) +
          '</div>' +
          (hasChild ? '<div class="tree-node__children">' + (node.children || []).map(function (c) {
            return renderNode(c, depth + 1, true);
          }).join('') + '</div>' : '') +
        '</div>'
      );
    }

    var customHtml = CUSTOM_FOLDERS.map(function (n) {
      return renderNode(n, 0, true);
    }).join('');

    root.innerHTML =
      renderNode(SYSTEM_FOLDER, 0, false) +
      '<div class="tree-section-label" data-folder-drop="' + escapeHtml(SYSTEM_FOLDER.id) + '">自定义文件夹</div>' +
      (customHtml || '<div class="tree-empty">暂无自定义文件夹</div>');
  }

  function metaText(row) {
    if (row.type === '视频') {
      return row.format + ' | ' + row.size + ' | ' + formatDuration(row.durationSec);
    }
    return row.format + ' | ' + row.size;
  }

  function tagsHtml(row, max) {
    var all = sortTagsForDisplay(row.tags || []);
    var tags = typeof max === 'number' ? all.slice(0, max) : all;
    var title = all.length ? ' title="' + escapeHtml(all.join('、')) + '"' : '';
    return '<div class="tag-list"' + title + '>' + tags.map(function (t) {
      var cls = isSystemTagName(t) ? 'mat-tag mat-tag--system' : 'mat-tag';
      return '<span class="' + cls + '">' + escapeHtml(t) + '</span>';
    }).join('') + '</div>';
  }

  function sizeCellText(v) {
    var s = v == null ? '' : String(v).trim();
    if (!s || s === '—') return '-';
    return s;
  }

  function gridMoreBtnHtml(attr, id) {
    return (
      '<button class="grid-card__more" type="button" ' + attr + '="' + escapeHtml(id) + '"' +
        ' title="更多" aria-label="更多" aria-haspopup="menu">' + MORE_SVG + '</button>'
    );
  }

  function cellEditBtnHtml(kind) {
    return '<button class="cell-edit-btn" type="button" data-quick="' + kind + '" aria-label="编辑" title="编辑">' +
      EDIT_SVG +
    '</button>';
  }

  function deliveryHtml(row) {
    if (!row.delivery.length) return '—';
    return '<span class="delivery-icons">' + row.delivery.map(function (k) {
      var p = PLATFORMS.find(function (x) { return x.key === k; });
      return '<span class="delivery-icon delivery-icon--' + k + '" title="' + escapeHtml((p && p.label) || k) + '">' +
        escapeHtml((p && p.label) || k) + '</span>';
    }).join('') + '</span>';
  }

  function syncHtml(row) {
    var tip = row.syncStatus === '同步失败' && row.failReason
      ? ' title="' + escapeHtml(row.failReason) + '"'
      : (row.xmpId ? ' title="XMP ID: ' + escapeHtml(row.xmpId) + '"' : '');
    return '<span class="sync-tag ' + (SYNC_CLASS[row.syncStatus] || '') + '"' + tip + '>' +
      escapeHtml(row.syncStatus) + '</span>';
  }

  var PLAY_ICON = '<span class="thumb__play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z"/></svg></span>';

  function clearSelection() {
    state.selected = {};
    state.selectedFolders = {};
  }

  function getSelectedFolderIds() {
    return Object.keys(state.selectedFolders || {}).filter(function (id) {
      return state.selectedFolders[id] && !!findFolderNode(id);
    });
  }

  function syncGridSelectAll() {
    var el = $('gridSelectAll');
    if (!el || state.view !== 'grid') return;
    var entries = getPageEntries().pageEntries || [];
    var total = entries.length;
    var checked = 0;
    entries.forEach(function (entry) {
      if (entry.kind === 'folder') {
        if (state.selectedFolders[entry.folder.id]) checked += 1;
      } else if (entry.row && state.selected[entry.row.id]) {
        checked += 1;
      }
    });
    el.checked = total > 0 && checked === total;
    el.indeterminate = checked > 0 && checked < total;
  }

  function setGridPageSelection(on) {
    (getPageEntries().pageEntries || []).forEach(function (entry) {
      if (entry.kind === 'folder') {
        state.selectedFolders[entry.folder.id] = !!on;
      } else if (entry.row) {
        state.selected[entry.row.id] = !!on;
      }
    });
  }

  function updateBatchBtn() {
    var btn = $('batchBtn');
    if (!btn) return;
    btn.disabled = getSelectedIds().length === 0 && getSelectedFolderIds().length === 0;
    if (state.view === 'grid') syncGridSelectAll();
  }

  function materialSpecText(row) {
    var size = sizeCellText(row.size);
    var dur = formatDuration(row.type === '视频' ? (row.durationSec || 0) : 0);
    return size + ' | ' + dur;
  }

  function materialNameCellHtml(row) {
    var playIcon = row.type === '视频' ? PLAY_ICON : '';
    var nameNoExt = stripExt(row.name);
    var spec = materialSpecText(row);
    var oss = row.ossUrl || buildOssUrl(row.name, new Date(row.createdTs || Date.now()), row.id, row.format);
    return '<div class="material-cell">' +
      '<button class="thumb" type="button" data-preview="' + escapeHtml(row.id) + '" data-oss="' + escapeHtml(oss) + '" aria-label="打开素材">' +
        '<span class="thumb__preview" aria-hidden="true"></span>' + playIcon +
      '</button>' +
      '<div class="material-cell__meta">' +
        '<div class="material-cell__name-wrap">' +
          '<span class="material-cell__name" title="' + escapeHtml(nameNoExt) + '">' + escapeHtml(nameNoExt) + '</span>' +
          cellEditBtnHtml('name') +
        '</div>' +
        '<div class="material-cell__spec" title="' + escapeHtml(spec) + '">' + escapeHtml(spec) + '</div>' +
      '</div>' +
    '</div>';
  }

  function folderNameCellHtml(folder) {
    return '<div class="folder-cell">' +
      '<span class="folder-cell__media">' +
        '<img class="folder-cell__icon" src="素材/文件夹.png" width="40" height="40" alt="" />' +
        folderCountBadgeHtml(folder.id) +
      '</span>' +
      '<div class="folder-cell__meta">' +
        '<span class="folder-cell__name" title="' + escapeHtml(folder.name) + '">' + escapeHtml(folder.name) + '</span>' +
      '</div>' +
    '</div>';
  }

  function cellHtml(row, col) {
    if (col.key === 'name') return materialNameCellHtml(row);
    if (col.key === 'tags') {
      return '<div class="tag-cell">' + tagsHtml(row) + cellEditBtnHtml('tag') + '</div>';
    }
    if (col.key === 'xmp_synced') return xmpTag(syncXmpYesNo(row));
    if (col.key === 'width_height') {
      var sizeText = sizeCellText(row.size);
      return '<span title="' + escapeHtml(sizeText) + '">' + escapeHtml(sizeText) + '</span>';
    }
    /* 数据指标：未勾选 / 未查询 / 数据时间已清除 → 占位 "-" */
    if (isDataGroupCol(col) && !canFillDeliveryMetrics()) return '-';
    var raw = columnRawValue(row, col.key);
    if (raw == null || raw === '') {
      if (col.copy) return '<span>-</span>';
      return '-';
    }
    var text;
    if (col.kind === 'int') text = formatInt(raw);
    else if (col.kind === 'float') text = formatFloat(raw);
    else if (col.kind === 'percent') text = formatPercent(raw);
    else text = String(raw);
    if (col.copy) {
      return '<span class="cell-id"><span class="cell-id__text" title="' + escapeHtml(text) + '">' + escapeHtml(text) + '</span>' +
        '<button class="copy-btn" type="button" data-copy="' + escapeHtml(text) + '" title="复制' + escapeHtml(col.name) + '" aria-label="复制' + escapeHtml(col.name) + '">' + UI.COPY_ICON + '</button></span>';
    }
    return '<span title="' + escapeHtml(text) + '">' + escapeHtml(text) + '</span>';
  }

  function syncFreezeLeft() {
    var table = $('libraryTable');
    if (!table) return;
    var cols = table.querySelectorAll('colgroup col');
    var ths = table.querySelectorAll('thead th');
    var bodyRows = table.querySelectorAll('tbody tr');
    var last = cols.length - 1;
    if (last >= 0 && cols[last].classList.contains('col-action')) {
      var current = parseFloat(cols[last].style.width) || ACTION_COL_WIDTH;
      var extra = current - ACTION_COL_WIDTH;
      if (extra > 0.5 && last > 0) {
        var prev = cols[last - 1];
        prev.style.width = ((parseFloat(prev.style.width) || 0) + extra) + 'px';
      }
      cols[last].style.width = ACTION_COL_WIDTH + 'px';
      cols[last].style.minWidth = ACTION_COL_WIDTH + 'px';
      cols[last].style.maxWidth = ACTION_COL_WIDTH + 'px';
    }
    var left = 0;
    var count = Math.min(1 + state.frozenCount, cols.length);
    Array.prototype.forEach.call(cols, function (col, index) {
      var frozen = index < count && !col.classList.contains('col-action');
      var width = parseFloat(col.style.width) || parseFloat(col.getAttribute('data-col-width')) || 0;
      if (ths[index]) {
        ths[index].classList.toggle('is-freeze', frozen);
        ths[index].style.left = frozen ? left + 'px' : '';
      }
      Array.prototype.forEach.call(bodyRows, function (tr) {
        var cell = tr.children[index];
        if (!cell) return;
        cell.classList.toggle('is-freeze', frozen);
        cell.style.left = frozen ? left + 'px' : '';
      });
      if (frozen) left += width;
    });
  }

  function renderTable() {
    var page = getPageEntries();
    var pageEntries = page.pageEntries;
    var total = page.total;
    var body = $('tableBody');
    var head = $('tableHead');
    var colgroup = $('tableColgroup');
    var empty = $('emptyTip');
    if (!body || !head || !colgroup) return;

    var cols = visibleColumnDefs();
    var pageMats = getPageMaterialRows();
    var checkedCount = pageMats.filter(function (r) { return state.selected[r.id]; }).length;

    colgroup.innerHTML =
      '<col class="col-check" data-col-width="48" data-col-fixed="true" />' +
      cols.map(function (col) {
        var cls = col.key === 'name' ? ' class="col-material"' : (col.key === 'id' ? ' class="col-id"' : '');
        return '<col' + cls + ' data-col-width="' + col.width + '" />';
      }).join('') +
      '<col class="col-action" data-col-width="' + ACTION_COL_WIDTH + '" />';

    head.innerHTML = '<tr>' +
      '<th class="col-check is-freeze"><span class="cell-check"><input type="checkbox" id="checkAll" aria-label="全选"' +
        (pageMats.length && checkedCount === pageMats.length ? ' checked' : '') + ' /></span></th>' +
      cols.map(function (col, index) {
        var cls = [];
        if (col.key === 'name') cls.push('col-material');
        if (col.key === 'id') cls.push('col-id');
        /* 属性左对齐、数据右对齐 */
        if (isDataGroupCol(col)) cls.push('num');
        if (index < state.frozenCount) cls.push('is-freeze');
        var label = escapeHtml(col.name);
        if (col.sortable) {
          label = '<div class="th-sort' + (isDataGroupCol(col) ? ' th-sort--num' : '') + '" data-key="' + col.key + '"><span>' + label + '</span>' + UI.TH_SORT_ICONS_HTML + '</div>';
        }
        return '<th class="' + cls.join(' ') + '">' + label + '</th>';
      }).join('') +
      '<th class="col-action">操作</th>' +
    '</tr>';

    body.innerHTML = pageEntries.map(function (entry) {
      var row = entry.row;
      var checked = state.selected[row.id] ? ' checked' : '';
      return (
        '<tr data-id="' + escapeHtml(row.id) + '">' +
          '<td class="col-check is-freeze"><span class="cell-check"><input type="checkbox" data-check="' + escapeHtml(row.id) + '"' + checked + ' aria-label="选择" /></span></td>' +
          cols.map(function (col, index) {
            var cls = [];
            if (col.key === 'name') cls.push('col-material');
            if (col.key === 'id') cls.push('col-id');
            if (col.key === 'tags') cls.push('col-tags');
            if (col.key === 'duration') cls.push('col-duration');
            if (isDataGroupCol(col)) cls.push('num');
            if (index < state.frozenCount) cls.push('is-freeze');
            return '<td' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' + cellHtml(row, col) + '</td>';
          }).join('') +
          '<td class="col-action"><span class="action-links">' +
            '<button class="link" type="button" data-act="detail">详情</button>' +
            '<button class="link" type="button" data-act="push">推送</button>' +
            '<button class="link link--danger" type="button" data-act="delete">删除</button>' +
          '</span></td>' +
        '</tr>'
      );
    }).join('');

    if (empty) empty.hidden = total > 0;

    var checkAll = $('checkAll');
    if (checkAll) {
      checkAll.checked = pageMats.length > 0 && checkedCount === pageMats.length;
      checkAll.indeterminate = checkedCount > 0 && checkedCount < pageMats.length;
    }

    UI.renderPagination({
      containerId: 'pagination',
      total: total,
      page: state.page,
      pageSize: state.pageSize
    });

    if (!state.paginationBound && UI.bindPagination) {
      UI.bindPagination({
        containerId: 'pagination',
        getPage: function () { return state.page; },
        getPageSize: function () { return state.pageSize; },
        getTotal: function () { return getListEntries().length; },
        onPageChange: function (p) { state.page = p; renderAll(); },
        onPageSizeChange: function (s) {
          state.pageSize = s;
          state.page = 1;
          renderAll();
        }
      });
      state.paginationBound = true;
    }

    if (window.ColResize) ColResize.refresh($('libraryTable'), { onLayout: syncFreezeLeft });
    else syncFreezeLeft();
    if (sortApi) sortApi.sync();
    updateBatchBtn();
  }

  function renderGrid() {
    var page = getPageEntries();
    var pageEntries = page.pageEntries;
    var total = page.total;
    var list = $('gridList');
    var empty = $('gridEmpty');
    if (!list) return;

    list.innerHTML = pageEntries.map(function (entry) {
      if (entry.kind === 'folder') {
        var folder = entry.folder;
        var folderChecked = state.selectedFolders[folder.id] ? ' checked' : '';
        return (
          '<div class="grid-card grid-card--folder" data-folder-id="' + escapeHtml(folder.id) + '">' +
            '<span class="grid-card__check cell-check">' +
              '<input type="checkbox" data-folder-check="' + escapeHtml(folder.id) + '"' + folderChecked + ' aria-label="选择文件夹" />' +
            '</span>' +
            '<div class="grid-card__stage">' +
              '<button class="grid-card__thumb grid-card__thumb--folder" type="button"' +
                ' data-folder-open="' + escapeHtml(folder.id) + '" title="进入文件夹" aria-label="进入文件夹">' +
                '<span class="grid-card__folder-wrap">' +
                  '<img class="grid-card__folder-icon" src="素材/文件夹.png" width="64" height="64" alt="" />' +
                  folderCountBadgeHtml(folder.id) +
                '</span>' +
              '</button>' +
            '</div>' +
            '<div class="grid-card__body">' +
              '<div class="grid-card__title-row">' +
                '<span class="grid-card__name" title="' + escapeHtml(folder.name) + '">' + escapeHtml(folder.name) + '</span>' +
                gridMoreBtnHtml('data-folder-more', folder.id) +
              '</div>' +
            '</div>' +
          '</div>'
        );
      }
      var row = entry.row;
      var checked = state.selected[row.id] ? ' checked' : '';
      var nameNoExt = stripExt(row.name);
      var oss = row.ossUrl || buildOssUrl(row.name, new Date(row.createdTs || Date.now()), row.id, row.format);
      var playIcon = row.type === '视频' ? PLAY_ICON : '';
      var sizeText = row.size || '—';
      var durationText = row.type === '视频' ? formatDuration(row.durationSec || 0) : '';
      return (
        '<div class="grid-card" data-id="' + escapeHtml(row.id) + '">' +
          '<span class="grid-card__check cell-check">' +
            '<input type="checkbox" data-check="' + escapeHtml(row.id) + '"' + checked + ' aria-label="选择" />' +
          '</span>' +
          '<div class="grid-card__stage">' +
            '<button class="grid-card__thumb" type="button" data-oss="' + escapeHtml(oss) + '" aria-label="打开素材">' +
              '<span class="grid-card__preview" aria-hidden="true"></span>' + playIcon +
            '</button>' +
            '<div class="grid-card__meta-bar" aria-hidden="true">' +
              '<span class="grid-card__meta-size">' + escapeHtml(sizeText) + '</span>' +
              (durationText
                ? '<span class="grid-card__meta-duration">' + escapeHtml(durationText) + '</span>'
                : '') +
            '</div>' +
          '</div>' +
          '<div class="grid-card__body">' +
            '<div class="grid-card__name-wrap">' +
              '<span class="grid-card__name" title="' + escapeHtml(nameNoExt) + '">' + escapeHtml(nameNoExt) + '</span>' +
              cellEditBtnHtml('name') +
            '</div>' +
            '<div class="grid-card__tags tag-cell">' +
              tagsHtml(row, 3) +
              gridMoreBtnHtml('data-material-more', row.id) +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    if (empty) empty.hidden = total > 0;

    UI.renderPagination({
      containerId: 'pagination',
      total: total,
      page: state.page,
      pageSize: state.pageSize
    });
    updateBatchBtn();
  }

  function syncToolbarByView() {
    var isList = state.view === 'list';
    var subWrap = $('showSubfolderWrap');
    var gridSelectWrap = $('gridSelectAllWrap');
    var deliveryWrap = $('showDeliveryWrap');
    /* 列表不展示「显示子文件夹素材 / 全选」；网格不展示「显示投放数据」
       .toolbar-check 的 display 会盖掉原生 [hidden]，需同步写 style */
    if (subWrap) {
      subWrap.hidden = isList;
      subWrap.style.display = isList ? 'none' : '';
    }
    if (gridSelectWrap) {
      gridSelectWrap.hidden = isList;
      gridSelectWrap.style.display = isList ? 'none' : '';
    }
    if (deliveryWrap) {
      deliveryWrap.hidden = !isList;
      deliveryWrap.style.display = isList ? '' : 'none';
    }
    syncDataDateVisibility();
    var metricsBtn = $('metricsBtn');
    var exportBtn = $('exportBtn');
    var metricsTip = $('metricsTip');
    var exportTip = $('exportTip');
    if (metricsBtn) metricsBtn.disabled = !isList;
    if (exportBtn) exportBtn.disabled = !isList;
    if (metricsTip) metricsTip.classList.toggle('is-disabled', !isList);
    if (exportTip) exportTip.classList.toggle('is-disabled', !isList);
  }

  function syncViewMode() {
    var listView = $('listView');
    var gridView = $('gridView');
    if (listView) listView.hidden = state.view !== 'list';
    if (gridView) gridView.hidden = state.view !== 'grid';
    document.querySelectorAll('.view-switch__btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-view') === state.view);
    });
    syncToolbarByView();
  }

  function syncNewFolderButtons() {
    var siderBtn = $('newFolderBtn');
    if (siderBtn) {
      siderBtn.disabled = false;
      siderBtn.title = '新建一级文件夹';
    }
    var toolbarBtn = $('newFolderToolbarBtn');
    if (toolbarBtn) {
      var disabled = isSystemFolder(state.folderId);
      toolbarBtn.disabled = disabled;
      toolbarBtn.title = disabled ? '全部素材不支持新建文件夹' : '新建文件夹';
    }
  }

  function renderAll() {
    updateBreadcrumb();
    renderFolderTree();
    syncNewFolderButtons();
    syncViewMode();
    if (state.view === 'grid') renderGrid();
    else renderTable();
  }

  function findRow(id) {
    return ALL_ROWS.find(function (r) { return r.id === id; });
  }

  function getSelectedIds() {
    return Object.keys(state.selected).filter(function (id) {
      return state.selected[id] && !!findRow(id);
    });
  }

  /** 单行下载：调起浏览器本地下载 */
  function triggerBrowserDownload(filename, content) {
    var name = filename || 'material.bin';
    var blob = new Blob([content || ('prototype download: ' + name)], { type: 'application/octet-stream' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function downloadRow(row) {
    if (!row) return;
    triggerBrowserDownload(row.name || ('material_' + row.id + '.bin'));
  }

  function getPushableXmpIds(ids) {
    return (ids || []).filter(function (id) {
      var row = findRow(id);
      return row && (row.syncStatus === '未同步' || row.syncStatus === '同步失败');
    });
  }

  function pushRows(ids, opts) {
    opts = opts || {};
    var targets = ids.map(findRow).filter(function (r) {
      return r && (r.syncStatus === '未同步' || r.syncStatus === '同步失败' || opts.force);
    });
    if (!targets.length) {
      if (!opts.silent) UI.showToast('没有可同步的素材');
      return;
    }
    targets.forEach(function (r) {
      r.syncStatus = '同步中';
      r.failReason = '';
    });
    renderAll();
    setTimeout(function () {
      targets.forEach(function (r, i) {
        if ((Number(r.id) + i) % 5 === 0) {
          r.syncStatus = '同步失败';
          r.failReason = 'XMP 限流';
          r.xmpId = '';
        } else {
          r.syncStatus = '已同步';
          r.xmpId = 'XMP' + String(80000 + Math.floor(Math.random() * 1000));
          r.failReason = '';
        }
      });
      renderAll();
      if (!opts.silent) {
        var ok = targets.filter(function (r) { return r.syncStatus === '已同步'; }).length;
        var fail = targets.length - ok;
        UI.showToast('同步完成：成功 ' + ok + (fail ? '，失败 ' + fail : ''), fail ? 'warning' : 'success');
      }
    }, 700);
  }

  function deleteRows(ids, opts) {
    opts = opts || {};
    ALL_ROWS = ALL_ROWS.filter(function (r) { return ids.indexOf(r.id) === -1; });
    ids.forEach(function (id) { delete state.selected[id]; });
    if (!opts.silent) {
      renderAll();
      UI.showToast('删除成功', 'success');
    }
  }

  /** 删除文件夹节点及其下全部素材；返回是否删除成功 */
  function removeFolderById(id) {
    if (!id || isSystemFolder(id)) return false;
    var node = findFolderNode(id);
    if (!node) return false;
    var removedIds = collectFolderIds(node);
    ALL_ROWS = ALL_ROWS.filter(function (r) {
      return removedIds.indexOf(r.folderId) === -1;
    });
    Object.keys(state.selected).forEach(function (mid) {
      if (!ALL_ROWS.some(function (r) { return r.id === mid; })) {
        delete state.selected[mid];
      }
    });
    removedIds.forEach(function (fid) { delete state.selectedFolders[fid]; });
    var list = findParentList(id);
    if (list) {
      var idx = list.findIndex(function (n) { return n.id === id; });
      if (idx >= 0) list.splice(idx, 1);
    }
    if (removedIds.indexOf(state.folderId) !== -1) {
      state.folderId = SYSTEM_FOLDER.id;
    }
    return true;
  }

  function mockFileSizeText(row) {
    if (!row) return '—';
    var n = 1.2 + ((Number(row.id) || 0) % 80) / 10;
    return n.toFixed(2) + 'MB';
  }

  var DETAIL_ACCOUNT_NAMES = [
    'YJNH_TT_TD_AND_02_XD',
    'YJNH_TT_TD_IOS_01_AB',
    'WONDER_TT_IAA_03_CN',
    'CUBE_TT_AND_PLAY_07',
    'DRAGON_TT_IOS_UA_12'
  ];
  var DETAIL_AD_NAMES = ['益智_601', '消除_220', '塔防_088', '解压_315', '合成_142'];
  var DETAIL_REJECT_REASONS = [
    "The ad or video features an invalid button which can't trigger the function after clicking the button. This could include a non-clickable button or a 'Download Now' button that does not lead users to the downloading page after clicking.",
    'The language in the video/ad creative/on the landing page is not accepted in the country/region where the ad is being delivered.',
    'The creative contains misleading claims or unverifiable performance statements that may confuse users.',
    'The landing page experience is inconsistent with the ad creative content or fails to load correctly.'
  ];

  function mockAccountName(seed) {
    return pick(DETAIL_ACCOUNT_NAMES, seed);
  }

  function mockAccountId(seed) {
    return '74284311982191' + String(10000 + (Math.abs(Number(seed) || 0) % 9000)).slice(-4);
  }

  function mockAdName(seed) {
    return pick(DETAIL_AD_NAMES, seed);
  }

  function mockAdId(seed) {
    return '186315574771' + String(10000 + (Math.abs(Number(seed) || 0) % 9000)).slice(-4);
  }

  function ensureDetailSideData(row) {
    if (!row) return;
    if (!row.pushRecords) {
      var n = 20 + (Number(row.id) % 15);
      row.pushRecords = Array.from({ length: n }, function (_, i) {
        var failed = i % 3 === 1;
        var ts = new Date(row.createdTs || Date.now());
        ts.setHours(ts.getHours() - i);
        return {
          id: row.id + '_p' + i,
          channel: DETAIL_CHANNEL_DEFAULT,
          accountName: mockAccountName(i + Number(row.id)),
          accountId: mockAccountId(i + Number(row.id)),
          channelMaterialId: String(1789000000000000000 + Number(row.id) * 100 + i),
          status: failed ? '已失败' : '已完成',
          error: failed ? String(40901 + (i % 5)) : '',
          updatedAt: formatDateTime(ts)
        };
      });
    }
    if (!row.adRecords) {
      var an = 12 + (Number(row.id) % 10);
      row.adRecords = Array.from({ length: an }, function (_, i) {
        var ts = new Date(row.createdTs || Date.now());
        ts.setDate(ts.getDate() - (i % 20));
        ts.setHours(10 + (i % 8), (i * 5) % 60, 0, 0);
        return {
          id: row.id + '_a' + i,
          channel: DETAIL_CHANNEL_DEFAULT,
          accountName: mockAccountName(i + 3 + Number(row.id)),
          accountId: mockAccountId(i + 3 + Number(row.id)),
          adName: mockAdName(i + Number(row.id)),
          adId: mockAdId(i + Number(row.id)),
          status: pick(['启用', '启用', '启用', '暂停', '删除'], i + Number(row.id)),
          creator: pick(USERS, i + Number(row.id)),
          createdAt: formatDateTime(ts)
        };
      });
    }
    if (!row.rejectRecords) {
      var rn = 2 + (Number(row.id) % 3);
      row.rejectRecords = Array.from({ length: rn }, function (_, i) {
        var ts = new Date(row.createdTs || Date.now());
        ts.setDate(ts.getDate() - i * 2);
        return {
          id: row.id + '_r' + i,
          channel: DETAIL_CHANNEL_DEFAULT,
          accountName: mockAccountName(i + 7 + Number(row.id)),
          accountId: mockAccountId(i + 7 + Number(row.id)),
          adName: mockAdName(i + 5 + Number(row.id)),
          adId: mockAdId(i + 5 + Number(row.id)),
          reason: pick(DETAIL_REJECT_REASONS, i + Number(row.id)),
          updatedAt: formatDateTime(ts)
        };
      });
    }
  }

  function detailRecordChannel(r) {
    return (r && r.channel) || DETAIL_CHANNEL_DEFAULT;
  }

  function normalizeDetailChannel(v) {
    return DETAIL_CHANNELS.indexOf(v) >= 0 ? v : DETAIL_CHANNEL_DEFAULT;
  }

  function matchDetailAccountKw(r, kw) {
    if (!kw) return true;
    return String(r.accountName || '').toLowerCase().indexOf(kw) !== -1 ||
      String(r.accountId || '').toLowerCase().indexOf(kw) !== -1;
  }

  function cellDualHtml(name, id) {
    return (
      '<div class="cell-dual">' +
        '<div class="cell-dual__name" title="' + escapeHtml(name) + '">' + escapeHtml(name) + '</div>' +
        '<div class="cell-dual__id">' +
          '<span class="cell-dual__id-text" title="ID: ' + escapeHtml(id) + '">ID: ' + escapeHtml(id) + '</span>' +
          '<button class="copy-btn" type="button" data-copy="' + escapeHtml(id) + '" title="复制ID" aria-label="复制ID">' + UI.COPY_ICON + '</button>' +
        '</div>' +
      '</div>'
    );
  }

  function cellCopyInlineHtml(text) {
    var t = text == null ? '' : String(text);
    return (
      '<span class="cell-copy-inline">' +
        '<span class="cell-copy-inline__text" title="' + escapeHtml(t) + '">' + escapeHtml(t) + '</span>' +
        '<button class="copy-btn" type="button" data-copy="' + escapeHtml(t) + '" title="复制" aria-label="复制">' + UI.COPY_ICON + '</button>' +
      '</span>'
    );
  }

  function adStatusDotHtml(status) {
    if (status === '启用') return '<span class="status-dot status-dot--delivering">启用</span>';
    if (status === '暂停') return '<span class="status-dot status-dot--paused">暂停</span>';
    if (status === '删除') return '<span class="status-dot status-dot--deleted">删除</span>';
    return UI.taskStatusDot ? UI.taskStatusDot(status) : escapeHtml(status || '-');
  }

  function syncDetailFooter() {
    var footer = $('detailDrawerFooter');
    if (!footer) return;
    var show = state.detail.tab === 'info';
    footer.hidden = !show;
    footer.style.display = show ? '' : 'none';
  }

  function setDetailTab(tab) {
    state.detail.tab = tab || 'info';
    if (typeof hideRejectReasonTip === 'function') hideRejectReasonTip();
    document.querySelectorAll('#detailMainTabs [data-detail-tab]').forEach(function (btn) {
      var on = btn.getAttribute('data-detail-tab') === state.detail.tab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('#detailDrawer [data-detail-panel]').forEach(function (panel) {
      var on = panel.getAttribute('data-detail-panel') === state.detail.tab;
      panel.classList.toggle('is-active', on);
      panel.hidden = !on;
    });
    syncDetailFooter();
    if (state.detail.tab === 'push') renderDetailPush();
    else if (state.detail.tab === 'ads') renderDetailAds();
    else if (state.detail.tab === 'reject') renderDetailReject();
    else if (state.detail.tab === 'info') {
      var row = getDetailRow();
      if (row) {
        requestAnimationFrame(function () { syncDetailPreviewFrame(row.size); });
      }
    }
  }

  function getDetailRow() {
    return findRow(state.detail.id);
  }

  function getDetailPushFiltered() {
    var row = getDetailRow();
    if (!row) return [];
    ensureDetailSideData(row);
    var ch = normalizeDetailChannel(state.detail.push.channel);
    var kw = (state.detail.push.kw || '').trim().toLowerCase();
    var status = state.detail.push.status || '';
    return (row.pushRecords || []).filter(function (r) {
      if (detailRecordChannel(r) !== ch) return false;
      if (status && r.status !== status) return false;
      return matchDetailAccountKw(r, kw);
    });
  }

  function getDetailAdsFiltered() {
    var row = getDetailRow();
    if (!row) return [];
    ensureDetailSideData(row);
    var ch = normalizeDetailChannel(state.detail.ads.channel);
    var kw = (state.detail.ads.kw || '').trim().toLowerCase();
    var status = state.detail.ads.status || '';
    return (row.adRecords || []).filter(function (r) {
      if (detailRecordChannel(r) !== ch) return false;
      if (status && r.status !== status) return false;
      return matchDetailAccountKw(r, kw);
    });
  }

  function getDetailRejectFiltered() {
    var row = getDetailRow();
    if (!row) return [];
    ensureDetailSideData(row);
    var ch = normalizeDetailChannel(state.detail.reject.channel);
    var kw = (state.detail.reject.kw || '').trim().toLowerCase();
    return (row.rejectRecords || []).filter(function (r) {
      if (detailRecordChannel(r) !== ch) return false;
      return matchDetailAccountKw(r, kw);
    });
  }

  function syncDetailPushBatchBtn() {
    var btn = $('detailPushBatchRetry');
    if (!btn) return;
    var list = getDetailPushFiltered();
    var has = list.some(function (r) {
      return state.detail.push.selected[r.id] && r.status === '已失败';
    });
    btn.disabled = !has;
  }

  function refreshDetailRecordColResize(tableId) {
    var table = $(tableId);
    if (!table || !window.ColResize) return;
    requestAnimationFrame(function () {
      if (table.clientWidth < 1) {
        requestAnimationFrame(function () {
          ColResize.refresh(table, { force: true });
        });
        return;
      }
      ColResize.refresh(table);
    });
  }

  function renderDetailPush() {
    var body = $('detailPushBody');
    if (!body) return;
    var list = getDetailPushFiltered();
    var total = list.length;
    var totalPages = Math.max(1, Math.ceil(total / state.detail.push.pageSize) || 1);
    if (state.detail.push.page > totalPages) state.detail.push.page = totalPages;
    var start = (state.detail.push.page - 1) * state.detail.push.pageSize;
    var pageRows = list.slice(start, start + state.detail.push.pageSize);
    var checkedCount = pageRows.filter(function (r) { return state.detail.push.selected[r.id]; }).length;

    body.innerHTML = pageRows.map(function (r) {
      var checked = state.detail.push.selected[r.id] ? ' checked' : '';
      var statusHtml = UI.taskStatusDot ? UI.taskStatusDot(r.status) : escapeHtml(r.status);
      var act = r.status === '已失败'
        ? '<button class="link" type="button" data-push-retry="' + escapeHtml(r.id) + '">重试</button>'
        : '';
      return (
        '<tr data-push-id="' + escapeHtml(r.id) + '">' +
          '<td class="col-check"><span class="cell-check"><input type="checkbox" data-push-check="' + escapeHtml(r.id) + '"' + checked + ' aria-label="选择" /></span></td>' +
          '<td>' + cellDualHtml(r.accountName, r.accountId) + '</td>' +
          '<td>' + cellCopyInlineHtml(r.channelMaterialId) + '</td>' +
          '<td>' + statusHtml + '</td>' +
          '<td>' + escapeHtml(r.error || '-') + '</td>' +
          '<td>' + escapeHtml(r.updatedAt) + '</td>' +
          '<td class="col-action">' + act + '</td>' +
        '</tr>'
      );
    }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--color-text-3)">暂无数据</td></tr>';

    var checkAll = $('detailPushCheckAll');
    if (checkAll) {
      checkAll.checked = pageRows.length > 0 && checkedCount === pageRows.length;
      checkAll.indeterminate = checkedCount > 0 && checkedCount < pageRows.length;
    }
    syncDetailPushBatchBtn();

    UI.renderPagination({
      containerId: 'detailPushPagination',
      total: total,
      page: state.detail.push.page,
      pageSize: state.detail.push.pageSize
    });
    if (!state.detail.push.paginationBound && UI.bindPagination) {
      UI.bindPagination({
        containerId: 'detailPushPagination',
        getPage: function () { return state.detail.push.page; },
        getPageSize: function () { return state.detail.push.pageSize; },
        getTotal: function () { return getDetailPushFiltered().length; },
        onPageChange: function (p) { state.detail.push.page = p; renderDetailPush(); },
        onPageSizeChange: function (s) {
          state.detail.push.pageSize = s;
          state.detail.push.page = 1;
          renderDetailPush();
        }
      });
      state.detail.push.paginationBound = true;
    }
    refreshDetailRecordColResize('detailPushTable');
  }

  function renderDetailAds() {
    var body = $('detailAdsBody');
    if (!body) return;
    var row = getDetailRow();
    if (!row) return;
    ensureDetailSideData(row);
    var list = getDetailAdsFiltered();
    var total = list.length;
    var totalPages = Math.max(1, Math.ceil(total / state.detail.ads.pageSize) || 1);
    if (state.detail.ads.page > totalPages) state.detail.ads.page = totalPages;
    var start = (state.detail.ads.page - 1) * state.detail.ads.pageSize;
    var pageRows = list.slice(start, start + state.detail.ads.pageSize);
    body.innerHTML = pageRows.map(function (r) {
      return (
        '<tr>' +
          '<td>' + cellDualHtml(r.accountName, r.accountId) + '</td>' +
          '<td>' + cellDualHtml(r.adName, r.adId) + '</td>' +
          '<td>' + adStatusDotHtml(r.status) + '</td>' +
          '<td>' + escapeHtml(r.creator) + '</td>' +
          '<td>' + escapeHtml(r.createdAt) + '</td>' +
        '</tr>'
      );
    }).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--color-text-3)">暂无数据</td></tr>';

    UI.renderPagination({
      containerId: 'detailAdsPagination',
      total: total,
      page: state.detail.ads.page,
      pageSize: state.detail.ads.pageSize
    });
    if (!state.detail.ads.paginationBound && UI.bindPagination) {
      UI.bindPagination({
        containerId: 'detailAdsPagination',
        getPage: function () { return state.detail.ads.page; },
        getPageSize: function () { return state.detail.ads.pageSize; },
        getTotal: function () { return getDetailAdsFiltered().length; },
        onPageChange: function (p) { state.detail.ads.page = p; renderDetailAds(); },
        onPageSizeChange: function (s) {
          state.detail.ads.pageSize = s;
          state.detail.ads.page = 1;
          renderDetailAds();
        }
      });
      state.detail.ads.paginationBound = true;
    }
    refreshDetailRecordColResize('detailAdsTable');
  }

  function renderDetailReject() {
    var body = $('detailRejectBody');
    if (!body) return;
    var row = getDetailRow();
    if (!row) return;
    ensureDetailSideData(row);
    var list = getDetailRejectFiltered();
    var total = list.length;
    var totalPages = Math.max(1, Math.ceil(total / state.detail.reject.pageSize) || 1);
    if (state.detail.reject.page > totalPages) state.detail.reject.page = totalPages;
    var start = (state.detail.reject.page - 1) * state.detail.reject.pageSize;
    var pageRows = list.slice(start, start + state.detail.reject.pageSize);
    body.innerHTML = pageRows.map(function (r) {
      return (
        '<tr>' +
          '<td>' + cellDualHtml(r.accountName, r.accountId) + '</td>' +
          '<td>' + cellDualHtml(r.adName, r.adId) + '</td>' +
          '<td class="col-reject-reason"><div class="reject-reason" data-tip="' + escapeHtml(r.reason) + '">' + escapeHtml(r.reason) + '</div></td>' +
          '<td>' + escapeHtml(r.updatedAt) + '</td>' +
        '</tr>'
      );
    }).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--color-text-3)">暂无数据</td></tr>';

    UI.renderPagination({
      containerId: 'detailRejectPagination',
      total: total,
      page: state.detail.reject.page,
      pageSize: state.detail.reject.pageSize
    });
    if (!state.detail.reject.paginationBound && UI.bindPagination) {
      UI.bindPagination({
        containerId: 'detailRejectPagination',
        getPage: function () { return state.detail.reject.page; },
        getPageSize: function () { return state.detail.reject.pageSize; },
        getTotal: function () { return getDetailRejectFiltered().length; },
        onPageChange: function (p) { state.detail.reject.page = p; renderDetailReject(); },
        onPageSizeChange: function (s) {
          state.detail.reject.pageSize = s;
          state.detail.reject.page = 1;
          renderDetailReject();
        }
      });
      state.detail.reject.paginationBound = true;
    }
    refreshDetailRecordColResize('detailRejectTable');
  }

  function retryPushRecords(ids) {
    var row = getDetailRow();
    if (!row || !ids || !ids.length) return;
    ensureDetailSideData(row);
    var map = {};
    ids.forEach(function (id) { map[id] = true; });
    var hit = 0;
    (row.pushRecords || []).forEach(function (r) {
      if (!map[r.id] || r.status !== '已失败') return;
      r.status = '已完成';
      r.error = '';
      r.updatedAt = formatDateTime(new Date());
      hit += 1;
      delete state.detail.push.selected[r.id];
    });
    if (!hit) {
      UI.showToast('没有可重试的记录');
      return;
    }
    renderDetailPush();
    UI.showToast('已重试 ' + hit + ' 条', 'success');
  }

  function parseSizeParts(size) {
    var m = String(size || '').match(/(\d+)\s*[x×]\s*(\d+)/i);
    if (!m) return { w: 9, h: 16 };
    var w = Number(m[1]);
    var h = Number(m[2]);
    if (!w || !h) return { w: 9, h: 16 };
    return { w: w, h: h };
  }

  function syncDetailPreviewFrame(size) {
    var stage = document.querySelector('#detailPanelInfo .detail-drawer__preview');
    var media = $('detailPreviewMedia');
    if (!stage || !media) return;
    var parts = parseSizeParts(size);
    /* 定宽 360，高度跟素材比例（1080x1920 → 640；800x800 → 360）；底板不够再等比缩小 */
    var boxW = 360;
    var boxH = boxW * parts.h / parts.w;
    var sw = stage.clientWidth || 360;
    var sh = stage.clientHeight || 0;
    if (sw > 0 && boxW > sw) {
      boxW = sw;
      boxH = boxW * parts.h / parts.w;
    }
    if (sh > 0 && boxH > sh) {
      boxH = sh;
      boxW = boxH * parts.w / parts.h;
    }
    media.style.width = Math.max(1, Math.round(boxW)) + 'px';
    media.style.height = Math.max(1, Math.round(boxH)) + 'px';
    media.style.maxWidth = '100%';
    media.style.maxHeight = '100%';
    media.style.setProperty('--detail-preview-ratio', parts.w + ' / ' + parts.h);
  }

  function closeDetailDrawer() {
    if (typeof hideRejectReasonTip === 'function') hideRejectReasonTip();
    UI.closeDrawer('detailDrawer');
  }

  function openDetail(row) {
    if (!row) return;
    ensureDetailSideData(row);
    state.detail.id = row.id;
    state.detail.nameBase = stripExt(row.name);
    state.detail.format = row.format || fileExt(row.name) || '';
    state.detail.folderId = row.folderId || SYSTEM_FOLDER.id;
    state.detail.tags = (row.tags || []).slice();
    state.detail.creator = row.creator || '';
    state.detail.push.draftChannel = DETAIL_CHANNEL_DEFAULT;
    state.detail.push.channel = DETAIL_CHANNEL_DEFAULT;
    state.detail.push.draftKw = '';
    state.detail.push.draftStatus = '';
    state.detail.push.kw = '';
    state.detail.push.status = '';
    state.detail.push.page = 1;
    state.detail.push.selected = {};
    state.detail.ads.draftChannel = DETAIL_CHANNEL_DEFAULT;
    state.detail.ads.channel = DETAIL_CHANNEL_DEFAULT;
    state.detail.ads.draftKw = '';
    state.detail.ads.kw = '';
    state.detail.ads.draftStatus = '';
    state.detail.ads.status = '';
    state.detail.ads.page = 1;
    state.detail.reject.draftChannel = DETAIL_CHANNEL_DEFAULT;
    state.detail.reject.channel = DETAIL_CHANNEL_DEFAULT;
    state.detail.reject.draftKw = '';
    state.detail.reject.kw = '';
    state.detail.reject.page = 1;
    if ($('detailPushKw')) $('detailPushKw').value = '';
    if ($('detailAdsKw')) $('detailAdsKw').value = '';
    if ($('detailRejectKw')) $('detailRejectKw').value = '';
    if (detailPushChannelSelect && detailPushChannelSelect.syncLabel) detailPushChannelSelect.syncLabel(DETAIL_CHANNEL_DEFAULT);
    if (detailAdsChannelSelect && detailAdsChannelSelect.syncLabel) detailAdsChannelSelect.syncLabel(DETAIL_CHANNEL_DEFAULT);
    if (detailRejectChannelSelect && detailRejectChannelSelect.syncLabel) detailRejectChannelSelect.syncLabel(DETAIL_CHANNEL_DEFAULT);
    if (detailPushStatusSelect && detailPushStatusSelect.syncLabel) detailPushStatusSelect.syncLabel('');
    if (detailAdsStatusSelect && detailAdsStatusSelect.syncLabel) detailAdsStatusSelect.syncLabel('');

    if ($('detailId')) $('detailId').textContent = row.id;
    if ($('detailName')) $('detailName').value = state.detail.nameBase;
    if ($('detailCreatedAt')) $('detailCreatedAt').textContent = row.createdAt || '—';
    if ($('detailSource')) $('detailSource').textContent = row.source || '本地上传';
    if ($('detailFileSize')) $('detailFileSize').textContent = mockFileSizeText(row);
    if ($('detailType')) $('detailType').textContent = row.type || '—';
    if ($('detailFormat')) $('detailFormat').textContent = row.format || '—';
    if ($('detailDim')) $('detailDim').textContent = sizeCellText(row.size);
    if ($('detailDuration')) {
      $('detailDuration').textContent = row.type === '视频' ? (String(row.durationSec || 0) + ' 秒') : '-';
    }
    var play = $('detailPreviewPlay');
    if (play) play.hidden = row.type !== '视频';

    ['detailNameItem', 'detailFolderItem', 'detailCreatorItem'].forEach(function (id) {
      var el = $(id);
      if (el) el.classList.remove('is-error');
    });

    if (detailFolderSelect && detailFolderSelect.syncLabel) detailFolderSelect.syncLabel();
    if (detailCreatorSelect && detailCreatorSelect.syncLabel) detailCreatorSelect.syncLabel();
    if (detailTagSelect && detailTagSelect.render) detailTagSelect.render();
    else if (detailTagSelect && detailTagSelect.syncLabel) detailTagSelect.syncLabel();

    setDetailTab('info');
    UI.openDrawer('detailDrawer');
    requestAnimationFrame(function () {
      syncDetailPreviewFrame(row.size);
    });
  }

  function submitDetail() {
    var row = findRow(state.detail.id);
    if (!row) {
      closeDetailDrawer();
      return;
    }
    var nameBase = (($('detailName') && $('detailName').value) || '').trim();
    state.detail.nameBase = nameBase;
    var ok = true;
    if (!nameBase) {
      if ($('detailNameItem')) $('detailNameItem').classList.add('is-error');
      ok = false;
    } else if ($('detailNameItem')) {
      $('detailNameItem').classList.remove('is-error');
    }
    if (!state.detail.folderId) {
      if ($('detailFolderItem')) $('detailFolderItem').classList.add('is-error');
      ok = false;
    } else if ($('detailFolderItem')) {
      $('detailFolderItem').classList.remove('is-error');
    }
    if (!state.detail.creator) {
      if ($('detailCreatorItem')) $('detailCreatorItem').classList.add('is-error');
      ok = false;
    } else if ($('detailCreatorItem')) {
      $('detailCreatorItem').classList.remove('is-error');
    }
    if (!ok) return;

    var ext = state.detail.format || fileExt(row.name) || 'mp4';
    row.name = nameBase + (ext ? ('.' + ext) : '');
    row.folderId = state.detail.folderId;
    row.source = sourceForFolder(state.detail.folderId);
    row.tags = state.detail.tags.slice();
    row.creator = state.detail.creator;
    closeDetailDrawer();
    renderAll();
    UI.showToast('保存成功', 'success');
  }

  /* preview（浮层尺寸对齐采集素材） */
  var previewPop = $('previewPop');

  function showPreview(displayName, anchor) {
    if (!previewPop || !anchor) return;
    var rect = anchor.getBoundingClientRect();
    var popW = 280;
    var popH = 480;
    var left = rect.right + 12;
    var top = rect.top;
    if (left + popW > window.innerWidth - 16) left = rect.left - popW - 12;
    if (top + popH > window.innerHeight - 16) top = window.innerHeight - popH - 16;
    if (top < 16) top = 16;
    if (left < 16) left = 16;
    previewPop.style.left = left + 'px';
    previewPop.style.top = top + 'px';
    previewPop.classList.add('is-open');
    previewPop.setAttribute('aria-hidden', 'false');
  }

  function hidePreview() {
    if (!previewPop) return;
    previewPop.classList.remove('is-open');
    previewPop.setAttribute('aria-hidden', 'true');
  }

  /* events */
  if (UI.bindSidebar) UI.bindSidebar();

  document.querySelectorAll('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-close');
      if (id === 'filterModal') {
        cancelFilterSettings();
        return;
      }
      UI.closeModal(id);
    });
  });

  if ($('filterSettingBtn')) {
    $('filterSettingBtn').addEventListener('click', function (e) {
      e.stopPropagation();
      openFilterSettings();
    });
  }
  if ($('filterSubmit')) {
    $('filterSubmit').addEventListener('click', submitFilterSettings);
  }

  syncFilterBarVisibility();

  $('folderTree').addEventListener('click', function (e) {
    var moreBtn = e.target.closest('[data-folder-more]');
    if (moreBtn) {
      e.stopPropagation();
      openFolderMoreMenu(moreBtn);
      return;
    }
    closeFolderMoreMenu();
    var toggle = e.target.closest('[data-toggle]');
    if (toggle && !toggle.classList.contains('is-leaf')) {
      e.stopPropagation();
      var tid = toggle.getAttribute('data-toggle');
      state.collapsed[tid] = !state.collapsed[tid];
      renderFolderTree();
      return;
    }
    var row = e.target.closest('[data-select]');
    if (!row) return;
    navigateToFolder(row.getAttribute('data-select') || SYSTEM_FOLDER.id, { clearFolderKw: false });
  });

  function clearFolderDropMarks() {
    var root = $('folderTree');
    if (!root) return;
    root.querySelectorAll('.is-drop-before, .is-drop-after, .is-drop-inside, .is-dragging').forEach(function (el) {
      el.classList.remove('is-drop-before', 'is-drop-after', 'is-drop-inside', 'is-dragging');
      el.removeAttribute('data-drop-place');
    });
  }

  function markFolderDragging(dragId) {
    var dragging = document.querySelector('.tree-node__row[data-folder-drag="' + dragId + '"]');
    if (dragging) dragging.classList.add('is-dragging');
  }

  function resolveFolderDropPlace(row, clientY) {
    var targetId = row.getAttribute('data-folder-drop');
    if (!targetId || isSystemFolder(targetId) || row.classList.contains('tree-section-label')) {
      return 'inside';
    }
    var rect = row.getBoundingClientRect();
    var y = clientY - rect.top;
    var h = rect.height || 1;
    if (y < h * 0.28) return 'before';
    if (y > h * 0.72) return 'after';
    return 'inside';
  }

  function canDropFolder(dragId, targetId, place) {
    if (!dragId || !targetId || dragId === targetId) return false;
    if (isSystemFolder(dragId)) return false;
    if (isDescendantFolder(targetId, dragId)) return false;
    if (isSystemFolder(targetId)) return place === 'inside';
    return place === 'before' || place === 'after' || place === 'inside';
  }

  function getFolderChildrenList(parentId) {
    if (!parentId || isSystemFolder(parentId)) return CUSTOM_FOLDERS;
    var parent = findFolderNode(parentId);
    if (!parent || parent.system) return null;
    if (!parent.children) parent.children = [];
    return parent.children;
  }

  function relocateFolder(dragId, targetId, place) {
    if (!canDropFolder(dragId, targetId, place)) return { ok: false };
    var node = findFolderNode(dragId);
    var fromList = findParentList(dragId);
    if (!node || !fromList) return { ok: false };
    var oldParentId = getFolderParentId(dragId) || SYSTEM_FOLDER.id;
    var newParentId;
    var toList;
    var insertAt;
    if (place === 'inside') {
      newParentId = isSystemFolder(targetId) ? SYSTEM_FOLDER.id : targetId;
      toList = getFolderChildrenList(newParentId);
      if (!toList) return { ok: false };
      insertAt = toList.length;
    } else {
      newParentId = getFolderParentId(targetId) || SYSTEM_FOLDER.id;
      toList = findParentList(targetId);
      if (!toList) return { ok: false };
      insertAt = toList.findIndex(function (n) { return n.id === targetId; });
      if (insertAt < 0) return { ok: false };
      if (place === 'after') insertAt += 1;
    }
    var fromIndex = fromList.findIndex(function (n) { return n.id === dragId; });
    if (fromIndex < 0) return { ok: false };
    var sameList = fromList === toList;
    fromList.splice(fromIndex, 1);
    if (sameList && fromIndex < insertAt) insertAt -= 1;
    var desiredName = node.name;
    var occupied = toList.map(function (n) { return n.name; });
    var finalName = allocateSiblingFolderName(desiredName, occupied);
    node.name = finalName;
    if (insertAt < 0) insertAt = 0;
    if (insertAt > toList.length) insertAt = toList.length;
    toList.splice(insertAt, 0, node);
    if (place === 'inside' && !isSystemFolder(targetId)) {
      state.collapsed[targetId] = false;
    }
    return {
      ok: true,
      name: finalName,
      autoRenamed: finalName !== desiredName,
      parentChanged: oldParentId !== newParentId
    };
  }

  $('folderTree').addEventListener('dragstart', function (e) {
    var row = e.target.closest('[data-folder-drag]');
    if (!row || e.target.closest('[data-folder-more], [data-toggle]')) {
      e.preventDefault();
      return;
    }
    var id = row.getAttribute('data-folder-drag');
    if (!id || isSystemFolder(id)) {
      e.preventDefault();
      return;
    }
    closeFolderMoreMenu();
    state.dragFolderId = id;
    row.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  });

  $('folderTree').addEventListener('dragend', function () {
    state.dragFolderId = null;
    clearFolderDropMarks();
  });

  $('folderTree').addEventListener('dragover', function (e) {
    var dragId = state.dragFolderId;
    if (!dragId) return;
    var row = e.target.closest('[data-folder-drop]');
    if (!row) {
      clearFolderDropMarks();
      markFolderDragging(dragId);
      return;
    }
    var targetId = row.getAttribute('data-folder-drop');
    var place = resolveFolderDropPlace(row, e.clientY);
    if (!canDropFolder(dragId, targetId, place)) {
      clearFolderDropMarks();
      markFolderDragging(dragId);
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    clearFolderDropMarks();
    markFolderDragging(dragId);
    var placeCls = place === 'inside' ? 'is-drop-inside' : (place === 'before' ? 'is-drop-before' : 'is-drop-after');
    row.classList.add(placeCls);
    row.setAttribute('data-drop-place', place);
  });

  $('folderTree').addEventListener('dragleave', function (e) {
    var row = e.target.closest('[data-folder-drop]');
    if (!row) return;
    if (row.contains(e.relatedTarget)) return;
    row.classList.remove('is-drop-before', 'is-drop-after', 'is-drop-inside');
    row.removeAttribute('data-drop-place');
  });

  $('folderTree').addEventListener('drop', function (e) {
    var dragId = state.dragFolderId;
    var row = e.target.closest('[data-folder-drop]');
    if (!dragId || !row) {
      clearFolderDropMarks();
      state.dragFolderId = null;
      return;
    }
    e.preventDefault();
    var targetId = row.getAttribute('data-folder-drop');
    var place = row.getAttribute('data-drop-place') || resolveFolderDropPlace(row, e.clientY);
    clearFolderDropMarks();
    state.dragFolderId = null;
    var moved = relocateFolder(dragId, targetId, place);
    if (!moved.ok) return;
    expandFolderAncestors(dragId);
    if (moved.parentChanged) renderAll();
    else renderFolderTree();
    requestAnimationFrame(function () {
      var el = document.querySelector('.tree-node__row[data-select="' + dragId + '"]');
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    });
    if (moved.autoRenamed) {
      UI.showToast('文件夹已移动，因同名已命名为 ' + moved.name, 'success');
    } else if (moved.parentChanged) {
      UI.showToast('文件夹已移动', 'success');
    }
  });

  $('folderKw').addEventListener('input', function () {
    state.folderKw = ($('folderKw').value || '').trim();
    renderFolderTree();
  });

  (function bindSiderResize() {
    var sider = document.querySelector('.lib-sider');
    var handle = $('siderResize');
    if (!sider || !handle || handle.getAttribute('data-bound') === '1') return;
    handle.setAttribute('data-bound', '1');
    var SIDER_MIN = 216;
    var SIDER_MAX = 400;
    var SIDER_KEY = 'delivery-material-sider-width';

    function clamp(w) {
      return Math.round(Math.min(SIDER_MAX, Math.max(SIDER_MIN, w)));
    }

    function applyWidth(w) {
      sider.style.width = clamp(w) + 'px';
    }

    function syncTable() {
      var table = $('libraryTable');
      if (table && window.ColResize && ColResize.syncTableWidth) ColResize.syncTableWidth(table);
    }

    var saved = 0;
    try { saved = parseFloat(sessionStorage.getItem(SIDER_KEY) || ''); } catch (err) {}
    if (saved > 0) applyWidth(saved);

    handle.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      var startX = e.clientX;
      var startW = sider.getBoundingClientRect().width;
      sider.classList.add('is-resizing');
      document.body.classList.add('is-sider-resizing');
      handle.classList.add('is-active');
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}

      function onMove(ev) {
        applyWidth(startW + (ev.clientX - startX));
        syncTable();
      }

      function onUp(ev) {
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
        try { handle.releasePointerCapture(ev.pointerId); } catch (err2) {}
        sider.classList.remove('is-resizing');
        document.body.classList.remove('is-sider-resizing');
        handle.classList.remove('is-active');
        var w = clamp(sider.getBoundingClientRect().width);
        applyWidth(w);
        try { sessionStorage.setItem(SIDER_KEY, String(w)); } catch (err3) {}
        syncTable();
      }

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    });
  })();

  function clearFolderFormError() {
    var item = $('folderNameItem');
    if (item) item.classList.remove('is-error');
    var err = $('folderNameError');
    if (err) err.textContent = '请输入文件夹名称';
  }

  function closeFolderMoreMenu() {
    var menu = $('folderMoreMenu');
    if (menu) {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
    }
    document.querySelectorAll('.tree-node__more.is-open, .grid-card__more.is-open').forEach(function (btn) {
      btn.classList.remove('is-open');
    });
    state.folderMoreId = null;
  }

  function closeMaterialMoreMenu() {
    var menu = $('materialMoreMenu');
    if (menu) {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
    }
    document.querySelectorAll('.grid-card__more[data-material-more].is-open').forEach(function (btn) {
      btn.classList.remove('is-open');
    });
    state.materialMoreId = null;
  }

  function positionMoreMenu(menu, btn) {
    var rect = btn.getBoundingClientRect();
    var mw = menu.offsetWidth || 120;
    var mh = menu.offsetHeight || 140;
    var left = Math.min(rect.right - mw, window.innerWidth - mw - 8);
    left = Math.max(8, left);
    var top = rect.bottom + 4;
    if (top + mh > window.innerHeight - 8) {
      top = Math.max(8, rect.top - mh - 4);
    }
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  }

  function openFolderMoreMenu(btn) {
    var id = btn.getAttribute('data-folder-more');
    var menu = $('folderMoreMenu');
    if (!menu || !id || isSystemFolder(id)) return;
    if (state.folderMoreId === id && menu.classList.contains('is-open')) {
      closeFolderMoreMenu();
      return;
    }
    closeMaterialMoreMenu();
    closeFolderMoreMenu();
    state.folderMoreId = id;
    btn.classList.add('is-open');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    positionMoreMenu(menu, btn);
  }

  function openMaterialMoreMenu(btn) {
    var id = btn.getAttribute('data-material-more');
    var menu = $('materialMoreMenu');
    if (!menu || !id) return;
    if (state.materialMoreId === id && menu.classList.contains('is-open')) {
      closeMaterialMoreMenu();
      return;
    }
    closeFolderMoreMenu();
    closeMaterialMoreMenu();
    state.materialMoreId = id;
    btn.classList.add('is-open');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    positionMoreMenu(menu, btn);
  }

  function formatFolderParentLabel(parentId) {
    if (!parentId || isSystemFolder(parentId)) return '自定义文件夹';
    return getFolderPath(parentId) || '自定义文件夹';
  }

  function fillFolderParentField(parentId) {
    var parentItem = $('folderParentItem');
    if (parentItem) parentItem.hidden = false;
    if ($('folderParentLabel')) $('folderParentLabel').value = formatFolderParentLabel(parentId);
  }

  function openFolderCreate(parentId) {
    parentId = parentId || state.folderId || SYSTEM_FOLDER.id;
    state.folderModal = { mode: 'create', parentId: parentId, targetId: null };
    if ($('folderTitle')) $('folderTitle').textContent = '新建文件夹';
    fillFolderParentField(parentId);
    if ($('folderNameInput')) $('folderNameInput').value = '';
    clearFolderFormError();
    UI.openModal('folderModal');
  }

  function openFolderRename(id) {
    if (isSystemFolder(id)) {
      UI.showToast('系统文件夹不可编辑');
      return;
    }
    var node = findFolderNode(id);
    if (!node) return;
    var parentId = getFolderParentId(id) || SYSTEM_FOLDER.id;
    state.folderModal = { mode: 'rename', parentId: parentId, targetId: id };
    if ($('folderTitle')) $('folderTitle').textContent = '编辑文件夹';
    fillFolderParentField(parentId);
    if ($('folderNameInput')) $('folderNameInput').value = node.name;
    clearFolderFormError();
    UI.openModal('folderModal');
  }

  function openFolderDelete(id) {
    if (isSystemFolder(id)) {
      UI.showToast('系统文件夹不可删除');
      return;
    }
    var node = findFolderNode(id);
    if (!node) return;
    state.deleteFolderId = id;
    if ($('deleteFolderText')) {
      $('deleteFolderText').textContent = '确认删除文件夹及文件夹下所有的素材？';
    }
    UI.openModal('deleteFolderModal');
  }

  function cloneMoveFolderTree(nodes, excludeId) {
    var list = [];
    (nodes || []).forEach(function (node) {
      if (node.id === excludeId) return;
      list.push({
        id: node.id,
        name: node.name,
        children: cloneMoveFolderTree(node.children || [], excludeId)
      });
    });
    return list;
  }

  function getMoveFolderRoots() {
    return [{
      id: SYSTEM_FOLDER.id,
      name: '自定义文件夹',
      children: cloneMoveFolderTree(CUSTOM_FOLDERS, state.moveFolderId)
    }];
  }

  function getBatchMoveRoots() {
    return [{
      id: SYSTEM_FOLDER.id,
      name: '自定义文件夹',
      children: cloneMoveFolderTree(CUSTOM_FOLDERS, null)
    }];
  }

  function formatBatchMoveLabel(value) {
    if (!value || isSystemFolder(value)) return '自定义文件夹';
    return getFolderPath(value) || '自定义文件夹';
  }

  function getFolderParentId(id) {
    if (!id || isSystemFolder(id)) return null;
    if (CUSTOM_FOLDERS.some(function (n) { return n.id === id; })) return SYSTEM_FOLDER.id;
    var found = null;
    walkFolders(CUSTOM_FOLDERS, '', function (node) {
      (node.children || []).forEach(function (c) {
        if (c.id === id) found = node.id;
      });
    });
    return found;
  }

  var moveFolderParentApi = null;

  function openFolderMove(id) {
    if (isSystemFolder(id)) {
      UI.showToast('系统文件夹不可移动');
      return;
    }
    var node = findFolderNode(id);
    if (!node) return;
    state.moveFolderId = id;
    state.moveFolderParentId = getFolderParentId(id) || SYSTEM_FOLDER.id;
    var item = $('moveFolderParentItem');
    if (item) item.classList.remove('is-error');
    if ($('moveFolderParentSearch')) $('moveFolderParentSearch').value = '';
    if (moveFolderParentApi && moveFolderParentApi.render) moveFolderParentApi.render();
    if (moveFolderParentApi && moveFolderParentApi.syncLabel) moveFolderParentApi.syncLabel();
    UI.openModal('moveFolderModal');
  }

  function formatMoveParentLabel(value) {
    if (!value || isSystemFolder(value)) return '自定义文件夹';
    return getFolderPath(value) || '自定义文件夹';
  }

  function moveFolderToParent(id, newParentId) {
    var node = findFolderNode(id);
    var list = findParentList(id);
    if (!node || !list) return { ok: false };
    var curParent = getFolderParentId(id);
    if (curParent === newParentId) return { ok: true, name: node.name, autoRenamed: false };
    var siblingNames = getSiblingNames(newParentId);
    var desiredName = node.name;
    var finalName = allocateSiblingFolderName(desiredName, siblingNames);
    var idx = list.findIndex(function (n) { return n.id === id; });
    if (idx < 0) return { ok: false };
    list.splice(idx, 1);
    if (isSystemFolder(newParentId)) {
      CUSTOM_FOLDERS.push(node);
    } else {
      var parent = findFolderNode(newParentId);
      if (!parent || parent.system) {
        list.splice(idx, 0, node);
        UI.showToast('目标文件夹不存在', 'error');
        return { ok: false };
      }
      parent.children = parent.children || [];
      parent.children.push(node);
      state.collapsed[parent.id] = false;
    }
    node.name = finalName;
    return { ok: true, name: finalName, autoRenamed: finalName !== desiredName };
  }

  $('folderMoreMenu').addEventListener('click', function (e) {
    var item = e.target.closest('[data-folder-menu]');
    if (!item) return;
    e.stopPropagation();
    var act = item.getAttribute('data-folder-menu');
    var fid = state.folderMoreId;
    closeFolderMoreMenu();
    if (!fid) return;
    if (act === 'add') openFolderCreate(fid);
    else if (act === 'edit') openFolderRename(fid);
    else if (act === 'move') openFolderMove(fid);
    else if (act === 'delete') openFolderDelete(fid);
  });

  if ($('materialMoreMenu')) {
    $('materialMoreMenu').addEventListener('click', function (e) {
      var item = e.target.closest('[data-material-menu]');
      if (!item) return;
      e.stopPropagation();
      var act = item.getAttribute('data-material-menu');
      var mid = state.materialMoreId;
      closeMaterialMoreMenu();
      if (!mid) return;
      var row = findRow(mid);
      if (!row) return;
      if (act === 'detail') openDetail(row);
      else if (act === 'push') openPushChannelModal([row.id]);
      else if (act === 'delete') {
        state.deleteIds = [row.id];
        state.deleteFolderIds = [];
        if ($('deleteText')) {
          $('deleteText').textContent = '此操作不可撤销，确认删除吗？';
        }
        UI.openModal('deleteModal');
      }
    });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('#folderMoreMenu') || e.target.closest('[data-folder-more]')) return;
    closeFolderMoreMenu();
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('#materialMoreMenu') || e.target.closest('[data-material-more]')) return;
    closeMaterialMoreMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeFolderMoreMenu();
      closeMaterialMoreMenu();
    }
  });

  window.addEventListener('scroll', function () {
    closeFolderMoreMenu();
    closeMaterialMoreMenu();
  }, true);
  window.addEventListener('resize', function () {
    closeFolderMoreMenu();
    closeMaterialMoreMenu();
  });

  function openNewFolderAtRoot() {
    openFolderCreate(SYSTEM_FOLDER.id);
  }

  function openNewFolder() {
    if (isSystemFolder(state.folderId)) {
      UI.showToast('全部素材不支持新建文件夹');
      return;
    }
    openFolderCreate(state.folderId);
  }

  $('newFolderBtn').addEventListener('click', openNewFolderAtRoot);
  $('newFolderToolbarBtn').addEventListener('click', openNewFolder);

  if ($('moveFolderSubmit')) {
    $('moveFolderSubmit').addEventListener('click', function () {
      var id = state.moveFolderId;
      var parentId = state.moveFolderParentId;
      if (!id) {
        UI.closeModal('moveFolderModal');
        return;
      }
      if (!parentId) {
        var item = $('moveFolderParentItem');
        if (item) item.classList.add('is-error');
        return;
      }
      var moved = moveFolderToParent(id, parentId);
      if (!moved.ok) return;
      state.moveFolderId = null;
      UI.closeModal('moveFolderModal');
      expandFolderAncestors(state.folderId);
      renderAll();
      if (moved.autoRenamed) {
        UI.showToast('文件夹已移动，因同名已命名为 ' + moved.name, 'success');
      } else {
        UI.showToast('文件夹已移动', 'success');
      }
    });
  }

  function findParentList(id) {
    function walk(list) {
      var i;
      for (i = 0; i < list.length; i++) {
        if (list[i].id === id) return list;
        var found = walk(list[i].children || []);
        if (found) return found;
      }
      return null;
    }
    return walk(CUSTOM_FOLDERS);
  }

  $('folderSubmit').addEventListener('click', function () {
    var name = (($('folderNameInput') && $('folderNameInput').value) || '').trim();
    var item = $('folderNameItem');
    if (!name) {
      if (item) item.classList.add('is-error');
      return;
    }
    var mode = state.folderModal.mode;

    if (mode === 'rename') {
      var targetId = state.folderModal.targetId;
      var node = findFolderNode(targetId);
      if (!node || node.system) {
        UI.showToast('文件夹不存在');
        return;
      }
      var siblings = findParentList(targetId) || [];
      var occupied = siblings
        .filter(function (s) { return s.id !== targetId; })
        .map(function (s) { return s.name; });
      var finalRename = allocateSiblingFolderName(name, occupied);
      node.name = finalRename;
      UI.closeModal('folderModal');
      renderAll();
      notifyFolderAutoRename(name, finalRename);
      if (finalRename === name) UI.showToast('文件夹已重命名', 'success');
      return;
    }

    var parentId = state.folderModal.parentId || SYSTEM_FOLDER.id;
    var finalName = allocateSiblingFolderName(name, getSiblingNames(parentId));
    var neo = { id: 'f' + (++folderSeq), name: finalName, children: [] };
    if (isSystemFolder(parentId)) {
      CUSTOM_FOLDERS.push(neo);
    } else {
      var parent = findFolderNode(parentId);
      if (!parent || parent.system) {
        UI.showToast('父级文件夹不存在');
        return;
      }
      parent.children = parent.children || [];
      parent.children.push(neo);
      state.collapsed[parent.id] = false;
    }
    UI.closeModal('folderModal');
    renderFolderTree();
    notifyFolderAutoRename(name, finalName);
    if (finalName === name) UI.showToast('文件夹已创建', 'success');
  });

  $('deleteFolderOk').addEventListener('click', function () {
    var id = state.deleteFolderId;
    state.deleteFolderId = null;
    UI.closeModal('deleteFolderModal');
    if (!removeFolderById(id)) return;
    applyFilters();
    UI.showToast('文件夹已删除', 'success');
  });

  if ($('resetBtn')) $('resetBtn').addEventListener('click', resetFilters);
  $('queryBtn').addEventListener('click', applyFilters);

  if ($('breadcrumb')) {
    $('breadcrumb').addEventListener('click', function (e) {
      var link = e.target.closest('[data-crumb]');
      if (!link || !$('breadcrumb').contains(link)) return;
      var id = link.getAttribute('data-crumb');
      if (!id || id === state.folderId) return;
      navigateToFolder(id);
    });
  }

  document.querySelectorAll('.view-switch__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = btn.getAttribute('data-view') || 'list';
      if (next === state.view) return;
      state.view = next;
      state.page = 1;
      clearSelection();
      renderAll();
    });
  });

  if ($('showSubfolderMaterials')) {
    $('showSubfolderMaterials').checked = !!state.showSubfolderMaterials;
    $('showSubfolderMaterials').addEventListener('change', function () {
      state.showSubfolderMaterials = !!$('showSubfolderMaterials').checked;
      state.page = 1;
      clearSelection();
      renderAll();
    });
  }

  if ($('gridSelectAll')) {
    $('gridSelectAll').addEventListener('change', function () {
      setGridPageSelection(!!$('gridSelectAll').checked);
      renderAll();
    });
  }

  if ($('showDeliveryData')) {
    $('showDeliveryData').checked = !!state.showDeliveryData;
    $('showDeliveryData').addEventListener('change', function () {
      state.showDeliveryData = !!$('showDeliveryData').checked;
      /* 勾选仅展开数据时间；取消勾选立即回到占位 "-"，需再次查询才填数 */
      state.deliveryDataReady = false;
      if (!state.showDeliveryData) {
        if (state.sortSpecs && state.sortSpecs.length) {
          state.sortSpecs = state.sortSpecs.filter(function (s) { return !isDataColumnKey(s.key); });
        }
      } else if (state.deliveryDateCleared && dataDateApi && dataDateApi.setRange) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var start = new Date(today);
        start.setDate(start.getDate() - 6);
        dataDateApi.setRange(start, today, 'last7', true);
        state.deliveryDateCleared = false;
        var wrap = $('dataDateWrap');
        if (wrap) wrap.classList.add('has-value');
      }
      syncDataDateVisibility();
      renderAll();
    });
  }

  function renderMetricModal() {
    var kw = (($('metricSearch') && $('metricSearch').value) || '').trim().toLowerCase();
    var avail = availableColumns();
    var grouped = {};
    COLUMN_GROUPS.forEach(function (group) { grouped[group] = []; });
    avail.forEach(function (col) {
      if (kw && col.name.toLowerCase().indexOf(kw) < 0 && col.key.toLowerCase().indexOf(kw) < 0) return;
      if (!grouped[col.group]) grouped[col.group] = [];
      grouped[col.group].push(col);
    });
    var visibleGroups = COLUMN_GROUPS.filter(function (group) { return (grouped[group] || []).length; });
    if (visibleGroups.indexOf(state.metricCat) < 0) state.metricCat = visibleGroups[0] || COLUMN_GROUPS[0];

    $('metricCats').innerHTML = visibleGroups.map(function (group) {
      return '<button class="metric-cat' + (group === state.metricCat ? ' is-active' : '') + '" type="button" data-group="' + escapeHtml(group) + '">' + escapeHtml(group) + '</button>';
    }).join('') || '<div class="multi-panel__empty">无匹配</div>';

    $('metricOptions').innerHTML = visibleGroups.map(function (group) {
      var groupCols = grouped[group] || [];
      var selectable = groupCols.filter(function (col) { return !isDefaultFrozenKey(col.key); });
      var checkedN = groupCols.filter(function (col) { return state.columnDraft.indexOf(col.key) >= 0; }).length;
      var allOn = groupCols.length > 0 && checkedN === groupCols.length;
      return '<section class="metric-group" id="metricGroup-' + escapeHtml(group) + '" data-group="' + escapeHtml(group) + '">' +
        '<div class="metric-group__head">' +
          '<input class="metric-check" type="checkbox" data-group-check="' + escapeHtml(group) + '"' + (allOn ? ' checked' : '') + (selectable.length ? '' : ' disabled') + ' aria-label="全选' + escapeHtml(group) + '" />' +
          '<span>' + escapeHtml(group) + '</span></div>' +
        '<div class="metric-group__grid">' + groupCols.map(function (col) {
          var on = state.columnDraft.indexOf(col.key) >= 0;
          var locked = isDefaultFrozenKey(col.key);
          return '<label class="metric-option' + (locked ? ' is-disabled' : '') + '">' +
            '<input class="metric-check" type="checkbox" value="' + col.key + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + ' />' +
            '<span class="metric-option__name" title="' + escapeHtml(col.name) + '">' + escapeHtml(col.name) + '</span></label>';
        }).join('') + '</div></section>';
    }).join('') || '<div class="multi-panel__empty">无匹配指标</div>';

    $('metricOptions').querySelectorAll('[data-group-check]').forEach(function (input) {
      var group = input.getAttribute('data-group-check');
      var groupCols = grouped[group] || [];
      var checkedN = groupCols.filter(function (col) { return state.columnDraft.indexOf(col.key) >= 0; }).length;
      input.indeterminate = checkedN > 0 && checkedN < groupCols.length;
    });

    state.draftFrozenCount = Math.max(minFrozenCount(state.columnDraft), Math.min(state.draftFrozenCount, state.columnDraft.length));
    var freezeAt = state.draftFrozenCount;
    var listHtml = '';
    if (!state.columnDraft.length) {
      listHtml = '<div class="multi-panel__empty">请添加指标</div>';
    } else {
      state.columnDraft.forEach(function (key, idx) {
        if (idx === freezeAt) listHtml += '<div class="metric-freeze" data-freeze-line="1">拖到上方的列将冻结显示</div>';
        var col = COLUMN_MAP[key];
        if (!col) return;
        var forced = isDefaultFrozenKey(key);
        var frozen = idx < freezeAt;
        var icon = frozen
          ? '<svg class="metric-selected__lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="1"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>'
          : '<svg class="metric-selected__drag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
        var remove = forced ? '' : '<button class="metric-selected__remove" type="button" data-remove-col="' + escapeHtml(key) + '" aria-label="移除"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 2l8 8M10 2L2 10"/></svg></button>';
        listHtml += '<div class="metric-selected__item' + (frozen ? ' is-frozen' : '') + '" draggable="' + (forced ? 'false' : 'true') + '" data-metric="' + escapeHtml(key) + '">' +
          icon + '<span class="metric-selected__name">' + escapeHtml(col.name) + '</span>' + remove + '</div>';
      });
      if (freezeAt >= state.columnDraft.length) listHtml += '<div class="metric-freeze" data-freeze-line="1">拖到上方的列将冻结显示</div>';
    }
    $('metricSelectedList').innerHTML = listHtml;
    $('metricSelectedCount').textContent = '已选 ' + state.columnDraft.length + ' 列';
  }

  function toggleMetricKey(key, checked) {
    if (isDefaultFrozenKey(key)) return;
    var idx = state.columnDraft.indexOf(key);
    if (checked && idx < 0) state.columnDraft.push(key);
    else if (!checked && idx >= 0) {
      state.columnDraft.splice(idx, 1);
      if (idx < state.draftFrozenCount) {
        state.draftFrozenCount = Math.max(minFrozenCount(state.columnDraft), state.draftFrozenCount - 1);
      }
    }
    state.draftFrozenCount = Math.max(state.draftFrozenCount, minFrozenCount(state.columnDraft));
  }

  function normalizeFrozenDraft() {
    var forced = [];
    var rest = [];
    state.columnDraft.forEach(function (key) {
      if (isDefaultFrozenKey(key)) forced.push(key);
      else rest.push(key);
    });
    var userFrozen = rest.splice(0, Math.max(0, state.draftFrozenCount - forced.length));
    state.columnDraft = forced.concat(userFrozen, rest);
    state.draftFrozenCount = forced.length + userFrozen.length;
  }

  function openMetricModal() {
    state.columnDraft = state.columns.filter(function (key) { return !!COLUMN_MAP[key]; }).slice();
    state.draftFrozenCount = state.frozenCount;
    if ($('metricSearch')) $('metricSearch').value = '';
    state.metricCat = COLUMN_GROUPS[0];
    renderMetricModal();
    UI.openModal('metricModal');
  }

  if ($('metricsBtn')) {
    $('metricsBtn').addEventListener('click', function () {
      if ($('metricsBtn').disabled) return;
      UI.closePanels();
      openMetricModal();
    });
  }

  if ($('metricSearch')) {
    $('metricSearch').addEventListener('input', renderMetricModal);
  }

  if ($('metricOptions')) {
    $('metricOptions').addEventListener('scroll', function () {
      if (state.metricAnchorLock) return;
      var scroller = $('metricOptions');
      var groups = scroller.querySelectorAll('.metric-group');
      if (!groups.length) return;
      var top = scroller.scrollTop + 24;
      var active = groups[0].getAttribute('data-group');
      Array.prototype.forEach.call(groups, function (group) {
        if (group.offsetTop <= top) active = group.getAttribute('data-group');
      });
      if (active && active !== state.metricCat) {
        state.metricCat = active;
        Array.prototype.forEach.call($('metricCats').querySelectorAll('.metric-cat'), function (btn) {
          btn.classList.toggle('is-active', btn.getAttribute('data-group') === active);
        });
      }
    });

    $('metricOptions').addEventListener('change', function (e) {
      var groupInput = e.target.closest('[data-group-check]');
      if (groupInput) {
        var group = groupInput.getAttribute('data-group-check');
        var checked = groupInput.checked;
        availableColumns().forEach(function (col) {
          if (col.group !== group || isDefaultFrozenKey(col.key)) return;
          toggleMetricKey(col.key, checked);
        });
        renderMetricModal();
        return;
      }
      var input = e.target.closest('input.metric-check');
      if (!input || input.disabled || input.hasAttribute('data-group-check')) return;
      toggleMetricKey(input.value, input.checked);
      renderMetricModal();
    });
  }

  if ($('metricCats')) {
    $('metricCats').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-group]');
      if (!btn) return;
      var group = btn.getAttribute('data-group');
      var el = document.getElementById('metricGroup-' + group);
      var scroller = $('metricOptions');
      if (!el || !scroller) return;
      state.metricAnchorLock = true;
      state.metricCat = group;
      Array.prototype.forEach.call($('metricCats').querySelectorAll('.metric-cat'), function (item) {
        item.classList.toggle('is-active', item === btn);
      });
      scroller.scrollTo({ top: Math.max(0, el.offsetTop - 8), behavior: 'smooth' });
      window.setTimeout(function () { state.metricAnchorLock = false; }, 400);
    });
  }

  if ($('metricClear')) {
    $('metricClear').addEventListener('click', function () {
      state.columnDraft = state.columnDraft.filter(isDefaultFrozenKey);
      state.draftFrozenCount = state.columnDraft.length;
      renderMetricModal();
    });
  }

  if ($('metricSubmit')) {
    $('metricSubmit').addEventListener('click', function () {
      if (!state.columnDraft.length) {
        UI.showToast('请至少选择 1 列', 'warning');
        return;
      }
      normalizeFrozenDraft();
      state.columns = state.columnDraft.slice();
      state.frozenCount = state.draftFrozenCount;
      UI.closeModal('metricModal');
      renderAll();
      UI.showToast('自定义列已更新');
    });
  }

  if ($('metricSelectedList')) {
    $('metricSelectedList').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-remove-col]');
      if (!btn) return;
      toggleMetricKey(btn.getAttribute('data-remove-col'), false);
      renderMetricModal();
    });

    $('metricSelectedList').addEventListener('dragstart', function (e) {
      var item = e.target.closest('[data-metric]');
      if (!item || item.getAttribute('draggable') === 'false') {
        e.preventDefault();
        return;
      }
      state.dragMetric = item.getAttribute('data-metric');
      item.classList.add('is-dragging');
      try {
        e.dataTransfer.setData('text/plain', state.dragMetric);
        e.dataTransfer.effectAllowed = 'move';
      } catch (err) { /* ignore */ }
    });

    $('metricSelectedList').addEventListener('dragend', function () {
      var item = $('metricSelectedList').querySelector('.is-dragging');
      if (item) item.classList.remove('is-dragging');
      Array.prototype.forEach.call($('metricSelectedList').querySelectorAll('.is-drag-over'), function (el) {
        el.classList.remove('is-drag-over');
      });
      state.dragMetric = null;
    });

    $('metricSelectedList').addEventListener('dragover', function (e) {
      e.preventDefault();
      if (!state.dragMetric) return;
      var line = e.target.closest('[data-freeze-line]');
      var item = e.target.closest('[data-metric]');
      Array.prototype.forEach.call($('metricSelectedList').querySelectorAll('.is-drag-over'), function (el) {
        el.classList.remove('is-drag-over');
      });
      if (line) line.classList.add('is-drag-over');
      else if (item) item.classList.add('is-drag-over');
    });

    $('metricSelectedList').addEventListener('drop', function (e) {
      e.preventDefault();
      if (!state.dragMetric || isDefaultFrozenKey(state.dragMetric)) return;
      var line = e.target.closest('[data-freeze-line]');
      var item = e.target.closest('[data-metric]');
      var from = state.columnDraft.indexOf(state.dragMetric);
      if (from < 0) return;
      if (line) {
        state.columnDraft.splice(from, 1);
        var insertAt = from < state.draftFrozenCount
          ? Math.max(minFrozenCount(state.columnDraft), state.draftFrozenCount - 1)
          : state.draftFrozenCount;
        insertAt = Math.max(minFrozenCount(state.columnDraft), Math.min(insertAt, state.columnDraft.length));
        state.columnDraft.splice(insertAt, 0, state.dragMetric);
        state.draftFrozenCount = Math.max(minFrozenCount(state.columnDraft), insertAt + 1);
      } else if (item) {
        var target = item.getAttribute('data-metric');
        if (target === state.dragMetric) return;
        var to = state.columnDraft.indexOf(target);
        if (to < 0) return;
        var wasFrozen = from < state.draftFrozenCount;
        var toFrozen = to < state.draftFrozenCount;
        state.columnDraft.splice(from, 1);
        state.columnDraft.splice(to, 0, state.dragMetric);
        if (!wasFrozen && toFrozen) state.draftFrozenCount = Math.max(state.draftFrozenCount, minFrozenCount(state.columnDraft));
        else if (wasFrozen && !toFrozen) state.draftFrozenCount = Math.max(minFrozenCount(state.columnDraft), state.draftFrozenCount - 1);
      }
      normalizeFrozenDraft();
      renderMetricModal();
    });
  }

  if ($('exportBtn')) {
    $('exportBtn').addEventListener('click', function () {
      if ($('exportBtn').disabled) return;
      var count = getFilteredRows().length;
      if (!count) {
        UI.showToast('当前没有可下载的素材');
        return;
      }
      if (window.DownloadTaskStore && DownloadTaskStore.createPack) {
        DownloadTaskStore.createPack({ source: '素材库', count: count });
      }
      UI.showToast('下载任务已创建，请到任务中心查看', 'success');
    });
  }

  syncToolbarByView();

  if (UI.bindBatchMenu) {
    UI.bindBatchMenu({
      wrapId: 'batchWrap',
      btnId: 'batchBtn',
      menuId: 'batchMenu',
      onAction: function (action) {
        var ids = getSelectedIds();
        var folderIds = getSelectedFolderIds();
        if (!ids.length && !folderIds.length) {
          UI.showToast('请先勾选素材或文件夹');
          return;
        }
        if (action === 'download' || action === 'move' || action === 'tag' || action === 'pushChannel' || action === 'xmp') {
          if (!ids.length) {
            UI.showToast('请先勾选素材');
            return;
          }
          if (action === 'download') {
            if (window.DownloadTaskStore && DownloadTaskStore.createPack) {
              DownloadTaskStore.createPack({ source: '本地素材', count: ids.length });
            }
            UI.showToast('下载任务已创建，请到任务中心查看', 'success');
            return;
          }
          if (action === 'move') {
            openBatchMoveModal(ids);
            return;
          }
          if (action === 'tag') {
            openBatchTagModal(ids);
            return;
          }
          if (action === 'pushChannel') {
            openPushChannelModal(ids);
            return;
          }
          if (action === 'xmp') {
            openBatchXmpModal(ids);
            return;
          }
          return;
        }
        if (action === 'delete') {
          state.deleteIds = ids;
          state.deleteFolderIds = folderIds.slice();
          if ($('deleteText')) {
            if (ids.length && folderIds.length) {
              $('deleteText').textContent = '将删除已选素材与文件夹（含文件夹下素材），此操作不可撤销，确认删除吗？';
            } else if (folderIds.length) {
              $('deleteText').textContent = '确认删除文件夹及文件夹下所有的素材？';
            } else {
              $('deleteText').textContent = '此操作不可撤销，确认删除吗？';
            }
          }
          UI.openModal('deleteModal');
        }
      }
    });
  }

  function onCheckChange(id, checked) {
    state.selected[id] = checked;
    updateBatchBtn();
    if (state.view === 'list') {
      var checkAll = $('checkAll');
      if (checkAll) {
        var pageMats = getPageMaterialRows();
        var allChecked = pageMats.length > 0 && pageMats.every(function (r) { return state.selected[r.id]; });
        checkAll.checked = allChecked;
        checkAll.indeterminate = !allChecked && pageMats.some(function (r) { return state.selected[r.id]; });
      }
    }
  }

  function onFolderCheckChange(id, checked) {
    state.selectedFolders[id] = checked;
    updateBatchBtn();
  }

  $('libContent').addEventListener('change', function (e) {
    if (e.target && e.target.id === 'checkAll') {
      var on = e.target.checked;
      getPageMaterialRows().forEach(function (r) { state.selected[r.id] = on; });
      renderAll();
      return;
    }
    var folderCheck = e.target.closest('[data-folder-check]');
    if (folderCheck) {
      onFolderCheckChange(folderCheck.getAttribute('data-folder-check'), folderCheck.checked);
      return;
    }
    var check = e.target.closest('[data-check]');
    if (!check) return;
    onCheckChange(check.getAttribute('data-check'), check.checked);
  });

  $('libContent').addEventListener('click', function (e) {
    var copyBtn = e.target.closest('[data-copy]');
    if (!copyBtn || !$('libContent').contains(copyBtn)) return;
    e.preventDefault();
    e.stopPropagation();
    UI.copyText(copyBtn.getAttribute('data-copy'));
  });

  function closeNameEditPop() {
    var pop = $('nameEditPop');
    if (!pop) return;
    pop.classList.remove('is-open');
    pop.setAttribute('aria-hidden', 'true');
    state.nameEditId = null;
  }

  function startQuickNameEdit(row, btn) {
    if (!row || !btn) return;
    hidePreview();
    var pop = $('nameEditPop');
    var input = $('nameEditInput');
    if (!pop || !input) return;
    state.nameEditId = row.id;
    input.value = stripExt(row.name);
    pop.classList.add('is-open');
    pop.setAttribute('aria-hidden', 'false');

    var rect = btn.getBoundingClientRect();
    var popW = 320;
    var left = rect.left;
    var top = rect.bottom + 4;
    if (left + popW > window.innerWidth - 16) left = window.innerWidth - popW - 16;
    if (left < 16) left = 16;
    if (top + 120 > window.innerHeight - 16) top = Math.max(16, rect.top - 120);
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';

    setTimeout(function () {
      input.focus();
      input.select();
    }, 0);
  }

  function commitNameEdit() {
    var id = state.nameEditId;
    var row = id ? findRow(id) : null;
    var input = $('nameEditInput');
    if (!row || !input) {
      closeNameEditPop();
      return;
    }
    var v = (input.value || '').trim();
    if (!v) {
      UI.showToast('请输入素材名称', 'error');
      input.focus();
      return;
    }
    var ext = row.format || fileExt(row.name) || '';
    row.name = v + (ext ? ('.' + ext) : '');
    row.ossUrl = buildOssUrl(row.name, new Date(row.createdTs || Date.now()), row.id, row.format);
    closeNameEditPop();
    renderAll();
    UI.showToast('修改成功', 'success');
  }

  function openQuickTagEdit(row) {
    if (!row) return;
    hidePreview();
    closeNameEditPop();
    state.batchTagIds = [row.id];
    state.batchTags = (row.tags || []).slice();
    if (batchTagSelect && batchTagSelect.render) batchTagSelect.render();
    else if (batchTagSelect && batchTagSelect.syncLabel) batchTagSelect.syncLabel();
    UI.openModal('batchTagModal');
  }

  if ($('nameEditOk')) {
    $('nameEditOk').addEventListener('click', function (e) {
      e.stopPropagation();
      commitNameEdit();
    });
  }
  if ($('nameEditCancel')) {
    $('nameEditCancel').addEventListener('click', function (e) {
      e.stopPropagation();
      closeNameEditPop();
    });
  }
  if ($('nameEditInput')) {
    $('nameEditInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitNameEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeNameEditPop();
      }
    });
    $('nameEditInput').addEventListener('click', function (e) { e.stopPropagation(); });
  }
  if ($('nameEditPop')) {
    $('nameEditPop').addEventListener('click', function (e) { e.stopPropagation(); });
  }
  document.addEventListener('click', function (e) {
    if (!$('nameEditPop') || !$('nameEditPop').classList.contains('is-open')) return;
    if (e.target.closest('#nameEditPop') || e.target.closest('[data-quick="name"]')) return;
    closeNameEditPop();
  });

  $('tableBody').addEventListener('mouseover', function (e) {
    var btn = e.target.closest('[data-preview]');
    if (!btn) return;
    if ($('nameEditPop') && $('nameEditPop').classList.contains('is-open')) return;
    var row = findRow(btn.getAttribute('data-preview'));
    if (!row) return;
    showPreview(stripExt(row.name), btn);
  });
  $('tableBody').addEventListener('mouseout', function (e) {
    if (e.target.closest('[data-preview]')) hidePreview();
  });

  $('tableBody').addEventListener('click', function (e) {
    var quick = e.target.closest('[data-quick]');
    if (quick) {
      e.preventDefault();
      e.stopPropagation();
      var qTr = quick.closest('tr');
      var qRow = qTr ? findRow(qTr.getAttribute('data-id')) : null;
      if (!qRow) return;
      var kind = quick.getAttribute('data-quick');
      if (kind === 'name') startQuickNameEdit(qRow, quick);
      else if (kind === 'tag') openQuickTagEdit(qRow);
      return;
    }
    var thumb = e.target.closest('[data-oss]');
    if (thumb) {
      var oss = thumb.getAttribute('data-oss');
      if (oss) window.open(oss, '_blank', 'noopener,noreferrer');
      return;
    }
    var act = e.target.closest('[data-act]');
    if (!act || act.disabled) return;
    var tr = act.closest('tr');
    var row = tr ? findRow(tr.getAttribute('data-id')) : null;
    if (!row) return;
    var a = act.getAttribute('data-act');
    if (a === 'detail') openDetail(row);
    else if (a === 'push') {
      openPushChannelModal([row.id]);
    } else if (a === 'delete') {
      state.deleteIds = [row.id];
      state.deleteFolderIds = [];
      if ($('deleteText')) {
        $('deleteText').textContent = '此操作不可撤销，确认删除吗？';
      }
      UI.openModal('deleteModal');
    }
  });

  $('gridList').addEventListener('click', function (e) {
    if (e.target.closest('[data-check]') || e.target.closest('[data-folder-check]')) {
      e.stopPropagation();
      return;
    }
    var folderMore = e.target.closest('[data-folder-more]');
    if (folderMore) {
      e.preventDefault();
      e.stopPropagation();
      openFolderMoreMenu(folderMore);
      return;
    }
    var materialMore = e.target.closest('[data-material-more]');
    if (materialMore) {
      e.preventDefault();
      e.stopPropagation();
      openMaterialMoreMenu(materialMore);
      return;
    }
    var quick = e.target.closest('[data-quick]');
    if (quick) {
      e.preventDefault();
      e.stopPropagation();
      var qCard = quick.closest('[data-id]');
      var qRow = qCard ? findRow(qCard.getAttribute('data-id')) : null;
      if (!qRow) return;
      if (quick.getAttribute('data-quick') === 'name') startQuickNameEdit(qRow, quick);
      return;
    }
    var ossBtn = e.target.closest('[data-oss]');
    if (ossBtn && ossBtn.closest('#gridList')) {
      var oss = ossBtn.getAttribute('data-oss');
      if (oss) window.open(oss, '_blank', 'noopener,noreferrer');
      return;
    }
    var folderOpen = e.target.closest('[data-folder-open]');
    if (folderOpen) {
      drillIntoFolder(folderOpen.getAttribute('data-folder-open'));
    }
  });

  $('deleteOk').addEventListener('click', function () {
    var ids = state.deleteIds.slice();
    var folderIds = (state.deleteFolderIds || []).slice();
    state.deleteIds = [];
    state.deleteFolderIds = [];
    UI.closeModal('deleteModal');
    if (ids.length) deleteRows(ids, { silent: true });
    var folderRemoved = 0;
    folderIds.forEach(function (fid) {
      if (removeFolderById(fid)) folderRemoved += 1;
    });
    if (folderRemoved) clearSelection();
    if (folderRemoved) applyFilters();
    else renderAll();
    UI.showToast(folderRemoved && !ids.length ? '文件夹已删除' : '删除成功', 'success');
  });

  /* upload drawer */
  var UPLOAD_MAX = 500;
  var uploadUid = 1;
  var uploadProgressTimer = null;

  function canRetryItem(item) {
    return item && item.status === 'failed';
  }

  function canDeleteItem(item) {
    /* 列表仅为提交前缓存，已完成也可删；上传中不可删以免中断传输 */
    return item && item.status !== 'uploading';
  }

  function isUploadBusyItem(item) {
    return item && item.status === 'uploading';
  }

  function hasUploadingItems() {
    return state.upload.items.some(isUploadBusyItem);
  }

  function countUploadingItems() {
    return state.upload.items.filter(isUploadBusyItem).length;
  }

  function getSelectedUploadItems() {
    return state.upload.items.filter(function (it) { return state.upload.selected[it.uid]; });
  }

  function uploadProgressHtml(item) {
    if (item.status === 'failed') {
      return UI.taskStatusDot ? UI.taskStatusDot('已失败') : '<span class="status-dot status-dot--error">已失败</span>';
    }
    if (item.status === 'done') {
      return UI.taskStatusDot ? UI.taskStatusDot('已完成') : '<span class="status-dot status-dot--done">已完成</span>';
    }
    var pct = Math.max(0, Math.min(100, Math.round(Number(item.progress) || 0)));
    return (
      '<div class="upload-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
        '<div class="upload-progress__track" aria-hidden="true"><span class="upload-progress__fill" style="width:' + pct + '%"></span></div>' +
        '<span class="upload-progress__text">' + pct + '%</span>' +
      '</div>'
    );
  }

  function uploadActionHtml(item) {
    var retryOff = !canRetryItem(item);
    var delOff = !canDeleteItem(item);
    return (
      '<span class="action-links">' +
        '<button class="link' + (retryOff ? ' is-disabled' : '') + '" type="button" data-up-act="retry" data-uid="' + item.uid + '"' +
          (retryOff ? ' disabled' : '') + '>重试</button>' +
        '<button class="link link--danger' + (delOff ? ' is-disabled' : '') + '" type="button" data-up-act="delete" data-uid="' + item.uid + '"' +
          (delOff ? ' disabled' : '') + '>删除</button>' +
      '</span>'
    );
  }

  function syncUploadBusy() {
    var uploading = hasUploadingItems();
    var transferring = !!uploadProgressTimer;
    state.upload.uploading = transferring;
    var panel = document.querySelector('#uploadDrawer .drawer');
    if (panel) panel.classList.toggle('is-uploading', transferring);
    var submit = $('upSubmit');
    if (submit) submit.disabled = uploading;
  }

  function stopUploadProgressTimer() {
    if (uploadProgressTimer) {
      clearInterval(uploadProgressTimer);
      uploadProgressTimer = null;
    }
  }

  function patchUploadProgressCells() {
    state.upload.items.forEach(function (item) {
      var cell = document.querySelector('#upFileBody tr[data-uid="' + item.uid + '"] td[data-col="progress"]');
      if (cell) cell.innerHTML = uploadProgressHtml(item);
    });
  }

  function ensureUploadProgressTimer() {
    if (uploadProgressTimer) return;
    uploadProgressTimer = setInterval(function () {
      var anyUploading = false;
      var statusChanged = false;
      state.upload.items.forEach(function (item) {
        if (item.status !== 'uploading') return;
        anyUploading = true;
        item.progress = Math.min(100, (Number(item.progress) || 0) + (item.progressSpeed || 8));
        if (item.failAt != null && item.progress >= item.failAt) {
          item.status = 'failed';
          item.progress = item.failAt;
          item.failAt = null;
          statusChanged = true;
          return;
        }
        if (item.progress >= 100) {
          item.progress = 100;
          item.status = 'done';
          statusChanged = true;
        }
      });
      patchUploadProgressCells();
      if (statusChanged) {
        syncUploadBusy();
        renderUploadTable();
      }
      if (!anyUploading) {
        stopUploadProgressTimer();
        syncUploadBusy();
      }
    }, 220);
  }

  function retryUploadItems(items) {
    var targets = (items || []).filter(canRetryItem);
    if (!targets.length) {
      UI.showToast('请选择上传失败的素材');
      return;
    }
    targets.forEach(function (item, i) {
      item.status = 'uploading';
      item.progress = 0;
      item.failAt = null;
      item.progressSpeed = 8 + ((i * 5) % 10);
    });
    renderUploadTable();
    ensureUploadProgressTimer();
    syncUploadBusy();
  }

  function startPendingUploads() {
    var started = 0;
    state.upload.items.forEach(function (item, i) {
      if (item.status === 'pending') {
        item.status = 'uploading';
        item.failAt = (i % 5 === 4) ? (35 + (i % 4) * 12) : null;
        item.progressSpeed = 6 + ((i * 7) % 11);
        started++;
        return;
      }
      if (item.status === 'uploading') {
        if (!item.progressSpeed) item.progressSpeed = 6 + ((i * 7) % 11);
        started++;
      }
    });
    if (!started) {
      if (state.upload.items.some(canRetryItem)) {
        UI.showToast('存在上传失败的素材，请重试');
      } else {
        UI.showToast('没有待上传的素材');
      }
      return false;
    }
    renderUploadTable();
    ensureUploadProgressTimer();
    syncUploadBusy();
    return true;
  }

  function getUploadSummary() {
    var total = state.upload.items.length;
    var done = 0;
    var failed = 0;
    state.upload.items.forEach(function (it) {
      if (it.status === 'done') done++;
      else if (it.status === 'failed') failed++;
    });
    return { total: total, done: done, failed: failed };
  }

  function openSubmitUploadConfirm() {
    var s = getUploadSummary();
    var text = $('submitUploadText');
    if (text) {
      text.textContent = '上传素材共' + s.total + '个，已完成' + s.done + '个，已失败' + s.failed + '个。';
    }
    UI.openModal('submitUploadModal');
  }

  function commitUploadedItems() {
    var now = new Date();
    var newIds = [];
    var targetFolder = state.upload.folderId;
    var tags = withoutSystemTags(state.upload.tags).length ? withoutSystemTags(state.upload.tags) : ['英语'];
    var ready = state.upload.items.filter(function (item) { return item.status === 'done'; });
    ready.forEach(function (item, i) {
      var id = String(materialSeq++);
      newIds.push(id);
      var ext = item.format && item.format !== '—' ? item.format : fileExt(item.name) || 'mp4';
      var isImage = item.mediaType === '图片' || ['png', 'jpg', 'jpeg', 'webp', 'gif'].indexOf(ext) !== -1;
      var fullName = item.name.indexOf('.') > 0 ? item.name : (item.name + '.' + ext);
      ALL_ROWS.unshift({
        id: id,
        name: fullName,
        folderId: targetFolder,
        type: isImage ? '图片' : '视频',
        format: ext,
        size: item.sizeDim && item.sizeDim !== '—' ? item.sizeDim : '1080x1920',
        durationSec: isImage ? 0 : 12 + i,
        tags: tags,
        creator: state.upload.creator,
        createdAt: formatDateTime(now),
        createdDate: formatDateYMD(now),
        createdTs: now.getTime() + i,
        status: '启用',
        syncStatus: '未同步',
        xmpId: '',
        mediaId: 'md' + id,
        failReason: '',
        delivery: [],
        source: sourceForFolder(targetFolder),
        ossUrl: buildOssUrl(fullName, now, id, ext)
      });
    });
    syncUploadBusy();
    if (UI.closeModal) UI.closeModal('submitUploadModal');
    closeUploadDrawer({ force: true });
    UI.showToast('已上传 ' + newIds.length + ' 个素材', 'success');
    applyFilters();
    pushRows(newIds, { force: true, silent: true });
  }

  function listFolderSelectOptions() {
    var opts = [{ id: SYSTEM_FOLDER.id, name: SYSTEM_FOLDER.name }];
    walkFolders(CUSTOM_FOLDERS, '', function (node, path) {
      opts.push({ id: node.id, name: path });
    });
    return opts;
  }

  function formatFileSize(bytes) {
    var n = Number(bytes) || 0;
    if (n < 1024) return n + 'B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(n < 10 * 1024 ? 2 : 0) + 'KB';
    return (n / (1024 * 1024)).toFixed(2) + 'MB';
  }

  function getUploadFolderLabel(id) {
    if (!id) return '';
    if (isSystemFolder(id)) return SYSTEM_FOLDER.name;
    return getFolderPath(id) || '';
  }

  function bindFolderSelect(cfg) {
    cfg = cfg || {};
    var wrap = $(cfg.wrapId || 'upFolderWrap');
    var trigger = $(cfg.triggerId || 'upFolderTrigger');
    var panel = $(cfg.panelId || 'upFolderPanel');
    var label = $(cfg.labelId || 'upFolderLabel');
    var list = $(cfg.listId || 'upFolderList');
    var search = $(cfg.searchId || 'upFolderSearch');
    var clearBtn = $(cfg.clearId || 'upFolderClear');
    var errorItemId = cfg.errorItemId || 'upFolderItem';
    if (!wrap || !trigger || !panel || !label || !list) return null;

    function getValue() {
      return cfg.getValue ? cfg.getValue() : state.upload.folderId;
    }

    function setValue(v) {
      if (cfg.setValue) cfg.setValue(v || '');
      else state.upload.folderId = v || '';
    }

    function formatValue(value) {
      if (cfg.formatValue) return cfg.formatValue(value);
      return getUploadFolderLabel(value);
    }

    function listOptions() {
      if (cfg.getOptions) return cfg.getOptions() || [];
      return listFolderSelectOptions();
    }

    function syncLabel() {
      var value = getValue();
      if (!value) {
        label.innerHTML = '<span class="muted">' + (cfg.placeholder || '请选择') + '</span>';
        wrap.classList.remove('has-value');
      } else {
        label.textContent = formatValue(value) || value;
        wrap.classList.add('has-value');
      }
    }

    function render() {
      var kw = search ? (search.value || '').trim().toLowerCase() : '';
      var options = listOptions().filter(function (o) {
        var name = o.name || o.id || '';
        return !kw || name.toLowerCase().indexOf(kw) !== -1;
      });
      var value = getValue();
      list.innerHTML = options.map(function (o) {
        var active = o.id === value ? ' is-active' : '';
        return '<button class="single-option' + active + '" type="button" data-value="' +
          escapeHtml(o.id) + '">' + escapeHtml(o.name) + '</button>';
      }).join('') || '<div class="empty-tip" style="padding:12px;display:block">无匹配项</div>';
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !panel.classList.contains('is-open');
      UI.closePanels();
      document.querySelectorAll('.search-select-panel.is-open').forEach(function (p) {
        p.classList.remove('is-open');
      });
      if (open) {
        panel.classList.add('is-open');
        trigger.classList.add('is-open');
        render();
        if (search) {
          search.value = '';
          search.focus();
        }
      }
    });

    list.addEventListener('click', function (e) {
      e.stopPropagation();
      var opt = e.target.closest('.single-option');
      if (!opt) return;
      setValue(opt.getAttribute('data-value') || '');
      if (getValue()) {
        var item = $(errorItemId);
        if (item) item.classList.remove('is-error');
      }
      syncLabel();
      panel.classList.remove('is-open');
      trigger.classList.remove('is-open');
    });

    if (search) {
      search.addEventListener('input', function () { render(); });
      search.addEventListener('click', function (e) { e.stopPropagation(); });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setValue('');
        syncLabel();
        panel.classList.remove('is-open');
      });
    }

    wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    syncLabel();
    return { syncLabel: syncLabel };
  }

  function unportalFolderTree(panel) {
    if (!panel || !panel.classList.contains('dropdown-portal')) return;
    panel.classList.remove('dropdown-portal');
    panel.style.position = '';
    panel.style.left = '';
    panel.style.top = '';
    panel.style.right = '';
    panel.style.bottom = '';
    panel.style.margin = '';
    panel.style.zIndex = '';
    panel.style.width = '';
    panel.style.minWidth = '';
    panel.style.maxHeight = '';
    panel.style.overflow = '';
    panel.style.height = '';
    var host = panel.__dropdownHost;
    if (host && panel.parentElement !== host) host.appendChild(panel);
  }

  function portalFolderTree(panel, trigger) {
    if (!panel || !trigger) return;
    if (!panel.__dropdownHost) panel.__dropdownHost = panel.parentElement;
    var rect = trigger.getBoundingClientRect();
    var pad = 8;
    var gap = 4;
    var pw = rect.width;
    if (panel.parentElement !== document.body) document.body.appendChild(panel);
    panel.classList.add('dropdown-portal');
    panel.classList.remove('is-dropup', 'is-align-right');
    panel.style.minWidth = pw + 'px';
    panel.style.width = pw + 'px';
    var cap = parseInt((getComputedStyle(document.documentElement).getPropertyValue('--select-panel-height') || '').trim(), 10) || 296;
    var spaceBelow = window.innerHeight - rect.bottom - pad;
    var spaceAbove = rect.top - pad;
    var ph = Math.min(panel.scrollHeight || panel.offsetHeight || cap, cap);
    var openDown = spaceBelow >= Math.min(ph, 200) || spaceBelow >= spaceAbove;
    var avail = (openDown ? spaceBelow : spaceAbove) - gap;
    if (avail < 120) avail = Math.max(spaceBelow, spaceAbove, 120) - gap;
    avail = Math.min(avail, cap);
    var usedH = Math.min(ph, avail);
    var left = rect.left;
    if (left + pw > window.innerWidth - pad) left = Math.max(pad, window.innerWidth - pw - pad);
    var top = openDown ? rect.bottom + gap : Math.max(pad, rect.top - usedH - gap);
    panel.style.position = 'fixed';
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.style.margin = '0';
    panel.style.zIndex = '1200';
    panel.style.maxHeight = avail + 'px';
  }

  var _closePanels = UI.closePanels;
  UI.closePanels = function () {
    if (_closePanels) _closePanels();
    document.querySelectorAll('.folder-tree-panel.dropdown-portal').forEach(unportalFolderTree);
  };

  function bindFolderTreeSelect(cfg) {
    var wrap = $(cfg.wrapId);
    var trigger = $(cfg.triggerId);
    var panel = $(cfg.panelId);
    var label = $(cfg.labelId);
    var list = $(cfg.listId);
    var search = $(cfg.searchId);
    var clearBtn = $(cfg.clearId);
    if (!wrap || !trigger || !panel || !label || !list) return null;

    var collapsed = {};
    function seedCollapsed(nodes, depth) {
      (nodes || []).forEach(function (n) {
        if (n.children && n.children.length && depth > 0) collapsed[n.id] = true;
        seedCollapsed(n.children, depth + 1);
      });
    }
    if (cfg.collapseNested) seedCollapsed(cfg.getRoots ? cfg.getRoots() : [], 0);
    else {
      (cfg.getRoots ? cfg.getRoots() : []).forEach(function (n) {
        if (n.children && n.children.length) collapsed[n.id] = true;
      });
    }

    function getValue() { return cfg.getValue ? cfg.getValue() : ''; }
    function setValue(v) { if (cfg.setValue) cfg.setValue(v || ''); }

    function syncLabel() {
      var id = getValue();
      if (!id) {
        label.innerHTML = '<span class="muted">' + (cfg.placeholder || '请选择') + '</span>';
        wrap.classList.remove('has-value');
        return;
      }
      label.textContent = (cfg.getPath ? cfg.getPath(id) : id) || id;
      wrap.classList.add('has-value');
    }

    function nodeMatches(node, kw) {
      if (!kw) return true;
      if ((node.name || '').toLowerCase().indexOf(kw) !== -1) return true;
      return (node.children || []).some(function (c) { return nodeMatches(c, kw); });
    }

    function renderNode(node, depth) {
      var kw = search ? (search.value || '').trim().toLowerCase() : '';
      if (kw && !nodeMatches(node, kw)) return '';
      var hasChildren = !!(node.children && node.children.length);
      var isCollapsed = !!collapsed[node.id] && !kw;
      var active = node.id === getValue() ? ' is-active' : '';
      var pad = 12 + depth * 16;
      var toggle = hasChildren
        ? ('<button class="folder-tree-node__toggle' + (isCollapsed ? '' : ' is-open') + '" type="button" data-toggle="' +
          escapeHtml(node.id) + '" aria-label="展开/收起">' +
          '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg></button>')
        : '<span class="folder-tree-node__toggle is-empty" aria-hidden="true"></span>';
      var html = '<div class="folder-tree-node' + active + '" style="padding-left:' + pad + 'px">' +
        toggle +
        '<button class="folder-tree-node__label" type="button" data-folder-id="' + escapeHtml(node.id) + '">' +
          escapeHtml(node.name) +
        '</button></div>';
      if (hasChildren && !isCollapsed) {
        node.children.forEach(function (child) {
          html += renderNode(child, depth + 1);
        });
      }
      return html;
    }

    function render() {
      var currentRoots = cfg.getRoots ? cfg.getRoots() : [];
      list.innerHTML = currentRoots.map(function (n) { return renderNode(n, 0); }).join('') ||
        '<div class="empty-tip" style="padding:12px;display:block">无匹配项</div>';
      if (panel.classList.contains('is-open')) portalFolderTree(panel, trigger);
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !panel.classList.contains('is-open');
      UI.closePanels();
      document.querySelectorAll('.search-select-panel.is-open').forEach(function (p) {
        p.classList.remove('is-open');
      });
      if (open) {
        panel.classList.add('is-open');
        trigger.classList.add('is-open');
        render();
        if (search) {
          search.value = '';
          search.focus();
        }
        if (UI.adjustDropdownPlacement) UI.adjustDropdownPlacement(panel, trigger);
        portalFolderTree(panel, trigger);
      }
    });

    list.addEventListener('click', function (e) {
      e.stopPropagation();
      var toggleBtn = e.target.closest('[data-toggle]');
      if (toggleBtn) {
        var tid = toggleBtn.getAttribute('data-toggle');
        collapsed[tid] = !collapsed[tid];
        render();
        return;
      }
      var opt = e.target.closest('[data-folder-id]');
      if (!opt) return;
      setValue(opt.getAttribute('data-folder-id') || '');
      if (cfg.onChange) cfg.onChange(getValue());
      syncLabel();
      panel.classList.remove('is-open');
      trigger.classList.remove('is-open');
      unportalFolderTree(panel);
    });

    if (search) {
      search.addEventListener('input', function () { render(); });
      search.addEventListener('click', function (e) { e.stopPropagation(); });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setValue('');
        if (cfg.onChange) cfg.onChange('');
        syncLabel();
        panel.classList.remove('is-open');
        trigger.classList.remove('is-open');
        unportalFolderTree(panel);
      });
    }
    wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
    syncLabel();
    return { syncLabel: syncLabel, render: render };
  }

  if ($('moveFolderParentWrap')) {
    moveFolderParentApi = bindFolderTreeSelect({
      wrapId: 'moveFolderParentWrap',
      triggerId: 'moveFolderParentTrigger',
      panelId: 'moveFolderParentPanel',
      labelId: 'moveFolderParentLabel',
      listId: 'moveFolderParentList',
      searchId: 'moveFolderParentSearch',
      placeholder: '请选择',
      collapseNested: true,
      getRoots: getMoveFolderRoots,
      getPath: formatMoveParentLabel,
      getValue: function () { return state.moveFolderParentId; },
      setValue: function (v) { state.moveFolderParentId = v || ''; },
      onChange: function () {
        var item = $('moveFolderParentItem');
        if (item) item.classList.remove('is-error');
      }
    });
  }

  var batchMoveTargetApi = null;
  if ($('batchMoveTargetWrap')) {
    batchMoveTargetApi = bindFolderTreeSelect({
      wrapId: 'batchMoveTargetWrap',
      triggerId: 'batchMoveTargetTrigger',
      panelId: 'batchMoveTargetPanel',
      labelId: 'batchMoveTargetLabel',
      listId: 'batchMoveTargetList',
      searchId: 'batchMoveTargetSearch',
      placeholder: '请选择',
      collapseNested: true,
      getRoots: getBatchMoveRoots,
      getPath: formatBatchMoveLabel,
      getValue: function () { return state.batchMoveTarget; },
      setValue: function (v) { state.batchMoveTarget = v || ''; },
      onChange: function () {
        var item = $('batchMoveTargetItem');
        if (item) item.classList.remove('is-error');
      }
    });
  }
  if ($('batchMoveSubmit')) {
    $('batchMoveSubmit').addEventListener('click', submitBatchMove);
  }

  var upFolderSelect = bindFolderSelect({
    wrapId: 'upFolderWrap',
    triggerId: 'upFolderTrigger',
    panelId: 'upFolderPanel',
    labelId: 'upFolderLabel',
    listId: 'upFolderList',
    searchId: 'upFolderSearch',
    clearId: 'upFolderClear',
    errorItemId: 'upFolderItem',
    getValue: function () { return state.upload.folderId; },
    setValue: function (v) { state.upload.folderId = v || ''; }
  });

  var detailFolderSelect = bindFolderSelect({
    wrapId: 'detailFolderWrap',
    triggerId: 'detailFolderTrigger',
    panelId: 'detailFolderPanel',
    labelId: 'detailFolderLabel',
    listId: 'detailFolderList',
    searchId: 'detailFolderSearch',
    clearId: 'detailFolderClear',
    errorItemId: 'detailFolderItem',
    getValue: function () { return state.detail.folderId; },
    setValue: function (v) { state.detail.folderId = v || ''; }
  });

  var batchXmpTargetSelect = bindFolderTreeSelect({
    wrapId: 'batchXmpTargetWrap',
    triggerId: 'batchXmpTargetTrigger',
    panelId: 'batchXmpTargetPanel',
    labelId: 'batchXmpTargetLabel',
    listId: 'batchXmpTargetList',
    searchId: 'batchXmpTargetSearch',
    clearId: 'batchXmpTargetClear',
    placeholder: '请选择',
    getRoots: function () { return XMP_FOLDER_TREE; },
    getPath: function (id) { return id || ''; },
    getValue: function () { return state.batchXmp.targetFolder; },
    setValue: function (v) { state.batchXmp.targetFolder = v || ''; },
    onChange: function () {
      var item = $('batchXmpTargetItem');
      if (item) item.classList.remove('is-error');
    }
  });

  var batchXmpParentSelect = bindFolderTreeSelect({
    wrapId: 'batchXmpParentWrap',
    triggerId: 'batchXmpParentTrigger',
    panelId: 'batchXmpParentPanel',
    labelId: 'batchXmpParentLabel',
    listId: 'batchXmpParentList',
    searchId: 'batchXmpParentSearch',
    clearId: 'batchXmpParentClear',
    placeholder: '请选择',
    getRoots: function () { return XMP_FOLDER_TREE; },
    getPath: function (id) { return id || ''; },
    getValue: function () { return state.batchXmp.parentFolder; },
    setValue: function (v) { state.batchXmp.parentFolder = v || ''; }
  });

  var upCreatorSelect = bindSearchSelect({
    wrapId: 'upCreatorWrap',
    triggerId: 'upCreatorTrigger',
    panelId: 'upCreatorPanel',
    labelId: 'upCreatorLabel',
    listId: 'upCreatorList',
    searchId: 'upCreatorSearch',
    clearId: 'upCreatorClear',
    prefix: '',
    getOptions: function () { return USERS; },
    getValue: function () { return state.upload.creator; },
    onChange: function (v) {
      state.upload.creator = v || '';
      if (v) {
        var item = $('upCreatorItem');
        if (item) item.classList.remove('is-error');
      }
    }
  });

  var detailCreatorSelect = bindSearchSelect({
    wrapId: 'detailCreatorWrap',
    triggerId: 'detailCreatorTrigger',
    panelId: 'detailCreatorPanel',
    labelId: 'detailCreatorLabel',
    listId: 'detailCreatorList',
    searchId: 'detailCreatorSearch',
    clearId: 'detailCreatorClear',
    prefix: '',
    getOptions: function () { return USERS; },
    getValue: function () { return state.detail.creator; },
    onChange: function (v) {
      state.detail.creator = v || '';
      if (v) {
        var item = $('detailCreatorItem');
        if (item) item.classList.remove('is-error');
      }
    }
  });

  var upTagSelect = bindCascadeMultiSelect({
    wrapId: 'upTagWrap',
    triggerId: 'upTagTrigger',
    panelId: 'upTagPanel',
    labelId: 'upTagLabel',
    groupListId: 'upTagGroupList',
    childListId: 'upTagChildList',
    selectedId: 'upTagSelected',
    searchId: 'upTagSearch',
    countId: 'upTagCount',
    selectAllId: 'upTagSelectAll',
    clearAllId: 'upTagClearAll',
    clearId: 'upTagClear',
    prefix: '',
    tree: FORM_TAG_TREE,
    getSelected: function () { return withoutSystemTags(state.upload.tags); },
    setSelected: function (arr) { state.upload.tags = withoutSystemTags(arr); }
  });

  var detailTagSelect = bindCascadeMultiSelect({
    wrapId: 'detailTagWrap',
    triggerId: 'detailTagTrigger',
    panelId: 'detailTagPanel',
    labelId: 'detailTagLabel',
    groupListId: 'detailTagGroupList',
    childListId: 'detailTagChildList',
    selectedId: 'detailTagSelected',
    searchId: 'detailTagSearch',
    countId: 'detailTagCount',
    selectAllId: 'detailTagSelectAll',
    clearAllId: 'detailTagClearAll',
    clearId: 'detailTagClear',
    prefix: '',
    tree: FORM_TAG_TREE,
    getSelected: function () { return withoutSystemTags(state.detail.tags); },
    setSelected: function (arr) { state.detail.tags = keepSystemTags(arr, state.detail.tags); }
  });

  var pushChannelSelect = UI.bindSingleSelect({
    wrapId: 'pushChannelWrap',
    triggerId: 'pushChannelTrigger',
    panelId: 'pushChannelPanel',
    labelId: 'pushChannelLabel',
    prefix: '渠道：',
    getValue: function () { return state.pushChannel.channel || DETAIL_CHANNEL_DEFAULT; },
    onChange: function (v) {
      state.pushChannel.channel = normalizeDetailChannel(v);
      state.pushChannel.accounts = buildPushAccountPool(state.pushChannel.channel);
      state.pushChannel.selectedIds = {};
      state.pushChannel.checkedAvail = {};
      state.pushChannel.checkedSelected = {};
      renderPushTransfer();
    }
  });

  var detailPushChannelSelect = UI.bindSingleSelect({
    wrapId: 'detailPushChannelWrap',
    triggerId: 'detailPushChannelTrigger',
    panelId: 'detailPushChannelPanel',
    labelId: 'detailPushChannelLabel',
    prefix: '渠道：',
    getValue: function () { return state.detail.push.draftChannel || DETAIL_CHANNEL_DEFAULT; },
    onChange: function (v) {
      state.detail.push.draftChannel = normalizeDetailChannel(v);
    }
  });

  var detailAdsChannelSelect = UI.bindSingleSelect({
    wrapId: 'detailAdsChannelWrap',
    triggerId: 'detailAdsChannelTrigger',
    panelId: 'detailAdsChannelPanel',
    labelId: 'detailAdsChannelLabel',
    prefix: '渠道：',
    getValue: function () { return state.detail.ads.draftChannel || DETAIL_CHANNEL_DEFAULT; },
    onChange: function (v) {
      state.detail.ads.draftChannel = normalizeDetailChannel(v);
    }
  });

  var detailRejectChannelSelect = UI.bindSingleSelect({
    wrapId: 'detailRejectChannelWrap',
    triggerId: 'detailRejectChannelTrigger',
    panelId: 'detailRejectChannelPanel',
    labelId: 'detailRejectChannelLabel',
    prefix: '渠道：',
    getValue: function () { return state.detail.reject.draftChannel || DETAIL_CHANNEL_DEFAULT; },
    onChange: function (v) {
      state.detail.reject.draftChannel = normalizeDetailChannel(v);
    }
  });

  var detailPushStatusSelect = UI.bindSingleSelect({
    wrapId: 'detailPushStatusWrap',
    triggerId: 'detailPushStatusTrigger',
    panelId: 'detailPushStatusPanel',
    labelId: 'detailPushStatusLabel',
    clearId: 'detailPushStatusClear',
    prefix: '推送状态：',
    getValue: function () { return state.detail.push.draftStatus; },
    onChange: function (v) { state.detail.push.draftStatus = v || ''; }
  });

  var detailAdsStatusSelect = UI.bindSingleSelect({
    wrapId: 'detailAdsStatusWrap',
    triggerId: 'detailAdsStatusTrigger',
    panelId: 'detailAdsStatusPanel',
    labelId: 'detailAdsStatusLabel',
    clearId: 'detailAdsStatusClear',
    prefix: '广告状态：',
    getValue: function () { return state.detail.ads.draftStatus; },
    onChange: function (v) { state.detail.ads.draftStatus = v || ''; }
  });

  if (UI.bindInputClearable) {
    UI.bindInputClearable({ wrapId: 'detailPushKwWrap', clearId: 'detailPushKwClear', inputId: 'detailPushKw' });
    UI.bindInputClearable({ wrapId: 'detailAdsKwWrap', clearId: 'detailAdsKwClear', inputId: 'detailAdsKw' });
    UI.bindInputClearable({ wrapId: 'detailRejectKwWrap', clearId: 'detailRejectKwClear', inputId: 'detailRejectKw' });
  }

  var batchTagSelect = bindCascadeMultiSelect({
    wrapId: 'batchTagWrap',
    triggerId: 'batchTagTrigger',
    panelId: 'batchTagPanel',
    labelId: 'batchTagLabel',
    groupListId: 'batchTagGroupList',
    childListId: 'batchTagChildList',
    selectedId: 'batchTagSelected',
    searchId: 'batchTagSearch',
    countId: 'batchTagCount',
    selectAllId: 'batchTagSelectAll',
    clearAllId: 'batchTagClearAll',
    clearId: 'batchTagClear',
    prefix: '',
    tree: FORM_TAG_TREE,
    getSelected: function () { return withoutSystemTags(state.batchTags); },
    setSelected: function (arr) { state.batchTags = keepSystemTags(arr, state.batchTags); }
  });

  function resetBatchXmpErrors() {
    ['batchXmpTargetItem', 'batchXmpFolderNameItem'].forEach(function (id) {
      var el = $(id);
      if (el) el.classList.remove('is-error');
    });
  }

  function syncBatchXmpFolderMode() {
    var create = state.batchXmp.folderMode === '创建文件夹';
    var existing = $('batchXmpTargetItem');
    var createBlock = $('batchXmpCreateBlock');
    if (existing) existing.classList.toggle('is-hidden', create);
    if (createBlock) createBlock.classList.toggle('is-hidden', !create);
  }

  function syncBatchXmpMetaTags() {
    var input = $('batchXmpFolderNameInput');
    var tags = $('batchXmpFolderNameTags');
    if (!input || !tags) return;
    var val = input.value || '';
    tags.querySelectorAll('.meta-tag').forEach(function (btn) {
      var token = btn.getAttribute('data-token') || '';
      var repeat = btn.getAttribute('data-repeat') === '1';
      btn.classList.toggle('is-used', !repeat && val.indexOf(token) !== -1);
    });
  }

  function insertBatchXmpToken(token, repeatable) {
    var input = $('batchXmpFolderNameInput');
    if (!input) return;
    var val = input.value || '';
    if (!repeatable && val.indexOf(token) !== -1) return;
    var start = input.selectionStart != null ? input.selectionStart : val.length;
    var end = input.selectionEnd != null ? input.selectionEnd : val.length;
    input.value = val.slice(0, start) + token + val.slice(end);
    var pos = start + token.length;
    input.focus();
    if (input.setSelectionRange) input.setSelectionRange(pos, pos);
    state.batchXmp.folderName = input.value;
    if ($('batchXmpFolderNameItem')) $('batchXmpFolderNameItem').classList.remove('is-error');
    syncBatchXmpMetaTags();
  }

  function buildPushAccountPool(channel) {
    var ch = normalizeDetailChannel(channel);
    return Array.from({ length: 20 }, function (_, i) {
      var name = mockAccountName(i + ch.length * 17);
      var id = mockAccountId(i + ch.length * 17);
      return { id: id, name: name, channel: ch };
    });
  }

  function parseMultiLineKw(raw) {
    return String(raw || '')
      .split(/[\n\r,，;；\s]+/)
      .map(function (s) { return s.trim().toLowerCase(); })
      .filter(Boolean);
  }

  function matchPushAccountKw(account, rawKw) {
    var tokens = parseMultiLineKw(rawKw);
    if (!tokens.length) return true;
    var name = String(account.name || '').toLowerCase();
    var id = String(account.id || '').toLowerCase();
    return tokens.some(function (t) {
      return name.indexOf(t) !== -1 || id.indexOf(t) !== -1;
    });
  }

  function getPushAvailAccounts() {
    var selected = state.pushChannel.selectedIds || {};
    return (state.pushChannel.accounts || []).filter(function (a) {
      if (selected[a.id]) return false;
      return matchPushAccountKw(a, state.pushChannel.availKw);
    });
  }

  function getPushSelectedAccounts() {
    var selected = state.pushChannel.selectedIds || {};
    return (state.pushChannel.accounts || []).filter(function (a) {
      if (!selected[a.id]) return false;
      return matchPushAccountKw(a, state.pushChannel.selectedKw);
    });
  }

  function syncPushTransferChecks(side) {
    var isAvail = side === 'avail';
    var list = isAvail ? getPushAvailAccounts() : getPushSelectedAccounts();
    var map = isAvail ? state.pushChannel.checkedAvail : state.pushChannel.checkedSelected;
    var checkAll = $(isAvail ? 'pushAvailCheckAll' : 'pushSelectedCheckAll');
    var moveBtn = $(isAvail ? 'pushMoveToSelected' : 'pushMoveToAvail');
    var checked = list.filter(function (a) { return map[a.id]; });
    if (checkAll) {
      checkAll.checked = list.length > 0 && checked.length === list.length;
      checkAll.indeterminate = checked.length > 0 && checked.length < list.length;
    }
    if (moveBtn) moveBtn.disabled = !checked.length;
  }

  function renderPushTransferSide(side) {
    var isAvail = side === 'avail';
    var list = isAvail ? getPushAvailAccounts() : getPushSelectedAccounts();
    var map = isAvail ? state.pushChannel.checkedAvail : state.pushChannel.checkedSelected;
    var body = $(isAvail ? 'pushAvailList' : 'pushSelectedList');
    var countEl = $(isAvail ? 'pushAvailCount' : 'pushSelectedCount');
    var totalPool = isAvail
      ? (state.pushChannel.accounts || []).filter(function (a) { return !state.pushChannel.selectedIds[a.id]; }).length
      : Object.keys(state.pushChannel.selectedIds || {}).length;
    if (countEl) countEl.textContent = checkedCountLabel(list, map, totalPool);
    if (!body) return;
    body.innerHTML = list.map(function (a) {
      var checked = map[a.id] ? ' checked' : '';
      var label = a.name + ' (' + a.id + ')';
      return (
        '<label class="transfer__item">' +
          '<input type="checkbox" data-push-account="' + escapeHtml(a.id) + '" data-push-side="' + side + '"' + checked + ' />' +
          '<span title="' + escapeHtml(label) + '">' + escapeHtml(label) + '</span>' +
        '</label>'
      );
    }).join('') || '<div class="transfer__empty">暂无数据</div>';
    syncPushTransferChecks(side);
  }

  function checkedCountLabel(visibleList, map, totalPool) {
    var checked = visibleList.filter(function (a) { return map[a.id]; }).length;
    return checked + ' / ' + totalPool;
  }

  function renderPushTransfer() {
    renderPushTransferSide('avail');
    renderPushTransferSide('selected');
  }

  function openBatchMoveModal(ids) {
    var materialIds = (ids || []).filter(Boolean);
    if (!materialIds.length) {
      UI.showToast('请先勾选素材');
      return;
    }
    state.batchMoveIds = materialIds;
    state.batchMoveTarget = '';
    if ($('batchMoveTargetItem')) $('batchMoveTargetItem').classList.remove('is-error');
    if ($('batchMoveTargetSearch')) $('batchMoveTargetSearch').value = '';
    if (batchMoveTargetApi && batchMoveTargetApi.syncLabel) batchMoveTargetApi.syncLabel();
    UI.openModal('batchMoveModal');
  }

  function submitBatchMove() {
    var target = state.batchMoveTarget;
    if (!target) {
      var item = $('batchMoveTargetItem');
      if (item) item.classList.add('is-error');
      return;
    }
    var n = 0;
    (state.batchMoveIds || []).forEach(function (id) {
      var row = findRow(id);
      if (!row) return;
      row.folderId = target;
      n += 1;
    });
    state.batchMoveIds = [];
    state.batchMoveTarget = '';
    UI.closeModal('batchMoveModal');
    renderAll();
    UI.showToast(n ? ('已移动 ' + n + ' 个素材') : '移动完成', 'success');
  }

  function openPushChannelModal(ids) {
    var materialIds = (ids || []).filter(Boolean);
    if (!materialIds.length) {
      UI.showToast('请先选择素材');
      return;
    }
    state.pushChannel.materialIds = materialIds;
    state.pushChannel.channel = DETAIL_CHANNEL_DEFAULT;
    state.pushChannel.accounts = buildPushAccountPool(DETAIL_CHANNEL_DEFAULT);
    state.pushChannel.selectedIds = {};
    state.pushChannel.checkedAvail = {};
    state.pushChannel.checkedSelected = {};
    state.pushChannel.availKw = '';
    state.pushChannel.selectedKw = '';
    if ($('pushAvailSearch')) $('pushAvailSearch').value = '';
    if ($('pushSelectedSearch')) $('pushSelectedSearch').value = '';
    if (pushChannelSelect && pushChannelSelect.syncLabel) {
      pushChannelSelect.syncLabel(DETAIL_CHANNEL_DEFAULT);
    }
    renderPushTransfer();
    UI.openModal('pushChannelModal');
  }

  function openBatchXmpModal(ids) {
    var pushable = getPushableXmpIds(ids);
    if (!pushable.length) {
      UI.showToast('没有可同步的素材');
      return;
    }
    state.batchXmp = {
      ids: pushable.slice(),
      filterDup: true,
      folderMode: '已有文件夹',
      targetFolder: '',
      parentFolder: '',
      folderName: DEFAULT_XMP_FOLDER_NAME
    };
    if (UI.setSegValue) {
      UI.setSegValue('batchXmpFolderSeg', '已有文件夹');
    }
    var sw = $('batchXmpDupSwitch');
    if (sw) {
      sw.classList.add('is-on');
      sw.setAttribute('aria-pressed', 'true');
    }
    if ($('batchXmpFolderNameInput')) $('batchXmpFolderNameInput').value = DEFAULT_XMP_FOLDER_NAME;
    resetBatchXmpErrors();
    syncBatchXmpFolderMode();
    syncBatchXmpMetaTags();
    if (batchXmpTargetSelect && batchXmpTargetSelect.syncLabel) batchXmpTargetSelect.syncLabel();
    if (batchXmpParentSelect && batchXmpParentSelect.syncLabel) batchXmpParentSelect.syncLabel();
    UI.openModal('batchXmpModal');
  }

  function ensureXmpFolder(path) {
    if (!path) return;
    if (XMP_FOLDERS.indexOf(path) === -1) XMP_FOLDERS.push(path);
    XMP_FOLDER_TREE = pathsToFolderTree(XMP_FOLDERS);
  }

  function validateBatchXmp() {
    resetBatchXmpErrors();
    var ok = true;
    if (state.batchXmp.folderMode === '已有文件夹' && !state.batchXmp.targetFolder) {
      if ($('batchXmpTargetItem')) $('batchXmpTargetItem').classList.add('is-error');
      ok = false;
    }
    if (state.batchXmp.folderMode === '创建文件夹') {
      var name = ($('batchXmpFolderNameInput') && $('batchXmpFolderNameInput').value || '').trim();
      state.batchXmp.folderName = name;
      if (!name) {
        if ($('batchXmpFolderNameItem')) $('batchXmpFolderNameItem').classList.add('is-error');
        ok = false;
      }
    }
    return ok;
  }

  UI.bindSeg('batchXmpFolderSeg', function (v) {
    state.batchXmp.folderMode = v;
    syncBatchXmpFolderMode();
  });

  if ($('batchXmpDupSwitch')) {
    $('batchXmpDupSwitch').addEventListener('click', function () {
      var on = !this.classList.contains('is-on');
      this.classList.toggle('is-on', on);
      this.setAttribute('aria-pressed', on ? 'true' : 'false');
      state.batchXmp.filterDup = on;
    });
  }

  if ($('batchXmpFolderNameTags')) {
    $('batchXmpFolderNameTags').addEventListener('click', function (e) {
      var btn = e.target.closest('.meta-tag');
      if (!btn || btn.classList.contains('is-used')) return;
      insertBatchXmpToken(btn.getAttribute('data-token') || '', btn.getAttribute('data-repeat') === '1');
    });
  }

  if ($('batchXmpFolderNameInput')) {
    $('batchXmpFolderNameInput').addEventListener('input', function () {
      state.batchXmp.folderName = this.value || '';
      if ((this.value || '').trim() && $('batchXmpFolderNameItem')) {
        $('batchXmpFolderNameItem').classList.remove('is-error');
      }
      syncBatchXmpMetaTags();
    });
  }

  if ($('batchXmpSubmit')) {
    $('batchXmpSubmit').addEventListener('click', function () {
      if (!validateBatchXmp()) return;
      var ids = (state.batchXmp.ids || []).slice();
      if (state.batchXmp.folderMode === '创建文件夹') {
        var created = state.batchXmp.parentFolder
          ? state.batchXmp.parentFolder + '/' + state.batchXmp.folderName
          : state.batchXmp.folderName;
        ensureXmpFolder(created);
      }
      state.batchXmp.ids = [];
      UI.closeModal('batchXmpModal');
      pushRows(ids);
    });
  }

  if (UI.bindFormHelp) UI.bindFormHelp($('batchXmpModal'));

  function openBatchTagModal(ids) {
    state.batchTagIds = ids.slice();
    state.batchTags = [];
    if (batchTagSelect && batchTagSelect.render) batchTagSelect.render();
    else if ($('batchTagLabel')) {
      $('batchTagLabel').innerHTML = '<span class="muted">请选择标签</span>';
      if ($('batchTagWrap')) $('batchTagWrap').classList.remove('has-value');
    }
    UI.openModal('batchTagModal');
  }

  if ($('batchTagSubmit')) {
    $('batchTagSubmit').addEventListener('click', function () {
      var ids = state.batchTagIds || [];
      var tags = withoutSystemTags(state.batchTags);
      ids.forEach(function (id) {
        var row = findRow(id);
        if (row) row.tags = keepSystemTags(tags, row.tags);
      });
      state.batchTagIds = [];
      state.batchTags = [];
      UI.closeModal('batchTagModal');
      renderAll();
      UI.showToast('修改标签成功', 'success');
    });
  }

  if (UI.bindFormHelp) UI.bindFormHelp($('uploadDrawer'));

  if ($('detailDrawerClose')) {
    $('detailDrawerClose').addEventListener('click', closeDetailDrawer);
  }
  if ($('detailDrawerCancel')) {
    $('detailDrawerCancel').addEventListener('click', closeDetailDrawer);
  }
  if ($('detailSubmit')) {
    $('detailSubmit').addEventListener('click', submitDetail);
  }
  if ($('detailName')) {
    $('detailName').addEventListener('input', function () {
      var v = ($('detailName').value || '').trim();
      if (v && $('detailNameItem')) $('detailNameItem').classList.remove('is-error');
    });
  }

  if ($('detailMainTabs')) {
    $('detailMainTabs').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-detail-tab]');
      if (!btn || !$('detailMainTabs').contains(btn)) return;
      setDetailTab(btn.getAttribute('data-detail-tab'));
    });
  }

  function bindPushSearch(inputId, key) {
    var el = $(inputId);
    if (!el) return;
    /* 单行框：粘贴多行会被浏览器转为空格，parseMultiLineKw 按空白拆分过滤 */
    el.addEventListener('input', function () {
      state.pushChannel[key] = el.value || '';
      renderPushTransfer();
    });
  }
  bindPushSearch('pushAvailSearch', 'availKw');
  bindPushSearch('pushSelectedSearch', 'selectedKw');

  if ($('pushAccountTransfer')) {
    $('pushAccountTransfer').addEventListener('change', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.id === 'pushAvailCheckAll' || t.id === 'pushSelectedCheckAll') {
        var isAvail = t.id === 'pushAvailCheckAll';
        var list = isAvail ? getPushAvailAccounts() : getPushSelectedAccounts();
        var map = isAvail ? state.pushChannel.checkedAvail : state.pushChannel.checkedSelected;
        list.forEach(function (a) { map[a.id] = !!t.checked; });
        renderPushTransferSide(isAvail ? 'avail' : 'selected');
        return;
      }
      var id = t.getAttribute('data-push-account');
      var side = t.getAttribute('data-push-side');
      if (!id || !side) return;
      if (side === 'avail') state.pushChannel.checkedAvail[id] = !!t.checked;
      else state.pushChannel.checkedSelected[id] = !!t.checked;
      syncPushTransferChecks(side);
    });
  }

  if ($('pushMoveToSelected')) {
    $('pushMoveToSelected').addEventListener('click', function () {
      Object.keys(state.pushChannel.checkedAvail).forEach(function (id) {
        if (!state.pushChannel.checkedAvail[id]) return;
        state.pushChannel.selectedIds[id] = true;
        delete state.pushChannel.checkedAvail[id];
      });
      renderPushTransfer();
    });
  }
  if ($('pushMoveToAvail')) {
    $('pushMoveToAvail').addEventListener('click', function () {
      Object.keys(state.pushChannel.checkedSelected).forEach(function (id) {
        if (!state.pushChannel.checkedSelected[id]) return;
        delete state.pushChannel.selectedIds[id];
        delete state.pushChannel.checkedSelected[id];
      });
      renderPushTransfer();
    });
  }
  if ($('pushChannelSubmit')) {
    $('pushChannelSubmit').addEventListener('click', function () {
      var n = Object.keys(state.pushChannel.selectedIds || {}).length;
      if (!n) {
        UI.showToast('请选择广告账户');
        return;
      }
      UI.closeModal('pushChannelModal');
      UI.showToast('已提交推送：' + n + ' 个账户', 'success');
    });
  }

  if ($('detailPushQuery')) {
    $('detailPushQuery').addEventListener('click', function () {
      state.detail.push.channel = normalizeDetailChannel(state.detail.push.draftChannel);
      state.detail.push.kw = (($('detailPushKw') && $('detailPushKw').value) || '').trim();
      state.detail.push.status = state.detail.push.draftStatus || '';
      state.detail.push.page = 1;
      state.detail.push.selected = {};
      renderDetailPush();
    });
  }

  if ($('detailAdsQuery')) {
    $('detailAdsQuery').addEventListener('click', function () {
      state.detail.ads.channel = normalizeDetailChannel(state.detail.ads.draftChannel);
      state.detail.ads.kw = (($('detailAdsKw') && $('detailAdsKw').value) || '').trim();
      state.detail.ads.status = state.detail.ads.draftStatus || '';
      state.detail.ads.page = 1;
      renderDetailAds();
    });
  }

  if ($('detailRejectQuery')) {
    $('detailRejectQuery').addEventListener('click', function () {
      state.detail.reject.channel = normalizeDetailChannel(state.detail.reject.draftChannel);
      state.detail.reject.kw = (($('detailRejectKw') && $('detailRejectKw').value) || '').trim();
      state.detail.reject.page = 1;
      renderDetailReject();
    });
  }

  if ($('detailPushBatchRetry')) {
    $('detailPushBatchRetry').addEventListener('click', function () {
      var ids = Object.keys(state.detail.push.selected).filter(function (id) {
        return state.detail.push.selected[id];
      });
      retryPushRecords(ids);
    });
  }

  if ($('detailPanelPush')) {
    $('detailPanelPush').addEventListener('change', function (e) {
      if (e.target && e.target.id === 'detailPushCheckAll') {
        var on = e.target.checked;
        getDetailPushFiltered().slice(
          (state.detail.push.page - 1) * state.detail.push.pageSize,
          state.detail.push.page * state.detail.push.pageSize
        ).forEach(function (r) {
          state.detail.push.selected[r.id] = on;
        });
        renderDetailPush();
        return;
      }
      var box = e.target.closest('[data-push-check]');
      if (!box) return;
      state.detail.push.selected[box.getAttribute('data-push-check')] = box.checked;
      syncDetailPushBatchBtn();
      var pageRows = getDetailPushFiltered().slice(
        (state.detail.push.page - 1) * state.detail.push.pageSize,
        state.detail.push.page * state.detail.push.pageSize
      );
      var checkedCount = pageRows.filter(function (r) { return state.detail.push.selected[r.id]; }).length;
      var checkAll = $('detailPushCheckAll');
      if (checkAll) {
        checkAll.checked = pageRows.length > 0 && checkedCount === pageRows.length;
        checkAll.indeterminate = checkedCount > 0 && checkedCount < pageRows.length;
      }
    });

    $('detailPanelPush').addEventListener('click', function (e) {
      var copyBtn = e.target.closest('[data-copy]');
      if (copyBtn && $('detailPanelPush').contains(copyBtn)) {
        e.preventDefault();
        e.stopPropagation();
        UI.copyText(copyBtn.getAttribute('data-copy'));
        return;
      }
      var retry = e.target.closest('[data-push-retry]');
      if (retry) {
        e.preventDefault();
        retryPushRecords([retry.getAttribute('data-push-retry')]);
      }
    });
  }

  if ($('detailPanelAds')) {
    $('detailPanelAds').addEventListener('click', function (e) {
      var copyBtn = e.target.closest('[data-copy]');
      if (!copyBtn || !$('detailPanelAds').contains(copyBtn)) return;
      e.preventDefault();
      e.stopPropagation();
      UI.copyText(copyBtn.getAttribute('data-copy'));
    });
  }

  function ensureRejectReasonTip() {
    var tip = document.getElementById('rejectReasonTip');
    if (tip) return tip;
    tip = document.createElement('div');
    tip.id = 'rejectReasonTip';
    tip.className = 'reject-reason-tip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
    return tip;
  }

  function hideRejectReasonTip() {
    var tip = document.getElementById('rejectReasonTip');
    if (tip) tip.classList.remove('is-open');
  }

  function showRejectReasonTip(anchor) {
    var msg = (anchor && (anchor.getAttribute('data-tip') || anchor.textContent)) || '';
    if (!msg) return;
    var tip = ensureRejectReasonTip();
    tip.textContent = msg;
    tip.classList.add('is-open');
    tip.style.left = '0px';
    tip.style.top = '0px';
    function place() {
      var a = anchor.getBoundingClientRect();
      var t = tip.getBoundingClientRect();
      if (!t.width || !t.height) return;
      var gap = 8;
      var pad = 8;
      var left = a.left + a.width / 2 - t.width / 2;
      left = Math.max(pad, Math.min(left, window.innerWidth - t.width - pad));
      var top = a.top - t.height - gap;
      if (top < pad) top = a.bottom + gap;
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
    }
    place();
    requestAnimationFrame(place);
  }

  if ($('detailPanelReject')) {
    $('detailPanelReject').addEventListener('click', function (e) {
      var copyBtn = e.target.closest('[data-copy]');
      if (!copyBtn || !$('detailPanelReject').contains(copyBtn)) return;
      e.preventDefault();
      e.stopPropagation();
      UI.copyText(copyBtn.getAttribute('data-copy'));
    });
    $('detailPanelReject').addEventListener('mouseover', function (e) {
      var el = e.target.closest('.reject-reason');
      if (!el || !$('detailPanelReject').contains(el)) return;
      if (e.relatedTarget && el.contains(e.relatedTarget)) return;
      showRejectReasonTip(el);
    });
    $('detailPanelReject').addEventListener('mouseout', function (e) {
      var el = e.target.closest('.reject-reason');
      if (!el) return;
      if (e.relatedTarget && el.contains(e.relatedTarget)) return;
      hideRejectReasonTip();
    });
    var rejectTableWrap = $('detailPanelReject').querySelector('.detail-record-table-wrap');
    if (rejectTableWrap) {
      rejectTableWrap.addEventListener('scroll', hideRejectReasonTip);
    }
  }

  function syncUpBatchBtn() {
    var selected = getSelectedUploadItems();
    var retryBtn = $('upBatchRetryBtn');
    var delBtn = $('upBatchDeleteBtn');
    if (retryBtn) retryBtn.disabled = !selected.some(canRetryItem);
    if (delBtn) delBtn.disabled = !selected.some(canDeleteItem);
  }

  function syncUpCount() {
    var el = $('upFileCount');
    if (el) el.textContent = '已添加：' + state.upload.items.length + '/' + UPLOAD_MAX;
  }

  function probeLocalMeta(item) {
    var file = item.file;
    if (!file) return;
    var url = URL.createObjectURL(file);
    var isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].indexOf(item.format) !== -1;
    function done(w, h) {
      try { URL.revokeObjectURL(url); } catch (err) { /* ignore */ }
      if (!state.upload.items.some(function (x) { return x.uid === item.uid; })) return;
      if (w > 0 && h > 0) item.sizeDim = w + 'x' + h;
      if (state.upload.uploading) return;
      renderUploadTable();
    }
    if (isImage) {
      var img = new Image();
      img.onload = function () { done(img.naturalWidth, img.naturalHeight); };
      img.onerror = function () { try { URL.revokeObjectURL(url); } catch (err) { /* ignore */ } };
      img.src = url;
      return;
    }
    var video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = function () { done(video.videoWidth || 0, video.videoHeight || 0); };
    video.onerror = function () { try { URL.revokeObjectURL(url); } catch (err) { /* ignore */ } };
    video.src = url;
  }

  function renderUploadTable() {
    var body = $('upFileBody');
    if (!body) return;
    var items = state.upload.items;
    body.innerHTML = items.map(function (item) {
      var checked = state.upload.selected[item.uid] ? ' checked' : '';
      var checkDisabled = isUploadBusyItem(item) ? ' disabled' : '';
      var displayName = stripExt(item.name);
      var playIcon = item.mediaType === '视频' ? PLAY_ICON : '';
      return (
        '<tr data-uid="' + item.uid + '">' +
          '<td class="col-check"><span class="cell-check"><input type="checkbox" data-up-check="' + item.uid + '"' + checked + checkDisabled + ' /></span></td>' +
          '<td class="col-material"><div class="material-cell">' +
            '<button class="thumb" type="button" data-up-preview="' + item.uid + '" aria-label="预览">' +
              '<span class="thumb__preview" aria-hidden="true"></span>' + playIcon +
            '</button>' +
            '<div class="material-cell__meta">' +
              '<span class="material-cell__name" title="' + escapeHtml(displayName) + '">' + escapeHtml(displayName) + '</span>' +
            '</div>' +
          '</div></td>' +
          '<td>' + escapeHtml(item.sizeText) + '</td>' +
          '<td>' + escapeHtml(item.format || '—') + '</td>' +
          '<td class="col-up-progress" data-col="progress">' + uploadProgressHtml(item) + '</td>' +
          '<td class="col-action">' + uploadActionHtml(item) + '</td>' +
        '</tr>'
      );
    }).join('');

    var checkAll = $('upCheckAll');
    if (checkAll) {
      var operable = items.filter(function (it) { return !isUploadBusyItem(it); });
      var allChecked = operable.length > 0 && operable.every(function (it) { return state.upload.selected[it.uid]; });
      checkAll.checked = allChecked;
      checkAll.indeterminate = !allChecked && operable.some(function (it) { return state.upload.selected[it.uid]; });
      checkAll.disabled = operable.length === 0;
    }
    syncUpCount();
    syncUpBatchBtn();
    syncUploadBusy();
  }

  function addUploadFiles(fileList) {
    if (uploadProgressTimer) return;
    var arr = Array.prototype.slice.call(fileList || []);
    if (!arr.length) return;
    var remain = UPLOAD_MAX - state.upload.items.length;
    if (remain <= 0) {
      UI.showToast('单次最多上传 ' + UPLOAD_MAX + ' 个文件');
      return;
    }
    if (arr.length > remain) {
      UI.showToast('超出上限，仅添加前 ' + remain + ' 个');
      arr = arr.slice(0, remain);
    }
    arr.forEach(function (file) {
      var ext = fileExt(file.name);
      var isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].indexOf(ext) !== -1;
      var idx = state.upload.items.length;
      var item = {
        uid: uploadUid++,
        name: file.name,
        displayName: stripExt(file.name),
        format: ext || '—',
        mediaType: isImage ? '图片' : '视频',
        size: file.size || 0,
        sizeText: formatFileSize(file.size),
        sizeDim: '—',
        file: file,
        progress: 0,
        status: 'uploading',
        failAt: (idx % 5 === 4) ? (35 + (idx % 4) * 12) : null,
        progressSpeed: 6 + ((idx * 7) % 11)
      };
      state.upload.items.push(item);
      probeLocalMeta(item);
    });
    renderUploadTable();
    ensureUploadProgressTimer();
    syncUploadBusy();
  }

  function discardUploadAndClose() {
    stopUploadProgressTimer();
    state.upload.items = [];
    state.upload.selected = {};
    syncUploadBusy();
    if (UI.closeModal) UI.closeModal('abortUploadModal');
    UI.closeDrawer('uploadDrawer');
  }

  function closeUploadDrawer(opts) {
    opts = opts || {};
    if (opts.force) {
      discardUploadAndClose();
      return;
    }
    if (!state.upload.items.length) {
      stopUploadProgressTimer();
      UI.closeDrawer('uploadDrawer');
      return;
    }
    var n = state.upload.items.length;
    var title = $('abortUploadTitle');
    var text = $('abortUploadText');
    if (title) title.textContent = '终止上传';
    if (text) text.textContent = '有' + n + '个文件尚未入库，确认终止任务并删除上传文件吗？';
    UI.openModal('abortUploadModal');
  }

  function openUpload() {
    stopUploadProgressTimer();
    state.upload.folderId = state.folderId || SYSTEM_FOLDER.id;
    state.upload.creator = CURRENT_USER;
    state.upload.tags = [];
    state.upload.deriveDup = true;
    state.upload.items = [];
    state.upload.selected = {};
    syncUploadBusy();
    if ($('upDeriveDup')) $('upDeriveDup').checked = true;
    if ($('upFileInput')) $('upFileInput').value = '';
    ['upFolderItem', 'upCreatorItem'].forEach(function (id) {
      var el = $(id);
      if (el) el.classList.remove('is-error');
    });
    if (upFolderSelect && upFolderSelect.syncLabel) upFolderSelect.syncLabel();
    if (upCreatorSelect && upCreatorSelect.syncLabel) upCreatorSelect.syncLabel();
    if (upTagSelect && upTagSelect.render) upTagSelect.render();
    else if ($('upTagLabel')) {
      $('upTagLabel').innerHTML = '<span class="muted">请选择标签</span>';
      if ($('upTagWrap')) $('upTagWrap').classList.remove('has-value');
    }
    renderUploadTable();
    UI.openDrawer('uploadDrawer');
  }

  $('uploadBtn').addEventListener('click', openUpload);
  $('uploadDrawerClose').addEventListener('click', closeUploadDrawer);
  $('uploadDrawerCancel').addEventListener('click', closeUploadDrawer);
  if ($('abortUploadOk')) {
    $('abortUploadOk').addEventListener('click', discardUploadAndClose);
  }
  if ($('submitUploadOk')) {
    $('submitUploadOk').addEventListener('click', commitUploadedItems);
  }

  (function bindUploadZone() {
    var zone = $('upFileZone');
    var input = $('upFileInput');
    if (!zone || !input) return;
    input.addEventListener('change', function () {
      addUploadFiles(input.files);
      input.value = '';
    });
    zone.addEventListener('dragover', function (e) {
      e.preventDefault();
      zone.classList.add('is-dragover');
    });
    zone.addEventListener('dragleave', function () { zone.classList.remove('is-dragover'); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.classList.remove('is-dragover');
      addUploadFiles(e.dataTransfer && e.dataTransfer.files);
    });
  })();

  if ($('upDeriveDup')) {
    $('upDeriveDup').addEventListener('change', function () {
      state.upload.deriveDup = !!$('upDeriveDup').checked;
    });
  }

  if ($('upCheckAll')) {
    $('upCheckAll').addEventListener('change', function () {
      var on = $('upCheckAll').checked;
      state.upload.items.forEach(function (it) {
        if (isUploadBusyItem(it)) return;
        state.upload.selected[it.uid] = on;
      });
      renderUploadTable();
    });
  }

  if ($('upFileBody')) {
    $('upFileBody').addEventListener('change', function (e) {
      var box = e.target.closest('[data-up-check]');
      if (!box) return;
      var uid = Number(box.getAttribute('data-up-check'));
      state.upload.selected[uid] = box.checked;
      syncUpBatchBtn();
      var checkAll = $('upCheckAll');
      if (checkAll) {
        var items = state.upload.items.filter(function (it) { return !isUploadBusyItem(it); });
        var allChecked = items.length > 0 && items.every(function (it) { return state.upload.selected[it.uid]; });
        checkAll.checked = allChecked;
        checkAll.indeterminate = !allChecked && items.some(function (it) { return state.upload.selected[it.uid]; });
      }
    });
    $('upFileBody').addEventListener('mouseover', function (e) {
      var btn = e.target.closest('[data-up-preview]');
      if (!btn) return;
      var uid = Number(btn.getAttribute('data-up-preview'));
      var item = state.upload.items.find(function (it) { return it.uid === uid; });
      if (!item) return;
      showPreview(stripExt(item.name), btn);
    });
    $('upFileBody').addEventListener('mouseout', function (e) {
      if (e.target.closest('[data-up-preview]')) hidePreview();
    });
    $('upFileBody').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-up-act]');
      if (!btn || btn.disabled) return;
      var uid = Number(btn.getAttribute('data-uid'));
      var act = btn.getAttribute('data-up-act');
      var idx = state.upload.items.findIndex(function (it) { return it.uid === uid; });
      if (idx < 0) return;
      var item = state.upload.items[idx];
      if (act === 'retry') {
        retryUploadItems([item]);
        return;
      }
      if (act === 'delete') {
        if (!canDeleteItem(item)) return;
        hidePreview();
        state.upload.items.splice(idx, 1);
        delete state.upload.selected[uid];
        renderUploadTable();
      }
    });
  }

  if ($('upBatchRetryBtn')) {
    $('upBatchRetryBtn').addEventListener('click', function () {
      var targets = getSelectedUploadItems().filter(canRetryItem);
      if (!targets.length) {
        UI.showToast('请先勾选上传失败的素材');
        return;
      }
      retryUploadItems(targets);
    });
  }

  if ($('upBatchDeleteBtn')) {
    $('upBatchDeleteBtn').addEventListener('click', function () {
      var targets = getSelectedUploadItems().filter(canDeleteItem);
      if (!targets.length) {
        UI.showToast('请先勾选要删除的素材');
        return;
      }
      var uids = targets.map(function (it) { return it.uid; });
      state.upload.items = state.upload.items.filter(function (it) { return uids.indexOf(it.uid) === -1; });
      uids.forEach(function (u) { delete state.upload.selected[u]; });
      renderUploadTable();
    });
  }

  $('upSubmit').addEventListener('click', function () {
    if (hasUploadingItems()) return;
    var ok = true;
    if (!state.upload.folderId) {
      if ($('upFolderItem')) $('upFolderItem').classList.add('is-error');
      ok = false;
    }
    if (!state.upload.creator) {
      if ($('upCreatorItem')) $('upCreatorItem').classList.add('is-error');
      ok = false;
    }
    if (!state.upload.items.length) {
      UI.showToast('请先添加素材文件');
      ok = false;
    }
    if (!ok) return;
    openSubmitUploadConfirm();
  });

  window.addEventListener('beforeunload', function (e) {
    if (!hasUploadingItems()) return;
    e.preventDefault();
    e.returnValue = '';
  });

  /* 去掉 HTML 里无效的全部时间快捷，避免落到近7天歧义 */
  var allBtn = document.querySelector('#dateShortcuts [data-shortcut="all"]');
  if (allBtn) allBtn.remove();

  if (UI.bindThSort) {
    sortApi = UI.bindThSort({
      root: '#libraryTable',
      getState: function () { return { specs: state.sortSpecs }; },
      setState: function (next) {
        var specs = (next && next.specs) || [];
        state.sortSpecs = specs.length ? [specs[specs.length - 1]] : [];
      },
      onChange: function () {
        state.page = 1;
        renderAll();
      }
    });
  }

  applyFilters();
})();
