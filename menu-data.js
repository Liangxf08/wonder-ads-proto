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

  function fillIcon(body) {
    return '<svg viewBox="0 0 1024 1024" fill="currentColor">' + body + '</svg>';
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
    app: fillIcon('<path d="M271.958852 64.00158c-115.276539 0-208.874831 93.670541-208.874831 208.950693C63.084021 388.337184 156.628127 481.899353 272.016651 481.899353h144.894925c35.347715 0 63.918494-28.762239 63.918495-64.106342V272.894474c-0.01445-115.36685-93.500757-208.892893-208.871219-208.892894zM416.875452 417.793011v0.025288a0.932009 0.932009 0 0 1 0.043349 0.144497H272.016651a145.241719 145.241719 0 1 1 144.858801-145.06471v144.894925zM416.897127 542.227083H272.016651c-115.370462 0-208.896506 93.515206-208.896506 208.885668 0 115.276539 93.562168 208.892893 208.856769 208.892893 115.370462 0 208.856769-93.529656 208.856769-208.900118v-144.894925c-0.018062-35.351327-28.592454-63.983518-63.936556-63.983518z m-0.021675 208.874831a144.721528 144.721528 0 0 1-88.483079 133.504905C310.564987 892.145979 291.59607 895.884854 272.016651 895.884854c-19.564969 0-38.519436-3.738874-56.354047-11.28526A144.880476 144.880476 0 0 1 272.016651 606.167252h144.920212a0.093923 0.093923 0 0 0-0.043349 0v144.920212zM751.101914 542.227083h-144.894925A63.965456 63.965456 0 0 0 542.227083 606.206989v144.894925c0 115.370462 93.515206 208.896506 208.885668 208.896506 115.276539 0 208.892893-93.60913 208.892893-208.885669-0.003612-115.370462-93.533269-208.885668-208.90373-208.885668zM884.686293 807.448736a144.927437 144.927437 0 0 1-278.519041-56.354047V606.167252h144.920212A144.996074 144.996074 0 0 1 884.686293 807.448736zM606.206989 481.899353h144.894925c115.370462 0 208.896506-93.562168 208.896506-208.950693 0-115.276539-93.60913-208.921793-208.885669-208.921792-115.370462 0-208.885668 93.497144-208.885668 208.867606v144.894925c0 35.347715 28.632191 64.109954 63.979906 64.109954z m-0.039737-209.004879A144.949112 144.949112 0 1 1 751.101914 417.959184H606.167252a0.520191 0.520191 0 0 1 0-0.144498V272.894474z"/>'),
    minigame: fillIcon('<path d="M807.796364 850.276848H758.690909a133.523394 133.523394 0 0 1-100.491636-45.66109l-58.243879-66.715152a37.236364 37.236364 0 0 0-28.051394-12.753454h-119.932121a37.236364 37.236364 0 0 0-28.051394 12.753454l-58.274909 66.715152a133.430303 133.430303 0 0 1-100.445091 45.66109h-49.058909a99.29697 99.29697 0 0 1-99.29697-99.296969v-375.466667a201.69697 201.69697 0 0 1 201.69697-201.69697h386.854788a201.69697 201.69697 0 0 1 201.696969 201.69697v375.466667a99.29697 99.29697 0 0 1-99.296969 99.296969z m37.236363-474.763636a139.636364 139.636364 0 0 0-139.636363-139.636364H318.541576a139.636364 139.636364 0 0 0-139.636364 139.636364v375.466667a37.236364 37.236364 0 0 0 37.236364 37.236363h49.058909a71.369697 71.369697 0 0 0 53.775515-24.436363l58.243879-66.715152a99.29697 99.29697 0 0 1 74.752-33.993697h119.854545a99.29697 99.29697 0 0 1 74.783031 33.993697l58.290424 66.715152a71.369697 71.369697 0 0 0 53.79103 24.436363h49.089939a37.236364 37.236364 0 0 0 37.236364-37.236363v-375.466667zM676.941576 565.822061a104.975515 104.975515 0 1 1 104.975515-104.975516 104.99103 104.99103 0 0 1-104.975515 104.975516z m0-147.890425a42.914909 42.914909 0 1 0 42.899394 42.914909 42.899394 42.899394 0 0 0-42.899394-42.914909z m-245.434182 67.165091h-40.339394v40.106667a31.030303 31.030303 0 1 1-62.060606 0v-40.106667h-40.137697a31.030303 31.030303 0 0 1 0-62.060606h40.153212v-40.572121a31.030303 31.030303 0 1 1 62.060606 0v40.556606h40.339394a31.030303 31.030303 0 0 1-0.015515 62.076121z"/>'),
    image: icon('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
    layout: icon('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>'),
    tag: icon('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/>'),
    copy: icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>'),
    collect: icon('<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/>'),
    derive: icon('<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M21 3l-7 7"/><path d="M3 3l7 7"/><path d="M12 14v7"/><path d="M8 18h8"/>'),
    host: icon('<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>'),
    minis: icon('<rect x="3" y="4" width="8" height="14" rx="1.5"/><rect x="13" y="6" width="8" height="14" rx="1.5"/>'),
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
    product: 'apps',
    minis: 'minigame',
    'material-library': 'image',
    'template-library': 'layout',
    'tag-library': 'tag',
    'copy-library': 'copy',
    'material-collect': 'collect',
    'material-derive': 'derive',
    'smart-hosting': 'host',
    'tiktok-asset': 'tiktok',
    'tiktok-minis': 'minis',
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
    item(19, '产品列表', 'dir', 2, '管理', 'product', 'Product'),
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
    item(34, 'Mini 列表', 'page', 32, 'TikTok', 'tiktok-minis', 'TiktokMinis'),
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
