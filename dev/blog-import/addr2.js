const fs=require('fs');const P=require('./parsed.json');const R=require('./fac-raw.json');
for(const f of R){const texts=P.filter(p=>f.posts.some(x=>x.logNo===p.logNo)).map(p=>p.text).join('\n');
const c={};const re=/((?:경기도|서울특별시|서울시|인천광역시|강원도|강원특별자치도|충청북도|충청남도)\s+[가-힣]+(?:시|군)(?:\s+[가-힣]+(?:구|읍|면))?(?:\s+[가-힣0-9]+(?:리|동))?\s+[가-힣0-9]+(?:로|길)(?:\s*[0-9]+번길)?\s*[0-9]+(?:-[0-9]+)?)/g;
let m;while((m=re.exec(texts))){const a=m[1].replace(/\s+/g,' ');c[a]=(c[a]||0)+1;}
const best=Object.entries(c).sort((a,b)=>b[1]-a[1]);f.addr2=best.slice(0,3);console.log(f.id.padEnd(13),JSON.stringify(best.slice(0,2)));}
fs.writeFileSync('fac-raw.json',JSON.stringify(R,null,1));
