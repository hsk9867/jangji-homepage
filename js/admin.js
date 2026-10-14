/* 관리자 페이지: 로그인, 문의 접수함, 시설·후기 등록(사진 업로드), 장지 안내·기본 정보 수정, 저장 */
(function () {
  var D = window.CONTENT_DEFAULT;
  var TYPE_KEYS = ['sumok', 'napgol', 'maejang', 'ijang'];
  var STATUSES = ['신규', '연락 완료', '답사 예약', '계약', '보류', '종료'];
  var state = { content: null, dirty: false, tab: 'inbox', inbox: [], typeTab: 'sumok', facFilter: '', revFilter: '', inqFilter: '' };
  var $ = function (id) { return document.getElementById(id); };
  var view = $('view');

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function bg(u) { return "background-image:url('" + String(u).replace(/'/g, '%27') + "')"; }
  function typeName(k) { return (D.types[k] || {}).name || k; }
  function uid(p) { return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function toast(msg, err) {
    var t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, err ? 4500 : 2200);
  }
  function lines(s) { return String(s || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean); }
  function pairsFromLines(s) { return lines(s).map(function (l) { var i = l.indexOf('|'); return i < 0 ? { t: l, d: '' } : { t: l.slice(0, i).trim(), d: l.slice(i + 1).trim() }; }); }
  function pairsToLines(a) { return (a || []).map(function (p) { return p.d ? p.t + ' | ' + p.d : p.t; }).join('\n'); }

  function api(action, data) {
    var opt = data === undefined ? { credentials: 'same-origin' } :
      { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'JANGJI' }, body: JSON.stringify(data) };
    return fetch('admin/api.php?action=' + action, opt).then(function (r) {
      return r.text().then(function (t) {
        try { return JSON.parse(t); } catch (e) { throw new Error('서버 응답 오류 (PHP가 동작하지 않는 곳일 수 있습니다)'); }
      });
    });
  }

  /* 기본값 위에 저장된 콘텐츠를 합칩니다 */
  function merge(saved) {
    saved = saved || {};
    var c = clone(D);
    c.site = Object.assign(c.site, saved.site || {});
    TYPE_KEYS.forEach(function (k) { c.types[k] = Object.assign(c.types[k], (saved.types || {})[k] || {}); });
    ['facilities', 'reviews', 'faqs', 'articles'].forEach(function (k) { if (Array.isArray(saved[k])) c[k] = saved[k]; if (!Array.isArray(c[k])) c[k] = []; });
    return c;
  }
  function payload() {
    var c = state.content, types = {};
    TYPE_KEYS.forEach(function (k) { var t = clone(c.types[k]); delete t.name; delete t.path; types[k] = t; });
    return { site: c.site, types: types, facilities: c.facilities, reviews: c.reviews, faqs: c.faqs, articles: c.articles };
  }
  function setDirty(v) {
    state.dirty = v;
    var m = $('save-msg');
    m.textContent = v ? '저장하지 않은 변경 사항이 있습니다.' : '모든 변경 사항이 저장되었습니다.';
    m.className = 'msg' + (v ? ' dirty' : '');
  }
  function save() {
    var btn = $('save'); btn.disabled = true;
    return api('save', { content: payload() }).then(function (r) {
      btn.disabled = false;
      if (!r.ok) throw new Error(r.message || r.error);
      setDirty(false); toast('저장했습니다. 사이트에 바로 반영됩니다.');
      return true;
    }).catch(function (e) { btn.disabled = false; toast('저장 실패: ' + e.message, true); return false; });
  }
  window.addEventListener('beforeunload', function (e) { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- 사진: 브라우저에서 줄여서 업로드 ---------- */
  function resize(file, max, keepPng) {
    return new Promise(function (ok, no) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, r = Math.min(1, max / Math.max(w, h));
        var cv = document.createElement('canvas'); cv.width = Math.round(w * r); cv.height = Math.round(h * r);
        var cx = cv.getContext('2d');
        var png = keepPng && file.type === 'image/png';
        if (!png) { cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); }
        cx.drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        ok(png ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = function () { URL.revokeObjectURL(url); no(new Error(file.name + ': 사진을 읽을 수 없습니다 (HEIC는 JPG로 바꿔 올려 주세요)')); };
      img.src = url;
    });
  }
  function uploadFiles(files, opts) {
    opts = opts || {};
    var list = [].slice.call(files), done = [], i = 0;
    function next() {
      if (i >= list.length) return Promise.resolve(done);
      var f = list[i++];
      if (opts.onProgress) opts.onProgress(i, list.length);
      return resize(f, opts.max || 1600, opts.keepPng).then(function (data) { return api('upload', { data: data }); })
        .then(function (r) { if (!r.ok) throw new Error(r.message || r.error); done.push(r.path); return next(); });
    }
    return next();
  }

  /* 사진 묶음 편집기 (배열을 직접 수정) */
  function photoEditor(host, arr, onChange, single) {
    function draw() {
      host.innerHTML = '<div class="photos">' + arr.map(function (p, i) {
        return '<div class="p" style="' + bg(p) + '">' + (i === 0 && !single ? '<span class="first">대표</span>' : '') +
          '<div class="ctl">' + (single ? '<span></span>' : '<button type="button" data-l="' + i + '" aria-label="앞으로">◀</button>') +
          '<button type="button" data-x="' + i + '" aria-label="삭제">삭제</button>' + (single ? '' : '<button type="button" data-r="' + i + '" aria-label="뒤로">▶</button>') + '</div></div>';
      }).join('') + ((single && arr.length) ? '' : '<label class="add">＋ 사진 추가<span style="font-size:12px;font-weight:400">' + (single ? '1장' : '여러 장 선택 가능') + '</span><input type="file" accept="image/*"' + (single ? '' : ' multiple') + '></label>') + '</div><div class="prog"></div>';
      var inp = host.querySelector('input[type=file]');
      if (inp) inp.onchange = function () {
        if (!inp.files.length) return;
        var prog = host.querySelector('.prog');
        uploadFiles(inp.files, { onProgress: function (n, t) { prog.textContent = '사진 올리는 중… (' + n + '/' + t + ')'; }, keepPng: single === 'logo', max: single === 'logo' ? 600 : 1600 })
          .then(function (paths) { paths.forEach(function (p) { arr.push(p); }); onChange(); draw(); })
          .catch(function (e) { prog.textContent = ''; toast(e.message, true); onChange(); draw(); });
      };
      host.querySelectorAll('[data-x]').forEach(function (b) { b.onclick = function () { arr.splice(+b.dataset.x, 1); onChange(); draw(); }; });
      host.querySelectorAll('[data-l]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.l; if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); onChange(); draw(); } }; });
      host.querySelectorAll('[data-r]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.r; if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); onChange(); draw(); } }; });
    }
    draw();
  }

  /* 두 번 눌러야 실행되는 삭제 버튼 (확인 창 없이) */
  function armButton(btn, fn) {
    var t;
    btn.onclick = function () {
      if (btn.classList.contains('arm')) { clearTimeout(t); fn(); return; }
      var old = btn.textContent; btn.classList.add('arm'); btn.textContent = '한 번 더 누르면 삭제';
      t = setTimeout(function () { btn.classList.remove('arm'); btn.textContent = old; }, 3000);
    };
  }

  /* ---------- 오른쪽 편집 패널 ---------- */
  function openPanel(title, bodyHtml, onMount, actions) {
    var p = document.createElement('div'); p.className = 'panel';
    p.innerHTML = '<div class="in" role="dialog" aria-label="' + esc(title) + '"><div class="ph"><b>' + esc(title) + '</b><button class="btn sm" data-close>닫기</button></div><div class="bd">' + bodyHtml + '</div>' +
      '<div class="ft">' + (actions.del ? '<button class="btn del" data-del>삭제</button>' : '') + '<button class="btn pri" data-ok>' + (actions.okLabel || '저장') + '</button></div></div>';
    document.body.appendChild(p); document.body.style.overflow = 'hidden';
    function close() { p.remove(); document.body.style.overflow = ''; }
    p.querySelector('[data-close]').onclick = close;
    p.onclick = function (e) { if (e.target === p) close(); };
    p.querySelector('[data-ok]').onclick = function () { actions.ok(close); };
    if (actions.del) armButton(p.querySelector('[data-del]'), function () { actions.del(close); });
    if (onMount) onMount(p);
    return p;
  }
  function val(p, name) { var el = p.querySelector('[name="' + name + '"]'); return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : ''; }
  function typeSelect(cur) { return '<select name="type">' + TYPE_KEYS.map(function (k) { return '<option value="' + k + '"' + (k === cur ? ' selected' : '') + '>' + typeName(k) + '</option>'; }).join('') + '</select>'; }

  /* ---------- 탭: 문의 접수 ---------- */
  function loadInbox(silent) {
    return api('inbox').then(function (r) {
      if (!r.ok) { if (r.error === 'auth') return showLogin(); throw new Error(r.message || r.error); }
      var before = state.inbox.filter(function (x) { return x.status === '신규'; }).length;
      state.inbox = r.inquiries || [];
      var n = state.inbox.filter(function (x) { return x.status === '신규'; }).length;
      var b = $('new-count'); b.textContent = n; b.classList.toggle('hidden', !n);
      if (silent && n > before) toast('새 문의가 들어왔습니다.');
      if (state.tab === 'inbox') renderInbox();
    }).catch(function (e) { if (!silent) toast(e.message, true); });
  }
  function renderInbox() {
    var list = state.inbox.filter(function (x) { return !state.inqFilter || x.status === state.inqFilter; });
    view.innerHTML = '<h2>문의 접수</h2><p class="help">홈페이지 상담 신청이 여기에 쌓입니다. 30초마다 새로 고칩니다. 상태와 메모는 바꾸면 바로 저장됩니다.</p>' +
      '<div class="bar"><div class="chips" id="inq-chips"><button class="chip' + (!state.inqFilter ? ' on' : '') + '" data-s="">전체 ' + state.inbox.length + '</button>' +
      STATUSES.map(function (s) { var n = state.inbox.filter(function (x) { return x.status === s; }).length; return '<button class="chip' + (state.inqFilter === s ? ' on' : '') + '" data-s="' + s + '">' + s + ' ' + n + '</button>'; }).join('') +
      '</div><span style="flex:1"></span><button class="btn sm" id="inq-reload">새로 고침</button><button class="btn sm" id="inq-csv">엑셀(CSV) 받기</button></div>' +
      '<div class="list">' + (list.length ? list.map(function (q) {
        var d = new Date(q.receivedAt);
        return '<div class="inq' + (q.status === '신규' ? ' new' : '') + '" data-id="' + esc(q.id) + '"><div class="hd"><b>' + esc(q.name) + '</b><a href="tel:' + esc(String(q.phone).replace(/[^0-9+]/g, '')) + '">' + esc(q.phone) + '</a>' +
          '<time>' + (isNaN(d) ? '' : d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })) + '</time></div>' +
          '<div class="meta">' + [q.type, q.region, q.when, q.facility ? '시설: ' + q.facility : ''].filter(Boolean).map(esc).join(' · ') + '</div>' +
          (q.memo ? '<div class="memo">' + esc(q.memo) + '</div>' : '') +
          '<div class="ctl"><select data-status>' + STATUSES.map(function (s) { return '<option' + (s === q.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
          '<input data-note placeholder="상담 메모 (예: 10/16 답사 예약)" value="' + esc(q.adminNote || '') + '"><button class="btn sm del" data-del>삭제</button></div></div>';
      }).join('') : '<div class="empty">' + (state.inqFilter ? '이 상태의 문의가 없습니다.' : '아직 접수된 문의가 없습니다.') + '</div>') + '</div>';

    $('inq-chips').onclick = function (e) { var b = e.target.closest('.chip'); if (b) { state.inqFilter = b.dataset.s; renderInbox(); } };
    $('inq-reload').onclick = function () { loadInbox(); };
    $('inq-csv').onclick = function () {
      var cols = [['receivedAt', '접수 시각'], ['name', '이름'], ['phone', '연락처'], ['type', '유형'], ['region', '지역'], ['when', '시기'], ['facility', '시설'], ['memo', '문의 내용'], ['status', '상태'], ['adminNote', '메모']];
      var csv = '﻿' + cols.map(function (c) { return c[1]; }).join(',') + '\n' + state.inbox.map(function (q) {
        return cols.map(function (c) { var v = c[0] === 'receivedAt' ? new Date(q[c[0]]).toLocaleString('ko-KR') : (q[c[0]] || ''); return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = '상담문의_' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
    };
    view.querySelectorAll('.inq').forEach(function (box) {
      var id = box.dataset.id;
      var item = state.inbox.filter(function (x) { return x.id === id; })[0];
      box.querySelector('[data-status]').onchange = function () {
        var s = this.value;
        api('inbox_update', { id: id, status: s }).then(function (r) { if (!r.ok) throw new Error(r.message || r.error); item.status = s; toast('상태를 바꿨습니다.'); loadInbox(); }).catch(function (e) { toast(e.message, true); });
      };
      box.querySelector('[data-note]').onchange = function () {
        var n = this.value;
        api('inbox_update', { id: id, note: n }).then(function (r) { if (!r.ok) throw new Error(r.message || r.error); item.adminNote = n; toast('메모를 저장했습니다.'); }).catch(function (e) { toast(e.message, true); });
      };
      armButton(box.querySelector('[data-del]'), function () {
        api('inbox_update', { id: id, delete: true }).then(function (r) { if (!r.ok) throw new Error(r.message || r.error); toast('삭제했습니다.'); loadInbox(); }).catch(function (e) { toast(e.message, true); });
      });
    });
  }

  /* ---------- 탭: 답사 시설 ---------- */
  function renderFacilities() {
    var c = state.content;
    var list = c.facilities.filter(function (f) { return !state.facFilter || f.type === state.facFilter; });
    view.innerHTML = '<h2>답사 시설</h2><p class="help">답사한 수목장·납골당·매장묘를 사진과 함께 올립니다. 첫 번째 사진이 대표 사진이 됩니다. "메인 추천"을 켜면 첫 화면에 나옵니다.</p>' +
      '<div class="bar"><div class="chips" id="fac-chips"><button class="chip' + (!state.facFilter ? ' on' : '') + '" data-t="">전체 ' + c.facilities.length + '</button>' +
      TYPE_KEYS.map(function (k) { return '<button class="chip' + (state.facFilter === k ? ' on' : '') + '" data-t="' + k + '">' + typeName(k) + ' ' + c.facilities.filter(function (f) { return f.type === k; }).length + '</button>'; }).join('') +
      '</div><span style="flex:1"></span><button class="btn pri" id="fac-add">＋ 시설 추가</button></div>' +
      '<div class="list">' + (list.length ? list.map(function (f) {
        return '<div class="item"><div class="th" style="' + bg((f.photos && f.photos[0]) || (D.types[f.type] || {}).image || 'img/hero.jpg') + '"></div><div class="tx"><b>' + esc(f.name || '(이름 없음)') + '</b><small>' +
          '<span class="lb">' + typeName(f.type) + '</span>' + (f.featured ? '<span class="lb star">메인 추천</span>' : '') + (f.visible === false ? '<span class="lb hide">숨김</span>' : '') + (f.sample ? '<span class="lb sample">예시</span>' : '') +
          esc(f.area || '') + ' · 사진 ' + (f.photos || []).length + '장</small></div><button class="btn sm" data-edit="' + esc(f.id) + '">수정</button></div>';
      }).join('') : '<div class="empty">등록된 시설이 없습니다. "＋ 시설 추가"를 눌러 주세요.</div>') + '</div>';
    $('fac-chips').onclick = function (e) { var b = e.target.closest('.chip'); if (b) { state.facFilter = b.dataset.t; renderFacilities(); } };
    $('fac-add').onclick = function () { editFacility(null); };
    view.querySelectorAll('[data-edit]').forEach(function (b) { b.onclick = function () { editFacility(b.dataset.edit); }; });
  }
  function editFacility(id) {
    var c = state.content;
    var orig = id ? c.facilities.filter(function (f) { return f.id === id; })[0] : null;
    var f = orig ? clone(orig) : { id: uid('f'), type: state.facFilter || 'sumok', name: '', area: '', address: '', operator: '', price: '', tags: [], comment: '', photos: [], featured: false, visible: true };
    var regions = (c.site.regions || []).map(function (r) { return '<option value="' + esc(r) + '">'; }).join('');
    var html =
      '<div class="f"><label>사진</label><div id="ph-host"></div><small>휴대폰 사진을 그대로 올리면 자동으로 줄여서 저장합니다.</small></div>' +
      '<div class="row2"><div class="f"><label>장지 유형</label>' + typeSelect(f.type) + '</div>' +
      '<div class="f"><label>시설 이름 *</label><input type="text" name="name" value="' + esc(f.name) + '" placeholder="예: OO 추모공원"></div></div>' +
      '<div class="row2"><div class="f"><label>지역 (필터에 쓰임)</label><input type="text" name="area" list="regions" value="' + esc(f.area) + '" placeholder="예: 경기"><datalist id="regions">' + regions + '</datalist></div>' +
      '<div class="f"><label>운영 형태</label><input type="text" name="operator" list="ops" value="' + esc(f.operator) + '" placeholder="공설 / 사설 / 종교 / 재단"><datalist id="ops"><option value="공설"><option value="사설"><option value="종교"><option value="재단"></datalist></div></div>' +
      '<div class="f"><label>주소</label><input type="text" name="address" value="' + esc(f.address) + '" placeholder="지도 연결에 쓰입니다"></div>' +
      '<div class="f"><label>가격 안내</label><input type="text" name="price" value="' + esc(f.price) + '" placeholder="예: 1위 300만원~ / 상담 시 안내"></div>' +
      '<div class="f"><label>블로그 답사기 주소</label><input type="url" name="blogUrl" value="' + esc(f.blogUrl || '') + '" placeholder="https://blog.naver.com/baewoong0816/..."><small>넣으면 시설 페이지에 "블로그 답사기 전체 보기" 버튼이 생깁니다.</small></div>' +
      '<div class="f"><label>특징 태그</label><input type="text" name="tags" value="' + esc((f.tags || []).join(', ')) + '" placeholder="쉼표로 구분: 주차 편리, 가족목 가능"></div>' +
      '<div class="f"><label>답사 메모</label><textarea name="comment" placeholder="직접 가 보고 느낀 점, 진입로, 주차, 분위기 등">' + esc(f.comment) + '</textarea></div>' +
      '<label class="chk"><input type="checkbox" name="featured"' + (f.featured ? ' checked' : '') + '>첫 화면에 추천 시설로 보이기</label>' +
      '<label class="chk"><input type="checkbox" name="visible"' + (f.visible !== false ? ' checked' : '') + '>홈페이지에 공개</label>' +
      (f.sample ? '<div class="warn">예시로 넣어 둔 시설입니다. 내용을 고쳐 저장하면 예시 표시가 사라집니다.</div>' : '');
    openPanel(orig ? '시설 수정' : '시설 추가', html, function (p) {
      photoEditor(p.querySelector('#ph-host'), f.photos, function () {});
    }, {
      okLabel: '저장하고 사이트에 반영',
      ok: function (close) {
        var p = document.querySelector('.panel');
        f.type = val(p, 'type'); f.name = val(p, 'name'); f.area = val(p, 'area'); f.operator = val(p, 'operator'); f.address = val(p, 'address');
        f.price = val(p, 'price'); f.blogUrl = val(p, 'blogUrl'); f.comment = val(p, 'comment'); f.featured = val(p, 'featured'); f.visible = val(p, 'visible');
        f.tags = val(p, 'tags').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
        if (!f.name) { toast('시설 이름을 입력해 주세요.', true); return; }
        delete f.sample;
        var prev = clone(c.facilities);
        if (orig) c.facilities[c.facilities.indexOf(orig)] = f; else c.facilities.unshift(f);
        save().then(function (ok) { if (ok) { close(); renderFacilities(); } else c.facilities = prev; });
      },
      del: orig ? function (close) {
        var prev = clone(c.facilities);
        c.facilities.splice(c.facilities.indexOf(orig), 1);
        c.reviews.forEach(function (r) { if (r.facilityId === orig.id) r.facilityId = ''; });
        save().then(function (ok) { if (ok) { close(); renderFacilities(); } else c.facilities = prev; });
      } : null
    });
  }

  /* ---------- 탭: 고객 후기 ---------- */
  function renderReviews() {
    var c = state.content;
    var list = c.reviews.filter(function (r) { return !state.revFilter || r.type === state.revFilter; })
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    view.innerHTML = '<h2>고객 후기</h2><p class="help">진행한 상담·분양·이장 후기를 올립니다. 고객 이름은 "김OO"처럼 가려서 적어 주세요. "메인 노출"을 켜면 첫 화면에 나옵니다.</p>' +
      '<div class="bar"><div class="chips" id="rev-chips"><button class="chip' + (!state.revFilter ? ' on' : '') + '" data-t="">전체 ' + c.reviews.length + '</button>' +
      TYPE_KEYS.map(function (k) { return '<button class="chip' + (state.revFilter === k ? ' on' : '') + '" data-t="' + k + '">' + typeName(k) + ' ' + c.reviews.filter(function (r) { return r.type === k; }).length + '</button>'; }).join('') +
      '</div><span style="flex:1"></span><button class="btn pri" id="rev-add">＋ 후기 작성</button></div>' +
      '<div class="list">' + (list.length ? list.map(function (r) {
        return '<div class="item"><div class="th" style="' + bg((r.photos && r.photos[0]) || (D.types[r.type] || {}).image || 'img/hero.jpg') + '"></div><div class="tx"><b>' + esc(r.title || '(제목 없음)') + '</b><small>' +
          '<span class="lb">' + typeName(r.type) + '</span>' + (r.featured ? '<span class="lb star">메인 노출</span>' : '') + (r.visible === false ? '<span class="lb hide">숨김</span>' : '') + (r.sample ? '<span class="lb sample">예시</span>' : '') +
          esc(r.author || '') + ' · ' + esc(r.date || '') + '</small></div><button class="btn sm" data-edit="' + esc(r.id) + '">수정</button></div>';
      }).join('') : '<div class="empty">등록된 후기가 없습니다. "＋ 후기 작성"을 눌러 주세요.</div>') + '</div>';
    $('rev-chips').onclick = function (e) { var b = e.target.closest('.chip'); if (b) { state.revFilter = b.dataset.t; renderReviews(); } };
    $('rev-add').onclick = function () { editReview(null); };
    view.querySelectorAll('[data-edit]').forEach(function (b) { b.onclick = function () { editReview(b.dataset.edit); }; });
  }
  function editReview(id) {
    var c = state.content;
    var orig = id ? c.reviews.filter(function (r) { return r.id === id; })[0] : null;
    var today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    var r = orig ? clone(orig) : { id: uid('r'), type: state.revFilter || 'sumok', title: '', author: '', date: today, facilityId: '', body: '', photos: [], featured: true, visible: true };
    var facOpts = '<option value="">선택 안 함</option>' + c.facilities.map(function (f) { return '<option value="' + esc(f.id) + '"' + (f.id === r.facilityId ? ' selected' : '') + '>[' + typeName(f.type) + '] ' + esc(f.name) + '</option>'; }).join('');
    var html =
      '<div class="row2"><div class="f"><label>장지 유형</label>' + typeSelect(r.type) + '</div>' +
      '<div class="f"><label>진행 시설</label><select name="facilityId">' + facOpts + '</select><small>고르면 시설 페이지에 이 후기가 함께 나옵니다.</small></div></div>' +
      '<div class="f"><label>제목 *</label><input type="text" name="title" value="' + esc(r.title) + '" placeholder="예: 어머니를 편안한 숲에 모셨습니다"></div>' +
      '<div class="row2"><div class="f"><label>고객 이름 (가려서)</label><input type="text" name="author" value="' + esc(r.author) + '" placeholder="김OO"></div>' +
      '<div class="f"><label>날짜</label><input type="date" name="date" value="' + esc(r.date) + '"></div></div>' +
      '<div class="f"><label>후기 내용 *</label><textarea name="body" style="min-height:180px" placeholder="고객이 남긴 말씀이나 진행 내용을 적어 주세요">' + esc(r.body) + '</textarea></div>' +
      '<div class="f"><label>블로그 원문 주소 (선택)</label><input type="url" name="blogUrl" value="' + esc(r.blogUrl || '') + '" placeholder="https://blog.naver.com/baewoong0816/..."></div>' +
      '<div class="f"><label>사진</label><div id="ph-host"></div><small>사진이 없으면 진행 시설의 대표 사진이 쓰입니다.</small></div>' +
      '<label class="chk"><input type="checkbox" name="featured"' + (r.featured ? ' checked' : '') + '>첫 화면에 보이기</label>' +
      '<label class="chk"><input type="checkbox" name="visible"' + (r.visible !== false ? ' checked' : '') + '>홈페이지에 공개</label>' +
      '<div class="warn">고객 사진이나 실명을 쓰려면 반드시 고객 동의를 받아 주세요.' + (r.sample ? ' 이 후기는 예시입니다. 실제 후기로 고쳐 저장하면 예시 표시가 사라집니다.' : '') + '</div>';
    openPanel(orig ? '후기 수정' : '후기 작성', html, function (p) {
      photoEditor(p.querySelector('#ph-host'), r.photos, function () {});
    }, {
      okLabel: '저장하고 사이트에 반영',
      ok: function (close) {
        var p = document.querySelector('.panel');
        r.type = val(p, 'type'); r.facilityId = val(p, 'facilityId'); r.title = val(p, 'title'); r.author = val(p, 'author');
        r.date = val(p, 'date'); r.body = val(p, 'body'); r.blogUrl = val(p, 'blogUrl'); r.featured = val(p, 'featured'); r.visible = val(p, 'visible');
        if (!r.title || !r.body) { toast('제목과 내용을 입력해 주세요.', true); return; }
        delete r.sample;
        var prev = clone(c.reviews);
        if (orig) c.reviews[c.reviews.indexOf(orig)] = r; else c.reviews.unshift(r);
        save().then(function (ok) { if (ok) { close(); renderReviews(); } else c.reviews = prev; });
      },
      del: orig ? function (close) {
        var prev = clone(c.reviews);
        c.reviews.splice(c.reviews.indexOf(orig), 1);
        save().then(function (ok) { if (ok) { close(); renderReviews(); } else c.reviews = prev; });
      } : null
    });
  }

  /* ---------- 공용: 폼 필드 → 객체 바인딩 ---------- */
  function bindFields(root, obj, map) {
    root.querySelectorAll('[data-k]').forEach(function (el) {
      var k = el.dataset.k, kind = el.dataset.kind || 'text';
      el.addEventListener('input', function () {
        var v = el.value;
        if (kind === 'lines') obj[k] = lines(v);
        else if (kind === 'pairs') obj[k] = pairsFromLines(v);
        else obj[k] = v;
        setDirty(true);
        if (map && map[k]) map[k](v);
      });
    });
  }
  function fText(label, obj, k, ph, help) { return '<div class="f"><label>' + label + '</label><input type="text" data-k="' + k + '" value="' + esc(obj[k] || '') + '" placeholder="' + esc(ph || '') + '">' + (help ? '<small>' + help + '</small>' : '') + '</div>'; }
  function fArea(label, obj, k, help, kind, h) {
    var v = kind === 'lines' ? (obj[k] || []).join('\n') : kind === 'pairs' ? pairsToLines(obj[k]) : (obj[k] || '');
    return '<div class="f"><label>' + label + '</label><textarea data-k="' + k + '"' + (kind ? ' data-kind="' + kind + '"' : '') + (h ? ' style="min-height:' + h + 'px"' : '') + '>' + esc(v) + '</textarea>' + (help ? '<small>' + help + '</small>' : '') + '</div>';
  }

  /* ---------- 탭: 장지 안내 ---------- */
  function renderTypes() {
    var k = state.typeTab, t = state.content.types[k];
    t.faqs = t.faqs || [];
    if (!t.image) t.image = '';
    var imgArr = t.image ? [t.image] : [];
    view.innerHTML = '<h2>장지 안내</h2><p class="help">유형별 페이지의 설명, 가격, 자주 묻는 질문을 고칩니다. 고친 뒤 아래 "저장하기"를 눌러야 반영됩니다.</p>' +
      '<div class="bar"><div class="chips" id="type-chips">' + TYPE_KEYS.map(function (x) { return '<button class="chip' + (x === k ? ' on' : '') + '" data-t="' + x + '">' + typeName(x) + '</button>'; }).join('') + '</div><a class="btn sm" href="' + D.types[k].path + '" target="_blank">페이지 보기</a></div>' +
      '<div class="card"><h3>' + typeName(k) + ' 기본 안내</h3>' +
        '<div class="f"><label>대표 사진</label><div id="type-img"></div><small>첫 화면 유형 카드와 페이지 상단 배경에 쓰입니다. 없으면 기본 그림이 나옵니다.</small></div>' +
        fText('한 줄 소개', t, 'short') + fArea('설명', t, 'desc', '', '', 120) + fText('가격 꼬리표', t, 'priceTag', '1인 기준 / 가족 단위', '첫 화면 가격 카드 위의 검은 꼬리표') +
        '<div class="row2">' + fText(k === 'ijang' ? '비용 안내 (크게 표시)' : '평균 가격 (크게 표시)', t, 'price', '예: 300~800만원') + fText('가격 설명', t, 'priceNote', '예: 위치·1인/가족에 따라 달라집니다') + '</div></div>' +
      (k === 'ijang' ?
        '<div class="card"><h3>이장·파묘 내용</h3>' + fArea('이런 경우 상담받으세요', t, 'reasons', '한 줄에 하나씩', 'lines') + fArea('진행 절차', t, 'steps', '한 줄에 하나씩, "제목 | 설명" 형식', 'pairs', 150) + '</div>' :
        '<div class="card"><h3>특징</h3>' + fArea('좋은 점', t, 'pros', '한 줄에 하나씩', 'lines') + fArea('미리 알아두실 점', t, 'cons', '한 줄에 하나씩', 'lines') + fArea('이런 분께 추천', t, 'recommend', '한 줄에 하나씩', 'lines') + '</div>') +
      '<div class="card"><h3>자주 묻는 질문</h3><div class="pairs" id="faqs"></div><button class="btn sm" id="faq-add">＋ 질문 추가</button></div>';
    $('type-chips').onclick = function (e) { var b = e.target.closest('.chip'); if (b) { state.typeTab = b.dataset.t; renderTypes(); } };
    bindFields(view, t);
    photoEditor($('type-img'), imgArr, function () { t.image = imgArr[0] || ''; setDirty(true); }, true);
    function drawFaqs() {
      var host = $('faqs');
      host.innerHTML = t.faqs.map(function (f, i) { return '<div class="pair"><input data-i="' + i + '" data-f="q" value="' + esc(f.q) + '" placeholder="질문"><textarea data-i="' + i + '" data-f="a" placeholder="답변">' + esc(f.a) + '</textarea><button class="btn sm del x" data-rm="' + i + '">삭제</button></div>'; }).join('') || '<p class="help">질문이 없습니다.</p>';
      host.querySelectorAll('[data-f]').forEach(function (el) { el.oninput = function () { t.faqs[+el.dataset.i][el.dataset.f] = el.value; setDirty(true); }; });
      host.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { t.faqs.splice(+b.dataset.rm, 1); setDirty(true); drawFaqs(); }; });
    }
    drawFaqs();
    $('faq-add').onclick = function () { t.faqs.push({ q: '', a: '' }); setDirty(true); drawFaqs(); };
  }

  /* ---------- 탭: 기본 정보 ---------- */
  function renderSite() {
    var c = state.content, s = c.site;
    var hero = s.heroImage ? [s.heroImage] : [], logo = s.logo ? [s.logo] : [];
    view.innerHTML = '<h2>기본 정보</h2><p class="help">상호, 전화번호, 첫 화면 문구 등 사이트 전체에 쓰이는 정보입니다. 고친 뒤 아래 "저장하기"를 눌러야 반영됩니다.</p>' +
      '<div class="card"><h3>연락처</h3><div class="row2">' + fText('상호 (사이트 이름)', s, 'name') + fText('대표 상담 전화', s, 'phone', '070-0000-0000', '모든 전화 버튼이 이 번호로 연결됩니다.') + '</div>' +
        '<div class="row2">' + fText('한 줄 소개 (로고 옆)', s, 'slogan', '장지 안심 동행 서비스') + fText('상담 시간', s, 'hours', '연중무휴 상담') + '</div>' +
        '<div class="row2">' + fText('카카오톡 채널 주소', s, 'kakao', 'https://pf.kakao.com/...', '비워 두면 카톡 버튼이 숨겨집니다.') + fText('블로그 주소', s, 'blogUrl', 'https://blog.naver.com/...') + '</div>' +
        fText('장례지원금 신청서 주소', s, 'supportFormUrl', 'https://naver.me/...', '첫 화면 "장례지원금" 띠의 버튼이 이 주소로 연결됩니다. 비우면 띠가 숨겨집니다.') +
        fText('문의 알림 받을 이메일', s, 'notifyEmail', 'example@naver.com', '홈페이지 문의가 들어오면 이 주소로 알림 메일을 보냅니다 (카페24 서버에서 동작).') + '</div>' +
      '<div class="card"><h3>로고</h3><div id="logo-host"></div><p class="help" style="margin-top:8px">정사각형 또는 육각형 마크(PNG, 배경 투명) 권장. 상호 글자 옆에 작게 나옵니다.</p></div>' +
      '<div class="card"><h3>첫 화면</h3><div class="f"><label>카드 뉴스 첫 장 사진</label><div id="hero-host"></div><small>세로가 긴 사진 권장. 2장째부터는 수목장·봉안당·공원묘지 대표 사진이 자동으로 쓰입니다.</small></div>' +
        fArea('카드 뉴스 (슬라이드)', s, 'cards', '한 줄에 한 장씩, "제목 | 설명" 형식. 최대 6장. 버튼·연결 페이지·사진은 기본 카드 순서(소개 → 수목장 → 봉안당 → 공원묘지 → 동행 답사 → 이장)를 따릅니다.', 'pairs', 150) +
        fArea('서비스 이용 안내 (4단계)', s, 'steps', '한 줄에 하나씩, "제목 | 설명" 형식', 'pairs', 120) +
        fArea('배웅의 약속', s, 'why', '한 줄에 하나씩, "제목 | 설명" 형식', 'pairs', 110) +
        fArea('맨 아래 상담 문구', s, 'finalTitle', '', '', 60) + '</div>' +
      '<div class="card"><h3>첫 화면 자주 묻는 질문</h3><div class="pairs" id="gfaqs"></div><button class="btn sm" id="gfaq-add">＋ 질문 추가</button></div>' +
      '<div class="card"><h3>장례정보 (블로그 글 링크)</h3><p class="help">첫 화면 "배웅이 알려드리는 장례정보"에 나오는 글입니다. 블로그 글 주소와 제목을 넣으세요.</p><div class="pairs" id="arts"></div><button class="btn sm" id="art-add">＋ 글 추가</button></div>' +
      '<div class="card"><h3>상담 지역</h3>' + fArea('지역 목록', s, 'regions', '한 줄에 하나씩. 상담 신청서의 지역 선택지에 쓰입니다.', 'lines', 120) + '</div>' +
      '<div class="card"><h3>사업자 정보 (맨 아래 표시)</h3><div class="row2">' + fText('사업자명', s, 'bizName') + fText('업종 소개', s, 'bizDesc') + '</div><div class="row2">' + fText('대표자', s, 'ceo') + fText('사업자등록번호', s, 'bizNo') + '</div><div class="row2">' + fText('주소', s, 'address') + fText('이메일', s, 'email') + '</div></div>';
    bindFields(view, s, { name: function (v) { $('top-name').textContent = v + ' 관리자'; } });
    photoEditor($('hero-host'), hero, function () { s.heroImage = hero[0] || ''; setDirty(true); }, true);
    photoEditor($('logo-host'), logo, function () { s.logo = logo[0] || ''; setDirty(true); }, 'logo');
    function drawFaqs() {
      var host = $('gfaqs');
      host.innerHTML = c.faqs.map(function (f, i) { return '<div class="pair"><input data-i="' + i + '" data-f="q" value="' + esc(f.q) + '" placeholder="질문"><textarea data-i="' + i + '" data-f="a" placeholder="답변">' + esc(f.a) + '</textarea><button class="btn sm del x" data-rm="' + i + '">삭제</button></div>'; }).join('') || '<p class="help">질문이 없습니다.</p>';
      host.querySelectorAll('[data-f]').forEach(function (el) { el.oninput = function () { c.faqs[+el.dataset.i][el.dataset.f] = el.value; setDirty(true); }; });
      host.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { c.faqs.splice(+b.dataset.rm, 1); setDirty(true); drawFaqs(); }; });
    }
    function drawArts() {
      var host = $('arts');
      host.innerHTML = c.articles.map(function (a, i) { return '<div class="pair"><input data-i="' + i + '" data-f="title" value="' + esc(a.title) + '" placeholder="글 제목"><input data-i="' + i + '" data-f="url" value="' + esc(a.url) + '" placeholder="https://blog.naver.com/..."><input data-i="' + i + '" data-f="date" type="date" value="' + esc(a.date || '') + '"><button class="btn sm del x" data-rm="' + i + '">삭제</button></div>'; }).join('') || '<p class="help">등록된 글이 없습니다.</p>';
      host.querySelectorAll('[data-f]').forEach(function (el) { el.oninput = function () { c.articles[+el.dataset.i][el.dataset.f] = el.value; setDirty(true); }; });
      host.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { c.articles.splice(+b.dataset.rm, 1); setDirty(true); drawArts(); }; });
    }
    drawFaqs(); drawArts();
    $('gfaq-add').onclick = function () { c.faqs.push({ q: '', a: '' }); setDirty(true); drawFaqs(); };
    $('art-add').onclick = function () { c.articles.unshift({ title: '', url: '', image: '', date: '' }); setDirty(true); drawArts(); };
  }

  /* ---------- 탭: 설정 ---------- */
  function renderSettings() {
    var c = state.content;
    var samples = c.facilities.filter(function (f) { return f.sample; }).length + c.reviews.filter(function (r) { return r.sample; }).length;
    view.innerHTML = '<h2>설정</h2>' +
      '<div class="card"><h3>예시 자료 정리</h3><p class="help">처음 만들 때 넣어 둔 예시 시설·후기가 ' + samples + '개 남아 있습니다. 실제 자료를 올린 뒤 한꺼번에 지울 수 있습니다.</p><button class="btn del" id="rm-samples"' + (samples ? '' : ' disabled') + '>예시 자료 모두 지우기</button></div>' +
      '<div class="card"><h3>관리자 비밀번호 변경</h3><div class="f"><label>현재 비밀번호</label><input type="password" id="pw-cur" autocomplete="current-password"></div>' +
      '<div class="f"><label>새 비밀번호 (8자 이상)</label><input type="password" id="pw-new" autocomplete="new-password"></div><button class="btn pri" id="pw-btn">비밀번호 바꾸기</button></div>' +
      '<div class="card"><h3>도움말</h3><p class="help" style="margin:0">· 사진은 휴대폰에서 바로 올릴 수 있습니다. 아이폰 HEIC 사진이 안 올라가면 설정 › 카메라 › 포맷 › "높은 호환성"으로 바꿔 주세요.<br>· 저장하면 홈페이지에 바로 반영됩니다. 안 보이면 새로 고침해 주세요.<br>· 비밀번호를 잊으면 제작사에 요청해 서버의 admin/auth.php 파일을 지우면 다시 설정할 수 있습니다.</p></div>';
    armButton($('rm-samples'), function () {
      var pf = clone(c.facilities), pr = clone(c.reviews);
      c.facilities = c.facilities.filter(function (f) { return !f.sample; });
      c.reviews = c.reviews.filter(function (r) { return !r.sample; });
      save().then(function (ok) { if (!ok) { c.facilities = pf; c.reviews = pr; } renderSettings(); });
    });
    $('pw-btn').onclick = function () {
      api('password', { current: $('pw-cur').value, password: $('pw-new').value }).then(function (r) {
        if (!r.ok) throw new Error(r.message || r.error); toast('비밀번호를 바꿨습니다.'); $('pw-cur').value = $('pw-new').value = '';
      }).catch(function (e) { toast(e.message, true); });
    };
  }

  /* ---------- 화면 전환 ---------- */
  var RENDER = { inbox: renderInbox, facilities: renderFacilities, reviews: renderReviews, types: renderTypes, site: renderSite, settings: renderSettings };
  function go(tab) {
    state.tab = tab;
    document.querySelectorAll('#tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === tab); });
    $('savebar').classList.toggle('hidden', !(tab === 'types' || tab === 'site'));
    RENDER[tab]();
    try { sessionStorage.setItem('jangji_admin_tab', tab); } catch (e) {}
    window.scrollTo(0, 0);
  }
  $('tabs').onclick = function (e) { var b = e.target.closest('button'); if (b) go(b.dataset.tab); };
  $('save').onclick = save;
  $('preview').onclick = function () {
    try { localStorage.setItem('jangji_preview', JSON.stringify(payload())); } catch (e) { toast('미리보기를 열 수 없습니다.', true); return; }
    window.open('./?preview=1', '_blank');
  };
  $('logout').onclick = function () { api('logout').then(function () { location.reload(); }); };

  function startApp() {
    $('login').classList.add('hidden'); $('app').classList.remove('hidden');
    api('load').then(function (r) {
      state.content = merge(r.ok ? r.content : window.SITE_CONTENT);
      $('top-name').textContent = state.content.site.name + ' 관리자';
      setDirty(false);
      var t = 'inbox'; try { t = sessionStorage.getItem('jangji_admin_tab') || 'inbox'; } catch (e) {}
      go(RENDER[t] ? t : 'inbox');
      loadInbox();
      setInterval(function () { loadInbox(true); }, 30000);
    });
  }

  /* ---------- 로그인 ---------- */
  function showLogin(st) {
    $('app').classList.add('hidden'); $('login').classList.remove('hidden');
    var setup = st && !st.hasPassword;
    $('lg-title').textContent = setup ? '관리자 비밀번호 만들기' : '관리자 로그인';
    $('lg-help').textContent = setup ? '처음 한 번만 설정합니다. 8자 이상으로 정해 주세요.' : '비밀번호를 입력하세요.';
    $('lg-pw2-wrap').classList.toggle('hidden', !setup);
    $('lg-btn').textContent = setup ? '설정하고 시작하기' : '로그인';
    function submit() {
      var pw = $('lg-pw').value, err = $('lg-err'); err.textContent = '';
      if (setup && pw !== $('lg-pw2').value) { err.textContent = '두 비밀번호가 다릅니다.'; return; }
      api(setup ? 'setup' : 'login', { password: pw }).then(function (r) {
        if (!r.ok) { err.textContent = r.message || (r.error === 'short' ? '8자 이상이어야 합니다.' : '로그인하지 못했습니다.'); return; }
        startApp();
      }).catch(function (e) { err.textContent = e.message; });
    }
    $('lg-btn').onclick = submit;
    $('lg-pw').onkeydown = $('lg-pw2').onkeydown = function (e) { if (e.key === 'Enter') submit(); };
    $('lg-pw').focus();
  }

  api('status').then(function (st) {
    if (st.loggedIn) startApp(); else showLogin(st);
  }).catch(function (e) {
    $('login').classList.remove('hidden');
    $('lg-title').textContent = '서버에 연결할 수 없습니다';
    $('lg-help').innerHTML = esc(e.message) + '<br>관리자 기능은 PHP가 되는 카페24 서버나, 로컬 개발 서버(node dev/server.js)에서 동작합니다.';
    $('lg-btn').classList.add('hidden'); $('lg-pw').parentNode.classList.add('hidden');
  });
})();
