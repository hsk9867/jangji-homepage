/* 배웅 홈페이지 — Cloudflare Worker
   - 정적 파일은 Workers Static Assets(env.ASSETS)로 그대로 서빙
   - admin/api.php 와 같은 주소·같은 응답 형식으로 관리자 API 를 제공 (admin.js 수정 없음)
   - 콘텐츠: D1 settings 테이블 (key 'content') → /data/content.js, /data/content.json 을 동적으로 생성
   - 사진: R2 (UPLOADS) → /uploads/연월/파일명
   - 문의: D1 inquiries, 알림 메일은 Resend(선택: RESEND_API_KEY, MAIL_FROM)
   - 로그인: PBKDF2 비밀번호 해시(settings 'auth') + HMAC 서명 쿠키 JANGJIADMIN */

const COOKIE = 'JANGJIADMIN';
const SESSION_HOURS = 12;
const TYPE_KEYS = ['sumok', 'napgol', 'maejang', 'ijang'];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname;
    try {
      if (p === '/admin/api.php' || p.startsWith('/api/')) return await api(request, env, ctx, url);
      if (p === '/data/content.js' || p === '/data/content.json') return await contentFile(request, env, p);
      if (p.startsWith('/uploads/')) return await serveUpload(request, env, p);
      if (p === '/admin/' || p === '/admin') return Response.redirect(url.origin + '/admin.html', 302);
    } catch (e) {
      return json({ ok: false, error: 'server', message: String(e && e.message || e) }, 500);
    }
    return env.ASSETS.fetch(request);
  }
};

/* ---------- 응답 도우미 ---------- */
function json(obj, status, extraHeaders) {
  const h = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  if (extraHeaders) for (const [k, v] of Object.entries(extraHeaders)) h.append(k, v);
  return new Response(JSON.stringify(obj), { status: status || 200, headers: h });
}
class Fail extends Error { constructor(err, msg) { super(msg || err); this.err = err; this.msg = msg || ''; } }
const fail = (err, msg) => { throw new Fail(err, msg); };

/* ---------- D1 settings ---------- */
async function getSetting(env, key) {
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first();
  if (!row) return null;
  try { return JSON.parse(row.value); } catch (e) { return null; }
}
async function setSetting(env, key, value) {
  await env.DB.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
    .bind(key, JSON.stringify(value)).run();
}
async function delSetting(env, key) { await env.DB.prepare('DELETE FROM settings WHERE key = ?').bind(key).run(); }

/* ---------- 암호화 도우미 ---------- */
const enc = new TextEncoder();
function hex(buf) { return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''); }
function randHex(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return hex(a); }
async function pbkdf2(password, saltHex, iterations) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const salt = new Uint8Array(saltHex.match(/../g).map(h => parseInt(h, 16)));
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return hex(bits);
}
async function makeAuth(password) {
  const salt = randHex(16), iterations = 100000;
  return { salt, iterations, hash: await pbkdf2(password, salt, iterations), setAt: new Date().toISOString() };
}
async function verifyPw(auth, password) {
  if (!auth || !auth.salt || !auth.hash) return false;
  const h = await pbkdf2(password, auth.salt, auth.iterations || 100000);
  return timingSafeEqual(h, auth.hash);
}
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0;
}
async function hmac(keyStr, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(keyStr), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}
async function sha256(s) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }

/* ---------- 세션 쿠키 ---------- */
function sessionKey(auth, env) { return (env.SESSION_SECRET || '') + '|' + auth.salt + '|' + auth.hash; }
async function sessionCookie(auth, env) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_HOURS * 3600;
  const sig = await hmac(sessionKey(auth, env), 'session|' + exp);
  return `${COOKIE}=${exp}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}`;
}
const clearCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
async function isLogged(request, auth, env) {
  if (!auth) return false;
  const m = (request.headers.get('Cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=(\\d+)\\.([a-f0-9]{64})'));
  if (!m) return false;
  const exp = parseInt(m[1], 10);
  if (!exp || exp < Math.floor(Date.now() / 1000)) return false;
  const sig = await hmac(sessionKey(auth, env), 'session|' + exp);
  return timingSafeEqual(sig, m[2]);
}

