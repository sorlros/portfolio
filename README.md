# 최규철 포트폴리오

BI/대시보드 풀스택 개발자 최규철의 개인 포트폴리오. GraeEye 케이스 스터디 4편(운영 DB 보호 관문 · SQL 쓰기 판정 분류기 · 계층 선언 없는 자동 탐색 · 폐쇄망 오프라인 배포)과 작업 색인, 일하는 방식, 이력, 연락 폼.

## 실행

```bash
npm install
npm run dev        # 개발 서버
npm run build      # tsc + vite build → dist/
npm run preview    # 빌드 결과 미리보기 (:4173)
npm run check      # Playwright: 390·360·1440 폭 가로 넘침·콘솔 검사 + OG 이미지 재생성 (preview 서버 필요)
```

## 내용 수정

모든 문구·수치는 `src/content.ts` 한 곳에 있다. 케이스 스터디 본문은 `src/pages/cases/*.tsx`, 데모는 `src/components/demos/*.tsx`. 이력서·경력기술서 PDF는 `public/resume.pdf`, `public/career.pdf`.

## 배포 (Vercel)

`vercel.json`의 SPA rewrite로 깊은 경로 직접 접속이 동작한다. 연락 폼은 `api/contact.ts`(서버리스). SMTP 환경변수(`.env.example`)가 없으면 503과 함께 "메일로 직접 연락" 안내로 동작하고, 화면에는 이메일이 항상 노출된다.

## 디자인

컨셉 "장부(Ledger)": 종이·잉크 편집 디자인 + 괘선 텍스처 + 표 숫자. 표시 글꼴 Noto Serif KR, 본문 Pretendard, 메타 JetBrains Mono. 케이스마다 잉크색이 바뀌고 라우트 커튼이 그 색을 쓴다. 모든 모션은 `prefers-reduced-motion`을 따른다.
