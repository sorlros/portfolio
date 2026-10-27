import { useRef, useState } from 'react';
import { AI_FLOW, AI_STATS, CAPABILITIES, FLAGSHIPS, PATH, PRINCIPLES, PROFILE, STATS, WORKS, type WorkKind } from '../content';
import { Link } from '../lib/router';
import { Scrub, Split, useHeroIntro, useMeta, useReveals } from '../lib/motion';
import { Contact, Nav } from '../components/Chrome';
import { Fig, FigAgents } from '../components/Fig';

const KINDS: (WorkKind | '전체')[] = ['전체', 'BI', 'Systems', 'AI', 'Web'];
const MARQ = ['1,114 merged PRs', '1,573 test files', '21 dashboard templates', '102 golden cases', '3 SQL dialects', '49 days uptime', '0.11MB login payload'];

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
            <span><b>{PROFILE.role}</b></span><span>{PROFILE.location}</span><span>{PROFILE.availability}</span><span>rev 2026.10</span>
          </p>
          <div className="hero__main">
            <div>
              <h1 className="hero__title" id="hero-h" aria-label="Guard the DB. Show it fast. 운영 DB를 지키면서 빠르게 보여주는 BI를 만듭니다.">
                <span data-hero-line="" aria-hidden="true"><span>Guard</span></span>
                <span data-hero-line="" aria-hidden="true"><span className="k">the DB.</span></span>
                <span data-hero-line="" aria-hidden="true"><span>Show it <em>fast.</em></span></span>
              </h1>
              <p className="hero__kr" data-hero-fade="">{PROFILE.positioning}</p>
            </div>
            <div data-hero-fade=""><Fig /></div>
          </div>
          <div>
            <div className="hero__bottom">
              <p className="hero__lede" data-hero-fade="">{PROFILE.lede}</p>
              <div className="hero__cta" data-hero-fade="">
                <Link href="/#work" className="pill pill--solid">View work</Link>
                <Link href={PROFILE.resume} className="pill" download>Resume PDF</Link>
              </div>
            </div>
          </div>
        </section>

        <div className="marq" aria-hidden="true">
          <div className="marq__track">{[...MARQ, ...MARQ].map((m, i) => <span key={i}>{m} <i>✦</i></span>)}</div>
        </div>

        <section className="wrap" aria-label="핵심 수치">
          <div className="hero__stats" data-reveal="">
            {STATS.map((s, i) => <div className="stat" key={s.label} data-n={`A-${i + 1}`}><b className="num">{s.value}</b><span>{s.label}</span><small>{s.note}</small></div>)}
          </div>
        </section>

        <section className="section wrap" id="product" aria-labelledby="product-h">
          <div className="sh" data-reveal=""><span className="lbl" id="product-h">Sheet 00 — Product, GraeEye</span><p>제가 맡아 개선하는 BI 편집기의 실제 화면 · 데이터는 가상</p></div>
          <div className="shots" data-reveal="">
            <figure className="shot corner"><span className="fig__t">완성된 대시보드 (미리보기)</span><img src="/shots/graeeye-preview.png" alt="GraeEye 미리보기 화면: 따릉이 이용 현황 대시보드. 조회 기간·자치구 조건, KPI 4개, 일별 대여 건수·강수량 차트, 이용권 구성 도넛, 자치구별 대여 막대" loading="lazy" /><figcaption className="shot__cap">조회 조건을 고르면 KPI·차트·표가 함께 바뀝니다.</figcaption></figure>
            <figure className="shot corner"><span className="fig__t">편집 화면</span><img src="/shots/graeeye-editor.png" alt="GraeEye 편집 화면: 왼쪽 화면 목록·데이터 소스, 가운데 캔버스, 오른쪽 페이지 설정 패널" loading="lazy" /><figcaption className="shot__cap">코드 없이 끌어다 놓아 화면을 만들고, DB 쿼리를 연결합니다.</figcaption></figure>
          </div>
        </section>

        <section className="section wrap" id="work" aria-labelledby="work-h">
          <div className="sh" data-reveal=""><span className="lbl" id="work-h">Sheet 01 — Flagship work, GraeEye</span><p>셀프서비스 BI 편집기를 전담하며 기획·설계·구현한 문제 다섯 가지 · 각 플레이트에 직접 만지는 데모</p></div>
          <div className="flag" role="list">
            {FLAGSHIPS.map((f) => (
              <Link key={f.slug} href={f.path} label={f.name} color={f.accent} className="flag__card corner" role="listitem" data-reveal="" data-cursor="Open">
                <span className="flag__id">Plate {f.index}</span>
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

        <section className="section wrap" aria-labelledby="index-h">
          <div className="sh" data-reveal=""><span className="lbl" id="index-h">Sheet 02 — Index</span><p>GraeEye의 다른 묶음과 회사 경력 전 1인 개발 프로젝트</p></div>
          <div className="filters" role="group" aria-label="종류 필터" data-reveal="">
            {KINDS.map((k) => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>)}
          </div>
          <div role="list">
            {works.map((w, i) => (
              <a key={w.name} href={w.href} target="_blank" rel="noopener noreferrer" className="row" role="listitem" data-reveal="">
                <span className="row__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="row__name">{w.name}</span>
                <span className="row__blurb">{w.blurb}</span>
                <span className="row__stack">{w.stack.join(' · ')}</span>
                <span className="row__year">{w.year}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="section wrap" id="about" aria-labelledby="about-h">
          <div className="sh" data-reveal=""><span className="lbl" id="about-h">Sheet 03 — Method</span><p>PR 1,114건이 같은 틀로 남아 있는 이유</p></div>
          <div className="about">
            <Scrub className="statement" text={PROFILE.statement} />
            <div className="principles">
              {PRINCIPLES.map((p) => <div className="principle" key={p.title} data-reveal=""><h3>{p.title}</h3><p>{p.body}</p></div>)}
            </div>
          </div>
          <div style={{ marginTop: 'clamp(2.5rem, 6vw, 5rem)' }}>
            <Split as="h3" className="display" text="Only what I can defend in an interview." />
            <div className="caps" style={{ marginTop: 22 }}>
              {CAPABILITIES.map((c) => (
                <div className="cap" key={c.title} data-reveal=""><h3>{c.title}</h3><ul role="list">{c.items.map((i) => <li key={i}>{i}</li>)}</ul></div>
              ))}
            </div>
          </div>
        </section>

        <section className="section wrap" id="agents" aria-labelledby="agents-h">
          <div className="sh" data-reveal=""><span className="lbl" id="agents-h">Sheet 04 — Working with AI agents</span><p>구현과 교차검토는 에이전트에게, 결정과 검증은 직접</p></div>
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

        <section className="section wrap" id="path" aria-labelledby="path-h">
          <div className="sh" data-reveal=""><span className="lbl" id="path-h">Sheet 05 — Path</span><p>회사 경력은 5개월, 코드는 5년</p></div>
          <div className="path">
            {PATH.map((p) => <div className="path__row" key={p.when} data-reveal=""><span className="mono">{p.when}</span><b>{p.what}</b><p>{p.detail}</p></div>)}
          </div>
        </section>
      </main>
      <Contact />
    </div>
  );
}
