/* 投放系统 · 菜单目录
 * 菜单名称重复时（如多个 TikTok）靠 parentId 挂到正确父级，上级菜单列仍显示名称。
 */
(function (global) {
  'use strict';

  function item(id, name, type, parentId, parent, path, perm) {
    return {
      id: String(id),
      name: name,
      type: type,
      parentId: parentId ? String(parentId) : '',
      parent: parent || '-',
      path: path,
      perm: perm,
      icon: '',
      status: '启用'
    };
  }

  function icon(body) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  }

  /* 侧栏首版图标。导航、按钮不进侧栏，不配图标。同平台在账户 / 资产 / 推广复用同一枚。 */
  var icons = {
    menu: icon('<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>'),
    shield: icon('<path d="M12 3l8 3v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3z"/>'),
    user: icon('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    users: icon('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    grid: icon('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>'),
    card: icon('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>'),
    apps: icon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
    phone: icon('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'),
    game: icon('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M8 10v4"/><path d="M15 11h.01M18 13h.01"/>'),
    image: icon('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
    layout: icon('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>'),
    tag: icon('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/>'),
    copy: icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>'),
    collect: icon('<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/>'),
    derive: icon('<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M21 3l-7 7"/><path d="M3 3l7 7"/><path d="M12 14v7"/><path d="M8 18h8"/>'),
    host: icon('<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>'),
    list: icon('<rect x="3" y="4" width="7" height="7" rx="1"/><path d="M13 6h8M13 9h5"/><rect x="3" y="13" width="7" height="7" rx="1"/><path d="M13 15h8M13 18h5"/>'),
    minis: icon('<rect x="3" y="4" width="8" height="14" rx="1.5"/><rect x="13" y="6" width="8" height="14" rx="1.5"/>'),
    pin: icon('<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
    target: icon('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>'),
    tiktok: '素材/菜单图标/tiktok.png',
    unity: '素材/菜单图标/unity.png',
    applovin: '素材/菜单图标/applovin.png',
    meta: '素材/菜单图标/meta.png',
    google: '素材/菜单图标/googleAds.png',
    mintegral: '素材/菜单图标/mintegral.png'
  };

  var iconByPath = {
    menu: 'menu',
    permission: 'shield',
    user: 'user',
    role: 'users',
    department: 'grid',
    account: 'card',
    'tiktok-account': 'tiktok',
    'unity-account': 'unity',
    'applovin-account': 'applovin',
    'meta-account': 'meta',
    'google-account': 'google',
    'mintegral-account': 'mintegral',
    product: 'apps',
    app: 'phone',
    minis: 'game',
    'material-library': 'image',
    'template-library': 'layout',
    'tag-library': 'tag',
    'copy-library': 'copy',
    'material-collect': 'collect',
    'material-derive': 'derive',
    'smart-hosting': 'host',
    'tiktok-asset': 'tiktok',
    'tiktok-app': 'list',
    'tiktok-minis': 'minis',
    'location-group': 'pin',
    'targeting-pack': 'target',
    'unity-asset': 'unity',
    'applovin-asset': 'applovin',
    'meta-asset': 'meta',
    'google-asset': 'google',
    'mintegral-asset': 'mintegral',
    'tiktok-promotion': 'tiktok',
    'unity-promotion': 'unity',
    'applovin-promotion': 'applovin',
    'meta-promotion': 'meta',
    'google-promotion': 'google',
    'mintegral-promotion': 'mintegral'
  };

  var rows = [
    item(1, '首页', 'nav', '', '-', 'home', 'Home'),
    item(2, '管理', 'nav', '', '-', 'manager', 'Manager'),
    item(3, '菜单管理', 'page', 2, '管理', 'menu', 'MenuManager'),
    item(4, '权限管理', 'dir', 2, '管理', 'permission', 'Permission'),
    item(5, '用户管理', 'page', 4, '权限管理', 'user', 'UserManager'),
    item(6, '角色管理', 'page', 4, '权限管理', 'role', 'RoleManager'),
    item(7, '数据组管理', 'page', 4, '权限管理', 'department', 'DepartmentManager'),
    item(8, '广告账户', 'dir', 2, '管理', 'account', 'Account'),
    item(9, 'TikTok', 'page', 8, '广告账户', 'tiktok-account', 'TiktokAccount'),
    item(10, '添加账户', 'btn', 9, 'TikTok', 'add', 'TiktokAccountAdd'),
    item(11, '导入更新', 'btn', 9, 'TikTok', 'import', 'TiktokAccountImport'),
    item(12, '批量操作', 'btn', 9, 'TikTok', 'batch', 'TiktokAccountBatch'),
    item(13, '编辑', 'btn', 9, 'TikTok', 'edit', 'TiktokAccountEdit'),
    item(14, 'Unity', 'page', 8, '广告账户', 'unity-account', 'UnityAccount'),
    item(15, 'AppLovin', 'page', 8, '广告账户', 'applovin-account', 'ApplovinAccount'),
    item(16, 'Meta', 'page', 8, '广告账户', 'meta-account', 'MetaAccount'),
    item(17, 'Google', 'page', 8, '广告账户', 'google-account', 'GoogleAccount'),
    item(18, 'Mintegral', 'page', 8, '广告账户', 'mintegral-account', 'MintegralAccount'),
    item(19, '产品列表', 'dir', 2, '管理', 'product', 'Product'),
    item(20, 'APP应用', 'page', 19, '产品列表', 'app', 'AppProduct'),
    item(21, '小游戏', 'page', 19, '产品列表', 'minis', 'MinisProduct'),
    item(22, '素材', 'nav', '', '-', 'material', 'Material'),
    item(23, '素材库', 'page', 22, '素材', 'material-library', 'MaterialLibrary'),
    item(24, '模板库', 'page', 22, '素材', 'template-library', 'TemplateLibrary'),
    item(25, '标签库', 'page', 22, '素材', 'tag-library', 'TagLibrary'),
    item(26, '文案库', 'page', 22, '素材', 'copy-library', 'CopyLibrary'),
    item(27, '工具', 'nav', '', '-', 'tool', 'Tool'),
    item(28, '素材采集', 'page', 27, '工具', 'material-collect', 'MaterialCollect'),
    item(29, '素材衍生', 'page', 27, '工具', 'material-derive', 'MaterialDerive'),
    item(30, '智能托管', 'page', 27, '工具', 'smart-hosting', 'SmartHosting'),
    item(31, '资产', 'nav', '', '-', 'asset', 'Asset'),
    item(32, 'TikTok', 'dir', 31, '资产', 'tiktok-asset', 'TiktokAsset'),
    item(33, '应用列表', 'page', 32, 'TikTok', 'tiktok-app', 'TiktokApp'),
    item(34, 'Mini 列表', 'page', 32, 'TikTok', 'tiktok-minis', 'TiktokMinis'),
    item(35, '地区组', 'page', 32, 'TikTok', 'location-group', 'LocationGroup'),
    item(36, '定向包', 'page', 32, 'TikTok', 'targeting-pack', 'TargetingPack'),
    item(37, 'Unity', 'dir', 31, '资产', 'unity-asset', 'UnityAsset'),
    item(38, 'AppLovin', 'dir', 31, '资产', 'applovin-asset', 'ApplovinAsset'),
    item(39, 'Meta', 'dir', 31, '资产', 'meta-asset', 'MetaAsset'),
    item(40, 'Google', 'dir', 31, '资产', 'google-asset', 'GoogleAsset'),
    item(41, 'Mintegral', 'dir', 31, '资产', 'mintegral-asset', 'MintegralAsset'),
    item(42, '推广', 'nav', '', '-', 'promotion', 'Promotion'),
    item(43, 'TikTok', 'page', 42, '推广', 'tiktok-promotion', 'TiktokPromotion'),
    item(44, 'Unity', 'page', 42, '推广', 'unity-promotion', 'UnityPromotion'),
    item(45, 'AppLovin', 'page', 42, '推广', 'applovin-promotion', 'ApplovinPromotion'),
    item(46, 'Meta', 'page', 42, '推广', 'meta-promotion', 'MetaPromotion'),
    item(47, 'Google', 'page', 42, '推广', 'google-promotion', 'GooglePromotion'),
    item(48, 'Mintegral', 'page', 42, '推广', 'mintegral-promotion', 'MintegralPromotion'),
    item(49, '看板', 'nav', '', '-', 'dashboard', 'Dashboard')
  ];

  rows.forEach(function (row) {
    if (iconByPath[row.path]) row.icon = iconByPath[row.path];
  });

  global.DeliveryMenu = { rows: rows, icons: icons };
})(window);
