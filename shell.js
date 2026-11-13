/* 投放系统 · 顶栏 / 侧栏
 * 目录来自 menu-data.js。导航进顶栏；目录与页面进当前模块侧栏；按钮只留在菜单管理。
 */
(function (global) {
  'use strict';

  var COLLAPSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h16"/><path d="M15 9l-3 3 3 3"/></svg>';
  var ARROW_ICON = '<svg class="menu-group__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5L6 7.5L9 4.5"/></svg>';
  var CHEVRON = '<svg class="chevron" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>';
  var TASK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z"/><path d="M3 12.5l9 4.5 9-4.5"/><path d="M3 17l9 4.5 9-4.5"/></svg>';
  var HELP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>';
  var headerBound = false;

  var pageKey = null;
  var keepCollapsed = false;
  var savedGroupCollapsed = null;

  function rows() {
    return (global.DeliveryMenu && global.DeliveryMenu.rows) || [];
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function byId(id) {
    var key = String(id || '');
    var list = rows();
    for (var i = 0; i < list.length; i += 1) {
      if (String(list[i].id) === key) return list[i];
    }
    return null;
  }

  function childrenOf(id) {
    var key = String(id || '');
    return rows().filter(function (row) {
      return String(row.parentId || '') === key && row.status !== '禁用';
    });
  }

  function navs() {
    return rows().filter(function (row) {
      return row.type === 'nav' && row.status !== '禁用';
    });
  }

  function fileKeyFromLocation() {
    var file = (location.pathname.split('/').pop() || '').replace(/\.html$/i, '');
    if (!file || file === 'index') return 'home';
    return file;
  }

  function findEntry(key) {
    var list = rows();
    for (var i = 0; i < list.length; i += 1) {
      var row = list[i];
      if (row.path === key && (row.type === 'page' || row.type === 'nav')) return row;
    }
    return null;
  }

  function navOf(row) {
    var cur = row;
    var guard = 0;
    while (cur && guard < 24) {
      if (cur.type === 'nav') return cur;
      if (!cur.parentId) return null;
      cur = byId(cur.parentId);
      guard += 1;
    }
    return null;
  }

  function containsPage(nodeId, pageId) {
    if (!pageId) return false;
    var kids = childrenOf(nodeId);
    for (var i = 0; i < kids.length; i += 1) {
      if (String(kids[i].id) === String(pageId)) return true;
      if (kids[i].type === 'dir' && containsPage(kids[i].id, pageId)) return true;
    }
    return false;
  }

  function firstPageUnder(id) {
    var kids = childrenOf(id);
    for (var i = 0; i < kids.length; i += 1) {
      var kid = kids[i];
      if (kid.type === 'page') return kid;
      if (kid.type === 'dir') {
        var found = firstPageUnder(kid.id);
        if (found) return found;
      }
    }
    return null;
  }

  function pageHref(row) {
    if (!row) return '#';
    if (row.type === 'link') {
      return /^https?:\/\//i.test(row.path) ? row.path : '#';
    }
    if (row.type === 'nav') {
      var first = firstPageUnder(row.id);
      if (first) return encodeURI(first.path) + '.html';
    }
    if (row.type === 'page' || row.type === 'nav') return encodeURI(row.path) + '.html';
    return '#';
  }

  function currentFile() {
    return (location.pathname.split('/').pop() || 'index.html');
  }

  function samePage(href) {
    if (!href || href === '#') return false;
    var file = href.split('/').pop();
    return file === currentFile();
  }

  function arcoToIconify(componentName) {
    var name = String(componentName || '');
    var isFill = /Fill$/.test(name);
    var isColor = /Color$/.test(name);
    var bare = name.replace(/^Icon/, '').replace(/Fill$/, '').replace(/Color$/, '');
    var kebab = bare
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();
    if (isFill) return 'icon-park-solid:' + kebab;
    if (isColor) return 'icon-park:' + kebab;
    return 'icon-park-outline:' + kebab;
  }

  function iconMarkup(icon) {
    if (!icon) return '';
    var value = String(icon);
    var presets = global.DeliveryMenu && global.DeliveryMenu.icons;
    if (presets && presets[value]) {
      var preset = String(presets[value]);
      if (preset.indexOf('<svg') === 0) {
        return preset.replace('<svg ', '<svg class="menu-icon" ');
      }
      return '<img class="menu-icon" src="' + encodeURI(preset) + '" alt="" />';
    }
    if (value.indexOf('<svg') === 0) {
      return value.replace('<svg ', '<svg class="menu-icon" ');
    }
    if (value.indexOf('data:image/') === 0) {
      return '<img class="menu-icon" src="' + esc(value) + '" alt="" />';
    }
    if (value.indexOf('Icon') === 0) {
      return '<iconify-icon class="menu-icon" icon="' + esc(arcoToIconify(icon)) + '"></iconify-icon>';
    }
    return '';
  }

  function iconHtml(icon) {
    return iconMarkup(icon) || '<span class="menu-icon" aria-hidden="true"></span>';
  }

  function resolve(activeKey) {
    var key = activeKey || pageKey || fileKeyFromLocation();
    if (key === 'index') key = 'home';
    var row = findEntry(key);
    return {
      key: key,
      row: row,
      nav: row ? navOf(row) : null
    };
  }

  function renderHeader(page) {
    var activeId = page.nav ? String(page.nav.id) : '';
    var nav = navs().map(function (item) {
      var href = pageHref(item);
      if (samePage(href)) href = '#';
      var active = String(item.id) === activeId ? ' is-active' : '';
      return '<a href="' + href + '" class="header-nav__item' + active + '" data-menu-name="' + esc(item.name) + '">' + esc(item.name) + '</a>';
    }).join('');

    return (
      '<header class="header">' +
        '<div class="header-left">' +
          '<img class="logo" src="素材/logo.png" width="32" height="32" alt="Wonder Ads" />' +
          '<span class="brand-name">Wonder Ads</span>' +
        '</div>' +
        '<nav class="header-nav" aria-label="顶部导航">' + nav + '</nav>' +
        '<div class="header-right">' +
          '<a class="header-icon" href="#" data-header-link="task" data-tip="任务中心" aria-label="任务中心">' + TASK_ICON + '</a>' +
          '<a class="header-icon" href="#" data-header-link="help" data-tip="帮助中心" aria-label="帮助中心">' + HELP_ICON + '</a>' +
          '<span class="header-divider" aria-hidden="true"></span>' +
          '<div class="user-menu">' +
            '<button class="user-chip" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="userPanel" aria-label="当前用户">' +
              '<span class="user-avatar" aria-hidden="true"></span>' +
              '<span class="user-name">用户A</span>' +
              CHEVRON +
            '</button>' +
            '<div class="user-panel" id="userPanel" role="menu">' +
              '<div class="user-panel__profile">' +
                '<span class="user-avatar" aria-hidden="true"></span>' +
                '<div class="user-panel__meta">' +
                  '<div class="user-panel__name">用户A</div>' +
                  '<div class="user-panel__account">ac123456789101112130</div>' +
                '</div>' +
              '</div>' +
              '<button class="user-panel__logout" type="button" role="menuitem" data-logout>退出登录</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</header>'
    );
  }

  function isSidebarNode(row) {
    return row.type === 'dir' || row.type === 'page' || row.type === 'link';
  }

  function renderLeaf(item, activeId, isRoot) {
    var href = pageHref(item);
    if (samePage(href)) href = '#';
    var active = String(item.id) === String(activeId) ? ' is-active' : '';
    var root = isRoot ? ' menu-item--root' : '';
    return (
      '<a href="' + href + '" class="menu-item' + root + active + '" data-menu-name="' + esc(item.name) + '">' +
        iconHtml(item.icon) +
        '<span class="menu-item__text">' + esc(item.name) + '</span>' +
      '</a>'
    );
  }

  function renderGroup(group, activeId) {
    var collapsed;
    if (savedGroupCollapsed && Object.prototype.hasOwnProperty.call(savedGroupCollapsed, String(group.id))) {
      collapsed = savedGroupCollapsed[String(group.id)];
    } else {
      collapsed = !containsPage(group.id, activeId);
    }
    var kids = childrenOf(group.id).filter(isSidebarNode).map(function (item) {
      if (item.type === 'dir') return '<li>' + renderGroup(item, activeId) + '</li>';
      return '<li>' + renderLeaf(item, activeId, false) + '</li>';
    }).join('');
    return (
      '<div class="menu-group' + (collapsed ? ' is-collapsed' : '') + '" data-group data-id="' + esc(group.id) + '">' +
        '<button class="menu-group__title" type="button" data-group-toggle>' +
          iconHtml(group.icon) +
          '<span class="menu-group__title-text">' + esc(group.name) + '</span>' +
          ARROW_ICON +
        '</button>' +
        '<ul class="menu-children">' + kids + '</ul>' +
      '</div>'
    );
  }

  function renderSidebar(page) {
    if (!page.nav) return '';
    var activeId = page.row ? page.row.id : '';
    var items = childrenOf(page.nav.id).filter(isSidebarNode);
    if (!items.length) return '';
    var body = items.map(function (item) {
      if (item.type === 'dir') return renderGroup(item, activeId);
      return renderLeaf(item, activeId, true);
    }).join('');
    var collapsed = keepCollapsed ? ' is-collapsed' : '';
    var toggleTitle = keepCollapsed ? '展开菜单' : '折叠菜单';
    var toggleLabel = keepCollapsed ? '展开侧边栏' : '折叠侧边栏';
    return (
      '<aside class="sidebar' + collapsed + '" id="sidebar">' +
        '<nav class="sidebar-nav" aria-label="侧边栏导航">' + body + '</nav>' +
        '<div class="sidebar-footer">' +
          '<button class="sidebar-collapse-btn" id="sidebarToggle" type="button" title="' + toggleTitle + '" aria-label="' + toggleLabel + '">' +
            COLLAPSE_ICON +
          '</button>' +
        '</div>' +
      '</aside>'
    );
  }

  function captureState() {
    var sidebar = document.getElementById('sidebar');
    keepCollapsed = !!(sidebar && sidebar.classList.contains('is-collapsed'));
    var groups = document.querySelectorAll('#sidebar [data-group]');
    if (!groups.length) return;
    savedGroupCollapsed = {};
    groups.forEach(function (group) {
      var id = group.getAttribute('data-id');
      if (id) savedGroupCollapsed[id] = group.classList.contains('is-collapsed');
    });
  }

  function setUserOpen(open) {
    var menu = document.querySelector('.user-menu');
    var chip = menu && menu.querySelector('.user-chip');
    if (!menu || !chip) return;
    menu.classList.toggle('is-open', !!open);
    chip.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function bindHeader() {
    if (headerBound) return;
    headerBound = true;
    document.addEventListener('click', function (event) {
      var menu = document.querySelector('.user-menu');
      if (!menu) return;
      var link = event.target.closest('[data-header-link]');
      if (link && link.getAttribute('href') === '#') event.preventDefault();
      if (event.target.closest('.user-chip')) {
        event.preventDefault();
        setUserOpen(!menu.classList.contains('is-open'));
        return;
      }
      if (event.target.closest('[data-logout]')) {
        event.preventDefault();
        window.location.href = 'login.html';
        return;
      }
      if (!event.target.closest('.user-panel')) setUserOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setUserOpen(false);
    });
  }

  function afterMount() {
    bindHeader();
    if (global.ProductUI && global.ProductUI.bindSidebar && document.getElementById('sidebar')) {
      global.ProductUI.bindSidebar();
    }
  }

  function mount(activeKey) {
    if (activeKey) pageKey = activeKey;
    captureState();
    var page = resolve(pageKey);
    var root = document.getElementById('appShell') || document.querySelector('.app');
    var existingHeader = document.querySelector('header.header');
    var existingSidebar = document.getElementById('sidebar');
    var sideHtml = renderSidebar(page);

    if (root && !existingHeader) {
      var main = root.querySelector('[data-main]') || root.querySelector('main');
      var mainHtml = main ? main.outerHTML : '<main class="main"></main>';
      root.innerHTML = renderHeader(page) + '<div class="body">' + sideHtml + mainHtml + '</div>';
      afterMount();
      return;
    }

    if (existingHeader) existingHeader.outerHTML = renderHeader(page);
    if (existingSidebar) {
      if (sideHtml) existingSidebar.outerHTML = sideHtml;
      else existingSidebar.remove();
    } else if (sideHtml) {
      var body = document.querySelector('.body');
      var mainEl = body && body.querySelector('main');
      if (body && mainEl) mainEl.insertAdjacentHTML('beforebegin', sideHtml);
    }
    afterMount();
  }

  global.DeliveryShell = {
    mount: mount,
    refresh: function () { mount(pageKey); }
  };

  var bootScript = document.currentScript;
  var bootPage = bootScript && bootScript.getAttribute('data-page');
  if (bootPage) mount(bootPage);
})(window);