/* ---------- 문자열 정리 (PHP 판과 같은 규칙) ---------- */
function cleanStr(v, max) { return String(v == null ? '' : v).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim().slice(0, max || 300); }
function cleanPath(p) { p = cleanStr(p, 200); return /^(uploads\/\d{6}\/[a-f0-9]{16,40}\.(jpg|png|webp)|img\/(?:(?:fac|rev|art)\/)?[a-z0-9_.-]+\.(svg|png|jpg|webp))$/.test(p) ? p : ''; }
function cleanUrl(u) { u = cleanStr(u, 400); return /^https:\/\/[^\s"<>]+$/.test(u) ? u : ''; }
function cleanList(arr, n, max) { return (Array.isArray(arr) ? arr : []).slice(0, n).map(v => cleanStr(v, max)).filter(Boolean); }
function cleanPairs(arr, n, tMax, dMax) { return (Array.isArray(arr) ? arr : []).slice(0, n).filter(r => r && typeof r === 'object').map(r => ({ t: cleanStr(r.t, tMax), d: cleanStr(r.d, dMax) })); }
function cleanItem(x, fields, long) { const o = {}; for (const k of fields) if (x[k] != null) o[k] = cleanStr(x[k], ['body', 'comment', 'desc'].includes(k) ? long : 300); return o; }

function sanitizeContent(c) {
  const out = {};
  if (c.site && typeof c.site === 'object') {
    const s = c.site, o = {};
    for (const k of ['name', 'slogan', 'phone', 'hours', 'notifyEmail', 'bizName', 'bizDesc', 'ceo', 'bizNo', 'address', 'email', 'heroEyebrow', 'heroTitle', 'heroSub', 'finalTitle', 'naverMapKey']) if (s[k] != null) o[k] = cleanStr(s[k], 400);
    for (const k of ['logo', 'heroImage']) if (s[k] != null) o[k] = cleanPath(s[k]);
    for (const k of ['kakao', 'blogUrl', 'supportFormUrl']) if (s[k] != null) o[k] = cleanUrl(s[k]);
    for (const k of ['heroBadges', 'regions']) if (Array.isArray(s[k])) o[k] = cleanList(s[k], 30, 60);
    for (const k of ['why', 'steps']) if (Array.isArray(s[k])) o[k] = cleanPairs(s[k], 10, 80, 300);
    if (Array.isArray(s.cards)) o.cards = s.cards.slice(0, 12).filter(x => x && typeof x === 'object').map(x => ({ tag: cleanStr(x.tag, 40), t: cleanStr(x.t, 120), d: cleanStr(x.d, 300), btn: cleanStr(x.btn, 40), href: cleanStr(x.href, 120), image: cleanPath(x.image) }));
    out.site = o;
  }
  if (c.types && typeof c.types === 'object') {
    out.types = {};
    for (const key of TYPE_KEYS) {
      const t = c.types[key]; if (!t || typeof t !== 'object') continue;
      const o = cleanItem(t, ['short', 'desc', 'price', 'priceNote', 'priceTag'], 3000);
      if (t.image != null) o.image = cleanPath(t.image);
      for (const k of ['pros', 'cons', 'recommend', 'reasons']) if (Array.isArray(t[k])) o[k] = cleanList(t[k], 20, 200);
      if (Array.isArray(t.faqs)) o.faqs = t.faqs.slice(0, 30).filter(f => f && typeof f === 'object').map(f => ({ q: cleanStr(f.q, 200), a: cleanStr(f.a, 1500) }));
      if (Array.isArray(t.steps)) o.steps = cleanPairs(t.steps, 12, 80, 300);
      out.types[key] = o;
    }
  }
  const lists = { facilities: ['id', 'type', 'name', 'area', 'address', 'operator', 'price', 'comment'], reviews: ['id', 'type', 'title', 'author', 'date', 'facilityId', 'body'] };
  for (const [listKey, fields] of Object.entries(lists)) {
    if (!Array.isArray(c[listKey])) continue;
    out[listKey] = [];
    for (const x of c[listKey].slice(0, 1000)) {
      if (!x || typeof x !== 'object') continue;
      const o = cleanItem(x, fields, 5000);
      if (!o.id || !/^[a-zA-Z0-9_-]{1,40}$/.test(o.id)) o.id = listKey[0] + '-' + randHex(4);
      if (!TYPE_KEYS.includes(o.type)) o.type = 'sumok';
      o.photos = (Array.isArray(x.photos) ? x.photos : []).slice(0, 30).map(cleanPath).filter(Boolean);
      if (x.blogUrl != null) o.blogUrl = cleanUrl(x.blogUrl);
      if (listKey === 'facilities') o.tags = cleanList(x.tags, 10, 30);
      if (listKey === 'facilities') {
        o.keywords = cleanList(x.keywords, 6, 24);
        if (Array.isArray(x.types)) o.types = x.types.filter(k => TYPE_KEYS.includes(k)).slice(0, 4);
        if (x.religion != null) o.religion = cleanStr(x.religion, 40);
        const lat = Number(x.lat), lng = Number(x.lng);
        if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) { o.lat = Math.round(lat * 1e7) / 1e7; o.lng = Math.round(lng * 1e7) / 1e7; }
        if (Array.isArray(x.priceItems)) o.priceItems = x.priceItems.slice(0, 20).filter(p => p && typeof p === 'object').map(p => ({ label: cleanStr(p.label, 40), price: cleanStr(p.price, 30) })).filter(p => p.label && p.price);
      }
      o.featured = !!x.featured;
      o.visible = x.visible == null ? true : !!x.visible;
      if (x.sample) o.sample = true;
      out[listKey].push(o);
    }
  }
  if (Array.isArray(c.faqs)) out.faqs = c.faqs.slice(0, 40).filter(f => f && typeof f === 'object').map(f => ({ q: cleanStr(f.q, 200), a: cleanStr(f.a, 1500) }));
  if (Array.isArray(c.articles)) {
    out.articles = [];
    for (const a of c.articles.slice(0, 60)) {
      if (!a || typeof a !== 'object') continue;
      const url = cleanUrl(a.url), title = cleanStr(a.title, 200);
      if (!url || !title) continue;
      const it = { title, url, image: cleanPath(a.image), date: cleanStr(a.date, 10) };
      if (a.hidden) it.hidden = true;
      out.articles.push(it);
    }
  }
  return out;
}

/* ---------- /data/content.js(.json) ---------- */
async function contentFile(request, env, p) {
  const c = await getSetting(env, 'content');
  if (!c) return env.ASSETS.fetch(request); // 저장된 적 없으면 저장소의 기본 파일
  const body = JSON.stringify(c).replace(/</g, '\\u003c').replace(/&/g, '\\u0026');
  const isJs = p.endsWith('.js');
  return new Response(isJs ? 'window.SITE_CONTENT = ' + body + ';\n' : body + '\n', {
    headers: { 'Content-Type': isJs ? 'application/javascript; charset=utf-8' : 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
  });
}

/* ---------- /uploads/* (R2) ---------- */
async function serveUpload(request, env, p) {
  const key = decodeURIComponent(p.slice(1));
  if (!/^uploads\/\d{6}\/[a-f0-9]{16,40}\.(jpg|png|webp)$/.test(key)) return new Response('Not found', { status: 404 });
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
  const obj = await env.UPLOADS.get(key);
  if (!obj) return new Response('Not found', { status: 404 });
  const h = new Headers();
  obj.writeHttpMetadata(h);
  h.set('ETag', obj.httpEtag);
  h.set('Cache-Control', 'public, max-age=31536000, immutable');
  if (!h.get('Content-Type')) h.set('Content-Type', key.endsWith('.png') ? 'image/png' : key.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
  return new Response(request.method === 'HEAD' ? null : obj.body, { headers: h });
}

/* ---------- 이미지 검사 ---------- */
function imageInfo(bytes) {
  const b = bytes;
  if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) {
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    return { mime: 'image/png', ext: 'png', width: dv.getUint32(16), height: dv.getUint32(20) };
  }
  if (b.length > 4 && b[0] === 0xFF && b[1] === 0xD8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xFF) { i++; continue; }
      const marker = b[i + 1];
      if (marker === 0xD8 || marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) { i += 2; continue; }
      const len = (b[i + 2] << 8) | b[i + 3];
      if ((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xC7) || (marker >= 0xC9 && marker <= 0xCB) || (marker >= 0xCD && marker <= 0xCF)) {
        return { mime: 'image/jpeg', ext: 'jpg', width: (b[i + 7] << 8) | b[i + 8], height: (b[i + 5] << 8) | b[i + 6] };
      }
      i += 2 + len;
    }
    return { mime: 'image/jpeg', ext: 'jpg', width: 0, height: 0 };
  }
  if (b.length > 30 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    const tag = String.fromCharCode(b[12], b[13], b[14], b[15]);
    let w = 0, h = 0;
    if (tag === 'VP8 ') { w = (b[26] | (b[27] << 8)) & 0x3fff; h = (b[28] | (b[29] << 8)) & 0x3fff; }
    else if (tag === 'VP8L') { const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24); w = (bits & 0x3FFF) + 1; h = ((bits >> 14) & 0x3FFF) + 1; }
    else if (tag === 'VP8X') { w = 1 + (b[24] | (b[25] << 8) | (b[26] << 16)); h = 1 + (b[27] | (b[28] << 8) | (b[29] << 16)); }
    return { mime: 'image/webp', ext: 'webp', width: w, height: h };
  }
  return null;
}
function b64decode(s) { const bin = atob(s); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }

