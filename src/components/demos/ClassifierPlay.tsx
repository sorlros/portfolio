import { useMemo, useState } from 'react';
// 교육용 축소판. 제품의 classifySql은 PG/MySQL/Oracle 어휘 규칙과 방언 모드 합집합으로 판정한다.
type Dialect = 'postgres' | 'mysql' | 'oracle' | 'generic';
type Verdict = { kind: 'read' | 'write' | 'reject'; why: string };
const WRITE = /^(insert|update|delete|merge|drop|create|alter|truncate|rename|grant|revoke|replace|call|do|lock|set|copy|vacuum|analyze|reindex|cluster|comment)\b/i;
function strip(sql: string, d: Dialect) {
  let s = sql; const notes: string[] = [];
  // 문자열
  s = s.replace(/'(?:[^']|'')*'/g, () => { notes.push('문자열 리터럴 제거'); return "''"; });
  if (d === 'postgres') { s = s.replace(/\$([A-Za-z_]*)\$[\s\S]*?\$\1\$/g, () => { notes.push('$tag$ 달러 인용 제거'); return "''"; }); s = s.replace(/E'(?:[^'\\]|\\.)*'/g, () => "''"); }
  if (d === 'oracle') s = s.replace(/q'(.)[\s\S]*?\1'/gi, () => { notes.push('q-인용 제거'); return "''"; });
  // 주석
  if (d === 'mysql') s = s.replace(/\/\*!\d*\s*([\s\S]*?)\*\//g, (_, body) => { notes.push('/*! 힌트 주석은 MySQL이 실행하므로 유지'); return ' ' + body + ' '; });
  if (d === 'postgres') { let prev; do { prev = s; s = s.replace(/\/\*(?:[^*/]|\*(?!\/)|\/(?!\*))*\*\//g, ' '); } while (prev !== s); if (prev !== sql) notes.push('중첩 블록 주석 제거'); }
  else s = s.replace(/\/\*[\s\S]*?\*\//g, ' ');
  s = s.replace(/--[^\n]*/g, ' ');
  if (d === 'mysql') s = s.replace(/#[^\n]*/g, () => { notes.push('# 줄 주석 제거'); return ' '; });
  return { s, notes };
}
export function classify(sql: string, d: Dialect): Verdict & { notes: string[] } {
  const { s, notes } = strip(sql, d);
  const stmts = s.split(';').map((x) => x.trim()).filter(Boolean);
  if (stmts.length === 0) return { kind: 'reject', why: '문장 없음', notes };
  if (stmts.length > 1) return { kind: 'reject', why: `문장 ${stmts.length}개 — 단일 문장만 허용`, notes };
  const st = stmts[0];
  if (/^(with|select|explain|show|describe|desc|values|table)\b/i.test(st)) {
    if (/\b(insert|update|delete|merge)\b/i.test(st.replace(/^with[\s\S]*?\)\s*/i, '')) && /^with/i.test(st)) return { kind: 'write', why: 'CTE 안의 데이터 변경(승격 스캔)', notes };
    if (/\binto\s+(?!outfile|dumpfile)\w/i.test(st) && /^select/i.test(st) && !/\bfrom\b[\s\S]*\binto\b/i.test(st)) return { kind: 'write', why: 'SELECT INTO = 테이블 생성', notes };
    if (/\bfor\s+update\b/i.test(st)) return { kind: 'write', why: 'FOR UPDATE 잠금', notes };
    if (/\b(pg_sleep|pg_terminate_backend|dbms_|utl_|load_file|sleep)\s*\(/i.test(st)) return { kind: 'reject', why: '부작용 함수 거부 목록', notes };
    return { kind: 'read', why: '읽기 문장', notes };
  }
  if (WRITE.test(st)) return { kind: 'write', why: `${st.split(/\s+/)[0].toUpperCase()} — 쓰기/DDL, 권한 필요`, notes };
  return { kind: 'reject', why: '알 수 없는 문장 — super_admin만', notes };
}
const SAMPLES: { label: string; sql: string }[] = [
  { label: '정상 SELECT', sql: "SELECT id, name FROM customers WHERE city = '서울' LIMIT 100" },
  { label: '주석 뒤 DROP', sql: "SELECT 1; -- 무해해 보이는 주석\nDROP TABLE users" },
  { label: 'PG 중첩 주석', sql: "/* 겉 /* 속 */ DROP TABLE t */ SELECT 1" },
  { label: 'MySQL /*! 힌트', sql: "SELECT 1 /*! ; DROP TABLE t */" },
  { label: '$tag$ 안의 세미콜론', sql: "SELECT $q$a; DROP TABLE t$q$ AS s" },
  { label: 'CTE 데이터 변경', sql: "WITH d AS (DELETE FROM orders RETURNING *) SELECT count(*) FROM d" },
  { label: '부작용 함수', sql: "SELECT pg_sleep(60)" },
];
export function ClassifierPlay() {
  const [sql, setSql] = useState(SAMPLES[1].sql);
  const ds: Dialect[] = ['postgres', 'mysql', 'oracle', 'generic'];
  const res = useMemo(() => ds.map((d) => ({ d, ...classify(sql, d) })), [sql]);
  const NAMES: Record<Dialect, string> = { postgres: 'PostgreSQL', mysql: 'MySQL', oracle: 'Oracle', generic: 'generic(합집합)' };
  const merged = res.some((r) => r.kind === 'reject') ? 'reject' : res.some((r) => r.kind === 'write') ? 'write' : 'read';
  return (
    <div className="demo" aria-label="SQL 분류 플레이그라운드">
      <div className="demo__head"><h3>분류 플레이그라운드</h3><small>교육용 축소판 · 제품 분류기와 다를 수 있음</small></div>
      <label htmlFor="sql" className="mono" style={{ display: 'block', marginBottom: 6 }}>SQL 입력</label>
      <textarea id="sql" className="sqlbox" value={sql} onChange={(e) => setSql(e.target.value)} spellCheck={false} />
      <div className="chips" role="list" aria-label="예제">{SAMPLES.map((s) => <button key={s.label} role="listitem" onClick={() => setSql(s.sql)}>{s.label}</button>)}</div>
      <div className="verdict">
        {res.map((r) => (
          <div className="verdict__cell" key={r.d} data-k={r.d === 'generic' ? merged : r.kind}>
            <b>{NAMES[r.d]}</b>
            <strong>{(r.d === 'generic' ? merged : r.kind) === 'read' ? '읽기' : (r.d === 'generic' ? merged : r.kind) === 'write' ? '쓰기·DDL' : '거부'}</strong>
            <small>{r.d === 'generic' ? '방언별 판정 중 가장 엄격한 쪽 (요구 권한 ⊇ 개별 방언)' : r.why}{r.notes.length ? ` · ${[...new Set(r.notes)].join(', ')}` : ''}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
