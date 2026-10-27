import { FLAGSHIPS } from '../../content';
import { Block, CaseShell } from '../../components/CaseShell';
import { ClassifierPlay } from '../../components/demos/ClassifierPlay';
const f = FLAGSHIPS.find((x) => x.slug === 'sql-classifier')!;
export function SqlClassifier() {
  return (
    <CaseShell f={f}>
      <Block n="문제" title="분류기와 실행부가 같은 SQL을 다르게 읽었습니다">
        <p>10월 전수조사에서 두 가지가 나왔습니다. 첫째, 내장 샘플 데이터소스 경로가 요청 본문의 <code>host</code> 문자열만으로 판정되고 라우트 5개 중 4개에 인증이 없었습니다. 허용목록은 "FROM 뒤 첫 토큰" 정규식이라 콤마 조인을 놓쳤고, <code>SELECT u.password_hash FROM sample_products s, users u</code> 한 줄로 미인증 요청이 세션 토큰과 암호화 접속정보를 읽을 수 있었습니다.</p>
        <p>둘째, <code>/query</code>의 쓰기 판정이 "위험 문장 앞머리 목록" 방식이라 <code>DROP SCHEMA</code>·<code>CREATE VIEW</code>·<code>RENAME TABLE</code>이 통과했고, 분류기와 라우트가 주석·세미콜론을 다르게 읽어 분류기가 <code>null</code>을 돌려준 입력이 실제로는 DROP을 실행했습니다. 커밋된 JWT 기본 문구로 서명한 <code>super_admin</code> 토큰도 통과했습니다.</p>
      </Block>
      <Block n="접근" title="세 방언의 어휘 규칙을 전부 읽고, 합집합으로 판정합니다">
        <ul>
          <li><b>내장 경로 3겹</b> — 서버가 해석한 등록 연결 행 기준 WeakSet 표식(위조 불가) + 로그인 필수 / node-sql-parser AST 허용목록(단일 SELECT·<code>sample_</code> 테이블·함수 허용목록·파싱 실패는 거부) / 읽기 전용 트랜잭션 + 확장 프로토콜 단문.</li>
          <li><b>렉서 기반 분류기</b> — PG 중첩 주석·E-문자열·<code>$tag$</code>, MySQL <code>#</code>·<code>/*!</code>, Oracle q-인용을 읽는 순수 모듈. PG는 <code>standard_conforming_strings</code> on/off 두 해석, MySQL은 기본·ANSI_QUOTES·NO_BACKSLASH_ESCAPES 세 모드의 합집합. 코드 위치의 <code>;</code>로 분할, 데이터 변경 CTE·SELECT INTO·FOR UPDATE 승격 스캔, 부작용 함수 거부 목록, 나머지 unknown은 super_admin만.</li>
          <li><b>불변식</b> — "generic의 요구 권한 ⊇ 개별 방언". 방언을 모를 때는 가장 엄격한 판정을 씁니다.</li>
          <li><b>같은 조사에서 나온 것</b> — 커서 페이징이 정규식으로 WHERE를 찾아 주석 속 <code>where</code>에 끼워 넣던 것은 원문을 파생 테이블로 감싸는 방식으로, DDL의 <code>col.name</code>·<code>col.type</code> 무검사 삽입은 실행 전 전부 조립·검증하는 순수 함수로 바꿨습니다.</li>
        </ul>
      </Block>
      <section className="wrap"><div data-reveal=""><ClassifierPlay /></div></section>
      <Block n="결과" title="뮤턴트 39종이 전부 죽었습니다">
        <table><thead><tr><th>검증</th><th>내용</th></tr></thead><tbody>
          <tr><td>분류기</td><td>표 기반 시험 138건, 가드를 하나씩 제거한 뮤턴트 39종 전부 실패(= 시험이 잡음)</td></tr>
          <tr><td>내장 경로</td><td>독립 보안 리뷰 2라운드(위조저항 12/12, reg* 전 타입 19/19), 브라우저 실측 무토큰 401·host 위조 미도달·콤마조인 거부</td></tr>
          <tr><td>회귀</td><td>서버 777건 중 768 통과, BI 12,822건 통과, 10-08 실서버 38건·13건 재확인</td></tr>
          <tr><td>덤</td><td>처음 커밋부터 한 번도 동작한 적 없던 OAuth 로그인(<code>db.query()</code>가 배열을 돌려주는데 <code>.rows</code>를 읽던 7곳)을 가짜 IdP HTTP 경계 시험 9건과 함께 복구</td></tr>
        </tbody></table>
        <div className="evidence" style={{ marginTop: 18 }}>{f.evidence.map((e) => <span key={e}>{e}</span>)}</div>
      </Block>
    </CaseShell>
  );
}
