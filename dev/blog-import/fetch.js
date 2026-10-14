// 블로그 글 본문 HTML을 posts/ 에 받아 텍스트·이미지·주소를 뽑아 parsed.json 으로 저장
const fs = require('fs');
const https = require('https');
const posts = require('./posts.json').filter(p => [6, 7, 8, 9].includes(p.cat));
fs.mkdirSync('posts', { recursive: true });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)';

function get(url) {
  return new Promise((ok, no) => {
    https.get(url, { headers: { 'User-Agent': UA } }, res => {
      let b = ''; res.setEncoding('utf8'); res.on('data', c => b += c); res.on('end', () => ok(b));
    }).on('error', no);
  });
}
function text(h) {
  const m = (h.split('se-main-container')[1] || '').split('function ImageLazyLoader')[0];
  return m.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<br\s*\/?>/g, '\n').replace(/<\/p>/g, '\n').replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/​/g, '').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}
function images(h) {
  const m = (h.split('se-main-container')[1] || '');
  const out = [];
  const re = /data-lazy-src="(https:\/\/(?:mblogthumb-phinf|postfiles)\.pstatic\.net\/[^"?]+)/g;
  let x; while ((x = re.exec(m))) if (!out.includes(x[1])) out.push(x[1]);
  return out;
}
(async () => {
  const parsed = [];
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const f = 'posts/' + p.logNo + '.html';
    let h;
    if (fs.existsSync(f)) h = fs.readFileSync(f, 'utf8');
    else { h = await get('https://m.blog.naver.com/PostView.naver?blogId=baewoong0816&logNo=' + p.logNo); fs.writeFileSync(f, h); await new Promise(r => setTimeout(r, 250)); }
    const t = text(h);
    const addr = (t.match(/주소는\s*([^\n]{6,60}?)(?:입니다|이며|이고|에\s|로\s|\.)/) || [])[1] || '';
    parsed.push({ logNo: p.logNo, cat: p.cat, title: p.title, date: p.date, addr: addr.trim(), imgs: images(h), len: t.length, text: t });
    if (i % 50 === 0) console.log(i, '/', posts.length);
  }
  fs.writeFileSync('parsed.json', JSON.stringify(parsed));
  console.log('done', parsed.length, 'with addr', parsed.filter(p => p.addr).length);
})();
