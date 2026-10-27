import { FLAGSHIPS } from '../../content';
import { Block, CaseShell } from '../../components/CaseShell';
import { DeployTimeline } from '../../components/demos/DeployTimeline';
const f = FLAGSHIPS.find((x) => x.slug === 'offline-deploy')!;
export function OfflineDeploy() {
  return (
    <CaseShell f={f}>
      <Block n="문제" title="공단 직원 PC에서 앱이 열리지 않았습니다">
        <p>첫 고객 서울시설공단의 서버는 KT 클라우드 DMZ 구역의 가상 서버(Rocky Linux 9.8 + Apache + HTTP, 4코어·16GB)이고, 회사 고정 IP에서만 SSH로 접속할 수 있습니다. 2026년 8월 이 서버에 v0.5.0을 원격으로 설치했고, 공단 직원 여러 명이 공용 계정으로 쓰고 있었습니다.</p>
        <p>10월, 두 가지 문제가 들어왔습니다. 공단 직원 PC에서는 앱이 아예 뜨지 않았고, 한 명이 로그아웃하면 같은 계정을 쓰는 모두가 강제로 로그아웃됐습니다. 서버 접속 로그에서 공단 쪽 요청을 보니, 로그인 화면 전에 받아야 하는 JS/CSS가 무압축 30.2MB·17파일이었고 메인 번들 7.87MB 중 2.7~3.0MB 지점에서 매번 전송이 끊겨 API 호출이 한 번도 일어나지 않았습니다(5회 시도). 회사 사무실에서는 매번 끝까지 받아져 재현되지 않던 문제였습니다.</p>
      </Block>
      <Block n="접근" title="원인 진단 → 수리 → 고객 데이터 사본에서 리허설 → 재배포">
        <ul>
          <li><b>접속 불가 수리</b> — 사전압축(.gz/.br) + Accept-Encoding 협상 + Apache 압축 설정, 난독화를 앱 청크로 한정(vendor 제외). 로그인 화면은 main 청크만 받고 편집기 본체는 인증 뒤 lazy 로드합니다.</li>
          <li><b>강제 로그아웃 수리</b> — 로그아웃이 그 사용자의 세션 전체를 지우는 구조가 원인이었습니다. 토큰과 세션을 묶어(sid) 로그아웃하면 본인 세션만 닫히게 했습니다.</li>
          <li><b>데이터를 지키는 업데이트</b> — 업데이트 스크립트는 백업 → 정지 → 교체 → 기동 → 검증 순서로 돌고 롤백 재료를 남깁니다. 고객 데이터 사본 위에서 새 버전을 먼저 띄워 회귀 2건(내장 커넥션 401·HTTP 클립보드 API)을 재배포 전에 잡았습니다.</li>
          <li><b>설치 체계(8월)</b> — 의존성을 전부 동봉해 외부 다운로드 없이 설치되는 오프라인 패키지(44MB)와 <code>setup.sh</code>(시크릿 생성 → 설치 → .env → 기동 → 접속 확인 자동), systemd 자동 재기동, Apache TLS 스크립트. 시스템 DB는 임베디드 PGlite라 별도 DB 설치가 없습니다. Node 버전을 고정하고 버전지정서·설치확인서를 고객에게 냈습니다. 소스 업로드 때는 시크릿·내부 문서를 rsync 필터로 제외하고 dry-run으로 확인했습니다(시크릿 0건).</li>
        </ul>
      </Block>
      <section className="wrap"><div data-reveal=""><DeployTimeline /></div></section>
      <Block n="결과" title="30.2MB에서 0.11MB로, 로그아웃은 본인만">
        <p>로그인 전 전송량은 무압축 30.2MB → 사전압축·경량 난독화 후 약 4MB → 로그인 화면 분리 후 raw 0.38MB / gz 0.11MB가 됐습니다. 공용 계정에서 한 명이 로그아웃해도 다른 사람의 세션은 유지됩니다. 2026-10-08 v0.6으로 재배포했고, 운영자가 서버 사양에 맞춰 조정할 값(조회 상한·시간 상한)은 환경변수로 노출했습니다.</p>
        <div className="evidence" style={{ marginTop: 18 }}>{f.evidence.map((e) => <span key={e}>{e}</span>)}</div>
      </Block>
    </CaseShell>
  );
}
