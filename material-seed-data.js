/* 本地素材示例数据 · 素材库 / 选择素材抽屉共用真源
 * 依赖：material-folder-data.js（MaterialFolderData.CUSTOM_FOLDERS）
 * 生成规则与素材库原 buildMockRows 一致：衍生 20，其余文件夹 randInt(10,50)
 * 使用固定种子，保证两端条数与内容一致（合计 1993）
 */
(function (global) {
  'use strict';

  var USERS = Array.from({ length: 10 }, function (_, i) {
    return '用户' + String.fromCharCode(65 + i);
  });

  var TAG_TREE = [
    { id: 'sys', label: '系统标签', system: true, children: ['衍生', '未使用', '已使用', '无消耗', '有消耗'] },
    { id: 'lang', label: '语言', children: ['英语', '日语', '繁中'] },
    { id: 'mix', label: '混合玩法', children: ['消消乐', '清理', '保护系列'] },
    { id: 'feat', label: '素材特点', children: ['CTR', '副玩法', 'DOGE'] },
    { id: 'fest', label: '节日限定', children: ['圣诞节', '夏日'] }
  ];
  var FORM_TAG_TREE = TAG_TREE.filter(function (g) { return !g.system; });

  var TYPE_TREE = [
    { id: 'video', label: '视频', children: ['mp4', 'mov', 'avi', 'mpeg'] },
    { id: 'image', label: '图片', children: ['jpg', 'jpeg', 'png', 'bmp', 'gif'] }
  ];

  var SIZE_TREE = [
    { id: 'portrait', label: '竖版(9:16)', children: ['1080x1920', '720x1280'] },
    { id: 'landscape', label: '横版(16:9)', children: ['1920x1080', '1280x720'] },
    { id: 'square', label: '方形(1:1)', children: ['1080x1080', '800x800', '512x512', '300x300', '180x180'] },
    { id: 'other', label: '其他', children: ['1200x628'] }
  ];

  var SYSTEM_TAG_NAMES = [];
  TAG_TREE.forEach(function (g) {
    if (!g.system) return;
    (g.children || []).forEach(function (c) {
      if (SYSTEM_TAG_NAMES.indexOf(c) === -1) SYSTEM_TAG_NAMES.push(c);
    });
  });

  var TT_COLLECTED_FOLDER_ID = 'tt_collected';
  var DERIVED_FOLDER_ID = 'cube_derived';
  /** 与素材库示例总量对齐 */
  var TOTAL = 1993;
  var SEED = 72;

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function pick(arr, i) { return arr[i % arr.length]; }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function startOfDay(d) {
    var x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

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

  function walkFolders(nodes, fn) {
    (nodes || []).forEach(function (node) {
      fn(node);
      if (node.children && node.children.length) walkFolders(node.children, fn);
    });
  }

  function listCustomFolderIds() {
    var folders = (global.MaterialFolderData && global.MaterialFolderData.CUSTOM_FOLDERS) || [];
    var ids = [];
    walkFolders(folders, function (node) { ids.push(node.id); });
    return ids;
  }

  function isTtCollectedFolder(folderId) {
    if (!folderId) return false;
    if (folderId === TT_COLLECTED_FOLDER_ID) return true;
    var folders = (global.MaterialFolderData && global.MaterialFolderData.CUSTOM_FOLDERS) || [];
    var pathIds = [];
    function findPath(nodes, trail) {
      var i;
      for (i = 0; i < (nodes || []).length; i += 1) {
        var n = nodes[i];
        var next = trail.concat(n.id);
        if (n.id === folderId) {
          pathIds = next;
          return true;
        }
        if (n.children && findPath(n.children, next)) return true;
      }
      return false;
    }
    findPath(folders, []);
    return pathIds.indexOf(TT_COLLECTED_FOLDER_ID) !== -1;
  }

  function sourceForFolder(folderId) {
    return isTtCollectedFolder(folderId) ? '外部采集' : '本地上传';
  }

  function isSystemTagName(name) {
    return SYSTEM_TAG_NAMES.indexOf(name) !== -1;
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

  function buildRows() {
    var folderIds = listCustomFolderIds();
    var syncCycle = ['已同步', '已同步', '未同步', '同步失败', '已同步'];
    var types = ['视频', '视频', '视频', '图片'];
    var list = [];
    var today = startOfDay(new Date());
    var i = 0;
    var materialSeq = 1000001;
    var rand = mulberry32(SEED);
    function randInt(min, max) {
      return min + Math.floor(rand() * (max - min + 1));
    }

    folderIds.forEach(function (folderId) {
      var isDerivedFolder = folderId === DERIVED_FOLDER_ID;
      /* 与素材库原逻辑一致：衍生固定 20，其余 10–50 */
      var count = isDerivedFolder ? 20 : randInt(10, 50);
      var c;
      for (c = 0; c < count; c += 1, i += 1) {
        var created = new Date(today);
        created.setDate(created.getDate() - (i % 20));
        created.setHours(9 + (i % 8), (i * 7) % 60, (i * 11) % 60, 0);
        var type = pick(types, i);
        var format = type === '视频' ? pick(['mp4', 'mov'], i) : pick(['png', 'jpg', 'gif'], i);
        var size = '1080x1920';
        var durationSec = type === '视频'
          ? pick([3, 5, 10, 12, 20, 28, 40, 55, 75, 90], i)
          : 0;
        var sync = pick(syncCycle, i);
        var delivery = [];
        if (i % 2 === 0) delivery.push('tt');
        if (i % 3 === 0) delivery.push('fb');
        if (i % 4 === 0) delivery.push('gg');
        if (i % 7 === 0) delivery.push('ap');
        var adCount = (i % 9 === 0) ? 0 : (1 + (i % 18));
        var impressions = 0;
        var clicks = 0;
        var spend = 0;
        var conversions = 0;
        if (adCount > 0) {
          impressions = 8000 + (i * 137) % 92000;
          clicks = Math.max(1, Math.floor(impressions * (0.008 + (i % 7) * 0.002)));
          if (i % 11 !== 0) {
            spend = Math.round((clicks * (0.18 + (i % 5) * 0.07)) * 100) / 100;
          }
          conversions = Math.floor(clicks * (0.02 + (i % 4) * 0.01));
        }
        var videoViews = type === '视频' && impressions ? Math.floor(impressions * (0.55 + (i % 5) * 0.06)) : 0;
        var videoP25 = type === '视频' ? Math.floor(videoViews * 0.82) : 0;
        var videoP50 = type === '视频' ? Math.floor(videoViews * 0.61) : 0;
        var videoP75 = type === '视频' ? Math.floor(videoViews * 0.38) : 0;
        var videoP100 = type === '视频' ? Math.floor(videoViews * 0.22) : 0;
        var tags = [];
        if (isDerivedFolder) tags.push('衍生');
        tags.push(adCount === 0 ? '未使用' : '已使用');
        tags.push(spend > 0 ? '有消耗' : '无消耗');
        if (i % 2 === 0) tags.push(pick(['英语', '繁中', '日语'], i));
        if (i % 3 === 0) tags.push(pick(['消消乐', '清理', '保护系列'], i + 1));
        if (i % 5 === 0) tags.push(pick(['CTR', '副玩法', 'DOGE'], i + 2));
        if (i % 7 === 0) tags.push(pick(['圣诞节', '夏日'], i + 3));
        tags = tags.filter(function (t, idx) { return tags.indexOf(t) === idx; });
        var creator = pick(USERS, i + 2);
        var nameStem = [
          String(1000 + i),
          creator,
          size,
          String(type === '视频' ? durationSec : 0),
          formatDateCompact(created)
        ].join('_');
        var id = String(materialSeq++);
        var row = {
          id: id,
          name: nameStem + '.' + format,
          folderId: folderId,
          type: type,
          format: format,
          size: size,
          durationSec: durationSec,
          tags: tags,
          creator: creator,
          createdAt: formatDateTime(created),
          createdDate: formatDateYMD(created),
          createdTs: created.getTime(),
          status: i % 11 === 0 ? '禁用' : '启用',
          syncStatus: sync,
          xmpId: sync === '已同步' ? 'XMP' + (5000 + i) : '',
          mediaId: 'md' + String(1000001 + i),
          failReason: sync === '同步失败' ? 'XMP 限流' : '',
          delivery: delivery,
          source: sourceForFolder(folderId),
          adCount: adCount,
          rejectCount: i % 5 === 0 ? (i % 4) : 0,
          spend: spend,
          impressions: impressions,
          clicks: clicks,
          conversions: conversions,
          videoViews: videoViews,
          videoP25: videoP25,
          videoP50: videoP50,
          videoP75: videoP75,
          videoP100: videoP100,
          ossUrl: ''
        };
        row.ossUrl = buildOssUrl(row.name, created, row.id, format);
        list.push(row);
      }
    });
    return list;
  }

  global.MaterialSeedData = {
    TOTAL: TOTAL,
    USERS: USERS,
    TAG_TREE: TAG_TREE,
    FORM_TAG_TREE: FORM_TAG_TREE,
    TYPE_TREE: TYPE_TREE,
    SIZE_TREE: SIZE_TREE,
    SYSTEM_TAG_NAMES: SYSTEM_TAG_NAMES,
    isSystemTagName: isSystemTagName,
    sortTagsForDisplay: sortTagsForDisplay,
    buildRows: buildRows
  };
})(window);