/* ---------- 알림 메일 (Resend) ---------- */
async function notify(env, site, rec) {
  const to = String(site.notifyEmail || '').trim();
  if (!env.RESEND_API_KEY || !env.MAIL_FROM || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return;
  const name = site.name || '홈페이지';
  const text = `새 상담 문의가 접수되었습니다.\n\n이름: ${rec.name}\n연락처: ${rec.phone}\n장지 유형: ${rec.type}\n희망 지역: ${rec.region}\n시기: ${rec.when}\n관심 시설: ${rec.facility}\n문의 내용: ${rec.memo}\n\n접수 시각: ${rec.receivedAt}\n관리자 페이지에서 확인하세요.`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { 'Authorization': 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: `${name} <${env.MAIL_FROM}>`, to: [to], subject: `[${name}] 새 상담 문의 - ${rec.name} (${rec.type})`, text })
  }).catch(() => {});
}

/* 고객 리뷰 키워드 (v4/js/app.js REVIEW_KEYWORDS 와 같게 유지) */
const REVIEW_KEYWORDS = ['경치가 좋아요', '조용해요', '주차가 편해요', '관리가 잘 돼요', '시설이 깨끗해요', '찾아가기 쉬워요', '실내가 밝아요', '직원이 친절해요', '산책하기 좋아요', '비용이 합리적이에요', '쉴 공간이 있어요', '자주 찾아뵙기 좋아요', '상담이 꼼꼼했어요', '답사 동행이 든든했어요'];

