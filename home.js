/* eastudyhub.com 첫 화면: IRS 주간 뉴스 + 학습 가이드
 * 글 목록은 블로그가 만드는 https://blog.eastudyhub.com/posts.json 에서 읽습니다.
 * 블로그에 새 글이 올라가면 이 페이지는 고칠 필요 없이 자동으로 바뀝니다.
 */
(function (root) {
  var CATEGORY_ORDER = ['세법 업데이트', '시험 준비 팁', 'EA 커리어'];
  var CATEGORY_ICON = {
    '세법 업데이트': 'fa-scale-balanced',
    '시험 준비 팁': 'fa-pen-ruler',
    'EA 커리어': 'fa-briefcase'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  // 제목 앞뒤의 이모지를 빼서 카드가 깔끔하게 보이게 합니다.
  function cleanTitle(t) {
    return String(t || '')
      .replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\u2B00-\u2BFF\u200d\ufe0f]/gu, '')
      .replace(/^\s*vs\s+/i, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
  function weeklyTitle(t) {
    return cleanTitle(t).replace(/^\[IRS 주간 소식\]\s*/, '');
  }
  function fmtDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles' });
  }
  function shortDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles' });
  }
  function tags(list) {
    return (list || []).map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('');
  }

  function renderWeekly(weekly) {
    if (!weekly || !weekly.length) {
      return '<div class="empty-card">첫 IRS 주간 뉴스를 준비하고 있습니다.</div>';
    }
    var latest = weekly[0];
    var hl = (latest.highlights || []).map(function (h) {
      return '<li><i class="fa-solid fa-circle-check"></i><span>' + esc(h) + '</span></li>';
    }).join('');
    var past = weekly.slice(1, 7).map(function (p) {
      return '<a class="issue-row" href="' + esc(p.url) + '">' +
        '<span class="issue-date">' + esc(shortDate(p.pubDate)) + '</span>' +
        '<span class="issue-name">' + esc(weeklyTitle(p.title)) + '</span>' +
        '<i class="fa-solid fa-chevron-right"></i></a>';
    }).join('');
    return '' +
      '<a class="issue-latest" href="' + esc(latest.url) + '">' +
        '<div class="issue-top"><span class="issue-badge">최신호</span><span class="issue-when">' + esc(fmtDate(latest.pubDate)) + '</span></div>' +
        '<h3>' + esc(weeklyTitle(latest.title)) + '</h3>' +
        (hl ? '<ul class="issue-points">' + hl + '</ul>' : '<p class="issue-desc">' + esc(latest.description) + '</p>') +
        '<div class="issue-foot"><span class="chips">' + tags(latest.tags) + '</span><span class="issue-cta">이번 호 읽기 <i class="fa-solid fa-arrow-right"></i></span></div>' +
      '</a>' +
      '<div class="issue-archive">' +
        '<div class="archive-head">지난 호</div>' +
        (past || '<p class="archive-empty">지난 호가 쌓이면 여기에 모입니다.</p>') +
        '<a class="archive-all" href="https://blog.eastudyhub.com/#weekly">전체 지난 호 보기 <i class="fa-solid fa-arrow-right"></i></a>' +
      '</div>';
  }

  function renderGuides(posts) {
    posts = posts || [];
    var pinned = posts.filter(function (p) { return p.pinned; }).slice(0, 4);
    var pinnedHtml = pinned.map(function (p, i) {
      return '<a class="guide-card" href="' + esc(p.url) + '">' +
        '<span class="guide-num">0' + (i + 1) + '</span>' +
        '<span class="guide-cat">' + esc(p.category || '가이드') + '</span>' +
        '<span class="guide-title">' + esc(cleanTitle(p.title)) + '</span>' +
        '<span class="guide-go">읽기 <i class="fa-solid fa-arrow-right"></i></span></a>';
    }).join('');

    var groups = CATEGORY_ORDER.map(function (name) {
      return { name: name, posts: posts.filter(function (p) { return p.category === name && !p.pinned; }) };
    }).filter(function (g) { return g.posts.length; });

    var tabs = groups.map(function (g, i) {
      return '<button type="button" class="tab' + (i === 0 ? ' active' : '') + '" data-tab="' + i + '">' +
        '<i class="fa-solid ' + (CATEGORY_ICON[g.name] || 'fa-folder') + '"></i> ' + esc(g.name) +
        ' <span class="tab-count">' + g.posts.length + '</span></button>';
    }).join('');
    var panels = groups.map(function (g, i) {
      var cards = g.posts.map(function (p) {
        return '<a class="post-card" href="' + esc(p.url) + '">' +
          '<span class="post-title">' + esc(cleanTitle(p.title)) + '</span>' +
          '<span class="post-desc">' + esc(p.description) + '</span>' +
          '<span class="chips">' + tags(p.tags) + '</span></a>';
      }).join('');
      return '<div class="tab-panel' + (i === 0 ? ' active' : '') + '" data-panel="' + i + '"><div class="post-grid">' + cards + '</div></div>';
    }).join('');

    return '' +
      (pinnedHtml ? '<div class="subhead-row"><h3 class="sub-title"><i class="fa-solid fa-thumbtack"></i> 먼저 읽어보세요</h3></div><div class="guide-grid">' + pinnedHtml + '</div>' : '') +
      (tabs ? '<div class="subhead-row"><h3 class="sub-title"><i class="fa-solid fa-layer-group"></i> 주제별 글</h3></div><div class="tabs" role="tablist">' + tabs + '</div>' + panels : '');
  }

  function bindTabs(scope) {
    var tabs = scope.querySelectorAll('.tab');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var n = t.getAttribute('data-tab');
        tabs.forEach(function (x) { x.classList.toggle('active', x === t); });
        scope.querySelectorAll('.tab-panel').forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-panel') === n);
        });
      });
    });
  }

  var api = { renderWeekly: renderWeekly, renderGuides: renderGuides };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  // 브라우저: 페이지에 미리 들어 있는 내용을 보여준 뒤, 블로그의 최신 목록으로 바꿉니다.
  document.addEventListener('DOMContentLoaded', function () {
    var weeklyEl = document.getElementById('weekly-content');
    var guidesEl = document.getElementById('guides-content');
    bindTabs(guidesEl);
    fetch('https://blog.eastudyhub.com/posts.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        if (data.weekly && data.weekly.length) weeklyEl.innerHTML = renderWeekly(data.weekly);
        if (data.posts && data.posts.length) { guidesEl.innerHTML = renderGuides(data.posts); bindTabs(guidesEl); }
      })
      .catch(function () { /* 실패하면 미리 들어 있는 내용을 그대로 둡니다 */ });
  });
})(this);
