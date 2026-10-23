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
// OG 이미지는 scripts/og.html 을 렌더 (새 톤)
const ctx2 = await b.newContext({ viewport: { width: 1200, height: 630 } }); const p2 = await ctx2.newPage();
await p2.goto(new URL('./og.html', import.meta.url).href, { waitUntil: 'networkidle' }); await p2.waitForTimeout(1500); await p2.screenshot({ path: new URL('../public/og.png', import.meta.url).pathname });
await b.close(); console.log(out.join('\n'));
