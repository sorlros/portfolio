// 모든 문구·데이터는 이 파일에서만 온다. 수치는 GraeEye 리포 git 로그·PR 본문·작업기록 기준.
export const PROFILE = {
  name: '최규철',
  nameLatin: 'Gyucheol Choi',
  role: 'BI/대시보드 풀스택 개발자',
  location: '경기 수원',
  email: 'sorlros2047@gmail.com',
  phone: '010-2394-2047',
  github: 'https://github.com/sorlros',
  vercel: 'https://vercel.com/sorlros-projects',
  resume: '/resume.pdf',
  career: '/career.pdf',
  availability: '재직 중 · 이직 검토',
  positioning: '운영 DB를 지키면서 빠르게 보여주는 BI를 만듭니다.',
  lede: '셀프서비스 BI 편집기 GraeEye를 입사 첫날부터 혼자 설계·구현해 공공기관 폐쇄망 서버에 설치·운영하고 있습니다. 숫자가 맞는지는 가설이 아니라 실측으로 확인합니다.',
  statement:
    '대시보드는 숫자가 틀리면 존재 이유가 없습니다. 그래서 저는 "필터를 걸었는데 숫자가 다르다"는 신고 하나를 4종 DB 실측으로 끝까지 추적하고, 조회가 운영 DB를 해치지 않도록 상한과 취소 경로를 먼저 만듭니다. 5개월간 머지한 PR 1,114건은 전부 문제·접근·검증·남은 위험을 적은 본문과 함께 남아 있습니다.',
};

export type Metric = { value: string; label: string; note?: string };

export const STATS: Metric[] = [
  { value: '1,114', label: '머지된 PR', note: '2026.07 ~ 10, 전부 단독 작성' },
  { value: '1,573', label: '테스트 파일', note: '단위 · HTTP 경계 · 실DB 통합 + E2E 16' },
  { value: '3', label: 'DB 방언', note: 'MySQL/MariaDB · PostgreSQL · Oracle' },
  { value: '49', label: '일 무중단 가동', note: '서울시설공단 폐쇄망 v0.5.0' },
];

export type Flagship = {
  slug: string; path: string; index: string; name: string; kicker: string; tagline: string;
  summary: string; role: string; period: string; stack: string[]; metrics: Metric[];
  accent: string; bg: string; fg: string; evidence: string[];
};

