/* 페이지별 화면. body data-page 값으로 골라 실행합니다.
   2026-11-03 시안 4(v4) 확정 내용 반영: 문구 띠, 6개 바로가기, 고객 후기, 주요 현황, 파묘·이장/e하늘 카드,
   장지 찾기·비교(search), 화장장 예약(crematorium), 서비스 안내(services), 시설 상세(키워드·가격표·공유·지도·고객 리뷰), 한 페이지 상담 신청 */
(function () {
  var U = window.U, C = window.C, I = U.ICON, LI = U.LI, esc = U.esc, nl = U.nl;
  var P = {};
  var S = C.site;
  function setTitle(t) { document.title = t ? t + ' | ' + C.site.name : C.site.name + ' | ' + C.site.slogan; }
  function list(a) { return (a || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); }
  var TYPE_ICON = { sumok: I.tree, napgol: I.house, maejang: I.hill };
  var SEARCH_TYPES = [['sumok', '수목장'], ['napgol', '봉안당'], ['maejang', '매장묘']];
  var REV_TABS = [['', '전체'], ['sumok', '수목장'], ['napgol', '봉안당'], ['maejang', '매장묘'], ['ijang', '파묘/이장']];
  function tname(t) { return (REV_TABS.filter(function (x) { return x[0] === t; })[0] || ['', U.typeOf(t).name])[1]; }
  function stars(n) { var s = ''; for (var i = 0; i < 5; i++) s += '<i' + (i < n ? ' class="on"' : '') + '>★</i>'; return '<span class="st" aria-label="별점 ' + n + '점">' + s + '</span>'; }
  /* 상담 후기 카드 (2026-11-17 고객 요청: '예시' 후기 대신 실제 등록되는 후기로).
     관리자 '후기' 탭에 등록한 후기(C.reviews, 처음 값은 배웅 블로그의 실제 상담·답사 글)를 그대로 보여 준다.
     카드 글은 후기의 '요약'(관리자 입력) → 없으면 아래 기본 요약 → 없으면 본문 앞부분. **…** 로 감싼 곳은 굵게 + 형광펜 */
  var REV_SUM = {
    b224431109629: '어머님이 무릎이 좋지 않아 오래 걷기 힘드시다는 말씀에, 풍경이나 가격보다 **이동 여건부터** 여쭸습니다. 자가용 이동, **편한 주차와 쉴 공간**까지 하나씩 적어 보니 용인 납골당 중심으로 가닥이 잡혔습니다.',
    b224423919482: '위치와 사진만으로는 결정할 수 없다는 가족을 위해 나래원수목장에 직접 다녀왔습니다. 차로 **진입 경로와 시설 동선**을 살폈고, **발안IC 인근**이라 오산·평택·수원에서도 찾기 편한 곳입니다.',
    b224397789066: '일산 자하연은 **매장묘부터 봉안묘·평장묘·자연장까지** 한곳에서 비교할 수 있는 공원묘원입니다. 직접 둘러보니 공원 전체가 **완만한 경사**로 조성되어 있었습니다.',
    b224395482038: '신앙 예식이 가능한 납골당을 찾는 성남·분당 가족을 위해 곤지암 인근 남서울가족공원을 답사했습니다. **봉안당과 수목장·잔디장, 매장까지** 함께 갖춘 곳입니다.',
    b224383776090: '처음엔 가까운 곳이면 된다고 생각하셨지만, 비교할수록 **시설 분위기와 관리 상태, 찾아가기 편한지**가 마음에 걸리셨다고 합니다. 직접 둘러본 끝에 **판단 기준**이 생겼습니다.',
    b224411743930: '배웅은 인터넷 정보만 전하지 않고 **직접 현장을 방문해 확인한 내용**으로 상담합니다. 양평 갈월사 수목장을 둘러보며 자연장을 고려하는 가족이 **함께 확인할 점**을 정리했습니다.',
    b224373334065: '사찰 수목장이라고 **불교 신자만 선택하는 곳은 아닙니다.** 용인 불광사 양지수목장을 직접 답사해 차분한 분위기와 함께 **시설별 이용 조건**을 미리 확인했습니다.',
    b224370709163: '아버님을 급히 모셔야 했던 형제분들은 **나무 아래 모시기**를 원하셨습니다. 용인·수원에서 멀지 않고 **조경 관리가 잘 된 곳**으로 금오동지를 가장 먼저 안내해 드렸습니다.',
    b224363967758: '서울과 가까우면서 **관리가 잘 이루어지는** 파주 납골당을 찾는 가족이 많습니다. 파주 광탄면 서현추모공원을 직접 찾아 **재단법인이 오래 운영해 온** 현장을 확인했습니다.',
    b224359282787: '“도서관처럼 생긴 봉안당”이라는 분당홈을 직접 방문했습니다. 안치 공간이 **양장본 책장처럼** 꾸며져 있고, 조명과 인테리어가 **따뜻한 느낌**을 주는 곳이었습니다.',
    b224438264593: '파묘·이장을 앞두고 새 장지를 찾는 가족을 위해 남양주 무량수목장을 살펴봤습니다. 이장은 **가족이 충분히 이야기를 나눈 뒤** 결정하시고, **어디에 모실지**를 함께 보는 일이 중요합니다.',
    b224247837400: '이장 유골은 새로 화장한 유골과 안치 조건이 다를 수 있습니다. 그래서 수목장 계약 전에 **이장 유골 수용 여부부터** 확인하는 것이 순서이며, **용기 재질 기준**도 시설마다 다릅니다.'
  };
  /* 후기 상세 본문: 5줄 이내로 정리한 글 + 해시태그 (2026-11-23 고객 요청).
     글마다 [정리한 글, 태그들]. 여기에 없는 후기(관리자에서 새로 추가한 글)는 본문 앞 두 문장 + 시설 키워드로 대신합니다. */
  var REV_BRIEF = {
    b224431109629: ['무릎이 좋지 않으신 어머님이 아버님을 자주 뵈러 가고 싶어 하셨습니다. 그래서 풍경이나 가격보다 이동 여건을 먼저 여쭙고, 주차가 편하고 쉴 공간이 있는 용인 납골당을 함께 살폈습니다.', ['주차가 편해요', '쉴 공간이 있어요', '어르신도 편해요']],
    b224423919482: ['사진만으로는 결정할 수 없다는 가족을 위해 나래원수목장에 직접 다녀왔습니다. 발안IC 인근이라 오산·평택·수원에서도 찾기 좋고, 진입 경로와 동선까지 확인했습니다.', ['IC에서 가까워요', '경기 남부에서 가까워요', '직접 답사했어요']],
    b224397789066: ['일산 자하연은 매장묘부터 봉안묘·평장묘·자연장까지 한곳에서 비교할 수 있는 공원묘원입니다. 공원 전체가 완만한 경사이고, 구역마다 정원처럼 차분했습니다.', ['경사가 완만해요', '정원 같아요', '안치 방식이 다양해요']],
    b224395482038: ['신앙 예식이 가능한 납골당을 찾는 성남·분당 가족을 위해 남서울가족공원을 답사했습니다. 봉안당과 수목장·잔디장을 함께 갖췄고 기독교식 추모예배도 준비할 수 있습니다.', ['추모예배가 가능해요', '신앙을 존중해요', '안치 방식이 다양해요']],
    b224383776090: ['가까운 곳이면 된다고 생각하셨지만, 비교할수록 분위기와 관리 상태가 마음에 걸리셨습니다. 양주 하늘안추모공원을 직접 둘러본 뒤에야 판단 기준이 생기셨습니다.', ['직접 둘러봤어요', '찾아가기 편해요', '미리 준비해요']],
    b224411743930: ['배웅은 직접 현장을 방문해 확인한 내용으로 상담합니다. 양평 갈월사는 수목장과 봉안시설을 함께 비교할 수 있어, 자연장을 고려하는 가족께 안내해 드립니다.', ['자연 속에 모셔요', '사찰이 운영해요', '봉안당과 비교할 수 있어요']],
    b224373334065: ['사찰 수목장이라고 불교 신자만 선택하는 곳은 아닙니다. 용인 불광사 양지수목장을 직접 답사해 접근성과 수목 상태, 묘역 관리, 이동 동선까지 확인했습니다.', ['분위기가 차분해요', '종교와 상관없어요', '자연과 가까워요']],
    b224370709163: ['아버님을 급히 모셔야 했던 형제분들은 나무 아래 모시기를 원하셨습니다. 용인·수원에서 멀지 않고 조경 관리가 잘 된 금오동지를 그 자리에서 안내해 드렸습니다.', ['조경이 잘 관리돼요', '용인·수원에서 가까워요', '나무 아래 모셔요']],
    b224363967758: ['서울과 가깝고 관리가 잘 되는 파주 납골당을 찾는 분이 많습니다. 서현추모공원은 재단법인이 오래 관리해 온 곳으로, 명봉산 자락이라 조용했습니다.', ['관리가 잘 돼요', '서울에서 가까워요', '조용해요']],
    b224359282787: ['“도서관처럼 생긴 봉안당” 분당홈을 직접 방문했습니다. 안치 공간이 책장처럼 꾸며져 있고 조명이 따뜻하며, 전용 열쇠로 유품함을 열어 볼 수 있습니다.', ['서재 같은 분위기예요', '조명이 따뜻해요', '유품함을 열어 볼 수 있어요']],
    b224438264593: ['파묘·이장을 앞두고 새 장지를 찾는 가족을 위한 이야기입니다. 벌초와 봉분 관리 부담을 덜 수 있고, 무량수목장은 계절 풍경 속에서 추모할 수 있는 곳입니다.', ['관리 부담이 줄어요', '계절 풍경이 좋아요', '이장 후 모실 수 있어요']],
    b224247837400: ['이장 유골은 새로 화장한 유골과 안치 조건이 다를 수 있습니다. 수목장 계약 전에 이장 유골을 받는지, 용기 재질 기준이 있는지부터 확인하시기를 권합니다.', ['계약 전에 확인해요', '안치 조건을 먼저 봐요', '기준부터 정리해요']]
  };
  function revBrief(r) {
    if (REV_BRIEF[r.id]) return REV_BRIEF[r.id][0];
    var ss = String(r.body || '').replace(/\s+/g, ' ').trim().match(/[^.!?。]+[.!?。]+/g) || [String(r.body || '')];
    return ss.slice(0, 2).map(function (x) { return x.trim(); }).join(' ');
  }
  function revTags(r) {
    var t = (Array.isArray(r.tags) && r.tags.length) ? r.tags : (REV_BRIEF[r.id] ? REV_BRIEF[r.id][1] : []);
    if (!t.length) { var f = U.facility(r.facilityId); if (f) t = (f.keywords && f.keywords.length ? f.keywords : (f.tags || [])); }
    return t.length ? '<div class="rtags">' + t.slice(0, 5).map(function (x) { return '<span>#' + esc(x) + '</span>'; }).join('') + '</div>' : '';
  }
  function hl(s) { return esc(s).replace(/\*\*([\s\S]+?)\*\*/g, '<mark class="hl">$1</mark>'); }
  function revSummary(r) {
    if (r.summary) return r.summary;
    if (REV_SUM[r.id]) return REV_SUM[r.id];
    var b = String(r.body || '').replace(/\s+/g, ' ').trim();
    return b.length > 150 ? b.slice(0, 150).replace(/\s\S*$/, '') + '…' : b;
  }
  function tCard(r) {
    var f = U.facility(r.facilityId);
    return '<a class="tc card-h" href="review.html?id=' + encodeURIComponent(r.id) + '"><div class="ph">' + U.img(U.revPhoto(r), f ? f.name : '') + '<span class="rtag">' + esc(tname(r.type)) + ' 상담</span></div>' +
      '<div class="bd"><p>' + hl(revSummary(r)) + '</p><span class="who"><b>' + esc(f ? f.name : (r.author || '배웅 상담팀')) + '</b><span>' + esc(tname(r.type)) + (f && f.area ? ' · ' + esc(f.area) : '') + ' · ' + U.fmtDate(r.date) + '</span></span></div></a>';
  }
  function loadTestimonials() { return Promise.resolve(U.visibleReviews().filter(function (r) { return !r.sample; })); }
  function contactBox(small, big, ctaType) {
    return '<div class="contact-box"><div class="av"><img src="img/logo-mark.png" alt=""></div><small>' + esc(small) + '</small><b>' + esc(big) + '</b>' +
      '<div class="acts">' + (S.kakao ? '<a class="btn btn-ck" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카톡문의</a>' : '') + '<a class="btn btn-ct" href="' + U.telHref(S.phone) + '">전화문의</a><a class="btn btn-main" href="contact.html' + (ctaType ? '?type=' + ctaType : '') + '">상담 신청</a></div></div>';
  }

  /* ---------- 공지사항 (C.notices — 관리자 '공지사항' 탭) ---------- */
  function visibleNotices() {
    return (C.notices || []).filter(function (n) { return n && n.visible !== false && n.title; })
      .sort(function (a, b) { return (!!b.pinned - !!a.pinned) || String(b.date).localeCompare(String(a.date)); });
  }
  function noticeHead(more) {
    return head('공지사항', '배웅의 새로운 소식과 안내입니다.', more ? '<a class="more" href="notice.html">전체 보기 ›</a>' : '');
  }
  function noticeList(list) {
    return '<ul class="nt-list">' + list.map(function (n) {
      return '<li><a href="notice.html?id=' + encodeURIComponent(n.id) + '"><span class="nt-lab' + (n.label === '공지' ? ' on' : '') + '">' + esc(n.label || '안내') + '</span>' +
        '<b>' + esc(n.title) + '</b><time>' + esc(String(n.date || '').replace(/-/g, '.')) + '</time><i class="nt-arr" aria-hidden="true">→</i></a></li>';
    }).join('') + '</ul>';
  }
  P.notice = function (el) {
    var id = U.qs('id'), list = visibleNotices();
    if (id) {
      var n = list.filter(function (x) { return x.id === id; })[0];
      if (!n) { el.innerHTML = '<div class="wrap sec"><div class="empty">공지를 찾을 수 없습니다. <a href="notice.html"><b>공지사항 목록</b></a></div></div>'; return; }
      setTitle(n.title);
      el.innerHTML = '<section class="sec notice-sec"><div class="wrap"><a class="back-link" href="notice.html">‹ 공지사항 목록</a>' +
        '<article class="nt-view"><span class="nt-lab' + (n.label === '공지' ? ' on' : '') + '">' + esc(n.label || '안내') + '</span><h1>' + esc(n.title) + '</h1><time>' + esc(String(n.date || '').replace(/-/g, '.')) + '</time>' +
        '<div class="nt-body">' + esc(n.body || '').replace(/\n/g, '<br>') + '</div></article>' +
        '<a class="btn btn-line btn-block mt24" href="notice.html">목록으로</a></div></section>';
      return;
    }
    setTitle('공지사항');
    el.innerHTML = '<section class="sec notice-sec"><div class="wrap">' + noticeHead(false) +
      (list.length ? noticeList(list) : '<div class="empty">등록된 공지사항이 없습니다.</div>') + '</div></section>';
  };

  /* ---------- HOME ---------- */
  function head(h2, sub, more, pill) {
    return '<div class="sec-head"><div class="tx">' + (pill ? '<span class="pill">' + esc(pill) + '</span>' : '') + '<h2>' + h2 + '</h2>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' + (more || '') + '</div>';
  }
  /* 메인 서비스 선택 카드: [키, 작은 설명, 이름, 링크, 사진] */
  var QUICK = [
    ['sumok', '자연 속에서 모시는', '수목장', 'search.html?type=sumok', 'img/quick/sumok.jpg'],
    ['napgol', '실내에서 편안하게', '봉안당', 'search.html?type=napgol', 'img/quick/napgol.jpg'],
    ['maejang', '전통 방식 그대로', '매장묘', 'search.html?type=maejang', 'img/quick/maejang.jpg'],
    ['ijang', '오래된 묘를 옮기는', '파묘·이장', 'ijang.html', 'img/quick/ijang.jpg'],
    ['cremation', 'e하늘 예약 대행', '화장장 예약', 'crematorium.html', 'img/quick/cremation.jpg'],
    ['support', '놓치기 쉬운 혜택', '장례지원금', 'support.html', 'img/quick/support.jpg']
  ];
  var STATS = [
    { n: 50, suffix: '+', unit: '곳', label: '상담 가능 장지', img: 'img/fac/eden-2.jpg' },
    { n: 1870, suffix: '', unit: '건', label: '누적 상담 신청', img: 'img/fac/gonggam-2.jpg' },
    { n: 640, suffix: '', unit: '건', label: '누적 계약 체결', img: 'img/fac/haneulmun-2.jpg' },
    { n: 97, suffix: '', unit: '%', label: '고객 만족도', img: 'img/counselor-1.jpg' }
  ];
  P.home = function (el) {
    var s = C.site, D = (window.CONTENT_DEFAULT || {}).site || {}, saved = (window.SITE_CONTENT || {}).site || {};
    setTitle('');

    /* 카드 뉴스: 관리자가 제목·설명만 고쳐도 버튼·사진은 기본 카드 순서대로 채웁니다 */
    var defCards = D.cards || [];
    var cards = (Array.isArray(s.cards) && s.cards.length ? s.cards : defCards).slice(0, 6).map(function (c, i) {
      var b = defCards[i] || {};
      var href = c.href || b.href || 'contact.html';
      return { tag: c.tag || b.tag || '', big: c.big || b.big || '', t: c.t || b.t || '', d: c.d || b.d || '', btn: c.btn || b.btn || '자세히 보기',
        href: href === 'tel' ? U.telHref(s.phone) : href, image: c.image || b.image || 'img/hero.jpg' };
    });
    if (cards.length && saved.heroImage) cards[0].image = saved.heroImage; /* 관리자가 첫 장 사진을 올린 경우만 */
    if (!cards.length) cards = [{ tag: s.slogan || '', t: s.heroTitle || s.name, d: '', btn: '지금 전화 상담', href: U.telHref(s.phone), image: s.heroImage || 'img/hero.svg' }];
    var newsHtml = '<section class="news" aria-label="배웅 카드 뉴스"><div class="track" id="news-track">' +
      cards.map(function (c, i) {
        var ext = /^https?:/.test(c.href);
        /* 2026-11-17 고객 요청(A 시안): 위 가운데 라벨 + 가운데 큰 제목(big) + 아래 두 줄 문구 */
        return '<a class="slide' + (c.big ? ' a-style' : '') + '" href="' + esc(c.href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' aria-label="' + esc(c.btn) + '">' + U.img(c.image, c.t, i === 0) + (c.tag ? '<span class="chip">' + esc(c.tag) + '</span>' : '') + (c.big ? '<strong class="big">' + esc(c.big) + '</strong>' : '') + '<h2>' + esc(c.t) + '</h2>' +
          (c.d ? '<p>' + esc(c.d) + '</p>' : '') + '</a>';
      }).join('') + '</div>' +
      (cards.length > 1 ? '<div class="news-foot"><div class="dots" id="news-dots">' + cards.map(function (_, i) { return '<button type="button" aria-label="' + (i + 1) + '번째 카드"' + (i === 0 ? ' class="on"' : '') + '></button>'; }).join('') + '</div>' +
        '<span class="num" id="news-num">1 / ' + cards.length + '</span><button class="arrow" type="button" id="news-prev" aria-label="이전 카드">‹</button><button class="arrow" type="button" id="news-next" aria-label="다음 카드">›</button></div>' : '') +
      '</section>';

    var typeIcon = { sumok: I.tree, napgol: I.house, maejang: I.hill, ijang: I.map };

    el.innerHTML =
      /* 1. 카드 뉴스 + 3. 서비스 선택 카드: PC에서는 좌우로 나란히 */
      '<div class="top2">' + newsHtml +

      /* 3. 서비스 선택 카드 (2열, 글 + 사진) */
      '<section class="sec" id="quick"><div class="wrap">' + head('무료 상담 신청', '') +
        '<nav class="qgrid" aria-label="서비스 바로가기">' + QUICK.map(function (q) {
          return '<a href="' + q[3] + '"><span class="tx"><small>' + esc(q[1]) + '</small><strong>' + esc(q[2]) + '</strong></span><span class="ph"><img src="' + q[4] + '" alt="" loading="lazy"></span></a>';
        }).join('') + '</nav><a class="svc-link" href="services.html">어떤 서비스인지 먼저 보기 · 서비스 안내</a></div></section></div>' +

      /* 5. 고객 후기 (data/testimonials.json) */
      '<section class="sec" id="reviews"><div class="wrap">' + head('배웅 동행 상담 후기', '', '<a class="more" href="reviews.html">전체 보기 ›</a>') +
        '<div class="chips" id="rvFilter" role="tablist" aria-label="후기 종류"></div><div id="rvRail"><div class="empty">후기를 불러오는 중입니다…</div></div>' +
        '<a class="btn btn-line btn-block mt16" href="reviews.html">상담 후기 전체 보기</a></div></section>' +

      /* 6~7. 서비스 이용 안내 · 배웅의 약속 섹션은 2026-11-10 고객 요청으로 메인에서 제외 (services.html 에 이용 안내 유지) */

      /* 8. 주요 현황 (숫자 카운트업) */
      '<section class="sec sec-gray stats" id="stats" aria-label="배웅 주요 현황"><div class="wrap">' + head('배웅 주요 현황', '') + '<ul id="statList">' +
        STATS.map(function (x) { return '<li><span class="ph">' + U.img(x.img, '') + '</span><span class="lb">' + x.label + '</span><b><span class="num" data-n="' + x.n + '">' + x.n.toLocaleString('ko-KR') + '</span>' + x.suffix + (x.unit ? '<small>' + x.unit + '</small>' : '') + '</b></li>'; }).join('') +
      '</ul></div></section>' +

      /* 9. 장지 유형 안내 (가격) */
      '<section class="sec" id="types"><div class="wrap">' + head('장지 유형 안내', '') + '<div class="price-cards">' +
        U.TYPE_KEYS.map(function (k, i) {
          var t = U.typeOf(k);
          return '<a class="pcard card-h' + (i === 0 ? ' hot' : '') + '" href="' + t.path + '"><span class="ic">' + typeIcon[k] + '</span>' +
            '<div class="tx"><div class="nm">' + esc(U.SHORT[k]) + (i === 0 ? '<span class="h">인기</span>' : '') + '</div><span class="d">' + esc(t.short) + '</span></div>' +
            '<div class="pr"><small>' + esc(t.priceTag || '') + '</small><em>' + esc(t.price) + '</em></div><span class="arr">›</span></a>';
        }).join('') + '</div></div></section>' +

      /* 10. 유형별 추천 시설 */
      '<section class="sec sec-gray" id="facilities"><div class="wrap">' + head('직접 답사한 장지 시설', '', '<a class="more" href="facilities.html">전체 보기 ›</a>') +
        ['sumok', 'napgol', 'maejang'].map(function (k) {
          var l = U.visibleFacilities(k).filter(function (f) { return (f.photos || []).length; }).sort(function (x, y) { return (y.type === k) - (x.type === k) || (!!y.featured) - (!!x.featured); }).slice(0, 8);
          if (!l.length) return '';
          return '<div class="type-block">' + head('<span class="dot-ic">' + typeIcon[k] + '</span>' + esc(U.SHORT[k]) + ' 추천', '', '<a class="more" href="search.html?type=' + k + '">더 보기 ›</a>') + U.rail(l.map(U.facCard).join('')) + '</div>';
        }).join('') + '</div></section>' +

      /* 11. 파묘·이장 / 화장장 예약 / 장례지원금 */
      '<section class="sec" id="extra" aria-label="파묘·이장과 화장장 예약, 장례지원금 안내"><div class="wrap"><div class="xcards">' +
        '<a class="xcard card-h" href="ijang.html"><b>파묘·이장도 함께합니다.</b><p>개장 신고부터 파묘, 화장과 새 장지 안치까지,<br>복잡한 절차를 순서대로 안내해 드립니다.</p><span class="lk">파묘·이장 상담하기 <i aria-hidden="true">→</i></span></a>' +
        '<a class="xcard card-h" href="crematorium.html"><b>화장장 예약도 함께합니다.</b><p>가능한 일정 확인부터 예약 방법까지<br>함께 도와드립니다.</p><span class="lk">화장장 예약 안내 <i aria-hidden="true">→</i></span></a></div>' +
        '<div class="xbtns"><a class="btn btn-main" href="contact.html">무료 상담 신청하기</a><a class="btn btn-gold" href="support.html">장례지원금 상담 신청</a></div></div></section>' +

      /* 12. 장례정보 */
      '<section class="sec sec-gray" id="artSec"' + ((C.articles || []).length ? '' : ' hidden') + '><div class="wrap">' + head('배웅이 알려드리는 장례정보', '', s.blogUrl ? '<a class="more" href="' + esc(s.blogUrl) + '" target="_blank" rel="noopener">블로그 ›</a>' : '') +
        '<div id="artRail">' + U.rail((C.articles || []).map(U.artCard).join(''), 'wide') + '</div></div></section>' +

      /* 13. FAQ */
      '<section class="sec" id="faq"><div class="wrap">' + head('자주 하는 질문', '상담 때 가족들이 가장 많이 물어보시는 내용입니다.') + U.faqHtml(C.faqs) + '</div></section>' +

      /* 14. 연락 박스 + 상담 신청 폼 (2026-11-25 요청: 전화·카톡이 겹치던 두 칸을 하나로) */
      U.applySection('', '', '<div class="contact-box" id="contact"><div class="av"><img src="img/logo-mark.png" alt=""></div><small>급하신 장지 문의는</small><b>연중무휴, 언제든 편히 연락 주십시오</b>' +
        '<a class="tel" href="' + U.telHref(s.phone) + '">' + I.phone + esc(s.phone) + '</a>' +
        '<p class="cb-note">모실 인원과 희망 지역을 알려주시면 배웅이 맞는 곳을 함께 찾아드립니다.</p>' +
        '<div class="acts">' + (s.kakao ? '<a class="btn btn-ck" href="' + esc(s.kakao) + '" target="_blank" rel="noopener">카톡문의</a>' : '') + '<a class="btn btn-ct" href="' + U.telHref(s.phone) + '">전화문의</a></div></div>') +

      /* 16. 공지사항 (2026-11-17 고객 요청: 마지막 부분) */
      (visibleNotices().length ? '<section class="sec notice-sec" id="notice"><div class="wrap">' + noticeHead(true) + noticeList(visibleNotices().slice(0, 3)) + '</div></section>' : '');

    /* 카드 뉴스 넘기기: 손가락으로 밀기 + 점(dot)·화살표 + 5초 자동 넘김 */
    var track = document.getElementById('news-track'), dots = document.getElementById('news-dots');
    if (track && dots) {
      var n = cards.length, cur = 0, timer = null, num = document.getElementById('news-num');
      var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      function w() { return track.clientWidth || 1; }
      function go(i) { cur = (i + n) % n; track.scrollTo({ left: cur * w(), behavior: still ? 'auto' : 'smooth' }); }
      function sync() {
        cur = Math.max(0, Math.min(n - 1, Math.round(track.scrollLeft / w())));
        [].forEach.call(dots.children, function (b, k) { b.classList.toggle('on', k === cur); });
        num.textContent = (cur + 1) + ' / ' + n;
      }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      function start() { stop(); if (still) return; timer = setInterval(function () { go(cur + 1); }, 5000); }
      track.addEventListener('scroll', sync, { passive: true });
      dots.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; go([].indexOf.call(dots.children, b)); start(); };
      document.getElementById('news-prev').onclick = function () { go(cur - 1); start(); };
      document.getElementById('news-next').onclick = function () { go(cur + 1); start(); };
      track.addEventListener('pointerdown', stop);
      track.addEventListener('pointerup', start);
      track.addEventListener('touchstart', stop, { passive: true });
      track.addEventListener('touchend', start);
      document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
      start();
    }

    /* 주요 현황: 보일 때 숫자가 올라간다 */
    var stl = document.getElementById('statList');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (stl && !reduce && 'IntersectionObserver' in window) {
      var ran = false;
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting || ran) return; ran = true; io.disconnect();
        stl.querySelectorAll('.num').forEach(function (e) {
          var to = Number(e.dataset.n), t0 = performance.now(), dur = 1400;
          (function tick(now) { var p = Math.min(1, (now - t0) / dur), ez = 1 - Math.pow(1 - p, 3); e.textContent = Math.round(to * ez).toLocaleString('ko-KR'); if (p < 1) requestAnimationFrame(tick); })(t0);
        });
      }, { threshold: .4 });
      stl.querySelectorAll('.num').forEach(function (e) { e.textContent = '0'; });
      io.observe(stl);
    }

    /* 장례정보: 관리자 "장례정보 · 직접 추가한 글"만 표시 (2026-11-19 요청 — 블로그 RSS 자동 연동·기본 글 사용 안 함), 모바일은 천천히 자동으로 흐름 */
    var artRail = document.getElementById('artRail');
    if ((C.articles || []).length) { U.bindRails(artRail); U.autoRail(artRail.querySelector('.rail'), 20); }

    /* 고객 후기: 유형 탭 + 가로 카드, 카드를 누르면 전문 */
    var rf = document.getElementById('rvFilter'), rr = document.getElementById('rvRail');
    loadTestimonials().then(function (revs) {
      var drawR = function (k) {
        var l = revs.filter(function (r) { return !k || r.type === k; });
        rr.innerHTML = l.length ? U.rail(l.map(tCard).join(''), 'wide auto') : '<div class="empty">' + tname(k) + ' 후기는 준비 중입니다.</div>';
        U.bindRails(rr);
        U.autoRail(rr.querySelector('.rail'), 20);
      };
      rf.innerHTML = REV_TABS.map(function (k, i) { var cnt = revs.filter(function (r) { return !k[0] || r.type === k[0]; }).length; return '<button type="button" class="chip' + (i === 0 ? ' on' : '') + '" data-k="' + k[0] + '">' + k[1] + '</button>'; }).join('');
      rf.onclick = function (e) { var b = e.target.closest('.chip'); if (!b) return; [].forEach.call(rf.children, function (c) { c.classList.toggle('on', c === b); }); drawR(b.dataset.k); };
      drawR('');
    }).catch(function () { rr.innerHTML = '<div class="empty">후기를 불러오지 못했습니다.</div>'; });
  };

  /* ---------- 장지 유형 (수목장·봉안당·공원묘지) ---------- */
  P.type = function (el) {
    var key = document.body.dataset.type, t = U.typeOf(key);
    setTitle(t.name);
    window.CONTACT_QUERY = '?type=' + key;
    var all = U.visibleFacilities(key);
    var areas = [];
    all.forEach(function (f) { var a = (f.area || '').replace(/\(.*\)/, '').trim(); if (a && areas.indexOf(a) < 0) areas.push(a); });
    var revs = U.visibleReviews(key).slice(0, 6);

    el.innerHTML =
      '<section class="sub-hero" style="' + U.bg(U.typeImg(key)) + '"><div class="wrap"><div class="crumb">장지 안내</div><h1>' + esc(t.name) + '</h1><p>' + esc(t.short) + '</p></div></section>' +
      '<section class="sec"><div class="wrap"><div class="intro-grid"><div><span class="pill">' + esc(U.SHORT[key]) + '란?</span><p class="lead">' + nl(t.desc) + '</p></div>' +
        '<div class="price-box"><span class="tg">' + esc(t.priceTag || '평균') + '</span><span class="lb">' + esc(U.SHORT[key]) + ' 평균 가격</span><span class="v">' + esc(t.price) + '</span><small>' + esc(t.priceNote) + '</small>' +
        '<a class="btn btn-main btn-block mt16" href="contact.html?type=' + key + '">' + I.form + '내 조건으로 견적 받기</a>' +
        '<a class="btn btn-line btn-block mt8" href="search.html?type=' + key + '">' + I.grid + esc(U.SHORT[key]) + ' 찾기·비교</a></div></div>' +
        '<div class="pc mt24"><div><h3>좋은 점</h3><ul>' + list(t.pros) + '</ul></div><div><h3>미리 알아두실 점</h3><ul>' + list(t.cons) + '</ul></div><div><h3>이런 가족께 권합니다</h3><ul>' + list(t.recommend) + '</ul></div></div>' +
      '</div></section>' +
      '<section class="sec sec-gray" id="list"><div class="wrap">' + head('<span class="dot-ic">' + (TYPE_ICON[key] || '') + '</span>배웅이 답사한 ' + esc(U.SHORT[key]) + ' <span class="cnt">' + all.length + '곳</span>', '사진을 누르시면 시설 정보와 답사 메모를 보실 수 있습니다.', '<a class="more" href="search.html?type=' + key + '">비교하기 ›</a>') +
        (areas.length > 1 ? '<div class="chips" id="chips"><button class="chip on" data-a="">전체</button>' + areas.map(function (a) { return '<button class="chip" data-a="' + esc(a) + '">' + esc(a) + '</button>'; }).join('') + '</div>' : '') +
        '<div class="fac-grid" id="facs"></div></div></section>' +
      (revs.length ? '<section class="sec"><div class="wrap">' + head(esc(U.SHORT[key]) + ' 상담·답사 이야기', '', '<a class="more" href="reviews.html?type=' + key + '">더 보기 ›</a>') + U.rail(revs.map(U.revCard).join(''), 'wide') + '</div></section>' : '') +
      ((t.faqs || []).length ? '<section class="sec sec-gray"><div class="wrap">' + head('자주 하는 질문') + U.faqHtml(t.faqs) + '</div></section>' : '') +
      U.applySection(U.SHORT[key] + ', 어디가 좋을지\n전화로 편하게 물어보십시오.', key);

    function draw(area) {
      var l = all.filter(function (f) { return !area || (f.area || '').indexOf(area) === 0; });
      document.getElementById('facs').innerHTML = l.length ? l.map(U.facCard).join('') : '<div class="empty" style="grid-column:1/-1">등록된 시설이 곧 올라옵니다. 지금은 전화로 안내받으십시오.</div>';
    }
    draw('');
    var chips = document.getElementById('chips');
    if (chips) chips.onclick = function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      [].forEach.call(chips.children, function (c) { c.classList.toggle('on', c === b); });
      draw(b.dataset.a);
    };
  };

  /* ---------- 답사 시설 전체 ---------- */
  P.facilities = function (el) {
    setTitle('답사 시설');
    var cur = U.qs('type');
    el.innerHTML = '<div class="wrap"><div class="plain-head"><h1>배웅이 답사한 시설</h1><p>배웅 상담팀이 직접 다녀와 확인한 수목장·봉안당·공원묘지입니다. 조건을 견주어 보시려면 <a href="search.html" style="text-decoration:underline"><b>장지 찾기·비교</b></a>를 이용해 주십시오.</p></div>' +
      '<div class="chips mt16" id="chips"><button class="chip" data-t="">전체</button>' + ['sumok', 'napgol', 'maejang'].map(function (k) { return '<button class="chip" data-t="' + k + '">' + esc(U.SHORT[k]) + ' ' + U.visibleFacilities(k).length + '</button>'; }).join('') + '</div>' +
      '<div class="fac-grid" id="facs"></div></div><div style="height:48px"></div>' + U.applySection();
    var chips = document.getElementById('chips');
    function draw() {
      [].forEach.call(chips.children, function (c) { c.classList.toggle('on', c.dataset.t === cur); });
      var l = U.visibleFacilities(cur);
      document.getElementById('facs').innerHTML = l.length ? l.map(U.facCard).join('') : '<div class="empty" style="grid-column:1/-1">등록된 시설이 없습니다.</div>';
    }
    chips.onclick = function (e) { var b = e.target.closest('.chip'); if (!b) return; cur = b.dataset.t; draw(); };
    draw();
  };

  /* ---------- 장지 찾기·비교 (수목장·봉안당·매장묘) ---------- */
  function areaKey(a) { a = String(a || '').replace(/\(.*\)$/, '').trim(); return /^경기/.test(a) ? a.replace(/^경기도?\s*/, '').split(' ')[0].replace(/(..)[시군]$/, '$1') : a; }   /* '경기도 고양시 일산'·'경기 고양(일산)' → 고양 */
  P.search = function (el) {
    var k = U.qs('type'); if (!C.types[k] || !SEARCH_TYPES.some(function (t) { return t[0] === k; })) k = 'sumok';
    var t = U.typeOf(k), all = U.visibleFacilities(k);
    setTitle(t.name + ' 찾기·비교');
    window.CONTACT_QUERY = '?type=' + k;
    var areas = []; all.forEach(function (f) { var a = areaKey(f.area); if (a && areas.indexOf(a) < 0) areas.push(a); });
    var tagCount = {}; all.forEach(function (f) { (f.tags || []).forEach(function (x) { tagCount[x] = (tagCount[x] || 0) + 1; }); });
    var tags = Object.keys(tagCount).sort(function (a, b) { return tagCount[b] - tagCount[a]; }).slice(0, 8);
    var state = { area: '', tag: '', feat: false, q: '' }, picked = [];

    el.innerHTML = '<div class="wrap"><div class="plain-head srch-top"><p class="notice-line"><i></i>직접 답사한 시설만 안내합니다.</p><h1>' + esc(t.name) + ' 찾기·비교</h1><p>' + esc(t.short) + '</p></div>' +
      '<div class="type-tabs">' + SEARCH_TYPES.map(function (x) { return '<a href="search.html?type=' + x[0] + '"' + (x[0] === k ? ' class="on"' : '') + '>' + x[1] + ' <small>' + U.visibleFacilities(x[0]).length + '</small></a>'; }).join('') + '</div>' +
      '<div class="filt"><div class="field"><select id="fArea" aria-label="지역"><option value="">지역 전체</option>' + areas.map(function (a) { return '<option value="' + esc(a) + '">' + esc(a) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><select id="fTag" aria-label="특징"><option value="">특징 전체</option>' + tags.map(function (a) { return '<option value="' + esc(a) + '">' + esc(a) + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="filt"><div class="field" style="flex:1"><input type="search" id="fQ" placeholder="시설명으로 찾기"></div><label class="tog"><input type="checkbox" id="fFeat"><span>배웅 추천만</span></label></div>' +
      '<div class="cnt-line"><b id="cnt"></b> <span>비교함에 담아 최대 3곳까지 한눈에 비교할 수 있습니다.</span></div></div>' +
      '<section class="sec sec-gray" id="listSec"><div class="wrap"><div class="fgrid" id="fgrid"></div></div></section>' +
      '<section class="sec" id="cmpSec" hidden><div class="wrap">' + head('선택한 시설 비교', '', '<button type="button" class="more x-btn" id="cmpClose" aria-label="닫기">닫기 ×</button>') + '<div class="cmp-wrap" id="cmpWrap"></div></div></section>' +
      U.applySection(U.SHORT[k] + ' 조건 비교가 어려우시면\n배웅이 함께 찾아드립니다.', k) +
      '<div class="cmpbar" id="cmpbar" hidden><div class="in"><span id="cmpN"></span><button type="button" class="btn btn-main btn-sm" id="cmpGo">비교하기</button><button type="button" class="btn btn-line btn-sm" id="cmpClear">비우기</button></div></div>';

    function filtered() {
      return all.filter(function (f) {
        if (state.area && areaKey(f.area) !== state.area) return false;
        if (state.tag && (f.tags || []).indexOf(state.tag) < 0) return false;
        if (state.feat && !f.featured) return false;
        if (state.q && (f.name + ' ' + f.area + ' ' + (f.tags || []).join(' ') + ' ' + (f.keywords || []).join(' ')).indexOf(state.q) < 0) return false;
        return true;
      });
    }
    function card(f) {
      var ph = (f.photos || [])[0], on = picked.indexOf(f.id) >= 0;
      return '<article class="fc' + (on ? ' on' : '') + '" data-id="' + esc(f.id) + '"><a class="ph" href="facility.html?id=' + esc(f.id) + '">' + (ph ? U.img(ph, f.name) : '') + (f.featured ? '<span class="bdg">배웅 추천</span>' : '') + '</a>' +
        '<div class="bd"><a class="nm" href="facility.html?id=' + esc(f.id) + '">' + esc(f.name) + '</a><div class="ar">' + esc(f.area) + (f.operator ? ' · ' + esc(f.operator) : '') + '</div>' +
        '<div class="pr">' + (f.price ? '<small>최저</small> ' + esc(f.price) : '상담 시 안내') + '</div>' + U.kwChips(U.kwOf(f), 3) +
        '<div class="acts"><button type="button" class="btn btn-line btn-sm cmp">' + (on ? '비교함에서 빼기' : '비교 담기') + '</button><a class="btn btn-main btn-sm" href="contact.html?type=' + esc(k) + '&facility=' + esc(f.id) + '">상담 신청</a></div></div></article>';
    }
    function draw() {
      var l = filtered();
      document.getElementById('cnt').textContent = '총 ' + l.length + '곳';
      document.getElementById('fgrid').innerHTML = l.length ? l.map(card).join('') : '<div class="empty">조건에 맞는 시설이 없습니다. 지역이나 특징을 바꿔 보십시오. 원하시는 조건을 상담으로 알려주시면 직접 찾아 안내해 드립니다.</div>';
    }
    function bar() {
      var b = document.getElementById('cmpbar'); b.hidden = !picked.length;
      document.getElementById('cmpN').innerHTML = '비교함 <b>' + picked.length + '</b> / 3';
    }
    function compare() {
      var fs = picked.map(U.facility).filter(Boolean); if (!fs.length) return;
      var rows = [['사진', function (f) { var p = (f.photos || [])[0]; return p ? U.img(p, f.name) : ''; }], ['시설명', function (f) { return '<b>' + esc(f.name) + '</b>' + (f.featured ? '<span class="bdg2">배웅 추천</span>' : ''); }], ['지역', function (f) { return esc(f.area); }], ['주소', function (f) { return esc(f.address || '-'); }], ['운영', function (f) { return esc(f.operator || '-'); }], ['사용료', function (f) { return esc(f.price || '상담 시 안내'); }], ['특징', function (f) { return (f.tags || []).map(function (x) { return '<span class="t">' + esc(x) + '</span>'; }).join('') || '-'; }], ['배웅 한줄평', function (f) { return esc(f.comment || '-'); }], ['', function (f) { return '<a class="btn btn-main btn-sm btn-block" href="contact.html?type=' + esc(k) + '&facility=' + esc(f.id) + '">상담 신청</a><a class="btn btn-line btn-sm btn-block mt8" href="facility.html?id=' + esc(f.id) + '">상세 보기</a>'; }]];
      document.getElementById('cmpWrap').innerHTML = '<table class="cmp"><tbody>' + rows.map(function (r) { return '<tr><th>' + r[0] + '</th>' + fs.map(function (f) { return '<td>' + r[1](f) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table><p class="price-note">※ 사용료·관리비·이용 기간은 시설 공지에 따라 달라지며, 계약 전에 서면으로 다시 비교해 드립니다.</p>';
      var sec = document.getElementById('cmpSec'); sec.hidden = false; sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    el.addEventListener('click', function (e) {
      var c = e.target.closest('.fc .cmp');
      if (c) {
        var id = c.closest('.fc').dataset.id, i = picked.indexOf(id);
        if (i >= 0) picked.splice(i, 1); else { if (picked.length >= 3) { U.toast('비교함에는 최대 3곳까지 담을 수 있습니다.'); return; } picked.push(id); }
        var on = picked.indexOf(id) >= 0; c.closest('.fc').classList.toggle('on', on); c.textContent = on ? '비교함에서 빼기' : '비교 담기';
        bar(); return;
      }
      if (e.target.id === 'cmpGo') compare();
      if (e.target.id === 'cmpClear') { picked = []; draw(); bar(); document.getElementById('cmpSec').hidden = true; }
      if (e.target.closest('#cmpClose')) document.getElementById('cmpSec').hidden = true;
    });
    document.getElementById('fArea').addEventListener('change', function (e) { state.area = e.target.value; draw(); });
    document.getElementById('fTag').addEventListener('change', function (e) { state.tag = e.target.value; draw(); });
    document.getElementById('fQ').addEventListener('input', function (e) { state.q = e.target.value.trim(); draw(); });
    document.getElementById('fFeat').addEventListener('change', function (e) { state.feat = e.target.checked; draw(); });
    draw(); bar();
  };

  /* ---------- 서비스 안내 보조 데이터 (화장장 예약·장례지원금) ---------- */
  var EXTRA = {
    cremation: {
      name: '화장장 예약 안내', short: '화장장 예약은 보건복지부 e하늘 장사정보시스템에서만 할 수 있습니다. 배웅이 예약 방법과 가능한 일정을 함께 확인해 드립니다.',
      priceTag: '화장 비용', price: '지역 주민 무료~수십만원', priceNote: '화장장마다 관내·관외 요금이 다릅니다. 거주지 기준으로 함께 확인해 드립니다.',
      desc: '임종 후 화장장 예약은 가장 먼저, 그리고 가장 서둘러야 하는 일입니다. 원하는 날짜와 시간대는 빠르게 마감되므로, 희망 지역과 일정만 알려주시면 배웅이 e하늘에서 가능한 일정을 바로 확인해 드립니다.',
      steps: [{ t: '희망 지역·일정 전달', d: '거주지, 장례식장, 발인 예정일을 알려주십시오.' }, { t: 'e하늘 가능 일정 확인', d: '관내·관외 화장장의 빈 시간대를 함께 확인합니다.' }, { t: '예약과 서류 안내', d: '사망진단서 등 필요한 서류와 예약 방법을 안내해 드립니다.' }, { t: '화장 후 모실 곳까지', d: '수목장·봉안당 등 화장 이후 장지까지 이어서 상담합니다.' }],
      faqs: [{ q: '배웅이 대신 예약해 드릴 수 있습니까?', a: '예약은 유족 명의로만 가능하므로, 배웅이 방법과 일정을 곁에서 함께 확인해 드립니다. 처음이시더라도 10분 정도면 마칠 수 있습니다.' }, { q: '원하는 날짜가 없으면 어떻게 됩니까?', a: '인근 다른 화장장의 일정을 바로 확인하고, 발인 일정 조정이 필요하면 장례식장과 조율하는 방법까지 안내해 드립니다.' }]
    },
    support: {
      name: '장례지원금 안내', short: '정부와 지자체가 지원하는 장례 관련 지원금을 놓치지 않도록 배웅이 대상 여부와 신청 방법을 확인해 드립니다.',
      priceTag: '대표 지원금', price: '장제급여 80만원 등', priceNote: '기초생활수급자 장제급여, 지자체 화장장려금, 국가유공자 장례 지원 등 자격에 따라 다릅니다.',
      desc: '장례 뒤에 신청할 수 있는 지원금은 종류가 많고 지자체마다 금액과 조건이 달라, 알지 못한 채 지나치는 가족이 많습니다. 배웅은 상담 과정에서 받으실 수 있는 지원금을 함께 확인하고 신청 서류를 안내해 드립니다.',
      steps: [{ t: '대상 확인', d: '고인과 신청인의 자격(수급 여부, 거주지, 유공자 등)을 확인합니다.' }, { t: '지원금 종류 안내', d: '장제급여, 화장장려금, 자연장 장려금 등 받으실 수 있는 항목을 정리해 드립니다.' }, { t: '서류 준비', d: '사망진단서, 화장증명서, 가족관계증명서 등 필요한 서류를 안내합니다.' }, { t: '신청 방법 안내', d: '주민센터·복지로 신청 절차를 단계별로 안내해 드립니다.' }],
      faqs: [{ q: '누구나 받을 수 있습니까?', a: '지원금마다 대상이 다릅니다. 기초생활수급자 장제급여처럼 자격이 필요한 것도 있고, 화장장려금처럼 거주 지역 조건만 충족하면 되는 것도 있습니다.' }, { q: '신청 기간이 정해져 있습니까?', a: '대부분 사망일 또는 화장일로부터 일정 기간 안에 신청해야 합니다. 상담 시 기한부터 확인해 드립니다.' }, { q: '장례를 이미 치렀는데 지금 신청해도 됩니까?', a: '네, 신청 기한 안이라면 장례를 마친 뒤에도 받으실 수 있습니다. 지원금마다 기한이 달라 이미 늦었다고 생각하셨던 항목도 받으실 수 있는 경우가 있으니 먼저 상담해 주십시오.' }, { q: '어떤 서류를 준비해야 합니까?', a: '보통 사망진단서(또는 시체검안서), 가족관계증명서, 신청인 신분증과 통장 사본이 필요하고, 화장장려금은 화장증명서가 추가로 필요합니다. 지원금마다 다르므로 상담 때 필요한 서류를 목록으로 정리해 드립니다.' }]
    }
  };

  /* ---------- 서비스 안내 (여섯 가지 한눈에) ---------- */
  P.services = function (el) {
    setTitle('서비스 안내');
    var T = C.types;
    var stepT = function (arr) { return (arr || S.steps || []).map(function (x) { return x.t; }); };
    var SV = [
      { k: 'sumok', ic: LI.tree, eyebrow: '수목장', h: '나무 아래, 자연으로 모시는 수목장', p: T.sumok.desc, who: '자연 속에 모시고 싶고 관리 부담을 줄이고 싶은 가족', cost: T.sumok.priceTag + ' ' + T.sumok.price + ' · ' + T.sumok.priceNote, do_: '직접 답사한 수목장 가운데 조건에 맞는 곳을 비교하고, 주말 동행 답사와 계약 대행까지 맡습니다', steps: stepT(), href: 'search.html?type=sumok', btn: '수목장 찾기·비교' },
      { k: 'napgol', ic: LI.hall, eyebrow: '봉안당(납골당)', h: '날씨와 상관없이 찾아뵙는 실내 봉안시설', p: T.napgol.desc, who: '자주 찾아뵙고 싶은 가족, 도심에서 가까운 곳을 원하는 분', cost: T.napgol.priceTag + ' ' + T.napgol.price + ' · ' + T.napgol.priceNote, do_: '단 위치·관리비·이용 기간을 서면으로 비교하고, 동행 답사와 계약 대행을 맡습니다', steps: stepT(), href: 'search.html?type=napgol', btn: '봉안당 찾기·비교' },
      { k: 'maejang', ic: LI.tomb, eyebrow: '매장묘', h: '가족이 함께 모이는 전통 묘역', p: T.maejang.desc, who: '가족 묘역을 원하시는 분', cost: T.maejang.priceTag + ' ' + T.maejang.price + ' · ' + T.maejang.priceNote, do_: '직접 답사한 공원묘지 비교, 동행 답사, 계약 대행', steps: stepT(), href: 'search.html?type=maejang', btn: '매장묘 찾기·비교' },
      { k: 'cremation', ic: LI.calendar, eyebrow: '화장장 예약', h: '임종 후 가장 먼저 잡아야 하는 화장 일정', p: EXTRA.cremation.desc, who: '임종 직후 화장 일정을 빨리 잡아야 하는 가족, e하늘 예약이 처음인 분', cost: EXTRA.cremation.priceTag + ' ' + EXTRA.cremation.price + ' · ' + EXTRA.cremation.priceNote, do_: 'e하늘에서 가능한 일정을 확인하고 필요한 서류를 안내하며, 화장 이후 모실 곳까지 이어서 상담합니다', steps: stepT(EXTRA.cremation.steps), href: 'crematorium.html', btn: '전국 화장시설 찾기' },
      { k: 'support', ic: LI.support, eyebrow: '장례지원금', h: '놓치기 쉬운 장례 지원금, 함께 확인해 드립니다', p: EXTRA.support.desc, who: '장제급여·화장장려금 등을 받을 수 있는지 궁금한 가족', cost: EXTRA.support.priceTag + ' ' + EXTRA.support.price + ' · ' + EXTRA.support.priceNote, do_: '대상 여부를 확인하고 지원금 종류를 정리해 서류와 신청 방법을 안내합니다', steps: stepT(EXTRA.support.steps), href: 'support.html', btn: '장례지원금 상담 신청' },
      { k: 'ijang', ic: LI.ijang, eyebrow: '파묘 · 이장', h: '묘를 옮겨야 할 때, 절차는 배웅이 맡습니다', p: T.ijang.desc, who: '기존 묘를 정리하거나 다른 곳으로 모셔야 하는 가족', cost: T.ijang.priceTag + ' ' + T.ijang.price + ' · ' + T.ijang.priceNote, do_: '개장 신고 대행, 길일 협의, 파묘·유골 수습, 화장과 새 장지 안치까지 진행', steps: stepT(T.ijang.steps), href: 'ijang.html', btn: '파묘·이장 안내 보기' }
    ];
    el.innerHTML = '<div class="wrap"><div class="plain-head"><div class="crumb"><a href="./">홈</a> › 서비스 안내</div><h1>처음이셔도 괜찮습니다.\n어떤 서비스인지 먼저 살펴보십시오</h1></div>' +
      '<nav class="chips svc-tabs" aria-label="서비스 바로가기">' + SV.map(function (x) { return '<a class="chip" href="#sv-' + x.k + '">' + x.eyebrow + '</a>'; }).join('') + '</nav></div>' +
      SV.map(function (x, i) {
        return '<section class="sec svc' + (i % 2 ? ' sec-gray' : '') + '" id="sv-' + x.k + '"><div class="wrap"><div class="svc-head"><span class="em" aria-hidden="true">' + x.ic + '</span><div><span class="eyebrow">' + esc(x.eyebrow) + '</span><h2>' + esc(x.h) + '</h2></div></div>' +
          '<p class="lead mt16">' + esc(x.p) + '</p>' +
          '<div class="svc-grid"><div><b>이런 분께</b><span>' + esc(x.who) + '</span></div></div>' + /* '비용은' · '배웅이 하는 일' 칸은 2026-11-10 고객 요청으로 삭제 */
          /* 단계 칩(장지 상담 신청 → 맞춤 시설 비교 → …)은 2026-11-10 고객 요청으로 삭제 */
          '<div class="btn-row mt16"><a class="btn btn-main" href="' + x.href + '">' + esc(x.btn) + '</a><a class="btn btn-line" href="contact.html?type=' + x.k + '">상담 신청</a></div></div></section>';
      }).join('') +
      '<section class="sec"><div class="wrap">' + contactBox('어떤 서비스가 맞을지 모르시겠다면', '편히 전화 주십시오. 상담하며 함께 정하겠습니다', 'unsure') + '</div></section>';
    if (location.hash) { var tg = document.querySelector(location.hash); if (tg) setTimeout(function () { tg.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); }
  };

  /* ---------- 화장장 예약 안내: 전국 화장시설 검색 + e하늘 예약 연결 ---------- */
  P.crematorium = function (el) {
    setTitle('화장장 예약 안내');
    window.CONTACT_QUERY = '?type=cremation';
    var x = EXTRA.cremation;
    el.innerHTML = '<div class="wrap"><div class="plain-head"><div class="crumb"><a href="./">홈</a> › 화장장 예약 안내</div><div class="svc-head"><span class="em" aria-hidden="true">' + LI.calendar + '</span><div><h1>화장장 예약 안내</h1></div></div></div></div>' +
      '<section class="sec sec-gray" id="cremList"><div class="wrap">' + head('전국 화장시설 찾기', '', '<small class="more" id="cremSrc"></small>') +
      '<div class="filt"><div class="field"><select id="cSido"><option value="">시·도 전체</option></select></div><div class="field" style="flex:1.2"><input type="search" id="cQ" placeholder="시설명·시군구로 찾기"></div></div>' +
      '<div class="cnt-line"><b id="cCnt"></b></div><div class="cgrid" id="cgrid"><div class="empty">자료를 불러오는 중입니다…</div></div></div></section>' +
      '<section class="sec"><div class="wrap">' + head('진행 순서') + '<ol class="steps-v">' + x.steps.map(function (st) { return '<li><div><strong>' + esc(st.t) + '</strong><span>' + esc(st.d) + '</span></div></li>'; }).join('') + '</ol></div></section>' +
      '<section class="sec sec-gray"><div class="wrap">' + head('자주 하는 질문') + U.faqHtml(x.faqs) + '</div></section>' +
      '<section class="sec"><div class="wrap">' + contactBox('화장 일정부터 모실 곳까지', '연중무휴, 언제든 편히 연락 주십시오', 'cremation') + '</div></section>';
    var data = [], sido = document.getElementById('cSido'), q = document.getElementById('cQ'), grid = document.getElementById('cgrid');
    function draw() {
      var sv = sido.value, kw = q.value.trim();
      var l = data.filter(function (r) { return (!sv || r.sido === sv) && (!kw || (r.name + ' ' + r.sigungu + ' ' + r.addr).indexOf(kw) >= 0); });
      document.getElementById('cCnt').textContent = '총 ' + l.length + '곳' + (sv ? ' · ' + sv : '');
      grid.innerHTML = l.length ? l.map(function (r) {
        return '<article class="cc"><div class="hd"><b>' + esc(r.name) + '</b><span class="pub">' + esc(r.pub || '') + (r.furnace ? ' · 화장로 ' + esc(r.furnace) + '기' : '') + '</span></div><div class="ar">' + esc(r.sido) + ' ' + esc(r.sigungu) + '</div><div class="ad">' + esc(r.addr) + '</div>' +
          '<div class="acts"><a class="btn btn-main btn-sm" href="contact.html?type=cremation&memo=' + encodeURIComponent(r.name + ' 화장장 예약 문의') + '">상담하기</a></div></article>';
      }).join('') : '<div class="empty">조건에 맞는 화장시설이 없습니다.</div>';
    }
    fetch('data/crematoriums.json?t=' + Math.floor(Date.now() / 3600000)).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      data = d.items || [];
      var sidos = []; data.forEach(function (r) { if (sidos.indexOf(r.sido) < 0) sidos.push(r.sido); });
      sido.innerHTML = '<option value="">시·도 전체</option>' + sidos.map(function (s0) { return '<option value="' + esc(s0) + '">' + esc(s0) + '</option>'; }).join('');
      document.getElementById('cremSrc').textContent = d.asOf ? d.asOf + ' 기준' : '';
      sido.onchange = draw; q.oninput = draw; draw();
    }).catch(function () {
      grid.innerHTML = '<div class="empty">전국 화장시설 목록은 준비 중입니다. 지역을 알려주시면 배웅이 가까운 화장시설과 예약 가능 일정을 바로 확인해 드립니다.</div>';
      document.getElementById('cCnt').textContent = '';
    });
  };

  /* ---------- 파묘·이장 (baewoong.co.kr/grave-relocation 내용 기준) ---------- */
  P.ijang = function (el) {
    var t = U.typeOf('ijang');
    setTitle(t.name);
    window.CONTACT_QUERY = '?type=ijang';
    var revs = U.visibleReviews('ijang').slice(0, 6);
    /* 2026-11-23 고객 요청: 글이 너무 많아 간결하게 줄임 (설명은 한 문장씩) */
    var TERMS = [
      ['파묘(破墓)', '묘를 열고 유해를 수습하는 일'],
      ['이장(移葬)', '수습한 유해를 새 자리에 모시는 일'],
      ['개장(改葬)', '파묘·이장 전 과정을 뜻하는 법률 용어']
    ];
    var STEPS = [
      ['가족 협의', '', '이장 사유와 새로 모실 방식을 함께 정합니다.'],
      ['새 안장지 계약', '', '파묘 전에 새로 모실 곳의 계약을 마칩니다.'],
      ['개장 신고', '', '묘가 있는 시·군·구청에 신고하고 허가증을 받습니다. (보통 3~7일)'],
      ['업체 선정', '', '작업비·운반비·화장비가 나뉜 견적을 두 곳 이상 비교합니다.'],
      ['파묘 당일', '', '개토제를 올린 뒤 유해를 수습합니다. 화장장은 2~5일 전에 예약합니다.'],
      ['재안장', '', '새 안장지의 절차에 따라 모십니다.'],
      ['마무리 제례', '', '새 자리에서 인사를 드리며 마칩니다.']
    ];
    var CHECKS = ['가족 협의 완료', '새 안장지 계약 (파묘 전)', '개장 허가증 수령', '업체 계약·날짜 확정', '화장장 예약 (2~5일 전)', '개토제 준비물', '당일 참석 인원 공유'];
    el.innerHTML =
      '<section class="sub-hero" style="' + U.bg(U.typeImg('ijang')) + '"><div class="wrap"><div class="crumb">장지 안내</div><h1>조상님을\n새 자리로 정중하게</h1><p>개장 신고부터 화장장 예약, 봉안까지 함께합니다</p><a class="btn btn-line mt16" href="contact.html?type=ijang">이장·개장 상담 신청</a></div></section>' +
      '<section class="sec"><div class="wrap"><div class="intro-grid"><div><span class="pill">파묘·이장이란?</span><p class="lead">묘를 열어 유골을 수습하고 새 장지로 옮겨 모시는 일입니다. 배웅이 개장 신고부터 안치까지 전 과정을 대행합니다.</p>' +
        '<div class="pc mt24"><div><h3>이런 경우 상담받으십시오</h3><ul>' + list(t.reasons) + '</ul></div></div></div>' +
        '<div class="price-box"><span class="tg">' + esc(t.priceTag || '') + '</span><span class="lb">비용 안내</span><span class="v">' + esc(t.price) + '</span><small>분묘 수와 장비 진입 여부에 따라 달라집니다.</small>' +
        '<a class="btn btn-main btn-block mt16" href="' + U.telHref(C.site.phone) + '">' + I.phone + '현장 확인 요청하기</a></div></div></div></section>' +
      '<section class="sec sec-gray"><div class="wrap">' + head('파묘·이장·개장') + '<div class="why">' + TERMS.map(function (x) { return '<div class="it"><div class="tx"><b>' + x[0] + '</b><span>' + x[1] + '</span></div></div>'; }).join('') + '</div>' +
        '<p class="price-note">개장은 관할 시·군·구청의 허가증을 받은 뒤에만 진행할 수 있습니다.</p></div></section>' +
      '<section class="sec"><div class="wrap">' + head('이장 시기') + '<p class="lead">전통적으로 음력 3월과 10월을 많이 택합니다. 실제 날짜는 가족 일정과 개장 허가 기간에 맞춰 마지막에 정합니다.</p></div></section>' +
      '<section class="sec sec-gray"><div class="wrap">' + head('파묘·이장 7단계', '', '', '진행 절차') + '<ol class="steps-v">' +
        STEPS.map(function (st) { return '<li><div><strong>' + esc(st[0]) + '</strong><span>' + esc(st[2]) + '</span></div></li>'; }).join('') + '</ol></div></section>' +
      '<section class="sec"><div class="wrap">' + head('파묘 전 체크포인트') + '<ul class="ij-check">' + CHECKS.map(function (c) { return '<li><span class="dot-ic">' + I.check + '</span><span>' + esc(c) + '</span></li>'; }).join('') + '</ul></div></section>' +
      '<section class="sec sec-gray"><div class="wrap">' + contactBox('이장 일정을 잡기 전에', '절차 전반을 함께 정리해 드립니다', 'ijang') + '</div></section>' +
      (revs.length ? '<section class="sec"><div class="wrap">' + head('파묘·이장 상담 이야기', '', '<a class="more" href="reviews.html?type=ijang">더 보기 ›</a>') + U.rail(revs.map(U.revCard).join(''), 'wide') + '</div></section>' : '') +
      ((t.faqs || []).length ? '<section class="sec sec-gray"><div class="wrap">' + head('자주 하는 질문') + U.faqHtml(t.faqs) + '</div></section>' : '') +
      U.applySection('묘 이전이 고민되시면\n현장 확인부터 무료로 받아보십시오.', 'ijang');
  };

  /* ---------- 시설 상세 ---------- */
  P.facility = function (el) {
    var f = U.facility(U.qs('id'));
    if (!f || f.visible === false) { el.innerHTML = '<div class="wrap sec"><div class="empty">시설 정보를 찾을 수 없습니다. <a href="facilities.html"><b>답사 시설 보기</b></a></div></div>'; return; }
    var t = U.typeOf(f.type);
    setTitle(f.name);
    window.CONTACT_QUERY = '?type=' + f.type + '&facility=' + encodeURIComponent(f.id);
    var photos = (f.photos && f.photos.length) ? f.photos : [U.typeImg(f.type)];
    var revs = U.visibleReviews().filter(function (r) { return r.facilityId === f.id; });
    var q = encodeURIComponent(f.address && f.address.length > 8 ? f.address : f.name);
    var rows = [['유형', U.typeNames(f)], ['지역', f.area], ['주소', f.address], ['운영', f.operator], ['종교', f.religion], ['사용료', f.price ? '<b class="pmin">' + esc(f.price) + '</b>' : '상담 시 안내']].filter(function (r) { return r[1]; });
    var pi = f.priceItems || [];
    var others = U.visibleFacilities(f.type).filter(function (x) { return x.id !== f.id; }).slice(0, 8);

    el.innerHTML =
      '<div class="gallery"><div class="track" id="track">' + photos.map(function (p, i) { return U.img(p, f.name + ' 사진 ' + (i + 1), i < 2); }).join('') + '</div>' +
        (photos.length > 1 ? '<button class="nav-b prev" aria-label="이전 사진">‹</button><button class="nav-b next" aria-label="다음 사진">›</button><span class="num" id="num">1 / ' + photos.length + '</span>' : '') + '</div>' +
      '<section class="sec" style="padding-top:24px"><div class="wrap"><div class="detail-grid"><div>' +
        '<div class="d-tags"><a class="ty" href="' + t.path + '">' + esc(U.SHORT[f.type]) + '</a>' + (f.types || []).filter(function (k) { return k !== f.type; }).map(function (k) { return '<a class="ty" href="' + U.typeOf(k).path + '">' + esc(U.SHORT[k]) + '</a>'; }).join('') + (f.featured ? '<span class="rec">배웅 추천</span>' : '') + U.sampleTag(f) + '</div>' +
        '<h1 class="d-title">' + esc(f.name) + '</h1>' +
        U.kwChips(U.kwOf(f), 6) +
        '<dl class="info mt16">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + (r[0] === '사용료' ? r[1] : esc(r[1])) + '</dd></div>'; }).join('') + '</dl>' +
        (pi.length > 1 || (pi[0] || {}).label !== '기본' && pi.length ? '<details class="ptable"><summary><h3>가격 정보 <small>' + pi.length + '건</small></h3><span class="more">더보기 <i aria-hidden="true">›</i></span></summary><ul>' + pi.map(function (x) { return '<li><span>' + esc(x.label) + '</span><b>' + esc(x.price) + '</b></li>'; }).join('') + '</ul><p>안치 위치·층·조건에 따라 달라질 수 있어 상담 때 최신 가격으로 다시 확인해 드립니다.</p></details>' : '') +
        '<div class="map-links"><button type="button" class="share" id="fshare">' + I.share + '가족에게 공유하기</button>' + (f.blogUrl ? '<a href="' + esc(f.blogUrl) + '" target="_blank" rel="noopener">답사 후기</a>' : '') + '</div>' +
        (f.comment ? '<div class="comment"><strong>배웅 답사 메모</strong>' + esc(f.comment) + '</div>' : '') +
        (f.lat && f.lng ? '<section class="floc" aria-label="위치 정보"><h3>위치 정보</h3><p class="addr">' + esc(f.address || '') + '</p><div id="fmap" class="fmap"></div><a class="more" href="https://map.naver.com/p/search/' + q + '" target="_blank" rel="noopener">네이버 지도에서 크게 보기</a></section>' : '') +
        '<section class="frev" id="frev" aria-label="고객 리뷰"></section>' +
        (revs.length ? '<div class="sec-head" style="margin-top:36px"><div class="tx"><h2>이 시설 상담·답사 이야기</h2></div></div><div class="rev-grid">' + revs.map(U.revCard).join('') + '</div>' : '') +
      '</div><div><div class="side-cta"><h3>이 시설, 상담받아 보십시오</h3><p>현재 선택할 수 있는 자리와 정확한 비용, 동행 답사 일정을 안내해 드립니다. 주말 답사도 무료입니다.</p>' +
        '<a class="btn btn-main btn-block" href="contact.html' + window.CONTACT_QUERY + '">' + I.form + '이 시설로 상담 신청</a>' +
        '<a class="btn btn-line btn-block" href="' + U.telHref(C.site.phone) + '">' + I.phone + '전화로 바로 묻기 ' + esc(C.site.phone) + '</a>' +
        (C.site.kakao ? '<a class="btn btn-kakao btn-block" href="' + esc(C.site.kakao) + '" target="_blank" rel="noopener">' + I.kakao + '카카오톡 상담</a>' : '') +
        '<p class="price-note">※ 사용료·관리비·이용 기간은 시설 공지에 따라 달라집니다. 계약 전에 서면으로 비교해 드립니다.</p></div></div></div></div></section>' +
      (others.length ? '<section class="sec sec-gray"><div class="wrap">' + head('다른 ' + esc(U.SHORT[f.type]) + '도 비교해 보십시오', '', '<a class="more" href="search.html?type=' + f.type + '">찾기·비교 ›</a>') + U.rail(others.map(U.facCard).join('')) + '</div></section>' : '');

    var track = document.getElementById('track'), num = document.getElementById('num');
    if (num) {
      var step = function () { return track.querySelector('img').clientWidth; };
      track.addEventListener('scroll', function () { num.textContent = (Math.round(track.scrollLeft / step()) + 1) + ' / ' + photos.length; }, { passive: true });
      el.querySelector('.gallery .prev').onclick = function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); };
      el.querySelector('.gallery .next').onclick = function () { track.scrollBy({ left: step(), behavior: 'smooth' }); };
    }
    document.getElementById('fshare').onclick = function () { shareFacility(f); }; if (S.kakaoJsKey || window.KAKAO_JS_KEY) loadKakao(); /* 클릭 전에 미리 받아 둬야 PC 팝업이 막히지 않음 */
    facMap(f);
    facReviews(f);
  };


  /* 카카오톡 공유: S.kakaoJsKey 가 있으면 SDK 를 불러 카톡 친구 선택 창을 바로 연다 */
  function kakaoShare(f, url, photo, fail) {
    var key = S.kakaoJsKey || window.KAKAO_JS_KEY || '';
    if (!key) return fail();
    var go = function () {
      try {
        if (!window.Kakao.isInitialized()) window.Kakao.init(key);
        var link = { mobileWebUrl: url, webUrl: url };
        var desc = [f.area, f.price ? '사용료 ' + f.price : ''].filter(Boolean).join(' · ') || f.address || '배웅 장지 안내';
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: { title: '[배웅] ' + f.name, description: desc, imageUrl: new URL(photo ? photo : 'img/og-a2.jpg', location.href).href, link: link },
          buttons: [{ title: '시설 자세히 보기', link: link }]
        });
      } catch (e) { fail(); }
    };
    loadKakao(go, fail);
  }
  function loadKakao(ok, fail) {
    if (window.Kakao && window.Kakao.init) return ok && ok();
    var sc = document.getElementById('kakao-sdk');
    if (!sc) { sc = document.createElement('script'); sc.id = 'kakao-sdk'; sc.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'; sc.crossOrigin = 'anonymous'; document.head.appendChild(sc); }
    if (ok) sc.addEventListener('load', ok); if (fail) sc.addEventListener('error', fail);
  }

  /* 가족에게 공유하기: 카카오 키가 있으면 카톡 공유창, 없으면 휴대폰 공유 시트, PC 는 링크 복사 */
  function shareFacility(f) {
    var url = location.href.split('#')[0];
    var text = '[배웅] ' + f.name + (f.area ? ' · ' + f.area : '') + (f.address ? '\n' + f.address : '') + (f.price ? '\n사용료 ' + f.price : '');
    var done = function () { U.toast('링크를 복사했습니다. 가족에게 붙여 넣어 보내 주십시오.'); };
    kakaoShare(f, url, (f.photos || [])[0], function () {
      if (navigator.share) navigator.share({ title: f.name + ' | 배웅', text: text, url: url }).catch(function (e) { if (e && e.name !== 'AbortError') copy(); });
      else copy();
    });
    function copy() { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, fallback); else fallback(); }
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { window.prompt('아래 주소를 복사해 가족에게 보내 주십시오.', url); }
      document.body.removeChild(ta);
    }
  }

  /* 위치 정보 지도: 네이버 지도(NCP 키 site.naverMapKey), 키가 없으면 OpenStreetMap */
  function facMap(f) {
    var box = document.getElementById('fmap'); if (!box || !f.lat || !f.lng) return;
    var key = S.naverMapKey || window.NAVER_MAP_KEY || '';
    var started = false;
    var start = function () {
      if (started) return; started = true;
      if (key) U.loadScript('https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=' + encodeURIComponent(key), naverMap, osmMap); else osmMap();
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); } }, { rootMargin: '200px' });
      io.observe(box);
    } else start();
    function naverMap() {
      if (!window.naver || !naver.maps) return osmMap();
      var pos = new naver.maps.LatLng(f.lat, f.lng);
      var map = new naver.maps.Map(box, { center: pos, zoom: 14, scaleControl: false, logoControlOptions: { position: naver.maps.Position.BOTTOM_LEFT }, mapDataControl: false, zoomControl: true, zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT, style: naver.maps.ZoomControlStyle.SMALL } });
      var mk = new naver.maps.Marker({ position: pos, map: map, title: f.name });
      var iw = new naver.maps.InfoWindow({ content: '<div class="fmap-iw"><b>' + esc(f.name) + '</b><span>' + esc(f.address || '') + '</span></div>', borderWidth: 0, backgroundColor: 'transparent', disableAnchor: true, pixelOffset: new naver.maps.Point(0, -8) });
      iw.open(map, mk);
      naver.maps.Event.addListener(mk, 'click', function () { if (iw.getMap()) iw.close(); else iw.open(map, mk); });
    }
    function osmMap() {
      var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css);
      U.loadScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js', function () {
        var map = L.map(box, { scrollWheelZoom: false }).setView([f.lat, f.lng], 14);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
        L.marker([f.lat, f.lng]).addTo(map).bindPopup('<b>' + esc(f.name) + '</b><br>' + esc(f.address || '')).openPopup();
      }, function () { box.innerHTML = '<p class="fmap-err">지도를 불러오지 못했습니다.</p>'; });
    }
  }

  /* 시설 고객 리뷰: 사진 + 글 + 키워드 (별점 없음). 서버(관리자 승인 후 게시) + 예시 파일 */
  function facReviews(f) {
    var box = document.getElementById('frev'); if (!box) return;
    Promise.all([
      U.getJson('admin/api.php?action=review_list&facility=' + encodeURIComponent(f.id)),
      U.getJson('data/facility-reviews.json?t=' + Math.floor(Date.now() / 600000))
    ]).then(function (res) {
      var live = (res[0] && res[0].reviews) || [];
      var samples = ((res[1] && res[1].items) || []).filter(function (x) { return x.facility === f.id; });
      draw(live.concat(samples));
    });
    function who(r) { return esc(r.name || '고객') + (r.date ? ' · ' + U.fmtDate(r.date) : ''); }
    function draw(l) {
      box.innerHTML = '<div class="frev-hd"><h2>고객 리뷰 <b>' + l.length + '</b></h2><button type="button" class="btn btn-line btn-sm" id="frevWrite">리뷰 쓰기</button></div>' +
        (l.length ?
          '<div class="frev-wrap"><div class="frev-track">' + l.map(function (r, i) {
            var ph = (r.photos || [])[0];
            return '<button type="button" class="frc" data-i="' + i + '">' + (ph ? U.img(ph, '') + ((r.photos || []).length > 1 ? '<em>+' + (r.photos.length - 1) + '</em>' : '') : '') +
              '<span class="tx"><span class="t">' + esc(r.text) + '</span>' + U.kwChips(r.keywords, 2) + '<span class="who">' + who(r) + (r.sample ? ' <i>예시</i>' : '') + '</span></span></button>';
          }).join('') + '</div></div>'
        : '<div class="empty">아직 등록된 리뷰가 없습니다.<br>다녀오신 가족의 이야기를 남겨 주십시오.</div>');
      box.querySelectorAll('.frc').forEach(function (b) { b.onclick = function () { openRev(l[+b.dataset.i]); }; });
      document.getElementById('frevWrite').onclick = openWrite;
      var w = box.querySelector('.frev-wrap'); if (w) U.dragScroll(w);
    }
    function openRev(r) {
      U.modal('<div class="frev-full">' + (r.photos || []).map(function (p) { return U.img(p, ''); }).join('') + U.kwChips(r.keywords, 5) +
        '<p>' + esc(r.text).replace(/\n/g, '<br>') + '</p><div class="who">' + who(r) + (r.sample ? ' · 예시 리뷰' : '') + '</div></div>');
    }
    function openWrite() {
      var picked = [], files = [];
      var m = U.modal('<form class="frev-form" novalidate><h3>' + esc(f.name) + ' 리뷰 쓰기</h3>' +
        '<div class="field"><label>어떤 점이 좋으셨습니까? <em>(최대 5개)</em></label><div class="kpick">' + U.REVIEW_KEYWORDS.map(function (k) { return '<button type="button" class="chip" data-k="' + esc(k) + '">' + esc(k) + '</button>'; }).join('') + '</div></div>' +
        '<div class="field"><label for="rv-text">리뷰 내용</label><textarea id="rv-text" rows="5" maxlength="1000" placeholder="다녀오신 소감을 편하게 적어 주십시오 (10자 이상)"></textarea></div>' +
        '<div class="field"><label>사진 <em>(선택, 최대 3장)</em></label><div class="pics" id="rv-pics"><label class="add">＋ 사진 추가<input type="file" id="rv-file" accept="image/*" multiple hidden></label></div></div>' +
        '<div class="field"><label for="rv-name">이름</label><input id="rv-name" maxlength="20" placeholder="예: 홍길동 (김○○처럼 가려서 보입니다)"></div>' +
        '<label class="agree"><input type="checkbox" id="rv-agree"><span>리뷰와 사진이 홈페이지에 공개되는 것에 동의합니다</span></label>' +
        '<div class="err" id="rv-err"></div><button type="submit" class="btn btn-main btn-block">리뷰 등록</button><p class="price-note" style="text-align:center">등록하신 리뷰는 확인 후 게시됩니다.</p></form>');
      var form = m.el.querySelector('form'), err = m.el.querySelector('#rv-err');
      form.querySelectorAll('.kpick button').forEach(function (b) {
        b.onclick = function () {
          var k = b.dataset.k, i = picked.indexOf(k);
          if (i >= 0) { picked.splice(i, 1); b.classList.remove('on'); }
          else if (picked.length < 5) { picked.push(k); b.classList.add('on'); }
        };
      });
      var pics = m.el.querySelector('#rv-pics');
      function drawPics() {
        pics.querySelectorAll('.pv').forEach(function (x) { x.remove(); });
        files.forEach(function (d, i) { pics.insertAdjacentHTML('beforeend', '<span class="pv"><img src="' + d + '" alt=""><button type="button" data-i="' + i + '" aria-label="사진 빼기">×</button></span>'); });
        pics.querySelectorAll('.pv button').forEach(function (b) { b.onclick = function () { files.splice(+b.dataset.i, 1); drawPics(); }; });
        pics.querySelector('.add').style.display = files.length >= 3 ? 'none' : '';
      }
      m.el.querySelector('#rv-file').onchange = function () {
        Array.prototype.slice.call(this.files, 0, 3 - files.length).forEach(function (file) { shrink(file, function (d) { if (d && files.length < 3) { files.push(d); drawPics(); } }); });
        this.value = '';
      };
      form.onsubmit = function (e) {
        e.preventDefault(); err.textContent = '';
        var text = form.querySelector('#rv-text').value.trim(), name = form.querySelector('#rv-name').value.trim();
        if (!picked.length) { err.textContent = '좋았던 점 키워드를 하나 이상 골라 주십시오.'; return; }
        if (text.length < 10) { err.textContent = '리뷰를 10자 이상 적어 주십시오.'; return; }
        if (!name) { err.textContent = '이름을 적어 주십시오.'; return; }
        if (!form.querySelector('#rv-agree').checked) { err.textContent = '공개 동의에 체크해 주십시오.'; return; }
        var btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = '등록 중…';
        fetch('admin/api.php?action=review_submit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'JANGJI' }, body: JSON.stringify({ review: { facility: f.id, name: name, text: text, keywords: picked, photos: files } }) })
          .then(function (r) { return r.json(); })
          .then(function (r) {
            if (!r.ok) throw new Error(r.message || '등록하지 못했습니다.');
            form.innerHTML = '<h3>감사합니다</h3><p class="lead mt16">소중한 리뷰가 접수되었습니다. 확인 후 이 페이지에 게시됩니다.</p><button type="button" class="btn btn-main btn-block mt16" id="rvDone">닫기</button>';
            form.querySelector('#rvDone').onclick = m.close;
          })
          .catch(function (x) { btn.disabled = false; btn.textContent = '리뷰 등록'; err.textContent = (x && x.message && !/JSON|fetch/i.test(x.message) ? x.message : '지금은 등록할 수 없습니다.') + ' 전화(' + S.phone + ')로 남겨 주셔도 됩니다.'; });
      };
    }
    /* 사진은 긴 변 1280px JPEG 로 줄여서 보냅니다 */
    function shrink(file, cb) {
      if (!/^image\//.test(file.type)) return cb('');
      var fr = new FileReader();
      fr.onload = function () {
        var im = new Image();
        im.onload = function () {
          var k = Math.min(1, 1280 / Math.max(im.width, im.height)), c = document.createElement('canvas');
          c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          cb(c.toDataURL('image/jpeg', .82));
        };
        im.onerror = function () { cb(''); };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    }
  }

  /* ---------- 고객 후기 전체 ---------- */
  P.reviews = function (el) {
    setTitle('상담 후기');
    var cur = U.qs('type'), shown = 9, revs = [];
    el.innerHTML = '<div class="wrap"><div class="plain-head"><h1>배웅 동행 상담 후기</h1><p>상담과 동행 답사를 함께한 가족의 이야기입니다.</p></div>' +
      '<div class="chips mt16" id="chips">' + REV_TABS.map(function (k) { return '<button class="chip" data-t="' + k[0] + '">' + k[1] + '</button>'; }).join('') + '</div>' +
      '<div class="rev-grid" id="list"><div class="empty">후기를 불러오는 중입니다…</div></div><button class="btn btn-line load-more" id="more" style="display:none">후기 더 보기</button></div>' +
      '<div style="height:56px"></div>' + U.applySection();
    var chips = document.getElementById('chips'), more = document.getElementById('more');
    function draw() {
      [].forEach.call(chips.children, function (c) { c.classList.toggle('on', c.dataset.t === cur); });
      var l = revs.filter(function (r) { return !cur || r.type === cur; });
      document.getElementById('list').innerHTML = l.length ? l.slice(0, shown).map(tCard).join('') : '<div class="empty">아직 등록된 후기가 없습니다.</div>';
      more.style.display = l.length > shown ? '' : 'none';
    }
    chips.onclick = function (e) { var b = e.target.closest('.chip'); if (!b) return; cur = b.dataset.t; shown = 9; draw(); };
    more.onclick = function () { shown += 9; draw(); };
    loadTestimonials().then(function (r) { revs = r; draw(); }).catch(function () { revs = []; draw(); });
  };

  /* ---------- 후기 상세 (블로그 상담·답사 이야기) ---------- */
  P.review = function (el) {
    var r = C.reviews.filter(function (x) { return x.id === U.qs('id'); })[0];
    if (!r || r.visible === false) { el.innerHTML = '<div class="wrap sec"><div class="empty">후기를 찾을 수 없습니다. <a href="reviews.html"><b>후기 목록</b></a></div></div>'; return; }
    setTitle(r.title);
    window.CONTACT_QUERY = '?type=' + r.type;
    var f = U.facility(r.facilityId);
    el.innerHTML = '<div class="wrap" style="padding-top:24px"><div class="article"><a class="back-link" href="reviews.html">‹ 후기 목록</a>' +
      '<div class="d-tags mt16"><span class="ty">' + esc(U.SHORT[r.type]) + ' 상담</span>' + U.sampleTag(r) + '</div>' +
      '<h1>' + esc(r.title) + '</h1><div class="who">' + esc(r.author || '고객') + ' · ' + U.fmtDate(r.date) + '</div>' +
      '<div class="body">' + esc(revBrief(r)) + '</div>' + revTags(r) +
      (function () { var f2 = U.facility(r.facilityId), ps = U.realPhotos(r); if (!ps.length && f2) ps = (f2.photos || []).slice(0, 3); return ps.length ? '<div class="photos">' + ps.map(function (p) { return U.img(p, r.title + ' 사진'); }).join('') + '</div>' : ''; })() +
      (f && f.visible !== false ? '<a class="linked" href="facility.html?id=' + encodeURIComponent(f.id) + '">' + U.img(U.facPhoto(f), f.name) + '<span><small>진행 시설</small><strong>' + esc(f.name) + '</strong></span><span style="margin-left:auto;color:#767676">›</span></a>' : '') +
      '</div></div><div style="height:48px"></div>' + U.applySection('같은 고민이 있으시다면\n편하게 전화 주십시오.', r.type);
  };

  /* ---------- 상담 신청 (한 페이지 간소 폼: 분야 → 지역 → 이름 → 연락처 → 추가 문의) ---------- */
  var TYPES = [
    ['sumok', '수목장 분양', '나무 아래 자연장'], ['napgol', '봉안당(납골당)', '실내 안치단'], ['maejang', '매장묘·공원묘지', '가족 묘역'],
    ['ijang', '파묘·이장', '묘 정리·새 장지'], ['cremation', '화장장 예약 안내', '예약 절차·일정 안내'], ['support', '장례지원금', '대상 확인·신청 안내'], ['unsure', '아직 정하지 못했습니다', '상담하며 정합니다']
  ];
  function typeLabel(k) { var t = TYPES.filter(function (x) { return x[0] === k; })[0]; return t ? t[1] : ''; }
  /* 장례지원금 안내 + 신청 (2026-11-17 고객 요청: 장지 상담과 같은 신청 폼, 큰 제목 '장례지원금', 위에 짧은 설명) */
  var SUPPORT_KINDS = [
    ['장제급여', '기초생활수급자(생계·의료·주거급여)였던 분이 돌아가셨을 때, 장례를 치른 가족에게 지급됩니다.'],
    ['사망일시금', '국민연금 가입 이력이 있는 분이 돌아가셨을 때, 유족연금을 받을 가족이 없는 경우 등 조건에 따라 지급됩니다.'],
    ['화장장려금', '화장을 하면 지원하는 제도로, 시행 여부와 금액이 주소지 지자체마다 다릅니다.'],
    ['그 밖의 장례 지원', '업무상 사고(산재)나 국가유공자 등은 별도의 장례비·안장 지원을 받을 수 있습니다.']
  ];
  function supportIntro() {
    return '<div class="sp-intro"><span class="sp-eye">놓치기 쉬운 장례 혜택</span><h1>장례지원금</h1>' +
      '<p class="lead">장례지원금은 가족을 떠나보낸 뒤 나라와 지자체, 공적 보험에서 <b>장례 비용의 일부를 지원받는 제도</b>입니다. 대상과 금액이 저마다 다르고 <b>직접 신청해야만 받을 수 있어</b> 모르고 지나치는 가족이 많습니다.</p></div>';
  }
  function supportInfo() {
    return '<div class="sp-intro sp-info"><h2 class="sp-form-h">받으실 수 있는 지원금</h2><ul class="sp-kinds">' + SUPPORT_KINDS.map(function (k) { return '<li><b>' + esc(k[0]) + '</b><span>' + esc(k[1]) + '</span></li>'; }).join('') + '</ul>' +
      '<p class="sp-note">지원 여부와 금액은 고인과 신청인의 조건, 심사 결과에 따라 달라집니다. 배웅이 받으실 수 있는 항목과 신청 기한, 필요한 서류부터 정리해 드립니다.</p>' +
      '<ol class="sp-steps">' + EXTRA.support.steps.map(function (x, i) { return '<li><em>' + (i + 1) + '</em><b>' + esc(x.t) + '</b><span>' + esc(x.d) + '</span></li>'; }).join('') + '</ol></div>';
  }
  P.support = function (el) { P.contact(el, 'support'); };
  P.contact = function (el, mode) {
    var sup = mode === 'support';
    setTitle(sup ? '장례지원금' : '상담 신청');
    var s = C.site;
    var fac = sup ? null : U.facility(U.qs('facility'));
    var type = sup ? 'support' : U.qs('type') || (fac ? fac.type : '');
    if (!typeLabel(type)) type = '';
    var regions = (s.regions || []).slice().concat(['상관없음']);
    var preR = U.qs('region');
    var opt = function (v, l, sel) { return '<option value="' + esc(v) + '"' + (sel ? ' selected' : '') + '>' + esc(l) + '</option>'; };
    el.innerHTML = '<div class="form-wrap' + (sup ? ' sp' : '') + '">' + (sup ? supportIntro() + '<h2 class="sp-form-h sp-first" id="apply-form">장례지원금 상담 신청</h2><p class="lead mt8">이름과 연락처만 남겨 주시면 받으실 수 있는 지원금부터 확인해 연락드리겠습니다. 상담은 무료입니다.</p>'
      : '<h1>상담 신청</h1><p class="lead mt8">이름과 연락처, 상담 분야만 남겨 주시면 됩니다. 상담과 동행 답사는 모두 무료이며, 접수 후 상담팀이 순서대로 연락드리겠습니다.</p>') +
      '<form id="cform" class="cf mt24" novalidate>' +
      '<div class="field"' + (sup ? ' style="display:none"' : '') + '><label for="f-type">상담 분야 <em>(필수)</em></label><select id="f-type">' + opt('', '선택해 주십시오', !type) + TYPES.map(function (t) { return opt(t[0], t[1], t[0] === type); }).join('') + '</select>' +
      '<div class="notice-box" id="cremNote" hidden><b>화장장 예약은 보건복지부 e하늘 장사정보시스템에서만 할 수 있습니다.</b> 배웅이 예약 방법과 가능한 일정을 함께 확인해 드리고, 화장 이후 모실 곳까지 이어서 안내해 드립니다. <a href="' + U.EHANEUL + '" target="_blank" rel="noopener">e하늘 바로가기</a></div>' +
      (fac ? '<div class="notice-box"><b>' + esc(fac.name) + '</b> 시설 문의로 접수됩니다.</div>' : '') + '</div>' +
      '<div class="field"><label for="f-region">희망 지역 <span>(선택)</span></label><select id="f-region">' + opt('', '선택해 주십시오', !preR) + regions.map(function (r) { return opt(r, r, r === preR); }).join('') + '</select></div>' +
      '<div class="field"><label for="f-name">이름 <em>(필수)</em></label><input id="f-name" autocomplete="name" placeholder="이름을 입력해 주십시오" value="' + esc(U.qs('name')) + '"></div>' +
      '<div class="field"><label for="f-phone">연락처 <em>(필수)</em></label><input id="f-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" value="' + esc(U.qs('phone')) + '"></div>' +
      '<div class="field"><label for="f-memo">추가 문의 <span>(선택)</span></label><textarea id="f-memo" placeholder="모실 인원, 예산, 원하시는 조건 등을 적어 주십시오">' + esc(U.qs('memo')) + '</textarea></div>' +
      '<label class="agree cf-agree"><input type="checkbox" id="f-agree"><span><b>개인정보 수집·이용에 동의합니다 <em>(필수)</em></b><small>상담을 위해 이름·연락처·문의 내용을 수집하며, 상담 완료 후 1년간 보관 후 파기합니다. <a href="privacy.html" target="_blank">자세히 보기</a></small></span></label>' +
      '<button class="btn btn-main btn-block cf-submit" type="submit">' + I.check + (sup ? '장례지원금 상담 신청하기' : '상담 신청하기') + '</button><div class="err" id="err"></div>' +
      '<p class="price-note" style="text-align:center">접수 후 상담팀이 순서대로 연락드리겠습니다.</p></form>' +
      (sup ? supportInfo() : '') +
      (sup ? '<div class="sp-faq"><h2>자주 하는 질문</h2>' + U.faqHtml(EXTRA.support.faqs) + '</div>' : '') +
      '<div class="call-box"><small>바로 상담을 원하시면</small><a class="tel" href="' + U.telHref(s.phone) + '">' + esc(s.phone) + '</a><small>' + esc(s.hours) + '</small>' + (s.kakao ? '<a class="btn btn-kakao btn-block mt16" href="' + esc(s.kakao) + '" target="_blank" rel="noopener">' + I.kakao + '카카오톡 상담</a>' : '') + '</div></div>';
    var form = document.getElementById('cform'), typeSel = form.querySelector('#f-type');
    typeSel.onchange = function () { document.getElementById('cremNote').hidden = typeSel.value !== 'cremation'; };
    typeSel.onchange();
    form.onsubmit = function (e) {
      e.preventDefault();
      var err = document.getElementById('err');
      var name = form.querySelector('#f-name').value.trim(), phone = form.querySelector('#f-phone').value.trim();
      if (!typeSel.value) { err.textContent = '상담 분야를 선택해 주십시오.'; typeSel.focus(); return; }
      if (!name) { err.textContent = '이름을 입력해 주십시오.'; form.querySelector('#f-name').focus(); return; }
      if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone)) { err.textContent = '연락처를 확인해 주십시오.'; form.querySelector('#f-phone').focus(); return; }
      if (!form.querySelector('#f-agree').checked) { err.textContent = '개인정보 수집·이용에 동의해 주십시오.'; return; }
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = '접수 중…'; err.textContent = '';
      var rec = { type: typeLabel(typeSel.value), region: form.querySelector('#f-region').value, when: '', name: name, phone: phone, memo: form.querySelector('#f-memo').value.trim(), facility: fac ? fac.name : '', page: document.referrer ? document.referrer.replace(location.origin, '') : '' };
      U.sendInquiry(rec).then(function (res) { if (!res || !res.ok) throw new Error((res && res.message) || '접수 실패'); done(rec, res.demo); })
        .catch(function () {
          btn.disabled = false; btn.innerHTML = I.check + (sup ? '장례지원금 상담 신청하기' : '상담 신청하기');
          err.innerHTML = '접수 중 문제가 생겼습니다. <a href="' + U.telHref(s.phone) + '"><b>' + esc(s.phone) + '</b></a> 로 전화 주십시오.';
        });
    };
    function done(rec, demo) {
      var msg = '[배웅 상담 신청]\n문의: ' + rec.type + (rec.facility ? '\n시설: ' + rec.facility : '') + '\n지역: ' + (rec.region || '-') + '\n이름: ' + rec.name + '\n연락처: ' + rec.phone + (rec.memo ? '\n내용: ' + rec.memo : '');
      el.innerHTML = '<div class="form-wrap done"><div class="ok">' + I.check + '</div><h1>' + (demo ? '미리보기 화면에서는 접수되지 않습니다' : '상담 신청이 접수되었습니다') + '</h1>' +
        '<p>' + (demo ? '실제 홈페이지에서는 이 화면에서 접수됩니다. 지금은 아래 버튼으로 카카오톡이나 전화로 같은 내용을 보내 주십시오.' : esc(rec.name) + '님, 상담팀이 순서대로 <b>' + esc(rec.phone) + '</b> 으로 연락드리겠습니다. 급하신 경우 바로 전화 주십시오.') + '</p>' +
        '<pre class="done-pre">' + esc(msg) + '</pre>' +
        (s.kakao ? '<a class="btn btn-kakao btn-block" href="' + esc(s.kakao) + '" target="_blank" rel="noopener">' + I.kakao + '카카오톡으로 보내기</a>' : '') +
        '<a class="btn btn-main btn-block mt8" href="' + U.telHref(s.phone) + '">' + I.phone + '바로 전화하기 ' + esc(s.phone) + '</a>' +
        '<a class="btn btn-line btn-block mt8" href="./">처음으로</a></div>';
      window.scrollTo(0, 0);
    }
  };

  /* ---------- 개인정보 처리방침 ---------- */
  P.privacy = function (el) {
    setTitle('개인정보 처리방침');
    var s = C.site;
    el.innerHTML = '<div class="wrap prose" style="padding:28px 20px 48px"><h1>개인정보 처리방침</h1>' +
      '<p class="mt16">' + esc(s.bizName) + '(이하 "회사")는 상담 신청 과정에서 받는 개인정보를 아래와 같이 처리합니다.</p>' +
      '<h2>1. 수집 항목</h2><p>이름, 휴대폰 번호, 문의 내용(장지 유형, 희망 지역, 시기, 요청 사항), 시설 리뷰 작성 시 이름·리뷰 내용·사진</p>' +
      '<h2>2. 수집·이용 목적</h2><p>장지 분양 및 이장·파묘 상담, 화장장 예약·장례지원금 안내, 견적 안내, 현장 답사 일정 조율을 위한 연락, 시설 리뷰 게시</p>' +
      '<h2>3. 보유 및 이용 기간</h2><p>상담 완료 후 1년간 보관하며, 기간이 지나면 지체 없이 파기합니다. 계약이 이루어진 경우 관련 법령에서 정한 기간 동안 보관합니다. 게시된 리뷰는 작성자가 삭제를 요청할 때까지 보관합니다.</p>' +
      '<h2>4. 제3자 제공</h2><p>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 상담 진행을 위해 이용자가 선택한 장지 시설에 연락처를 전달할 필요가 있는 경우 사전에 동의를 받습니다.</p>' +
      '<h2>5. 동의를 거부할 권리</h2><p>개인정보 수집·이용에 동의하지 않을 수 있으며, 이 경우 온라인 상담 신청은 할 수 없습니다. 전화 상담은 언제든 가능합니다.</p>' +
      '<h2>6. 이용자의 권리</h2><p>이용자는 언제든 자신의 개인정보 열람, 정정, 삭제를 요청할 수 있습니다.</p>' +
      '<h2>7. 개인정보 보호책임자</h2><p>' + esc(s.bizName) + (s.ceo ? ' 대표 ' + esc(s.ceo) : '') + ' · ' + esc(s.phone) + (s.email ? ' · ' + esc(s.email) : '') + '</p>' +
      '<p class="mt24">시행일: 2026년 10월 14일</p></div>';
  };

  window.PAGES = P;
})();
