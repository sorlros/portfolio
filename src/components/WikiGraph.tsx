import { useEffect, useRef, useState } from 'react';
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type SimulationNodeDatum } from 'd3-force';
import { select } from 'd3-selection';
import 'd3-transition';
import { zoom as d3zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { prefersReducedMotion } from '../lib/smooth';

// 세컨드브레인 위키 그래프 — 옵시디언 그래프뷰처럼 문서를 점, 「관련 문서」 링크를 선으로 그린다.
// 데이터(public/wiki/graph.json)는 볼트에서 민감 문서를 뺀 공개판이다. 섹션이 보일 때 한 번만 받는다.
type Doc = { id: number; t: number; title: string; name: string; path: string; date: string; tags: string[]; body: string };
type Data = { nodes: Doc[]; links: [number, number][]; topics: [string, number][] };
type N = Doc & SimulationNodeDatum & { deg: number; r: number };
type L = { source: N; target: N };

const COLORS = ['#D8FF3D', '#6EA8FF', '#FF8A5B', '#4FD1C5', '#C792EA', '#F7C948', '#FF6B9A', '#7FDBFF', '#9BE564', '#B8A1FF', '#FFB86B', '#8FA3BF'];
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export default function WikiGraph() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const docEl = useRef<HTMLDivElement>(null);
  const api = useRef<{ fit: () => void; reheat: () => void; topic: (t: number | null) => void; search: (q: string) => void } | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);
  const [topic, setTopic] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/wiki/graph.json').then((r) => (r.ok ? r.json() : Promise.reject(r.status))).then((d: Data) => alive && setData(d)).catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!data || !stage.current || !canvas.current || !docEl.current) return;
    const st = stage.current, cv = canvas.current, ctx = cv.getContext('2d')!, tp = tip.current!, dc = docEl.current;
    const nodes: N[] = data.nodes.map((n) => ({ ...n, deg: 0, r: 0 }));
    const nb = new Map<number, Set<number>>(nodes.map((n) => [n.id, new Set()]));
    for (const [a, b] of data.links) { nodes[a].deg++; nodes[b].deg++; nb.get(a)!.add(b); nb.get(b)!.add(a); }
    for (const n of nodes) n.r = 2.6 + Math.sqrt(n.deg) * 1.55;
    const links: L[] = data.links.map(([a, b]) => ({ source: nodes[a], target: nodes[b] }));
    const byName = new Map(nodes.map((n) => [n.name, n]));

    const sim = forceSimulation<N>(nodes)
      .force('link', forceLink<N, L>(links).distance(48).strength(0.55))
      .force('charge', forceManyBody<N>().strength(-46).distanceMax(320))
      .force('x', forceX<N>(0).strength(0.052)).force('y', forceY<N>(0).strength(0.052))
      .force('collide', forceCollide<N>((d) => d.r + 1.5))
      .alphaDecay(0.022);

    let W = 0, H = 0, dpr = 1, t: ZoomTransform = zoomIdentity, hover: N | null = null, sel: N | null = null, drag: N | null = null, tq: number | null = null, q = '';
    let downAt: [number, number] | null = null;
    const match = (n: N) => !q || (n.title + ' ' + n.tags.join(' ') + ' ' + n.name).toLowerCase().includes(q);
    const lit = (n: N) => { const f = hover || sel; if (q && !match(n)) return false; if (tq) return n.t === tq; if (f) return n === f || nb.get(f.id)!.has(n.id); return true; };

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.translate(W / 2 + t.x, H / 2 + t.y); ctx.scale(t.k, t.k);
      const f = hover || sel, focus = f || tq || q;
      for (const l of links) {
        const on = tq ? l.source.t === tq && l.target.t === tq : f ? l.source === f || l.target === f : false;
        ctx.strokeStyle = on ? 'rgba(216,255,61,.75)' : focus ? 'rgba(110,160,255,.06)' : 'rgba(110,160,255,.22)';
        ctx.lineWidth = (on ? 1.3 : 0.8) / Math.max(t.k, 0.6);
        ctx.beginPath(); ctx.moveTo(l.source.x!, l.source.y!); ctx.lineTo(l.target.x!, l.target.y!); ctx.stroke();
      }
      for (const n of nodes) {
        ctx.globalAlpha = lit(n) ? 1 : 0.14;
        ctx.fillStyle = n === hover || n === sel ? '#ffffff' : COLORS[n.t - 1];
        ctx.beginPath(); ctx.arc(n.x!, n.y!, n.r, 0, Math.PI * 2); ctx.fill();
        if (n === hover || n === sel) { ctx.strokeStyle = '#D8FF3D'; ctx.lineWidth = 2 / t.k; ctx.beginPath(); ctx.arc(n.x!, n.y!, n.r + 3 / t.k, 0, Math.PI * 2); ctx.stroke(); }
      }
      // 옵시디언처럼 확대할수록 제목이 드러나고, 초점 문서와 이웃의 제목은 항상 보인다
      ctx.font = `${11 / t.k}px 'Pretendard Variable', -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const zf = Math.max(0, Math.min(1, (t.k - 1.25) / 0.6));
      for (const n of nodes) {
        const near = f && (n === f || nb.get(f.id)!.has(n.id)) && lit(n);
        const a = near ? 1 : f ? 0 : lit(n) ? zf : zf * 0.12;
        if (a <= 0.02) continue;
        ctx.globalAlpha = a; ctx.fillStyle = n === f ? '#D8FF3D' : '#EAF0FF';
        ctx.fillText(n.title.length > 26 ? n.title.slice(0, 25) + '…' : n.title, n.x!, n.y! + n.r + 3 / t.k);
      }
      ctx.globalAlpha = 1;
    }
    const toWorld = (px: number, py: number) => [(px - W / 2 - t.x) / t.k, (py - H / 2 - t.y) / t.k];
    function pick(px: number, py: number) {
      const [x, y] = toWorld(px, py); let best: N | null = null, bd = Infinity;
      for (const n of nodes) { const d = Math.hypot(n.x! - x, n.y! - y); if (d < n.r + 5 / t.k && d < bd) { bd = d; best = n; } }
      return best;
    }
    const zb: ZoomBehavior<HTMLCanvasElement, unknown> = d3zoom<HTMLCanvasElement, unknown>().scaleExtent([0.25, 5])
      .filter((e: MouseEvent) => !(e.type === 'mousedown' && pick(e.offsetX, e.offsetY)) && !e.button)
      .on('zoom', (e) => { t = e.transform; draw(); });
    const cvSel = select(cv).call(zb).on('dblclick.zoom', null);
    const moveTo = (nt: ZoomTransform, ms = 600) => (prefersReducedMotion || !ms ? cvSel.call(zb.transform, nt) : cvSel.transition().duration(ms).call(zb.transform, nt));
    function fit(ms = 600) {
      const xs = nodes.map((n) => n.x!), ys = nodes.map((n) => n.y!);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const k = Math.min(3, 0.9 / Math.max((x1 - x0) / W, (y1 - y0) / H));
      moveTo(zoomIdentity.translate((-(x0 + x1) / 2) * k, (-(y0 + y1) / 2) * k).scale(k), ms);
    }
    function size() { const r = st.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, 2); cv.width = W * dpr; cv.height = H * dpr; draw(); }

    function open(n: N) {
      sel = n; draw();
      const nbrs = [...nb.get(n.id)!].map((id) => nodes[id]);
      const body = n.body.replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g, (_m, a: string, lbl?: string) => {
        const tg = byName.get(a.trim().split('/').pop()!);
        return tg ? `<a class="wl" data-id="${tg.id}">${esc(lbl || tg.title)}</a>` : esc(lbl || a);
      });
      const html = DOMPurify.sanitize(marked.parse(body, { async: false }) as string, { ADD_ATTR: ['data-id'] });
      dc.innerHTML = `<div class="wg__meta">${esc(data!.topics[n.t - 1][0])} · ${esc(n.date || '')}</div>
        <h4 class="wg__dt">${esc(n.title)}</h4>
        <div class="wg__tags">${n.tags.map((x) => `<span>#${esc(x)}</span>`).join('')}</div>
        <p class="wg__nbrs">연결 ${nbrs.length}: ${nbrs.map((x) => `<a data-id="${x.id}">${esc(x.title)}</a>`).join(' · ') || '없음'}</p>
        <div class="wg__md">${html}</div>`;
      dc.scrollTop = 0;
    }
    const onDoc = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>('a[data-id]'); if (!a) return;
      e.preventDefault(); const n = nodes[+a.dataset.id!]; open(n);
      const k = Math.max(t.k, 1.6); moveTo(zoomIdentity.translate(-n.x! * k, -n.y! * k).scale(k), 500);
    };
    const local = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
    const onMove = (e: PointerEvent) => {
      const [px, py] = local(e);
      if (drag) { const [x, y] = toWorld(px, py); drag.fx = x; drag.fy = y; if (prefersReducedMotion) { drag.x = x; drag.y = y; draw(); } return; }
      const n = pick(px, py);
      if (n !== hover) { hover = n; draw(); }
      if (n) { tp.innerHTML = `<b>${esc(n.title)}</b><br>${esc(data!.topics[n.t - 1][0])} · 연결 ${n.deg}`; tp.style.left = px + 'px'; tp.style.top = py + 'px'; tp.style.opacity = '1'; }
      else tp.style.opacity = '0';
    };
    const onDown = (e: PointerEvent) => {
      downAt = [e.clientX, e.clientY];
      const n = pick(...local(e)); if (!n) return;
      drag = n; n.fx = n.x; n.fy = n.y; cv.setPointerCapture(e.pointerId);
      if (!prefersReducedMotion) sim.alphaTarget(0.25).restart();
    };
    const onUp = (e: PointerEvent) => {
      const moved = downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 4;
      if (drag) { const n = drag; n.fx = n.fy = null; drag = null; sim.alphaTarget(0); if (!moved) open(n); }
      else if (!moved && e.type === 'pointerup' && sel) { sel = null; draw(); }
      downAt = null;
    };
    const onLeave = () => { if (!drag) { hover = null; tp.style.opacity = '0'; draw(); } };
    cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp); cv.addEventListener('pointerleave', onLeave);
    dc.addEventListener('click', onDoc);

    api.current = {
      fit: () => fit(),
      reheat: () => { if (prefersReducedMotion) return; for (const n of nodes) { n.x! += (Math.random() - 0.5) * 120; n.y! += (Math.random() - 0.5) * 120; } sim.alpha(0.9).restart(); setTimeout(() => fit(), 1800); },
      topic: (v) => { tq = v; draw(); },
      search: (v) => { q = v.trim().toLowerCase(); draw(); },
    };
    const ro = new ResizeObserver(size); ro.observe(st);
    let timer = 0;
    if (prefersReducedMotion) { sim.stop(); for (let i = 0; i < 400; i++) sim.tick(); size(); fit(0); }
    else { sim.on('tick', draw); size(); timer = window.setTimeout(() => fit(), 2200); }
    return () => {
      sim.stop(); ro.disconnect(); clearTimeout(timer); cvSel.on('.zoom', null);
      cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerdown', onDown);
      cv.removeEventListener('pointerup', onUp); cv.removeEventListener('pointercancel', onUp); cv.removeEventListener('pointerleave', onLeave);
      dc.removeEventListener('click', onDoc); api.current = null;
    };
  }, [data]);

  const nDocs = data?.nodes.length ?? 0, nLinks = data?.links.length ?? 0;
  return (
    <div className="fig corner wg">
      <span className="fig__t">그림 3 — 위키 문서 연결 그래프 · 공개 가능한 문서만</span>
      <div className="wg__grid">
        <div className="wg__stage" ref={stage} data-lenis-prevent="">
          <canvas ref={canvas} aria-label={`위키 문서 ${nDocs}편과 링크 ${nLinks}개의 연결 그래프. 점을 누르면 오른쪽에 문서가 열립니다.`} role="img" />
          <div className="wg__tip" ref={tip} aria-hidden="true" />
          <div className="wg__ctrl">
            <button type="button" onClick={() => api.current?.reheat()}>다시 배치</button>
            <button type="button" onClick={() => api.current?.fit()}>화면 맞춤</button>
          </div>
          <div className="wg__hud">{failed ? '그래프 데이터를 불러오지 못했습니다' : data ? `문서 ${nDocs} · 링크 ${nLinks} · 확대하면 제목이 나타납니다` : '불러오는 중…'}</div>
        </div>
        <aside className="wg__side">
          <input className="wg__q" type="search" placeholder="제목 · 태그 검색" aria-label="위키 문서 제목·태그 검색" onChange={(e) => api.current?.search(e.target.value)} />
          <ul className="wg__legend" role="list" aria-label="주제 — 누르면 그 주제만 강조">
            {data?.topics.map(([name, c], i) => (
              <li key={name}>
                <button type="button" aria-pressed={topic === i + 1} onClick={() => { const v = topic === i + 1 ? null : i + 1; setTopic(v); api.current?.topic(v); }}>
                  <i style={{ background: COLORS[i] }} /><span>{name.replace(/_/g, ' ')}</span><span>{c}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="wg__doc" ref={docEl} data-lenis-prevent="">
            <p className="wg__empty">점을 누르면 문서 제목 · 주제 · 태그 · 연결된 문서 · 본문이 여기에 열립니다. 본문의 링크를 누르면 그 문서로 이동합니다. 보안 관련 문서는 공개판에서 제외했습니다.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