export const FLAGSHIPS: Flagship[] = [
  {
    slug: 'query-gate', path: '/work/query-gate', index: '01',
    name: '운영 DB 보호 관문',
    kicker: '조회 상한 · 시간 상한 · 끊김 취소',
    tagline: '19.8만 행 피벗 하나가 서버 메모리를 473MB 늘리던 경로를, 고객 서버 사양에서 역산한 상한으로 닫았습니다.',
    summary: '전량 조회 29곳이 응답을 끝까지 받고, 일반 조회에는 시간 상한이 없고, 요청을 끊어도 DB에는 좀비 쿼리가 남았습니다. 화면·내보내기·임베디드 용도별 행/바이트 상한, 세 방언의 실행 시간 상한, 요청 끊김 시 쿼리 취소를 한 묶음으로 설계했습니다.',
    role: '설계 · 서버 · 프런트 · 실측 전담',
    period: '2026.09 ~ 10',
    stack: ['Node.js', 'Express', 'pg', 'mysql2', 'oracledb', 'PGlite', 'node:test', 'Docker'],
    metrics: [
      { value: '79MB → 12MB', label: '화면 조회 응답 상한' },
      { value: '176s → 2.3s', label: '상한 밖에서 돌던 COUNT' },
      { value: 'p99 3.4s', label: '5명 × 3회 동시 부하' },
      { value: '15 / 15', label: 'Docker 3종 DB 상한 시험' },
    ],
    accent: '#C8451B', bg: '#F6E9E1', fg: '#2A1109',
    evidence: ['PR #1013', 'PR #1047', 'PR #1051', 'PR #1126', '시설공단_시간제한_실측_2026-10-16'],
  },
  {
    slug: 'sql-classifier', path: '/work/sql-classifier', index: '02',
    name: 'SQL 쓰기 판정 분류기',
    kicker: '렉서 기반 · 세 방언 합집합 · 뮤턴트 39종',
    tagline: '키워드 앞머리 목록으로 SQL을 거르던 분류기를, 주석·문자열·방언 모드를 전부 읽는 렉서로 바꿨습니다.',
    summary: '분류기와 실행부가 주석과 세미콜론을 다르게 읽어 "판정 불가"로 통과한 입력이 실제로는 DROP을 실행했습니다. 미인증 요청이 콤마 조인 한 줄로 세션 토큰 테이블을 읽는 P0 경로도 같은 조사에서 나왔습니다.',
    role: '전수조사 · 설계 · 구현 · 독립 리뷰 대응',
    period: '2026.10',
    stack: ['TypeScript', 'node-sql-parser', 'PostgreSQL', 'MySQL', 'Oracle', 'node:test'],
    metrics: [
      { value: '138', label: '표 기반 분류 시험' },
      { value: '39 / 39', label: '뮤턴트 사망' },
      { value: '3겹', label: '내장 경로 방어(인증·AST·읽기전용)' },
      { value: 'P0 종결', label: '독립 보안 리뷰 2라운드' },
    ],
    accent: '#1F5F8B', bg: '#E4ECF3', fg: '#0B1E2C',
    evidence: ['PR #871', 'PR #943', 'PR #944', 'PR #945', 'PR #952', 'SQL인젝션_전수조사_2026-10-02'],
  },
  {
    slug: 'exploration', path: '/work/exploration', index: '03',
    name: '계층 선언 없는 자동 탐색',
    kicker: '차트 클릭 → 다음 분할 제안 → 하강',
    tagline: '드릴다운 계층을 미리 설정하지 않아도, 막대를 클릭한 자리에서 "무엇으로 쪼갤 수 있는지"를 실제 수치와 함께 보여줍니다.',
    summary: '기존 BI는 월 → 지역 → 창고 같은 계층을 선언해야 내려갑니다. 저는 클릭 지점에서 후보 분할 축을 실제 GROUP BY 프로브로 재고 상위 3개를 제안하는 엔진을 만들고, "이름에서 추정한 의미는 후보 자격에 쓰지 않는다, 부당 제외 0은 하드 게이트"라는 범위 원칙을 실측 감사로 확정했습니다.',
    role: '계획 확정 · 엔진 · 브리지 · 교차검토 12차',
    period: '2026.09 ~ 10',
    stack: ['React 19', 'TypeScript', 'ECharts 6', 'Zustand', 'vitest', 'Playwright'],
    metrics: [
      { value: 'Top 3', label: '분할 후보 제안(프로브 수치 동반)' },
      { value: '0', label: '부당 제외 허용치(하드 게이트)' },
      { value: '7', label: '구현 중 잡은 기존 결함' },
      { value: '12차', label: '교차검토 왕복' },
    ],
    accent: '#2E7D5B', bg: '#E3EEE7', fg: '#0C2219',
    evidence: ['PR #647', '차트그리드-자동탐색-계획-확정본_2026-09-08', '탐색_범위원칙_개정_2026-09-18'],
  },
  {
    slug: 'offline-deploy', path: '/work/offline-deploy', index: '04',
    name: '폐쇄망 오프라인 배포',
    kicker: '압축 파일 하나 · 스크립트 2개 · 49일 가동',
    tagline: '인터넷이 없는 공공기관 서버에 원격으로 설치하고, 저속 회선에서 부팅조차 못 하던 설치본을 30.2MB → 0.11MB로 줄였습니다.',
    summary: '고객은 인터넷·USB 반입이 제한된 폐쇄망이고 설치자는 비개발자일 수 있습니다. 시스템 DB를 임베디드 PGlite로 두고, 시크릿 생성부터 접속 확인까지 자동인 설치 스크립트와 TLS·systemd 스크립트를 만들었습니다. 재배포 전 실측에서 고객 회선이 2.7~3.0MB 지점마다 끊기는 것을 보고 사전압축·난독화 범위 축소·로그인 화면 분리로 수리했습니다.',
    role: '패키징 · 설치 스크립트 · 원격 설치 · 재배포',
    period: '2026.07 ~ 10',
    stack: ['Rocky Linux', 'Apache', 'systemd', 'Vite', 'PGlite', 'Brotli/gzip', 'Shell'],
    metrics: [
      { value: '30.2MB → 0.11MB', label: '로그인 전 전송량(gz)' },
      { value: '2', label: '설치 완료까지 스크립트 수' },
      { value: '49일', label: '첫 설치 후 무중단 가동' },
      { value: '2건', label: '리허설에서 사전 수리한 회귀' },
    ],
    accent: '#8A6D2C', bg: '#F1EAD9', fg: '#261D08',
    evidence: ['PR #1', 'PR #894', 'PR #895', 'PR #899', 'PR #896', '서울시설공단_HTTP접속_다중접속_안정화_재배포_2026-10-08'],
  },
];

