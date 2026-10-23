import { FLAGSHIPS } from '../../content';
import { Block, CaseShell } from '../../components/CaseShell';
import { GateCalc } from '../../components/demos/GateCalc';
const f = FLAGSHIPS[0];
export function QueryGate() {
  return (
    <CaseShell f={f}>
      <Block n="문제" title="상한이 없는 조회는 운영 DB와 서버를 같이 무너뜨립니다">
        <p>"저장된 SQL의 LIMIT = 사용자 의도"라는 전제부터 거짓이었습니다. 행 제한이 박히는 다섯 경로 중 네 개는 시스템이 강제로 넣은 100이었습니다. 전량 조회 API의 호출부 29곳은 응답을 끝까지 받았고, 피벗을 19.8만 행 테이블에 연결하자 79MB 응답에 서버 메모리가 473MB 늘었습니다.</p>
        <p>실행 시간 상한은 검증 요청에만 걸려 있어 일반 조회에서 <code>pg_sleep(6)</code>이 12초 뒤 정상 응답했고, 요청을 abort해도 PostgreSQL <code>pg_stat_activity</code>에는 끝까지 <code>active</code>로 남았습니다. 임베디드 PGlite는 단일 응답이 약 16MB를 넘으면 인스턴스가 깨져 로그인과 프로젝트 조회까지 멈췄습니다(실측 13.8MB 정상 / 17.3MB 붕괴).</p>
      </Block>
      <Block n="접근" title="고객 서버 사양에서 기본값을 역산했습니다">
        <ul>
          <li><b>행·바이트 상한</b> — 서울시설공단 서버(4코어·15GB)에서 Node 힙 약 3.7GB, "서버 메모리 ≈ 응답 크기 × 5~7배", 최악 동시 20건을 가정해 화면 30,000행·12MB / 내보내기 100,000행·48MB / 임베디드 12MB를 용도별로 두었습니다. 업계 BI 6종이 모두 "화면 상한 + 내보내기 별도 상한" 구조라는 것을 1차 자료로 확인했습니다.</li>
          <li><b>시간 상한</b> — PostgreSQL <code>statement_timeout</code>(DBA 기본값이 더 작으면 그것), MySQL <code>MAX_EXECUTION_TIME</code>을 문장마다, Oracle <code>callTimeout</code>. 기본값 60초·140초는 4코어 컨테이너에서 5명 × 3회 동시 재생 실측(화면 최대 4.15초·내보내기 4.65초)에 "최대의 10배 이상, 하한 30초" 규칙을 적용해 정했습니다.</li>
          <li><b>끊김 취소</b> — 끊김 신호를 한 곳에서 받고, 실행 전 확인 → 300ms 뒤 실행 중일 때만 취소 → 취소 왕복 중 연결 반납 금지. PG는 일회용 연결로 <code>pg_cancel_backend</code>, MySQL은 <code>KILL CONNECTION</code>, Oracle은 <code>break()</code>. 읽기만 취소합니다.</li>
          <li><b>PGlite 16MB</b> — 임베디드 DB는 실행 전에 <code>octet_length(row_to_json)</code> 누적합으로 들어갈 행 수를 재고, 통째 문서 저장에는 12MB 관문을 두었습니다.</li>
        </ul>
      </Block>
      <section className="wrap"><div data-reveal=""><GateCalc /></div></section>
      <Block n="결과" title="실엔진 시험이 상한 밖의 쿼리를 하나 더 찾았습니다">
        <p>PostgreSQL 페이징 COUNT가 <code>SET statement_timeout</code>보다 먼저 큐에 들어가 상한 밖에서 돌고 있었습니다(4억 행 COUNT 176초). 가드 안으로 옮기자 2.3초가 됐습니다. PG 백엔드가 끊길 때 서버 프로세스가 죽는 회귀도 같은 PR에서 잡았습니다.</p>
        <table><thead><tr><th>항목</th><th>수치</th></tr></thead><tbody>
          <tr><td>서버 시험</td><td>1,320건(통과 1,311) · Docker PG18·MySQL5.7·Oracle18 상한 시험 15/15</td></tr>
          <tr><td>동시 부하</td><td>5명 × 3회 90건 총 13.8초, 서버 p50 287ms · p99 3,423ms · 60초 초과 0건</td></tr>
          <tr><td>고지</td><td>잘림 사유를 응답 메타·화면 칩·내보내기 파일 안에 같은 문구로</td></tr>
        </tbody></table>
        <div className="evidence" style={{ marginTop: 18 }}>{f.evidence.map((e) => <span key={e}>{e}</span>)}</div>
      </Block>
    </CaseShell>
  );
}
