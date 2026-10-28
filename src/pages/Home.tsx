import { useRef, useState } from 'react';
import { AI_FLOW, AI_STATS, CAPABILITIES, FLAGSHIPS, PATH, PRINCIPLES, PROFILE, STATS, WORKS, type WorkKind } from '../content';
import { Link } from '../lib/router';
import { Scrub, Split, useHeroIntro, useMeta, useReveals } from '../lib/motion';
import { Contact, Nav } from '../components/Chrome';
import { Fig, FigAgents } from '../components/Fig';
import { Clip } from '../components/Clip';

const KINDS: (WorkKind | '전체')[] = ['전체', 'BI', 'Systems', 'AI', 'Web'];
const MARQ = ['운영 DB 보호', '대시보드 자동 구성', '고객사 배포·장애 수리', 'SQL 안전 판정', '실측으로 확인', '기획부터 배포까지'];

export function Home() {
  const scope = useRef<HTMLDivElement>(null);
  useMeta(`${PROFILE.name} — ${PROFILE.role}`, PROFILE.lede, '#070D1A', '/');
  useHeroIntro(scope); useReveals(scope);
  const [kind, setKind] = useState<WorkKind | '전체'>('전체');
  const works = WORKS.filter((w) => kind === '전체' || w.kind === kind);
  return (
    <div ref={scope}>
      <Nav />
      <main id="main">
        <section className="hero wrap" aria-labelledby="hero-h">
          <p className="hero__meta" data-hero-fade="">
            <span><b>{PROFILE.role}</b></span><span>{PROFILE.location}</span><span>{PROFILE.availability}</span><span>2026.10 기준</span>
          </p>
          <div className="hero__main">
            <div>
              <h1 className="hero__title hero__title--ko" id="hero-h" aria-label="DB는 지키고, 화면은 빠르게.">
                <span data-hero-line="" aria-hidden="true"><span>DB는</span></span>
                <span data-hero-line="" aria-hidden="true"><span className="k">지키고,</span></span>
                <span data-hero-line="" aria-hidden="true"><span>화면은 <em>빠르게.</em></span></span>
              </h1>
              <p className="hero__kr" data-hero-fade="">{PROFILE.positioning}</p>
            </div>
            <div data-hero-fade=""><Fig /></div>
          </div>
          <div>
            <div className="hero__bottom">
              <p className="hero__lede" data-hero-fade="">{PROFILE.lede}</p>
              <div className="hero__cta" data-hero-fade="">
                <Link href="/#work" className="pill pill--solid">작업 보기</Link>
                <Link href="/#contact" className="pill">연락하기</Link>
              </div>
            </div>
          </div>
        </section>

        <div className="marq" aria-hidden="true">
          <div className="marq__track">{[...MARQ, ...MARQ].map((m, i) => <span key={i}>{m} <i>✦</i></span>)}</div>
        </div>

        <section className="wrap" aria-label="핵심 수치">
          <div className="hero__stats hero__stats--3" data-reveal="">
            {STATS.map((s, i) => <div className="stat" key={s.label} data-n={`A-${i + 1}`}><b className="num">{s.value}</b><span>{s.label}</span><small>{s.note}</small></div>)}
          </div>
        </section>

        <section className="section wrap" id="product" aria-labelledby="product-h">
          <div className="sh" data-reveal=""><span className="lbl" id="product-h">제품 화면 <small>Sheet 00</small></span><p>제가 맡아 개선하는 BI 편집기를 실제로 조작한 화면 · 데이터는 가상</p></div>
          <div className="shots shots--clips" data-reveal="">
            <figure className="shot corner">
              <span className="fig__t">대시보드 구성 자동화</span>
              <Clip name="graeeye-automation" title="대시보드 구성 자동화" label="GraeEye 대시보드 구성 자동화 시연: SQL 한 줄을 입력하고 대시보드 만들기를 누르면 추천 구성 카드가 뜨고, 하나를 고르면 제목·KPI·차트 2개·표가 한 번에 배치된 뒤 미리보기로 전환된다" />
              <figcaption className="shot__cap">SQL 한 줄 → 「대시보드 만들기」 → 추천 구성 하나를 고르면 제목·KPI·차트·표가 한 번에 배치됩니다. <Link href="/work/automation">자세히 →</Link></figcaption>
            </figure>
            <figure className="shot corner">
              <span className="fig__t">클릭해 나눠 보기 (자동 탐색)</span>
              <Clip name="graeeye-explore" title="클릭해 나눠 보기 (자동 탐색)" label="GraeEye 자동 탐색 시연: 9월 막대를 눌러 나눠 보기 후보 중 처리상태를 고르고, 다시 처리중 막대를 눌러 민원유형으로 나눈 뒤 처음 화면으로 돌아온다" />
              <figcaption className="shot__cap">막대를 누르면 나눠 볼 기준이 조각 수와 함께 뜹니다. 계층을 미리 정하지 않아도 연달아 내려갈 수 있습니다. <Link href="/work/exploration">자세히 →</Link></figcaption>
            </figure>
          </div>
        </section>

        <section className="section wrap" id="work" aria-labelledby="work-h">
          <div className="sh" data-reveal=""><span className="lbl" id="work-h">대표 작업 · GraeEye <small>Sheet 01</small></span><p>BI 편집기를 맡아 기획·설계·구현한 문제 다섯 가지 · 각 페이지에 직접 눌러 보는 데모</p></div>
          <div className="flag" role="list">
            {FLAGSHIPS.map((f) => (
              <Link key={f.slug} href={f.path} label={f.name} color={f.accent} className="flag__card corner" role="listitem" data-reveal="" data-cursor="Open">
                <span className="flag__id">작업 {f.index}</span>
                <div>
                  <div className="flag__index" aria-hidden="true">{f.index}</div>
                  <span className="flag__kicker">{f.kicker}</span>
                  <h3 className="flag__name">{f.name}</h3>
                  <p className="flag__tag">{f.tagline}</p>
                </div>
                <div className="flag__side">
                  {f.metrics.slice(0, 2).map((m) => <div className="flag__m" key={m.label}><b className="num">{m.value}</b><span>{m.label}</span></div>)}
                  <span className="flag__arrow" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M2 10 10 2M4 2h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section wrap" id="about" aria-labelledby="about-h">
          <div className="sh" data-reveal=""><span className="lbl" id="about-h">일하는 방식 <small>Sheet 02</small></span><p>PR 1,114건이 같은 틀로 남아 있는 이유</p></div>
          <div className="about">
            <Scrub className="statement" text={PROFILE.statement} />
            <div className="principles">
              {PRINCIPLES.map((p) => <div className="principle" key={p.title} data-reveal=""><h3>{p.title}</h3><p>{p.body}</p></div>)}
            </div>
          </div>
          <div style={{ marginTop: 'clamp(2.5rem, 6vw, 5rem)' }}>
            <Split as="h3" className="display" text="직접 설계하고 구현한 기술만 적었습니다." />
            <div className="caps" style={{ marginTop: 22 }}>
              {CAPABILITIES.map((c) => (
                <div className="cap" key={c.title} data-reveal=""><h3>{c.title}</h3><ul role="list">{c.items.map((i) => <li key={i}>{i}</li>)}</ul></div>
              ))}
            </div>
          </div>
        </section>

        <section className="section wrap" id="agents" aria-labelledby="agents-h">
          <div className="sh" data-reveal=""><span className="lbl" id="agents-h">AI 에이전트 운용 <small>Sheet 03</small></span><p>구현·교차검토는 에이전트에 위임하고, 결정·검증은 직접 맡는 개발 체계</p></div>
          <div className="agents">
            <div data-reveal=""><FigAgents /></div>
            <ol className="agents__flow" role="list">
              {AI_FLOW.map((a) => (
                <li key={a.step} className="agents__step" data-reveal="">
                  <div className="agents__head"><span className="mono">{a.step}</span><b className={a.who === '나' ? 'agents__me' : ''}>{a.who}</b></div>
                  <p>{a.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="hero__stats" data-reveal="" style={{ marginTop: 28 }}>
            {AI_STATS.map((s, i) => <div className="stat" key={s.label} data-n={`AI-${i + 1}`}><b className="num">{s.value}</b><span>{s.label}</span><small>{s.note}</small></div>)}
          </div>
        </section>

        <section className="section wrap" aria-labelledby="index-h">
          <div className="sh" data-reveal=""><span className="lbl" id="index-h">그 밖의 작업 <small>Sheet 04</small></span><p>GraeEye의 다른 작업 묶음과 회사 경력 전 1인 개발 프로젝트 · ↗ 표시는 GitHub 저장소로 연결</p></div>
          <div className="filters" role="group" aria-label="종류 필터" data-reveal="">
            {KINDS.map((k) => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>)}
          </div>
          <div role="list">
            {works.map((w, i) => {
              const cells = (<>
                <span className="row__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="row__name">{w.name}{w.href && <span className="row__go" aria-hidden="true"> ↗</span>}</span>
                <span className="row__blurb">{w.blurb}</span>
                <span className="row__stack">{w.stack.join(' · ')}</span>
                <span className="row__year">{w.year}</span>
              </>);
              return w.href
                ? <a key={w.name} href={w.href} target="_blank" rel="noopener noreferrer" className="row" role="listitem" data-reveal="">{cells}</a>
                : <div key={w.name} className="row row--static" role="listitem" data-reveal="">{cells}</div>;
            })}
          </div>
        </section>

        <section className="section wrap" id="path" aria-labelledby="path-h">
          <div className="sh" data-reveal=""><span className="lbl" id="path-h">이력 <small>Sheet 05</small></span><p>회사 경력은 5개월, 코드는 5년</p></div>
          <div className="path">
            {PATH.map((p) => <div className="path__row" key={p.when} data-reveal=""><span className="mono">{p.when}</span><b>{p.what}</b><p>{p.detail}</p></div>)}
          </div>
        </section>
      </main>
      <Contact />
    </div>
  );
}