export type WorkKind = 'BI' | 'AI' | 'Web' | 'Systems';
export const WORKS: { name: string; blurb: string; stack: string[]; kind: WorkKind; year: string; href: string; route?: string }[] = [
  { name: '다중 DB 방언 단일 조립 엔진', blurb: '중복된 SQL 조립 경로 2벌을 순수 함수 엔진 + 방언 데이터 테이블로 단일화. 타입 인지 리터럴로 Oracle 날짜·boolean 무음 오답 제거, 무배선 코드 3,079줄 삭제.', stack: ['TypeScript', 'SQL'], kind: 'BI', year: '2026', href: 'https://github.com/sorlros' },
  { name: '그리드 합계·서버 사이드 피벗·DB 대조', blurb: '합계 집계 축을 화면 표시 행 하나로 통일, DISTINCT → CASE WHEN 자동 피벗 + 4계층 정합성 검증, 실행 SQL을 감싼 집계 1회로 DB와 대조.', stack: ['React', 'SQL', 'BigInt'], kind: 'BI', year: '2026', href: 'https://github.com/sorlros' },
  { name: '차트 겹침 근본 원인과 SSR 검증 하네스', blurb: 'ECharts 6의 deprecated containLabel이 축 이름 회피를 끄는 것을 추적, 옵션을 실제 렌더해 텍스트 좌표로 겹침을 판정하는 하네스로 54조합 회귀 증명.', stack: ['ECharts 6', 'SSR'], kind: 'BI', year: '2026', href: 'https://github.com/sorlros' },
  { name: '다중 사용자 협업 모델', blurb: '화면 단위 버전, presence 하트비트 동시편집 경고(고객 서버 CPU 실측 근거), 화면별 공개/비공개, 연결 소프트 삭제/대체. ADR 3편, 스택 PR 30여 건.', stack: ['Express', 'PostgreSQL', 'ADR'], kind: 'Systems', year: '2026', href: 'https://github.com/sorlros' },
  { name: '서버 DB 분기 71곳 해소·HTTP 시험 하네스', blurb: '풀 미사용·풀 파괴 등 결함 15건 확정, 골든 계약 하네스로 응답 고정 후 어댑터 계층 이행. 다른 워크트리 서버를 상대로 돌던 시험 플레이크 수리.', stack: ['Node.js', 'node:test', 'CI'], kind: 'Systems', year: '2026', href: 'https://github.com/sorlros' },
  { name: 'NovelAIne', blurb: 'AI 대화형 소설·자동 삽화. pgvector RAG 선택적 기억 + Summary Buffer로 긴 서사의 설정 오류·토큰 낭비 감소, 중요도 점수 임계치에서만 삽화 생성.', stack: ['Flutter', 'FastAPI', 'Supabase'], kind: 'AI', year: '2026', href: 'https://github.com/sorlros/NovelAIne' },
  { name: 'Orbit Agent Web', blurb: 'LangGraph 멀티에이전트(Manager·Backend·Frontend·QA·Reporter) 오케스트레이터의 웹 클라이언트. pgvector RAG로 과거 맥락 주입, 백그라운드 요약.', stack: ['React', 'Vite', 'LangGraph'], kind: 'AI', year: '2026', href: 'https://github.com/sorlros/multi-agent-bot-web' },
  { name: 'ServerOps Simulator', blurb: '웹 터미널에서 디스크 부족·OOM·Nginx 502·커넥션 풀 고갈·배포 롤백 6개 장애를 상태머신으로 재현하는 운영 학습 도구. DDD/TDD 구조.', stack: ['Next.js', 'TypeScript'], kind: 'Web', year: '2026', href: 'https://github.com/sorlros/server-ops-sim' },
  { name: 'Wall-E 외벽 균열 탐지', blurb: '드론 영상에서 YOLOv11로 균열 탐지, MobileNetV3 임베딩 코사인 유사도로 중복 저장 차단. FastAPI 3-트랙 비동기 + MJPEG/WebSocket + Flutter. 16일 팀 프로젝트.', stack: ['YOLO', 'FastAPI', 'Flutter'], kind: 'AI', year: '2026', href: 'https://github.com/sorlros/WALL-E' },
  { name: '2022 ~ 2024 웹앱 20여 개', blurb: 'Vue 3에서 React/Next.js로 옮겨 오며 실시간 채팅, 쇼핑몰, 노션·트렐로·에어비앤비 클론 등을 TypeScript로 구현·배포.', stack: ['React', 'Next.js', 'TypeScript'], kind: 'Web', year: '2022–24', href: 'https://github.com/sorlros?tab=repositories' },
];

