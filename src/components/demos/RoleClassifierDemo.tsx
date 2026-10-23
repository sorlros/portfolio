import { useMemo, useState } from 'react';
// 제품 roleClassifier 의 축소판: 타입 → 이름·코멘트 → 값 샘플 통계 → 저확신 폴백. 같은 입력이면 언제나 같은 결과, LLM 없음.
type Role = 'dimension' | 'measure' | 'time' | 'id';
type Col = { name: string; type: string; comment?: string; samples: (string | number | null)[] };
type Verdict = { role: Role; confidence: number; rule: string };
const LOW = 0.6;
const BADGE: Record<Role, string> = { dimension: 'D', measure: 'M', time: 'T', id: '#' };
const LABEL: Record<Role, string> = { dimension: '차원', measure: '지표', time: '시간', id: '식별자' };
export function classifyColumn(c: Col): Verdict {
  const t = c.type.toLowerCase(); const n = c.name.toLowerCase(); const cm = (c.comment || '').toLowerCase();
  if (/date|time|timestamp/.test(t)) return { role: 'time', confidence: 0.95, rule: '규칙1: 타입이 날짜·시각' };
  if (/_at$|_dt$|date|일자|일시|시각/.test(n) || /일자|날짜|시각/.test(cm)) return { role: 'time', confidence: 0.85, rule: '규칙2: 이름·코멘트가 시간을 말함' };
  if (/_yn$|_at$/.test(n) && c.samples.every((v) => v === 'Y' || v === 'N' || v == null)) return { role: 'dimension', confidence: 0.9, rule: '규칙1b: 공공 표기 _YN/_AT 플래그 → 차원' };
  if (/(^|_)id$|_no$|_cd$|code|코드|번호/.test(n) || /코드|번호|식별/.test(cm)) {
    const uniq = new Set(c.samples.filter((v) => v != null)).size;
    if (/(^|_)id$/.test(n) && uniq === c.samples.length) return { role: 'id', confidence: 0.9, rule: '규칙3: 이름이 id + 전부 고유값 → 식별자' };
    return { role: 'dimension', confidence: 0.85, rule: '규칙7: 숫자/문자라도 코드성 이름 → 차원(숫자=지표 함정 차단)' };
  }
  if (/amount|amt|price|qty|cnt|count|sum|total|rate|ratio|금액|수량|건수|매출|비율/.test(n) || /금액|수량|건수|비율/.test(cm)) return { role: 'measure', confidence: 0.9, rule: '규칙6: 이름·코멘트가 계량을 말함' };
  const nums = c.samples.filter((v): v is number => typeof v === 'number');
  if (nums.length && nums.length === c.samples.filter((v) => v != null).length) {
    const uniq = new Set(nums).size; const sorted = [...nums].sort((a, b) => a - b);
    const allInt = nums.every((v) => Number.isInteger(v)); const hasNegOrFrac = nums.some((v) => v < 0 || !Number.isInteger(v));
    const consecutive = allInt && sorted.every((v, i) => i === 0 || v - sorted[i - 1] === 1);
    const fixedWidth = allInt && new Set(nums.map((v) => String(v).length)).size === 1 && String(nums[0]).length >= 6 && uniq === nums.length;
    if (hasNegOrFrac) return { role: 'measure', confidence: 0.8, rule: '규칙8d: 소수·음수 포함 → 계량형' };
    if (fixedWidth) return { role: 'id', confidence: 0.75, rule: '규칙8g: 고정폭 식별번호 전부 고유 → 식별자' };
    if (consecutive && uniq === nums.length) return { role: 'id', confidence: 0.7, rule: '규칙8b: 연속 순번 전부 고유 → 식별자(순번형)' };
    const range = sorted[sorted.length - 1] - sorted[0];
    if (uniq <= Math.max(3, Math.floor(nums.length / 3))) return { role: 'dimension', confidence: 0.65, rule: `규칙8c: 통계 — 고유값 ${uniq}개, 반복되는 소수 코드 → 차원` };
    if (allInt && range < 50 && uniq > 3) return { role: 'measure', confidence: 0.55, rule: `규칙8c: 통계 — 고유값 ${uniq}개, 조밀 정수 범위 (코드/수량 모호 — 확인 권장)` };
    return { role: 'measure', confidence: 0.7, rule: '규칙8a: 넓은 범위의 수치 → 지표' };
  }
  const uniq = new Set(c.samples.filter((v) => v != null)).size;
  if (uniq === c.samples.length && c.samples.length > 5) return { role: 'dimension', confidence: 0.55, rule: '규칙9b: 문자열 전부 고유 — 차원으로 두되 저확신(이름일 수도, 식별자일 수도)' };
  return { role: 'dimension', confidence: 0.8, rule: '규칙9: 문자열 반복값 → 차원' };
}
const DATASETS: { label: string; cols: Col[] }[] = [
  { label: '이름 없는 레거시(F1~F6)', cols: [
    { name: 'F1', type: 'varchar', samples: ['20260101', '20260102', '20260103', '20260104', '20260105', '20260106'] },
    { name: 'F2', type: 'int', samples: [101, 102, 103, 104, 105, 106] },
    { name: 'F3', type: 'int', samples: [3, 3, 1, 2, 3, 1] },
    { name: 'F4', type: 'decimal', samples: [12.5, 300.25, 18.0, 4200.75, 99.9, 1.5] },
    { name: 'F5', type: 'varchar', samples: ['서울', '부산', '서울', '대구', '부산', '서울'] },
    { name: 'F6', type: 'int', samples: [20260001, 20260002, 20260003, 20260004, 20260005, 20260006] },
  ] },
  { label: '콜센터 인입 로그', cols: [
    { name: 'call_id', type: 'bigint', samples: [1, 2, 3, 4, 5, 6] },
    { name: 'recv_dt', type: 'datetime', samples: ['2026-10-01 09:00', '2026-10-01 09:02', '2026-10-01 09:05', '2026-10-01 09:07', '2026-10-01 09:11', '2026-10-01 09:12'] },
    { name: 'line_cd', type: 'varchar', comment: '대표번호 코드', samples: ['L01', 'L02', 'L01', 'L03', 'L01', 'L02'] },
    { name: 'agent_no', type: 'int', samples: [12, 7, 12, 3, 7, 12] },
    { name: 'talk_sec', type: 'int', comment: '통화 시간(초)', samples: [182, 45, 603, 97, 240, 31] },
    { name: 'abandon_yn', type: 'char', samples: ['N', 'Y', 'N', 'N', 'Y', 'N'] },
  ] },
  { label: '매장 매출(숫자=지표 함정)', cols: [
    { name: 'store_no', type: 'int', comment: '매장 번호', samples: [7, 12, 7, 31, 12, 7] },
    { name: 'year', type: 'int', samples: [2024, 2025, 2024, 2026, 2025, 2026] },
    { name: 'sales_amt', type: 'numeric', samples: [1250000, 980000, 1310000, 455000, 1020000, 1190000] },
    { name: 'conversion_rate', type: 'numeric', samples: [0.12, 0.09, 0.15, 0.07, 0.11, 0.13] },
    { name: 'region', type: 'varchar', samples: ['수도권', '영남', '수도권', '호남', '영남', '수도권'] },
    { name: 'qty', type: 'int', samples: [4, 9, 3, 11, 6, 8] },
  ] },
];
export function RoleClassifierDemo() {
  const [ds, setDs] = useState(0);
  const [fix, setFix] = useState<Record<string, Role>>({});
  const rows = useMemo(() => DATASETS[ds].cols.map((c) => ({ c, v: classifyColumn(c) })), [ds]);
  const cycle = (name: string, cur: Role) => { const order: Role[] = ['dimension', 'measure', 'time', 'id']; const next = order[(order.indexOf(cur) + 1) % 4]; setFix({ ...fix, [name]: next }); };
  return (
    <div className="demo" aria-label="컬럼 역할 분류 데모">
      <div className="demo__head"><h3>이름 없는 컬럼 분류하기 — 타입 → 이름·코멘트 → 값 통계 → 저확신 폴백</h3><small>제품 분류기 축소판 · LLM 없음 · 같은 입력이면 같은 결과</small></div>
      <div className="chips" role="list" aria-label="데이터셋">{DATASETS.map((d, i) => <button key={d.label} role="listitem" aria-pressed={ds === i} onClick={() => { setDs(i); setFix({}); }} style={ds === i ? { background: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'var(--accent)' } : undefined}>{d.label}</button>)}</div>
      <div className="roles" role="list">
        {rows.map(({ c, v }) => { const role = fix[c.name] ?? v.role; const low = v.confidence < LOW; const fixed = !!fix[c.name]; return (
          <div className="roles__row" key={c.name} role="listitem">
            <button className={`badge ${low && !fixed ? 'badge--low' : ''} ${fixed ? 'badge--fixed' : ''}`} onClick={() => cycle(c.name, role)} aria-label={`${c.name} 역할 ${LABEL[role]}${fixed ? ' (사용자 정정)' : ''}, 클릭하면 정정`} title="클릭 → 역할 정정">{BADGE[role]}</button>
            <div><b>{c.name}</b> <span className="roles__type">{c.type}{c.comment ? ` · "${c.comment}"` : ''}</span><div className="roles__samples">{c.samples.slice(0, 6).map((s) => String(s)).join(' · ')}</div></div>
            <div className="roles__v"><strong>{LABEL[role]}{fixed ? ' · 사용자 정정' : ''}</strong><small>{fixed ? '정정은 재 sync가 덮지 못함 (role_source = user)' : `${v.rule} · 확신 ${v.confidence.toFixed(2)}${low ? ' · 저확신(점선)' : ''}`}</small></div>
          </div>); })}
      </div>
      <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 12 }}>뱃지를 클릭하면 역할이 바뀝니다. 제품에서는 정정이 서버에 저장되고 SQL CASE WHEN으로 보호되어 자동 분류가 다시 덮지 못합니다. 저확신(0.6 미만)은 점선으로 드러냅니다.</p>
    </div>
  );
}
