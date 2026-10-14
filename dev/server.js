/* 로컬 확인용 개발 서버. PHP가 없는 PC에서 admin/api.php 와 같은 동작을 흉내 냅니다.
   실행: node dev/server.js  →  http://localhost:8080  (관리자: http://localhost:8080/admin.html)
   실제 서비스는 카페24 PHP 서버의 admin/api.php 가 처리합니다. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8080;
const AUTH = path.join(ROOT, 'admin', 'auth-dev.json');
const INQ = path.join(ROOT, 'admin', 'store', 'inquiries.json');
const CJSON = path.join(ROOT, 'data', 'content.json');
const CJS = path.join(ROOT, 'data', 'content.js');
const sessions = new Set();
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon' };

const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n'); };
const hash = (pw, salt) => crypto.createHash('sha256').update(salt + pw).digest('hex');

function body(req) {
  return new Promise((ok) => { let b = ''; req.on('data', (c) => { b += c; }); req.on('end', () => { try { ok(JSON.parse(b || '{}')); } catch (e) { ok({}); } }); });
}
function cookie(req) { const m = /JANGJIDEV=([a-f0-9]+)/.exec(req.headers.cookie || ''); return m ? m[1] : ''; }

async function api(req, res, action) {
  const send = (o, extra) => { res.writeHead(200, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, extra || {})); res.end(JSON.stringify(o)); };
  const fail = (e, m) => send({ ok: false, error: e, message: m || '' });
  if (req.method === 'POST' && req.headers['x-requested-with'] !== 'JANGJI') return fail('bad_request');
  const logged = sessions.has(cookie(req));
  const login = () => { const id = crypto.randomBytes(16).toString('hex'); sessions.add(id); return { 'Set-Cookie': 'JANGJIDEV=' + id + '; Path=/; HttpOnly; SameSite=Lax' }; };
  const auth = readJson(AUTH, null);
  const b = req.method === 'POST' ? await body(req) : {};
  switch (action) {
    case 'status': return send({ ok: true, server: true, dev: true, hasPassword: !!auth, loggedIn: logged, writable: true, uploadsWritable: true });
    case 'setup':
      if (auth) return fail('already_set');
      if (String(b.password || '').length < 8) return fail('short', '8자 이상이어야 합니다.');
      { const salt = crypto.randomBytes(8).toString('hex'); writeJson(AUTH, { salt, hash: hash(b.password, salt) }); }
      return send({ ok: true }, login());
    case 'login':
      if (!auth) return fail('no_password');
      if (hash(String(b.password || ''), auth.salt) !== auth.hash) return fail('wrong', '비밀번호가 맞지 않습니다.');
      return send({ ok: true }, login());
    case 'logout': sessions.delete(cookie(req)); return send({ ok: true });
    case 'password':
      if (!logged) return fail('auth');
      if (hash(String(b.current || ''), auth.salt) !== auth.hash) return fail('wrong', '현재 비밀번호가 맞지 않습니다.');
      if (String(b.password || '').length < 8) return fail('short', '8자 이상이어야 합니다.');
      { const salt = crypto.randomBytes(8).toString('hex'); writeJson(AUTH, { salt, hash: hash(b.password, salt) }); }
      return send({ ok: true });
    case 'inquiry': {
      const r = b.inquiry || {};
      if (!r.name || String(r.phone || '').replace(/\D/g, '').length < 9) return fail('bad_record', '이름과 연락처를 확인해 주세요.');
      const list = readJson(INQ, []);
      const rec = { type: r.type || '', region: r.region || '', when: r.when || '', name: r.name, phone: r.phone, facility: r.facility || '', page: r.page || '', memo: r.memo || '', id: 'Q' + Date.now().toString(36).toUpperCase(), receivedAt: new Date().toISOString(), status: '신규' };
      list.unshift(rec); writeJson(INQ, list);
      console.log('[문의 접수]', rec.name, rec.phone, rec.type);
      return send({ ok: true, id: rec.id });
    }
    case 'inbox': if (!logged) return fail('auth'); return send({ ok: true, inquiries: readJson(INQ, []), now: new Date().toISOString() });
    case 'inbox_update': {
      if (!logged) return fail('auth');
      let list = readJson(INQ, []); const i = list.findIndex((x) => x.id === b.id);
      if (i < 0) return fail('not_found');
      if (b.delete) list.splice(i, 1); else { if (b.status != null) list[i].status = b.status; if (b.note != null) list[i].adminNote = b.note; list[i].updatedAt = new Date().toISOString(); }
      writeJson(INQ, list); return send({ ok: true });
    }
    case 'upload': {
      if (!logged) return fail('auth');
      const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''));
      if (!m) return fail('bad_image', 'JPG, PNG, WebP 사진만 올릴 수 있습니다.');
      const ext = { jpeg: 'jpg', png: 'png', webp: 'webp' }[m[1]];
      const sub = new Date().toISOString().slice(0, 7).replace('-', '');
      const name = crypto.randomBytes(10).toString('hex') + '.' + ext;
      const dir = path.join(ROOT, 'uploads', sub); fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, name), Buffer.from(m[2], 'base64'));
      return send({ ok: true, path: 'uploads/' + sub + '/' + name });
    }
    case 'load': if (!logged) return fail('auth'); return send({ ok: true, content: readJson(CJSON, {}) });
    case 'save': {
      if (!logged) return fail('auth');
      const c = b.content; if (!c || typeof c !== 'object') return fail('bad_config');
      const keep = {}; ['site', 'types', 'facilities', 'reviews', 'faqs', 'articles'].forEach((k) => { if (c[k] !== undefined) keep[k] = c[k]; });
      keep.savedAt = new Date().toISOString();
      const json = JSON.stringify(keep, null, 2).replace(/</g, '\\u003C').replace(/>/g, '\\u003E').replace(/&/g, '\\u0026');
      fs.writeFileSync(CJSON, json + '\n'); fs.writeFileSync(CJS, 'window.SITE_CONTENT = ' + json + ';\n');
      return send({ ok: true, savedAt: keep.savedAt, content: keep });
    }
    default: return fail('unknown_action');
  }
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/admin/api.php') return api(req, res, u.searchParams.get('action') || '');
  let p = decodeURIComponent(u.pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (p === '/dev/mobile.html') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(fs.readFileSync(path.join(__dirname, 'mobile.html'))); }
  if (!file.startsWith(ROOT) || /[\\/](admin[\\/]store|admin[\\/]auth|dev[\\/]|deploy[\\/]|\.git)/.test(file.slice(ROOT.length))) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('없는 페이지입니다'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, () => console.log('개발 서버: http://localhost:' + PORT + '  (관리자: /admin.html)'));
