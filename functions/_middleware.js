/* eastudyhub.com 첫 화면: IRS 주간 뉴스를 서버에서 미리 채웁니다 (2026-11-21).
 * 브라우저의 home.js도 같은 피드를 읽지만, 자바스크립트를 실행하지 않는 검색·AI 크롤러는
 * 페이지에 들어 있는 내용만 봅니다. 그래서 첫 화면(/)을 보낼 때 PracExam IRS 주간 뉴스(한국어)
 * 최신 목록으로 #weekly-content를 바꿔서 보냅니다. 피드를 못 읽으면 원래 페이지를 그대로 보냅니다.
 * 카드 모양은 home.js의 renderPxWeekly와 같습니다. 한쪽을 바꾸면 다른 쪽도 같이 바꿔 주세요.
 */
const FEED = 'https://pracexam.com/ea/irs-news/ko/latest.json';
const LIST = 'https://pracexam.com/ea/irs-news/ko/';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// "2026-11-16" -> "11월 16일" / "2026년 11월 16일"
function pxDate(d, long) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || ''));
  if (!m) return '';
  const md = Number(m[2]) + '월 ' + Number(m[3]) + '일';
  return long ? m[1] + '년 ' + md : md;
}
function pxName(it) {
  const t = it.titles || [];
  if (!t.length) return it.headline || '';
  return t[0] + (t.length > 1 ? ' 외 ' + (t.length - 1) + '건' : '');
}
function safeUrl(u) {
  return /^https:\/\/pracexam\.com\//.test(String(u || '')) ? u : LIST;
}
function render(feed) {
  const items = (feed && feed.items) || [];
  if (!items.length || !items[0].date) return '';
  const latest = items[0];
  const pts = (latest.titles || []).map((h) =>
    '<li><i class="fa-solid fa-circle-check"></i><span>' + esc(h) + '</span></li>').join('');
  const past = items.slice(1).map((p) =>
    '<a class="issue-row" href="' + esc(safeUrl(p.url)) + '">' +
    '<span class="issue-date">' + esc(pxDate(p.date)) + '</span>' +
    '<span class="issue-name">' + esc(pxName(p)) + '</span>' +
    '<i class="fa-solid fa-chevron-right"></i></a>').join('');
  return '' +
    '<a class="issue-latest' + (past ? '' : ' wide') + '" href="' + esc(safeUrl(latest.url)) + '">' +
      '<div class="issue-top"><span class="issue-badge">최신호</span><span class="issue-when">' + esc(pxDate(latest.date, true)) + '</span></div>' +
      '<h3>' + esc(pxDate(latest.date)) + ' 주간 정리</h3>' +
      (pts ? '<ul class="issue-points">' + pts + '</ul>' : '<p class="issue-desc">' + esc(latest.summary) + '</p>') +
      '<div class="issue-foot"><span class="chips"><span class="chip">PracExam IRS 주간 뉴스</span></span><span class="issue-cta">이번 호 읽기 <i class="fa-solid fa-arrow-right"></i></span></div>' +
    '</a>' +
    (past ? '<div class="issue-archive">' +
      '<div class="archive-head">지난 호 ' + (items.length - 1) + '개</div>' + past +
      '<a class="archive-all" href="' + LIST + '">PracExam에서 전체 보기 <i class="fa-solid fa-arrow-right"></i></a>' +
    '</div>' : '');
}

export async function onRequest(context) {
  const res = await context.next();
  try {
    const url = new URL(context.request.url);
    if (context.request.method !== 'GET') return res;
    if (url.pathname !== '/' && url.pathname !== '/index.html') return res;
    if (res.status !== 200 || !(res.headers.get('content-type') || '').includes('text/html')) return res;

    const r = await fetch(FEED, {
      headers: { accept: 'application/json' },
      cf: { cacheTtl: 600, cacheEverything: true },
    });
    if (!r.ok) return res;
    const html = render(await r.json());
    if (!html) return res;

    const out = new HTMLRewriter()
      .on('#weekly-content', { element(el) { el.setInnerContent(html, { html: true }); } })
      .transform(res);
    const headers = new Headers(out.headers);
    headers.delete('etag');
    headers.set('cache-control', 'public, max-age=0, must-revalidate');
    return new Response(out.body, { status: out.status, headers });
  } catch (e) {
    return res;
  }
}
