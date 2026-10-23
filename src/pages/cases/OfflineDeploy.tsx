import { FLAGSHIPS } from '../../content';
import { Block, CaseShell } from '../../components/CaseShell';
import { DeployTimeline } from '../../components/demos/DeployTimeline';
const f = FLAGSHIPS[3];
export function OfflineDeploy() {
  return (
    <CaseShell f={f}>
      <Block n="문제" title="인터넷도, USB도, 개발자도 없는 서버">
        <p>첫 고객 서울시설공단은 인터넷과 USB 반입이 제한된 폐쇄망이고, 설치하는 사람이 비개발자일 수 있습니다. 현장은 Rocky Linux 9.8 + Apache + HTTP(TLS 미도입), 4코어·16GB 서버 1대를 여러 사용자가 공유하며 업무용 PostgreSQL에 직접 질의합니다.</p>
        <p>10월 재배포 전 실측에서, 로그인 화면 전에 받아야 하는 JS/CSS가 무압축 30.2MB·17파일이었고 고객 회선에서는 메인 번들 7.87MB 중 2.7~3.0MB 지점에서 매번 전송이 끊겨 앱이 부팅조차 못 했습니다(접속 로그 5회).</p>
      </Block>
      <Block n="접근" title="압축 파일 하나, 스크립트 두 개, 리허설은 고객 데이터 사본 위에서">
        <ul>
          <li><b>설치 체계</b> — <code>setup.sh</code>(시크릿 생성 → 설치 → .env → 기동 → 접속 확인 6/6 자동), systemd 설치 스크립트(크래시·재부팅 자동 재기동), 오프라인 패키지 생성기(<code>--obfuscate --skip-python</code>: 난독화·AI 제외 코어 BI), Apache TLS 스크립트(0단계 점검 → mod_ssl·인증서·vhost·SELinux → 멱등 재실행). 시스템 DB는 임베디드 PGlite라 별도 DB 설치가 없습니다.</li>
          <li><b>반입물 검증</b> — 소스 업로드 시 시크릿·특허 명세·내부 문서를 rsync 필터로 제외하고 dry-run으로 확인(731파일 전송, 시크릿 0건).</li>
          <li><b>부팅 수리</b> — 사전압축(.gz/.br) + Accept-Encoding 협상 + Apache DEFLATE/BROTLI, 난독화를 앱 청크로 한정(vendor 제외), 로그인 화면은 main 청크만 로드하고 에디터 본체는 인증 뒤 lazy, 토큰-세션 결속(sid)으로 공용 계정에서 한 명의 로그아웃이 전원을 튕기지 않게. 업데이트 스크립트는 백업 → 정지 → 교체 → 기동 → 검증.</li>
          <li><b>리허설</b> — 고객 데이터 사본 위에서 새 버전을 띄워 회귀 2건(내장 커넥션 401·HTTP 클립보드 API)을 재배포 전에 잡았습니다.</li>
        </ul>
      </Block>
      <section className="wrap"><div data-reveal=""><DeployTimeline /></div></section>
      <Block n="결과" title="30.2MB에서 0.11MB로">
        <p>v0.5.0 최종 리허설은 "빈 서버 → 완성된 서비스"를 스크립트 2개로 완주했고 패키지는 44MB였습니다. 2026-08-18 설치 후 49일 무중단 가동(10-07 진단 문서 기준), 10-08 v0.6 재배포. 로그인 전 전송량은 무압축 30.2MB → 사전압축·경량 난독화 후 약 4MB → 로그인 화면 분리 후 raw 0.38MB / gz 0.11MB가 됐습니다. 폐쇄망 반입 뒤 운영자가 조정할 값(조회 상한·시간 상한)은 환경변수로 노출했습니다.</p>
        <div className="evidence" style={{ marginTop: 18 }}>{f.evidence.map((e) => <span key={e}>{e}</span>)}</div>
      </Block>
    </CaseShell>
  );
}
