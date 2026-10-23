import { useMemo, useState } from 'react';
// 콜센터 샘플 데이터로 "클릭 지점에서 다음 분할 후보를 프로브 수치와 함께 제안"하는 결정적 엔진의 축소판.
type Row = { month: string; line: string; agent: string; ivr: string; calls: number };
const MONTHS = ['01', '02', '03', '04', '05', '06'];
const LINES = ['대표번호', '상담예약', '민원'];
const AGENTS = ['김상담', '이응대', '박안내', '최처리'];
const IVR = ['1 요금', '2 고장', '3 기타'];
function seeded(n: number) { let x = n * 9301 + 49297; return () => { x = (x * 233280 + 1) % 2147483647; return (x % 1000) / 1000; }; }
const rnd = seeded(7);
const DATA: Row[] = [];
for (const month of MONTHS) for (const line of LINES) for (const agent of AGENTS) for (const ivr of IVR) {
  const base = line === '대표번호' ? 60 : line === '민원' ? 25 : 15;
  const spike = month === '04' && line === '민원' && ivr === '2 고장' ? 4 : 1;
  DATA.push({ month, line, agent, ivr, calls: Math.round(base * spike * (0.6 + rnd() * 0.8)) });
}
type Dim = 'month' | 'line' | 'agent' | 'ivr';
const LABEL: Record<Dim, string> = { month: '월', line: '회선', agent: '상담원', ivr: 'IVR 선택' };
function groupBy(rows: Row[], dim: Dim) {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r[dim], (m.get(r[dim]) || 0) + r.calls);
  return [...m.entries()].map(([k, v]) => ({ k, v }));
}
export function ExploreDemo() {
  const [filters, setFilters] = useState<{ dim: Dim; val: string }[]>([]);
  const [dim, setDim] = useState<Dim>('month');
  const rows = useMemo(() => DATA.filter((r) => filters.every((f) => r[f.dim] === f.val)), [filters]);
  const groups = useMemo(() => groupBy(rows, dim), [rows, dim]);
  const max = Math.max(...groups.map((g) => g.v), 1);
  const [picked, setPicked] = useState<string | null>(null);
  const used = new Set<Dim>([dim, ...filters.map((f) => f.dim)]);
  // 후보 = 아직 안 쓴 차원. 프로브 = 선택 막대 안에서 그 차원으로 나눴을 때 조각 수·최대 편중.
  const suggestions = useMemo(() => {
    if (!picked) return [];
    const sub = rows.filter((r) => r[dim] === picked);
    return (['month', 'line', 'agent', 'ivr'] as Dim[]).filter((d) => !used.has(d)).map((d) => {
      const g = groupBy(sub, d); const total = g.reduce((a, b) => a + b.v, 0);
      const top = Math.max(...g.map((x) => x.v));
      const skew = total ? top / total : 0;
      return { d, pieces: g.length, skew, blocked: g.length < 2 ? '조각 1개 — 나눌 수 없음' : null };
    }).sort((a, b) => (a.blocked ? 1 : 0) - (b.blocked ? 1 : 0) || b.skew - a.skew);
  }, [picked, rows, dim, filters]);
  const descend = (d: Dim) => { if (!picked) return; setFilters([...filters, { dim, val: picked }]); setDim(d); setPicked(null); };
  const reset = (i: number) => { const f = filters.slice(0, i); setFilters(f); setDim(i < filters.length ? filters[i].dim : dim); setPicked(null); };
  const W = 560, H = 220, pad = 28, bw = (W - pad * 2) / groups.length;
  return (
    <div className="demo" aria-label="자동 탐색 데모">
      <div className="demo__head"><h3>콜 인입 건수 — 막대를 클릭하면 다음 분할을 제안합니다</h3><small>샘플 데이터 · 결정적 엔진 축소판</small></div>
      <div className="crumbs" aria-label="탐색 경로">
        <button onClick={() => reset(0)}>전체</button>
        {filters.map((f, i) => <span key={i}>› <button onClick={() => reset(i + 1)}>{LABEL[f.dim]}={f.val}</button></span>)}
        <span>› {LABEL[dim]}별</span>
      </div>
      <div className="demo__grid">
        <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${LABEL[dim]}별 콜 인입 막대 차트`}>
          {groups.map((g, i) => {
            const h = (g.v / max) * (H - pad * 2); const x = pad + i * bw + 4; const y = H - pad - h;
            const sel = picked === g.k;
            return (
              <g key={g.k}>
                <rect className="col" x={x} y={y} width={bw - 8} height={h} fill={sel ? 'var(--accent)' : 'var(--fg)'} tabIndex={0} role="button" aria-label={`${g.k}: ${g.v.toLocaleString()}건`} onClick={() => setPicked(g.k)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPicked(g.k); } }} />
                <text x={x + (bw - 8) / 2} y={H - pad + 14} textAnchor="middle">{g.k}</text>
                <text x={x + (bw - 8) / 2} y={y - 4} textAnchor="middle">{g.v.toLocaleString()}</text>
              </g>
            );
          })}
        </svg>
        <div>
          {!picked && <p style={{ fontSize: '.9rem', color: 'var(--fg-2)' }}>막대를 클릭하세요. 아직 쓰지 않은 차원마다 실제 GROUP BY 프로브를 돌려 "조각 수"와 "편중"을 재고, 나눌 수 없는 차원은 사유와 함께 막힌 채로 보여줍니다. 자동 실행은 없습니다.</p>}
          {picked && (
            <div className="suggest" role="list" aria-label="분할 후보">
              <p className="mono" style={{ marginBottom: 4 }}>{LABEL[dim]} = {picked} 를 무엇으로 나눠 볼까요?</p>
              {suggestions.map((s, i) => (
                <button key={s.d} role="listitem" className="suggest__item" disabled={!!s.blocked} onClick={() => descend(s.d)}>
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <span>{LABEL[s.d]}별로 나누기{s.blocked ? ` — ${s.blocked}` : ''}</span>
                  <small className="num">{s.pieces}조각 · 최대 {(s.skew * 100).toFixed(0)}%</small>
                </button>
              ))}
              {suggestions.length === 0 && <p style={{ fontSize: '.9rem' }}>더 나눌 차원이 없습니다.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
