const STEPS = [
  { when: '2026.07', what: '리허설 — 우분투 공용 서버에서 3가지 서빙 방식(Node 내장 80 / Caddy / 외부 웹서버 프록시) 검증, rsync 필터 dry-run(731파일 전송, 시크릿 0건)' },
  { when: '2026.08.14', what: 'v0.5.0 최종 리허설 — 빈 서버 → 완성된 서비스를 스크립트 2개로 완주, 패키지 44MB' },
  { when: '2026.08.18', what: '서울시설공단 개발서버 원격 설치(Rocky Linux 9.8 · Apache · HTTP), 설치확인서 실측' },
  { when: '2026.10.07', what: '재배포 전 실측 — 로그인 전 JS/CSS 30.2MB 무압축, 고객 회선 2.7~3.0MB 지점 전송 끊김 5회 확인' },
  { when: '2026.10.08', what: '수리 4건(사전압축·난독화 범위·로그인 화면 분리·토큰-세션 결속) → 고객 데이터 사본 위 리허설 → v0.6 재배포' },
];
const SIZES = [
  { label: '종전 (무압축)', mb: 30.2 },
  { label: '사전압축 + 경량 난독화', mb: 4.0 },
  { label: '로그인 화면 분리 (raw)', mb: 0.38 },
  { label: '로그인 화면 분리 (gz)', mb: 0.11 },
];
export function DeployTimeline() {
  const max = SIZES[0].mb;
  return (
    <div className="demo" aria-label="배포 타임라인과 전송량">
      <div className="demo__head"><h3>로그인 전 전송량</h3><small>PR #894 · #895 · #899</small></div>
      <div className="sizes">
        {SIZES.map((s) => (
          <div className="sizes__row" key={s.label}><span>{s.label}</span><div className="bar"><i style={{ width: `${Math.max(1.2, (s.mb / max) * 100)}%` }} /></div><b className="num">{s.mb} MB</b></div>
        ))}
      </div>
      <div className="demo__head" style={{ marginTop: 26 }}><h3>설치 · 재배포 타임라인</h3><small>작업기록</small></div>
      <div className="timeline">
        {STEPS.map((s) => <div className="timeline__row" key={s.when}><span className="mono">{s.when}</span><p>{s.what}</p></div>)}
      </div>
    </div>
  );
}