/* ---------- 관리자 API ---------- */
async function api(request, env, ctx, url) {
  const action = url.searchParams.get('action') || url.pathname.replace(/^\/api\//, '').replace(/\/.*$/, '');
  const method = request.method;
  try {
    if (method !== 'GET' && method !== 'POST') fail('bad_request');
    if (method === 'POST' && request.headers.get('X-Requested-With') !== 'JANGJI') fail('bad_request');
    const auth = await getSetting(env, 'auth');
    const hasPw = !!auth;
    const logged = await isLogged(request, auth, env);
    const needPost = () => { if (method !== 'POST') fail('bad_request'); };
    const needLogin = () => { if (!logged) fail('auth'); };
    const readBody = async (max) => {
      const raw = await request.text();
      if (raw.length > (max || 4 * 1024 * 1024)) fail('too_large', '요청이 너무 큽니다.');
      try { const j = JSON.parse(raw); return j && typeof j === 'object' ? j : {}; } catch (e) { return {}; }
    };

    switch (action) {
      case 'status':
        return json({ ok: true, server: true, hasPassword: hasPw, loggedIn: logged, writable: true, uploadsWritable: !!env.UPLOADS, php: 'cloudflare-workers' });

      case 'setup': {
        needPost();
        if (hasPw) fail('already_set');
        const pw = String((await readBody()).password || '');
        if (pw.length < 8) fail('short', '8자 이상이어야 합니다.');
        const a = await makeAuth(pw);
        await setSetting(env, 'auth', a);
        return json({ ok: true }, 200, { 'Set-Cookie': await sessionCookie(a, env) });
      }
      case 'login': {
        needPost();
        if (!hasPw) fail('no_password');
        const lock = (await getSetting(env, 'lock')) || { fails: 0, until: 0 };
        const now = Math.floor(Date.now() / 1000);
        if (lock.until > now) fail('locked', '로그인 시도가 많아 15분간 잠겼습니다.');
        const pw = String((await readBody()).password || '');
        if (await verifyPw(auth, pw)) {
          await delSetting(env, 'lock');
          return json({ ok: true }, 200, { 'Set-Cookie': await sessionCookie(auth, env) });
        }
        lock.fails = (lock.fails || 0) + 1;
        if (lock.fails >= 8) { lock.fails = 0; lock.until = now + 15 * 60; }
        await setSetting(env, 'lock', lock);
        await new Promise(r => setTimeout(r, 800));
        fail('wrong', '비밀번호가 맞지 않습니다.');
      }
      case 'logout':
        return json({ ok: true }, 200, { 'Set-Cookie': clearCookie });

      case 'password': {
        needPost(); needLogin();
        const b = await readBody();
        if (!(await verifyPw(auth, String(b.current || '')))) fail('wrong', '현재 비밀번호가 맞지 않습니다.');
        const nw = String(b.password || '');
        if (nw.length < 8) fail('short', '8자 이상이어야 합니다.');
        const a = await makeAuth(nw);
        await setSetting(env, 'auth', a);
        return json({ ok: true }, 200, { 'Set-Cookie': await sessionCookie(a, env) });
      }

      /* ---------- 고객 문의 접수 (로그인 불필요) ---------- */
      case 'inquiry': {
        needPost();
        const b = await readBody(20 * 1024);
        const inq = b.inquiry && typeof b.inquiry === 'object' ? b.inquiry : null;
        if (!inq) fail('bad_record');
        const rec = {};
        for (const k of ['type', 'region', 'when', 'name', 'phone', 'facility', 'page']) rec[k] = cleanStr(inq[k], 120);
        rec.memo = cleanStr(inq.memo, 2000);
        if (!rec.name || rec.phone.replace(/[^0-9]/g, '').length < 9) fail('bad_record', '이름과 연락처를 확인해 주세요.');
        const ip = request.headers.get('CF-Connecting-IP') || '';
        const ipHash = (await sha256(ip + '|jangji')).slice(0, 16);
        const cnt = await env.DB.prepare("SELECT COUNT(*) AS n FROM inquiries WHERE ip_hash = ? AND received_at >= datetime('now', '-1 hour')").bind(ipHash).first();
        if (cnt && cnt.n >= 10) fail('rate_limited', '접수가 너무 잦습니다. 전화로 문의해 주세요.');
        rec.id = 'Q' + Date.now().toString(36).toUpperCase() + randHex(2).slice(0, 3);
        rec.receivedAt = new Date().toISOString();
        rec.status = '신규';
        await env.DB.prepare('INSERT INTO inquiries (id, received_at, status, ip_hash, data) VALUES (?, ?, ?, ?, ?)')
          .bind(rec.id, rec.receivedAt, rec.status, ipHash, JSON.stringify(rec)).run();
        const content = (await getSetting(env, 'content')) || {};
        ctx.waitUntil(notify(env, content.site || {}, rec));
        return json({ ok: true, id: rec.id });
      }

      /* ---------- 관리자: 문의 목록 ---------- */
      case 'inbox': {
        needLogin();
        const rows = await env.DB.prepare('SELECT data, status, admin_note, updated_at FROM inquiries ORDER BY received_at DESC LIMIT 3000').all();
        const list = (rows.results || []).map(r => { const d = JSON.parse(r.data); d.status = r.status; if (r.admin_note) d.adminNote = r.admin_note; if (r.updated_at) d.updatedAt = r.updated_at; delete d.ipHash; return d; });
        return json({ ok: true, inquiries: list, now: new Date().toISOString() });
      }
      case 'inbox_update': {
        needPost(); needLogin();
        const b = await readBody();
        const id = cleanStr(b.id, 40); if (!id) fail('bad_request');
        const row = await env.DB.prepare('SELECT id FROM inquiries WHERE id = ?').bind(id).first();
        if (!row) fail('not_found');
        if (b.delete) { await env.DB.prepare('DELETE FROM inquiries WHERE id = ?').bind(id).run(); return json({ ok: true }); }
        const sets = [], vals = [];
        if (b.status != null) { sets.push('status = ?'); vals.push(cleanStr(b.status, 40)); }
        if (b.note != null) { sets.push('admin_note = ?'); vals.push(cleanStr(b.note, 1000)); }
        sets.push("updated_at = datetime('now')");
        vals.push(id);
        await env.DB.prepare('UPDATE inquiries SET ' + sets.join(', ') + ' WHERE id = ?').bind(...vals).run();
        return json({ ok: true });
      }

      /* ---------- 시설 고객 리뷰: 공개 목록 (게시된 것만) ---------- */
      case 'review_list': {
        const fac = cleanStr(url.searchParams.get('facility'), 40);
        const q = fac ? env.DB.prepare("SELECT id, facility, created_at, data FROM facility_reviews WHERE status = '게시' AND facility = ? ORDER BY created_at DESC LIMIT 300").bind(fac)
          : env.DB.prepare("SELECT id, facility, created_at, data FROM facility_reviews WHERE status = '게시' ORDER BY created_at DESC LIMIT 1000");
        const rows = await q.all();
        const list = (rows.results || []).map(r => { const d = JSON.parse(r.data); return { id: r.id, facility: r.facility, date: r.created_at.slice(0, 10), name: d.name, text: d.text, keywords: d.keywords || [], photos: d.photos || [] }; });
        return json({ ok: true, reviews: list });
      }
      /* ---------- 시설 고객 리뷰: 작성 (로그인 불필요, 관리자 승인 후 게시) ---------- */
      case 'review_submit': {
        needPost();
        const b = await readBody(9 * 1024 * 1024);
        const rv = b.review && typeof b.review === 'object' ? b.review : null;
        if (!rv) fail('bad_record');
        const facility = cleanStr(rv.facility, 40);
        if (!/^[a-zA-Z0-9_-]{1,40}$/.test(facility)) fail('bad_record', '시설 정보가 올바르지 않습니다.');
        let name = cleanStr(rv.name, 20) || '고객';
        name = name.length >= 2 ? name[0] + '○'.repeat(Math.min(2, name.length - 1)) : name;
        const text = cleanStr(rv.text, 1000);
        if (text.length < 10) fail('bad_record', '리뷰를 10자 이상 적어 주세요.');
        const keywords = (Array.isArray(rv.keywords) ? rv.keywords : []).map(k => cleanStr(k, 24)).filter(k => REVIEW_KEYWORDS.includes(k)).slice(0, 5);
        if (!keywords.length) fail('bad_record', '키워드를 하나 이상 골라 주세요.');
        const ip = request.headers.get('CF-Connecting-IP') || '';
        const ipHash = (await sha256(ip + '|jangji')).slice(0, 16);
        const cnt = await env.DB.prepare("SELECT COUNT(*) AS n FROM facility_reviews WHERE ip_hash = ? AND created_at >= datetime('now', '-1 hour')").bind(ipHash).first();
        if (cnt && cnt.n >= 5) fail('rate_limited', '잠시 후 다시 시도해 주세요.');
        const photos = [];
        const imgs = (Array.isArray(rv.photos) ? rv.photos : []).slice(0, 3);
        if (imgs.length && !env.UPLOADS) fail('write', '사진 저장소가 연결되지 않았습니다.');
        for (const data of imgs) {
          const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(data || ''));
          if (!m) fail('bad_image', 'JPG, PNG 사진만 올릴 수 있습니다.');
          let bytes; try { bytes = b64decode(m[2]); } catch (e) { fail('bad_image', '사진 데이터가 손상되었습니다.'); }
          if (bytes.length > 3 * 1024 * 1024) fail('bad_image', '사진이 너무 큽니다.');
          const info = imageInfo(bytes); if (!info) fail('bad_image', '사진 파일이 아닙니다.');
          const d = new Date(), sub = d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, '0');
          const key = 'uploads/' + sub + '/' + randHex(10) + '.' + info.ext;
          await env.UPLOADS.put(key, bytes, { httpMetadata: { contentType: info.mime, cacheControl: 'public, max-age=31536000, immutable' } });
          photos.push(key);
        }
        const id = 'R' + Date.now().toString(36).toUpperCase() + randHex(2).slice(0, 3);
        const now = new Date().toISOString();
        await env.DB.prepare('INSERT INTO facility_reviews (id, facility, created_at, status, ip_hash, data) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(id, facility, now, '대기', ipHash, JSON.stringify({ name, text, keywords, photos })).run();
        return json({ ok: true, id });
      }
      /* ---------- 관리자: 리뷰 목록·게시 관리 ---------- */
      case 'review_admin': {
        needLogin();
        const rows = await env.DB.prepare('SELECT id, facility, created_at, status, data FROM facility_reviews ORDER BY created_at DESC LIMIT 2000').all();
        const list = (rows.results || []).map(r => Object.assign({ id: r.id, facility: r.facility, createdAt: r.created_at, status: r.status }, JSON.parse(r.data)));
        return json({ ok: true, reviews: list });
      }
      case 'review_update': {
        needPost(); needLogin();
        const b = await readBody();
        const id = cleanStr(b.id, 40); if (!id) fail('bad_request');
        const row = await env.DB.prepare('SELECT data FROM facility_reviews WHERE id = ?').bind(id).first();
        if (!row) fail('not_found');
        if (b.delete) {
          const d = JSON.parse(row.data);
          if (env.UPLOADS) for (const k of d.photos || []) ctx.waitUntil(env.UPLOADS.delete(k).catch(() => {}));
          await env.DB.prepare('DELETE FROM facility_reviews WHERE id = ?').bind(id).run();
          return json({ ok: true });
        }
        const st = cleanStr(b.status, 10);
        if (!['대기', '게시', '숨김'].includes(st)) fail('bad_request');
        await env.DB.prepare("UPDATE facility_reviews SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(st, id).run();
        return json({ ok: true });
      }

      /* ---------- 관리자: 사진 업로드 (data URL) ---------- */
      case 'upload': {
        needPost(); needLogin();
        if (!env.UPLOADS) fail('write', 'R2 버킷(UPLOADS)이 연결되지 않았습니다.');
        const b = await readBody(12 * 1024 * 1024);
        const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''));
        if (!m) fail('bad_image', 'JPG, PNG, WebP 사진만 올릴 수 있습니다.');
        let bytes; try { bytes = b64decode(m[2]); } catch (e) { fail('bad_image', '사진 데이터가 손상되었습니다.'); }
        if (bytes.length > 8 * 1024 * 1024) fail('bad_image', '사진이 너무 큽니다.');
        const info = imageInfo(bytes);
        if (!info) fail('bad_image', '사진 파일이 아닙니다.');
        const d = new Date(), sub = d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, '0');
        const key = 'uploads/' + sub + '/' + randHex(10) + '.' + info.ext;
        await env.UPLOADS.put(key, bytes, { httpMetadata: { contentType: info.mime, cacheControl: 'public, max-age=31536000, immutable' } });
        return json({ ok: true, path: key, width: info.width, height: info.height });
      }

      /* ---------- 관리자: 콘텐츠 읽기·저장 ---------- */
      case 'load': {
        needLogin();
        return json({ ok: true, content: (await getSetting(env, 'content')) || {} });
      }
      case 'save': {
        needPost(); needLogin();
        const c = (await readBody()).content;
        if (!c || typeof c !== 'object') fail('bad_config', '저장 형식이 올바르지 않습니다.');
        const clean = sanitizeContent(c);
        clean.savedAt = new Date().toISOString();
        await setSetting(env, 'content', clean);
        return json({ ok: true, savedAt: clean.savedAt, content: clean });
      }

      default:
        fail('unknown_action');
    }
  } catch (e) {
    if (e instanceof Fail) return json({ ok: false, error: e.err, message: e.msg });
    return json({ ok: false, error: 'server', message: String(e && e.message || e) }, 500);
  }
}

export { sanitizeContent, imageInfo, cleanPath, cleanUrl };