export const CAPABILITIES: { title: string; items: string[] }[] = [
  { title: '데이터 조회·시각화', items: ['MySQL/MariaDB · PostgreSQL · Oracle 방언별 SQL 조립', '서버 사이드 피벗 · 합계/필터 정합', 'ECharts 6 차트 27종 매핑 · 지표 매트릭스', 'xlsx/PNG 내보내기 · WebSocket 실시간 수신'] },
  { title: '운영 DB 보호·성능', items: ['용도별 행/바이트 상한', '방언별 실행 시간 상한', '요청 끊김 시 쿼리 취소', '동시 부하 실측으로 기본값 도출'] },
  { title: '보안·권한', items: ['SQL 인젝션 전수조사 · AST 허용목록', '렉서 기반 SQL 쓰기 판정', 'JWT 세션 결속 · OAuth2/OIDC · SAML', '5단계 RBAC · 연결 소유권(IDOR) 차단'] },
  { title: '배포·운영', items: ['폐쇄망 오프라인 패키지 · 원클릭 설치', 'Apache TLS · systemd · 사전압축', '임베디드 PGlite ↔ PostgreSQL 전환', 'Rocky/Ubuntu 원격 설치·재배포'] },
  { title: '품질 방법론', items: ['TDD · red-first · 뮤턴트 사망 확인', 'Docker 실DB 통합 · HTTP 경계 시험', 'Playwright E2E · 골든셋/블라인드 하네스', 'PR 5요소 · 작업기록 362편 · ADR'] },
  { title: 'AI 응용', items: ['RAG(ChromaDB · pgvector) 문서 QA', 'LLM 게이트웨이(OpenAI · Claude · Ollama)', 'NL→SQL(DB 능력 탐침 → 제약 프롬프트)', 'LangGraph 멀티에이전트'] },
];

export const PATH: { when: string; what: string; detail: string }[] = [
  { when: '2026.06 — 현재', what: '비즈플러그 · 풀스택 개발자', detail: 'GraeEye BI 편집기 전담. 서울시설공단 폐쇄망 설치(08) → 재배포(10).' },
  { when: '2026.01 — 05', what: '1인 개발 · AI 응용', detail: 'NovelAIne, Orbit Agent Web, ServerOps Simulator, Wall-E 팀 프로젝트.' },
  { when: '2022 — 2024', what: '1인 개발 · 웹', detail: 'Vue 3 → React/Next.js. TypeScript 웹앱 20여 개 구현·배포.' },
  { when: '2011 — 2018', what: '충북대학교 바이오시스템공학과', detail: '중퇴. GTQ 1급(2020), 웹디자인기능사(2011).' },
];

export const NAV = [
  { label: '작업', href: '/#work' },
  { label: '방식', href: '/#about' },
  { label: '이력', href: '/#path' },
  { label: '연락', href: '/#contact' },
];

export const PRINCIPLES: { title: string; body: string }[] = [
  { title: '결함은 실측으로 확정한다', body: '가설이 아니라 실엔진 시험·브라우저 재현·고객 서버 측정으로 원인을 고정합니다. 전제가 뒤집히면 그 반전을 문서 제목에 남깁니다.' },
  { title: '경계 산출물을 단언한다', body: '테스트는 "전송된 SQL"과 "저장된 레코드"처럼 밖으로 나가는 것을 봅니다. 순수 계층이 초록인데 호출부에서 뚫리는 실패를 여섯 번 겪고 규칙으로 만들었습니다.' },
  { title: '코드 전에 계약을 쓴다', body: '결과 소유권·필터 관철처럼 여러 PR에 걸치는 변경은 불변식을 먼저 문서로 합의하고 묶음으로 나눠 머지합니다.' },
  { title: '남은 위험을 적는다', body: 'PR 본문은 문제 / 접근 / 범위 / 검증 / 남은 위험. 측정이 틀렸으면 정정을 본문에 남깁니다.' },
];
