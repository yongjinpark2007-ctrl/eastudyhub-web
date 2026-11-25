/* eastudyhub.com 첫 화면: IRS 주간 뉴스 + 학습 가이드
 * 글 목록은 블로그가 만드는 https://blog.eastudyhub.com/posts.json 에서 읽습니다.
 * 블로그에 새 글이 올라가면 이 페이지는 고칠 필요 없이 자동으로 바뀝니다.
 * IRS 주간 뉴스는 PracExam IRS 주간 뉴스(https://pracexam.com/ea/irs-news/ko/latest.json)를 읽습니다 (2026-11-21).
 * 월요일 루틴이 PracExam에 새 호를 저장하면 여기에도 바로 보입니다. 카드는 PracExam의 해당 호 페이지로 갑니다.
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
    // 지난 호가 아직 없으면 최신호를 가로로 넓게 보여줍니다.
    return '' +
      '<a class="issue-latest' + (past ? '' : ' wide') + '" href="' + esc(latest.url) + '">' +
        '<div class="issue-top"><span class="issue-badge">최신호</span><span class="issue-when">' + esc(fmtDate(latest.pubDate)) + '</span></div>' +
        '<h3>' + esc(weeklyTitle(latest.title)) + '</h3>' +
        (hl ? '<ul class="issue-points">' + hl + '</ul>' : '<p class="issue-desc">' + esc(latest.description) + '</p>') +
        '<div class="issue-foot"><span class="chips">' + tags(latest.tags) + '</span><span class="issue-cta">이번 호 읽기 <i class="fa-solid fa-arrow-right"></i></span></div>' +
      '</a>' +
      (past ? '<div class="issue-archive">' +
        '<div class="archive-head">지난 호</div>' + past +
        '<a class="archive-all" href="https://blog.eastudyhub.com/#weekly">전체 지난 호 보기 <i class="fa-solid fa-arrow-right"></i></a>' +
      '</div>' : '');
  }

  // PracExam 피드의 날짜는 "2026-11-16" 형식이라 UTC 기준으로 읽어야 하루 밀리지 않습니다.
  function pxDate(d, long) {
    var o = long ? { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' } : { month: 'long', day: 'numeric', timeZone: 'UTC' };
    return new Date(d + 'T00:00:00Z').toLocaleDateString('ko-KR', o);
  }
  function pxName(it) {
    var t = it.titles || [];
    if (!t.length) return it.headline || '';
    return t[0] + (t.length > 1 ? ' 외 ' + (t.length - 1) + '건' : '');
  }
  function renderPxWeekly(feed) {
    var items = (feed && feed.items) || [];
    if (!items.length) return '';
    var latest = items[0];
    var pts = (latest.titles || []).map(function (h) {
      return '<li><i class="fa-solid fa-circle-check"></i><span>' + esc(h) + '</span></li>';
    }).join('');
    var past = items.slice(1).map(function (p) {
      return '<a class="issue-row" href="' + esc(p.url) + '">' +
        '<span class="issue-date">' + esc(pxDate(p.date)) + '</span>' +
        '<span class="issue-name">' + esc(pxName(p)) + '</span>' +
        '<i class="fa-solid fa-chevron-right"></i></a>';
    }).join('');
    return '' +
      '<a class="issue-latest' + (past ? '' : ' wide') + '" href="' + esc(latest.url) + '">' +
        '<div class="issue-top"><span class="issue-badge">최신호</span><span class="issue-when">' + esc(pxDate(latest.date, true)) + '</span></div>' +
        '<h3>' + esc(pxDate(latest.date)) + ' 주간 정리</h3>' +
        (pts ? '<ul class="issue-points">' + pts + '</ul>' : '<p class="issue-desc">' + esc(latest.summary) + '</p>') +
        '<div class="issue-foot"><span class="chips"><span class="chip">PracExam IRS 주간 뉴스</span></span><span class="issue-cta">이번 호 읽기 <i class="fa-solid fa-arrow-right"></i></span></div>' +
      '</a>' +
      (past ? '<div class="issue-archive">' +
        '<div class="archive-head">지난 호 ' + (items.length - 1) + '개</div>' + past +
        '<a class="archive-all" href="' + esc(feed.list || 'https://pracexam.com/ea/irs-news/ko/') + '">PracExam에서 전체 보기 <i class="fa-solid fa-arrow-right"></i></a>' +
      '</div>' : '');
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

  // ── EA 쇼츠 (2026-11-25): PracExam EA YouTube 쇼츠 한국어판 ──
  // 목록은 PracExam Supabase의 get_videos_for_viewer(익명 = 무료 공개 영상만)에서 읽고, 한국어 영상(youtube_id_ko)만 씁니다.
  // 최신 1개는 여기서 재생하고, 지난 영상 3개와 "전체 보기"는 YouTube로 보냅니다.
  var SB_URL = 'https://ufrhvodruulpgnmudzwh.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcmh2b2RydXVscGdubXVkendoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5OTgyOTYsImV4cCI6MjA5NzU3NDI5Nn0.evW9GggJ2saXHgZah1SRQvSdle7AC5esAnrmpbm5jb8';
  var SHORTS_CHANNEL = 'https://www.youtube.com/@PracExam-EA/shorts';
  var YT_ID = /^[A-Za-z0-9_-]{6,20}$/;

  // "미국 세무사 EA 시험: ... | 파트 1 실전 문제 #EA시험" -> "미국 세무사 EA 시험: ..."
  function shortTitle(t) { return String(t || '').replace(/#\S+/g, ' ').split('|')[0].replace(/\s+/g, ' ').trim(); }
  // 설명 첫 줄에서 해시태그와 링크 안내를 뺀 한 문장
  function shortDesc(d) {
    var line = String(d || '').split('\n')[0].replace(/#\S+/g, ' ');
    line = line.split('\uD83D\uDD17')[0];   // 🔗 앞까지
    return line.replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\ufe0f]/gu, '').replace(/\s+/g, ' ').trim();
  }
  function ymd(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || ''));
    return m ? { y: m[1], m: Number(m[2]), d: Number(m[3]) } : null;
  }
  function partChip(p) {
    p = Number(p);
    if (p === 0) return '<span class="chip">IRS Tax Tip</span>';
    return p ? '<span class="chip">Part ' + p + '</span>' : '';
  }

  function renderShorts(rows) {
    rows = (rows || []).filter(function (r) { return r && !r.locked && YT_ID.test(r.youtube_id_ko || ''); });
    if (!rows.length) return '';
    var top = rows[0], t = shortTitle(top.title_ko), dt = ymd(top.published_at);
    var past = rows.slice(1, 4).map(function (r) {
      var d = ymd(r.published_at);
      return '<a class="short-row" href="https://www.youtube.com/shorts/' + esc(r.youtube_id_ko) + '" target="_blank" rel="noopener">' +
        '<span class="issue-date">' + (d ? d.m + '월 ' + d.d + '일' : '') + '</span>' +
        '<span class="issue-name">' + esc(shortTitle(r.title_ko)) + '</span>' +
        '<i class="fa-solid fa-arrow-up-right-from-square"></i></a>';
    }).join('');
    var desc = shortDesc(top.description_ko);
    return '<div class="short-grid">' +
      '<div class="short-frame" data-id="' + esc(top.youtube_id_ko) + '" data-title="' + esc(t) + '">' +
        '<button type="button" class="short-poster" aria-label="영상 재생: ' + esc(t) + '">' +
        '<img src="https://i.ytimg.com/vi/' + esc(top.youtube_id_ko) + '/hqdefault.jpg" alt="" width="360" height="640" decoding="async">' +
        '<span class="short-play" aria-hidden="true"><i class="fa-solid fa-play"></i></span></button></div>' +
      '<div class="short-side">' +
        '<div class="short-top"><span class="issue-badge">최신 영상</span>' +
          (dt ? '<span class="short-when">' + dt.y + '년 ' + dt.m + '월 ' + dt.d + '일</span>' : '') + partChip(top.ea_part) + '</div>' +
        '<h3 class="short-title">' + esc(t) + '</h3>' +
        (desc ? '<p class="short-desc">' + esc(desc) + '</p>' : '') +
        '<div class="short-actions"><a class="btn btn-primary" href="' + SHORTS_CHANNEL + '" target="_blank" rel="noopener">' +
          '<i class="fa-brands fa-youtube"></i> YouTube에서 쇼츠 전체 보기</a></div>' +
        (past ? '<div class="short-past"><div class="archive-head">지난 영상</div>' + past + '</div>' : '') +
      '</div></div>';
  }

  // 포스터를 누르면 그 자리에서 YouTube(쿠키 없는 주소)로 재생합니다. 그 전에는 YouTube를 불러오지 않습니다.
  function bindShort(scope) {
    var box = scope.querySelector('.short-frame');
    if (!box) return;
    var btn = box.querySelector('.short-poster');
    if (btn) btn.addEventListener('click', function () {
      var id = box.getAttribute('data-id');
      if (!YT_ID.test(id || '')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1&modestbranding=1';
      f.title = box.getAttribute('data-title') || 'EA 쇼츠';
      f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      f.setAttribute('allowfullscreen', '');
      box.innerHTML = '';
      box.appendChild(f);
    });
  }
  function loadShorts() {
    return fetch(SB_URL + '/rest/v1/rpc/get_videos_for_viewer', {
      method: 'POST',
      headers: { apikey: SB_ANON, Authorization: 'Bearer ' + SB_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_limit: 12 })
    }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  var api = { renderWeekly: renderWeekly, renderPxWeekly: renderPxWeekly, renderGuides: renderGuides, renderShorts: renderShorts };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  // 브라우저: 페이지에 미리 들어 있는 내용을 보여준 뒤, 블로그의 최신 목록으로 바꿉니다.
  document.addEventListener('DOMContentLoaded', function () {
    var weeklyEl = document.getElementById('weekly-content');
    var guidesEl = document.getElementById('guides-content');
    bindTabs(guidesEl);
    // EA 쇼츠: 실패하면 페이지에 미리 들어 있는 영상을 그대로 둡니다.
    var shortsEl = document.getElementById('shorts-content');
    if (shortsEl) {
      bindShort(shortsEl);
      loadShorts()
        .then(function (rows) {
          var h = renderShorts(rows);
          if (h && !shortsEl.querySelector('iframe')) { shortsEl.innerHTML = h; bindShort(shortsEl); }
        })
        .catch(function () {});
    }
    fetch('https://blog.eastudyhub.com/posts.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        if (data.posts && data.posts.length) { guidesEl.innerHTML = renderGuides(data.posts); bindTabs(guidesEl); }
      })
      .catch(function () { /* 실패하면 미리 들어 있는 내용을 그대로 둡니다 */ });
    // IRS 주간 뉴스: PracExam 피드. 실패하면 페이지에 미리 들어 있는 최신호를 그대로 둡니다.
    fetch('https://pracexam.com/ea/irs-news/ko/latest.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (feed) { var h = renderPxWeekly(feed); if (h) weeklyEl.innerHTML = h; })
      .catch(function () {});
  });
})(this);
