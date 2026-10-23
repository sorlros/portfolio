import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs'; mkdirSync('/tmp/pf-shots', { recursive: true });
const b = await chromium.launch(); 
const out = [];
for (const [w,h,tag] of [[390,844,'m'],[360,780,'s'],[1440,900,'d']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = []; p.on('console', m => { if (['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text()); }); p.on('pageerror', e => errs.push('pageerror: '+e.message));
  for (const path of ['/', '/work/query-gate', '/work/exploration', '/nope']) {
    await p.goto('http://localhost:4173'+path, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    const sw = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, over: [...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,6).map(e=>e.tagName+'.'+(e.className?.baseVal??e.className)) }));
    out.push(`${tag} ${path}: sw=${sw.sw} iw=${sw.iw} over=${JSON.stringify(sw.over)}`);
    if (tag==='m') await p.screenshot({ path: `/tmp/pf-shots/${tag}${path.replace(/\//g,'_')||'_home'}.png`, fullPage: true });
  }
  if (tag==='m') { await p.goto('http://localhost:4173/'); await p.waitForTimeout(800); await p.click('button.nav__menu'); await p.waitForTimeout(900); await p.screenshot({ path: '/tmp/pf-shots/m_menu.png' }); }
  if (tag==='d') { await p.goto('http://localhost:4173/'); await p.waitForTimeout(1500); await p.screenshot({ path: '/tmp/pf-shots/d_home_top.png' }); }
  out.push(`${tag} console: ${errs.length? errs.join(' | ') : 'clean'}`);
  await ctx.close();
}
// OG 이미지
const ctx = await b.newContext({ viewport: { width: 1200, height: 630 } }); const p = await ctx.newPage();
await p.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@700&family=JetBrains+Mono&display=swap" rel="stylesheet"><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet"><style>body{margin:0;width:1200px;height:630px;background:#F3EFE6;color:#15140F;font-family:'Pretendard Variable',sans-serif;position:relative;overflow:hidden}body:before{content:'';position:absolute;inset:0;background-image:linear-gradient(to bottom,rgba(21,20,15,.06) 1px,transparent 1px);background-size:100% 32px}.m{position:absolute;left:72px;top:64px;font-family:'JetBrains Mono';font-size:18px;letter-spacing:.08em;color:#6F6A5D}h1{position:absolute;left:72px;top:150px;margin:0;font-family:'Noto Serif KR';font-size:92px;line-height:1.04;letter-spacing:-.02em;word-break:keep-all}h1 em{font-style:normal;color:#C8451B}.f{position:absolute;left:72px;bottom:64px;right:72px;border-top:1px solid rgba(21,20,15,.4);padding-top:22px;display:flex;justify-content:space-between;font-size:24px}.f b{font-family:'Noto Serif KR'}</style></head><body><div class="m">GYUCHEOL CHOI — BI / DASHBOARD FULL-STACK</div><h1>운영 DB를 지키면서<br><em>빠르게 보여주는</em><br>BI를 만듭니다.</h1><div class="f"><span><b>최규철</b> · 비즈플러그 GraeEye 전담 개발</span><span>PR 1,114 · 테스트 파일 1,573</span></div></body></html>`, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500); await p.screenshot({ path: new URL('../public/og.png', import.meta.url).pathname });
await b.close(); console.log(out.join('\n'));
