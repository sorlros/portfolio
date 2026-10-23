import { useState } from 'react';
// 실제 PR #1013의 산식을 단순화한 예시. "서버 메모리 ≈ 응답 바이트 × 5~7배, 최악 동시 N건" 규칙.
const fmtMB = (b: number) => `${(b / 1_048_576).toFixed(1)} MB`;
export function GateCalc() {
  const [rows, setRows] = useState(198_000);
  const [bytesPerRow, setBpr] = useState(400);
  const [users, setUsers] = useState(5);
  const [memGB, setMem] = useState(16);
  const [cap, setCap] = useState(12);
  const resp = rows * bytesPerRow;
  const mult = 6;
  const perReq = resp * mult;
  const worst = perReq * users * 3;
  const heap = Math.min(memGB, 16) * 0.23 * 1024 ** 3; // Node 힙 추정(4코어·16GB에서 ≈3.7GB)
  const capBytes = cap * 1_048_576;
  const capped = Math.min(resp, capBytes);
  const cappedWorst = capped * mult * users * 3;
  const pct = Math.min(100, (worst / heap) * 100);
  const pctCapped = Math.min(100, (cappedWorst / heap) * 100);
  return (
    <div className="demo" aria-label="조회 상한 계산기">
      <div className="demo__head"><h3>조회 상한 계산기</h3><small>예시 산식 · PR #1013 단순화</small></div>
      <div className="demo__grid">
        <div>
          <div className="ctl"><label htmlFor="g-rows">결과 행 수 <b className="num">{rows.toLocaleString()}</b></label><input id="g-rows" type="range" min={1000} max={400000} step={1000} value={rows} onChange={(e) => setRows(+e.target.value)} /></div>
          <div className="ctl"><label htmlFor="g-bpr">행당 바이트 <b className="num">{bytesPerRow}</b></label><input id="g-bpr" type="range" min={50} max={2000} step={10} value={bytesPerRow} onChange={(e) => setBpr(+e.target.value)} /></div>
          <div className="ctl"><label htmlFor="g-users">동시 사용자 <b className="num">{users}명 × 3회</b></label><input id="g-users" type="range" min={1} max={20} value={users} onChange={(e) => setUsers(+e.target.value)} /></div>
          <div className="ctl"><label htmlFor="g-mem">서버 메모리 <b className="num">{memGB} GB</b></label><input id="g-mem" type="range" min={4} max={64} step={4} value={memGB} onChange={(e) => setMem(+e.target.value)} /></div>
          <div className="ctl"><label htmlFor="g-cap">화면 응답 상한 <b className="num">{cap} MB</b></label><input id="g-cap" type="range" min={2} max={64} step={1} value={cap} onChange={(e) => setCap(+e.target.value)} /></div>
        </div>
        <div className="out">
          <div className="out__row"><span>응답 크기(상한 없음)</span><b className="num">{fmtMB(resp)}</b></div>
          <div className={`out__row ${pct >= 80 ? 'warn' : ''}`}><span>최악 동시 부하 시 메모리 / Node 힙<div className="bar"><i style={{ width: `${pct}%` }} /></div></span><b className="num">{fmtMB(worst)} · {pct.toFixed(0)}%</b></div>
          <div className="out__row"><span>상한 적용 후 응답</span><b className="num">{fmtMB(capped)}{resp > capBytes ? ' · 잘림 고지' : ''}</b></div>
          <div className={`out__row ${pctCapped >= 80 ? 'warn' : ''}`}><span>상한 적용 후 최악 부하<div className="bar"><i style={{ width: `${pctCapped}%` }} /></div></span><b className="num">{fmtMB(cappedWorst)} · {pctCapped.toFixed(0)}%</b></div>
          <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 6 }}>실제 제품은 행 수·바이트 상한을 함께 두고, 잘림 사유를 응답·칩·내보내기 파일에 같은 문구로 고지합니다. 임베디드 PGlite는 실행 전에 바이트를 측정합니다.</p>
        </div>
      </div>
    </div>
  );
}
