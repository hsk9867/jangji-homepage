/* worker.js 를 가짜 D1/R2/ASSETS 로 끝까지 돌려 보는 로컬 테스트.  실행: node dev/test-worker.mjs */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const src = readFileSync(new URL('../worker.js', import.meta.url), 'utf8');
const dir = mkdtempSync(join(tmpdir(), 'bw-'));
const modPath = join(dir, 'worker.mjs');
writeFileSync(modPath, src);
const mod = await import('file://' + modPath.replace(/\\/g, '/'));
const worker = mod.default;

/* ---- 가짜 D1 (쓰는 SQL 문장만 처리) ---- */
function fakeD1() {
  const settings = new Map(), inquiries = [], frev = [];
  function stmt(sql) {
    let args = [];
    const s = sql.replace(/\s+/g, ' ').trim();
    const api = {
      bind(...a) { args = a; return api; },
      async first() {
        if (/^SELECT value FROM settings/.test(s)) return settings.has(args[0]) ? { value: settings.get(args[0]) } : null;
        if (/^SELECT COUNT\(\*\) AS n FROM inquiries/.test(s)) return { n: inquiries.filter(r => r.ip_hash === args[0]).length };
        if (/^SELECT COUNT\(\*\) AS n FROM facility_reviews/.test(s)) return { n: frev.filter(r => r.ip_hash === args[0]).length };
        if (/^SELECT data FROM facility_reviews/.test(s)) { const r = frev.find(x => x.id === args[0]); return r ? { data: r.data } : null; }
        if (/^SELECT id FROM inquiries/.test(s)) return inquiries.find(r => r.id === args[0]) ? { id: args[0] } : null;
        throw new Error('first? ' + s);
      },
      async run() {
        if (/^INSERT INTO settings/.test(s)) { settings.set(args[0], args[1]); return { success: true }; }
        if (/^DELETE FROM settings/.test(s)) { settings.delete(args[0]); return { success: true }; }
        if (/^INSERT INTO inquiries/.test(s)) { inquiries.unshift({ id: args[0], received_at: args[1], status: args[2], ip_hash: args[3], data: args[4], admin_note: null, updated_at: null }); return { success: true }; }
        if (/^INSERT INTO facility_reviews/.test(s)) { frev.unshift({ id: args[0], facility: args[1], created_at: args[2], status: args[3], ip_hash: args[4], data: args[5] }); return { success: true }; }
        if (/^DELETE FROM facility_reviews/.test(s)) { const i = frev.findIndex(r => r.id === args[0]); if (i >= 0) frev.splice(i, 1); return { success: true }; }
        if (/^UPDATE facility_reviews SET status/.test(s)) { const r = frev.find(x => x.id === args[1]); r.status = args[0]; return { success: true }; }
        if (/^DELETE FROM inquiries/.test(s)) { const i = inquiries.findIndex(r => r.id === args[0]); if (i >= 0) inquiries.splice(i, 1); return { success: true }; }
        if (/^UPDATE inquiries SET/.test(s)) {
          const r = inquiries.find(x => x.id === args[args.length - 1]); const cols = s.match(/SET (.*) WHERE/)[1].split(',').map(x => x.trim());
          let ai = 0; for (const c of cols) { if (c.startsWith('status')) r.status = args[ai++]; else if (c.startsWith('admin_note')) r.admin_note = args[ai++]; else if (c.startsWith('updated_at')) r.updated_at = 'now'; }
          return { success: true };
        }
        throw new Error('run? ' + s);
      },
      async all() {
        if (/FROM facility_reviews WHERE status = '게시' AND facility/.test(s)) return { results: frev.filter(r => r.status === '게시' && r.facility === args[0]) };
        if (/FROM facility_reviews WHERE status = '게시'/.test(s)) return { results: frev.filter(r => r.status === '게시') };
        if (/^SELECT id, facility, created_at, status, data FROM facility_reviews/.test(s)) return { results: frev.slice() };
        if (/^SELECT data, status, admin_note, updated_at FROM inquiries/.test(s)) return { results: inquiries.slice() };
        throw new Error('all? ' + s);
      }
    };
    return api;
  }
  return { prepare: stmt, _settings: settings, _inq: inquiries };
}
/* ---- 가짜 R2 ---- */
function fakeR2() {
  const m = new Map();
  return {
    async delete(k) { m.delete(k); },
    async put(k, bytes, opt) { m.set(k, { bytes, ct: opt?.httpMetadata?.contentType }); },
    async get(k) { const o = m.get(k); if (!o) return null; return { body: o.bytes, httpEtag: '"x"', writeHttpMetadata(h) { if (o.ct) h.set('Content-Type', o.ct); } }; },
    _m: m
  };
}
const env = { DB: fakeD1(), UPLOADS: fakeR2(), ASSETS: { fetch: async (req) => new Response('ASSET:' + new URL(req.url).pathname, { status: 200 }) }, SESSION_SECRET: 'test' };
const ctx = { waitUntil() {} };
let cookie = '';
async function call(action, body, opts = {}) {
  const init = body === undefined ? { method: 'GET' } : { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'JANGJI' } };
  init.headers = Object.assign({}, init.headers, cookie ? { Cookie: cookie } : {}, opts.headers || {});
  const res = await worker.fetch(new Request('https://x.test/admin/api.php?action=' + action, init), env, ctx);
  const sc = res.headers.get('Set-Cookie'); if (sc) cookie = sc.split(';')[0];
  const j = await res.json();
  return j;
}
function ok(name, cond, extra) { console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  ' + JSON.stringify(extra).slice(0, 160) : '')); if (!cond) process.exitCode = 1; }

let r = await call('status'); ok('status before setup', r.ok && r.hasPassword === false && r.loggedIn === false, r);
r = await call('setup', { password: 'short' }); ok('setup short pw rejected', !r.ok && r.error === 'short');
r = await call('setup', { password: 'test-password-1' }); ok('setup ok + cookie', r.ok && cookie.startsWith('JANGJIADMIN='));
r = await call('status'); ok('logged in after setup', r.loggedIn === true && r.hasPassword === true);
const saved = cookie; cookie = '';
r = await call('load'); ok('load without cookie → auth', !r.ok && r.error === 'auth');
r = await call('login', { password: 'wrong-password' }); ok('wrong login', !r.ok && r.error === 'wrong');
r = await call('login', { password: 'test-password-1' }); ok('login ok', r.ok && cookie);
r = await call('save', { content: { site: { name: '배웅<script>', phone: '070-1', kakao: 'http://bad', blogUrl: 'https://blog.naver.com/x', cards: [{ tag: 'a', t: 'b', image: 'img/hero.jpg' }] }, facilities: [{ id: 'bad id!', type: 'zzz', name: 'F', photos: ['uploads/202610/' + 'a'.repeat(20) + '.jpg', '../evil'] }], articles: [{ title: 'T', url: 'https://ok', hidden: true }, { title: 'no url' }] } });
ok('save sanitized', r.ok && r.content.site.name === '배웅<script>' && r.content.site.kakao === '' && r.content.site.blogUrl && /^f-/.test(r.content.facilities[0].id) && r.content.facilities[0].type === 'sumok' && r.content.facilities[0].photos.length === 1 && r.content.articles.length === 1 && r.content.articles[0].hidden === true, r.content && r.content.facilities);
let res = await worker.fetch(new Request('https://x.test/data/content.js'), env, ctx); let txt = await res.text();
ok('content.js dynamic + escaped', txt.startsWith('window.SITE_CONTENT = ') && txt.includes('\\u003cscript') && !txt.includes('<script'), txt.slice(0, 80));
res = await worker.fetch(new Request('https://x.test/data/content.json'), env, ctx); ok('content.json', res.headers.get('Content-Type').includes('json'));
res = await worker.fetch(new Request('https://x.test/index.html'), env, ctx); ok('static passthrough', (await res.text()) === 'ASSET:/index.html');
/* 문의 (로그인 불필요) */
const c2 = cookie; cookie = '';
r = await call('inquiry', { inquiry: { name: '홍길동', phone: '010-1234-5678', type: '수목장', region: '경기 남부', when: '급해요', memo: '문의', page: 'v3' } }, { headers: { 'CF-Connecting-IP': '1.2.3.4' } });
ok('inquiry accepted', r.ok && /^Q/.test(r.id), r);
r = await call('inquiry', { inquiry: { name: '', phone: '1' } }); ok('inquiry invalid rejected', !r.ok && r.error === 'bad_record');
for (let i = 0; i < 9; i++) await call('inquiry', { inquiry: { name: 'n', phone: '010-0000-0000' } }, { headers: { 'CF-Connecting-IP': '1.2.3.4' } });
r = await call('inquiry', { inquiry: { name: 'n', phone: '010-0000-0000' } }, { headers: { 'CF-Connecting-IP': '1.2.3.4' } }); ok('rate limit after 10/h', !r.ok && r.error === 'rate_limited', r);
cookie = c2;
r = await call('inbox'); ok('inbox lists inquiries, no ipHash', r.ok && r.inquiries.length === 10 && r.inquiries[0].status === '신규' && !('ipHash' in r.inquiries[0]), r.inquiries && r.inquiries[0]);
const qid = r.inquiries[r.inquiries.length - 1].id;
r = await call('inbox_update', { id: qid, status: '완료', note: '통화함' }); ok('inbox_update', r.ok);
r = await call('inbox'); const upd = r.inquiries.find(x => x.id === qid); ok('status/note persisted', upd.status === '완료' && upd.adminNote === '통화함', upd);
r = await call('inbox_update', { id: qid, delete: true }); r = await call('inbox'); ok('delete', r.inquiries.length === 9);
/* 업로드: 1x1 PNG, 작은 JPEG 헤더 */
const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
r = await call('upload', { data: 'data:image/png;base64,' + png }); ok('upload png', r.ok && /^uploads\/\d{6}\/[a-f0-9]{20}\.png$/.test(r.path) && r.width === 1 && r.height === 1, r);
res = await worker.fetch(new Request('https://x.test/' + r.path), env, ctx); ok('serve upload from R2', res.status === 200 && res.headers.get('Content-Type') === 'image/png' && res.headers.get('Cache-Control').includes('immutable'));
res = await worker.fetch(new Request('https://x.test/uploads/202610/evil.txt'), env, ctx); ok('bad upload path 404', res.status === 404);
r = await call('upload', { data: 'data:image/png;base64,QUJDRA==' }); ok('non-image rejected', !r.ok && r.error === 'bad_image', r);
const jpg = Buffer.from('ffd8ffe000104a46494600010100000100010000ffc0001108000a0014030122000211010311010000', 'hex').toString('base64');
r = await call('upload', { data: 'data:image/jpeg;base64,' + jpg }); ok('jpeg dims parsed (20x10)', r.ok && r.width === 20 && r.height === 10, r);
r = await call('password', { current: 'nope', password: 'new-password-22' }); ok('password change wrong current', !r.ok && r.error === 'wrong');
r = await call('password', { current: 'test-password-1', password: 'new-password-22' }); ok('password changed', r.ok);
r = await call('status'); ok('still logged in after change (new cookie)', r.loggedIn === true);
cookie = saved; r = await call('status'); ok('old cookie invalid after password change', r.loggedIn === false);
r = await call('logout'); ok('logout', r.ok);
res = await worker.fetch(new Request('https://x.test/admin/api.php?action=save', { method: 'POST', body: '{}' }), env, ctx); r = await res.json(); ok('POST without JANGJI header rejected', !r.ok && r.error === 'bad_request');
console.log('done');

/* ---- 시설 리뷰 ---- */
{
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  cookie = ''; await call('login', { password: 'new-password-22' }); const adminCookie = cookie; cookie = '';
  let r = await call('review_submit', { review: { facility: 'muryang', name: '홍길동', text: '짧음', keywords: ['조용해요'] } });
  ok('review short text rejected', !r.ok && r.error === 'bad_record', r);
  r = await call('review_submit', { review: { facility: 'muryang', name: '홍길동', text: '경치가 좋고 조용해서 마음에 들었습니다.', keywords: ['없는 키워드'] } });
  ok('review needs valid keyword', !r.ok && r.error === 'bad_record', r);
  r = await call('review_submit', { review: { facility: 'muryang', name: '홍길동', text: '경치가 좋고 조용해서 마음에 들었습니다.', keywords: ['조용해요', '경치가 좋아요', '가짜'], photos: [png] } }, { headers: { 'CF-Connecting-IP': '5.6.7.8' } });
  ok('review submitted', r.ok && /^R/.test(r.id), r);
  const rid = r.id;
  r = await call('review_list?x=1&facility=muryang'.replace('?x=1', ''));
  ok('pending review hidden from public', r.ok && r.reviews.length === 0, r);
  r = await call('review_admin'); ok('review_admin needs login', !r.ok && r.error === 'auth');
  cookie = adminCookie;
  r = await call('review_admin');
  ok('admin sees review (masked name, photo, filtered keywords)', r.ok && r.reviews[0].name === '홍○○' && r.reviews[0].photos.length === 1 && r.reviews[0].keywords.join() === '조용해요,경치가 좋아요', r.reviews && r.reviews[0]);
  r = await call('review_update', { id: rid, status: '게시' }); ok('approve', r.ok);
  cookie = '';
  const res2 = await worker.fetch(new Request('https://x.test/admin/api.php?action=review_list&facility=muryang'), env, ctx); r = await res2.json();
  ok('approved review public', r.ok && r.reviews.length === 1 && r.reviews[0].text.startsWith('경치'), r);
  cookie = adminCookie;
  const before = env.UPLOADS._m.size; r = await call('review_update', { id: rid, delete: true }); ok('delete review + photo', r.ok && env.UPLOADS._m.size === before - 1, [before, env.UPLOADS._m.size]);
  r = await call('save', { content: { facilities: [{ id: 'aa', type: 'napgol', name: 'A', keywords: ['경치가 좋아요', '조용해요'], types: ['napgol', 'sumok', 'xx'], religion: '불교' }] } });
  ok('save keeps keywords/types/religion', r.ok && r.content.facilities[0].keywords.length === 2 && r.content.facilities[0].types.join() === 'napgol,sumok' && r.content.facilities[0].religion === '불교', r.content && r.content.facilities);
}
