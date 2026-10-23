import { useRef, useState } from 'react';
import { CAPABILITIES, FLAGSHIPS, PATH, PRINCIPLES, PROFILE, STATS, WORKS, type WorkKind } from '../content';
import { Link } from '../lib/router';
import { Scrub, Split, useHeroIntro, useMeta, useReveals } from '../lib/motion';
import { Contact, Nav } from '../components/Chrome';

const KINDS: (WorkKind | '전체')[] = ['전체', 'BI', 'Systems', 'AI', 'Web'];

export function Home() {
  const scope = useRef<HTMLDivElement>(null);
  useMeta(`${PROFILE.name} — ${PROFILE.role}`, PROFILE.lede, '#F3EFE6', '/');
  useHeroIntro(scope); useReveals(scope);
  const [kind, setKind] = useState<WorkKind | '전체'>('전체');
  const works = WORKS.filter((w) => kind === '전체' || w.kind === kind);
  return (
    <div ref={scope}>
      <Nav />
      <main id="main">
        <section className="hero wrap" aria-labelledby="hero-h">
          <div>
            <p className="hero__meta" data-hero-fade="">
              <span><b>{PROFILE.role}</b></span><span>{PROFILE.location}</span><span>{PROFILE.availability}</span><span>2026</span>
            </p>
            <h1 className="hero__title" id="hero-h">
              <span data-hero-line=""><span>운영 DB를 지키면서</span></span>
              <span data-hero-line=""><span><em>빠르게 보여주는</em></span></span>
              <span data-hero-line=""><span>BI를 만듭니다.</span></span>
            </h1>
          </div>
          <div>
            <div className="hero__bottom">
              <p className="hero__lede" data-hero-fade="">{PROFILE.lede}</p>
              <div className="hero__cta" data-hero-fade="">
                <Link href="/#work" className="pill pill--solid">작업 보기</Link>
                <Link href={PROFILE.resume} className="pill" download>이력서 PDF</Link>
              </div>
            </div>
            <div className="hero__stats" data-hero-fade="">
              {STATS.map((s) => <div className="stat" key={s.label}><b className="num">{s.value}</b><span>{s.label}</span><small>{s.note}</small></div>)}
            </div>
          </div>
        </section>

        <section className="section wrap" id="work" aria-labelledby="work-h">
          <div className="sh" data-reveal=""><span className="mono" id="work-h">(01) 대표 작업 — GraeEye</span><p>셀프서비스 BI 편집기에서 혼자 풀어낸 문제 네 가지. 각 페이지에 직접 만져 볼 수 있는 축소판 데모가 있습니다.</p></div>
          <div className="flag" role="list">
            {FLAGSHIPS.map((f) => (
              <Link key={f.slug} href={f.path} label={f.name} color={f.accent} className="flag__card" role="listitem" data-reveal="" data-cursor="Open" style={{ '--card-bg': f.bg, '--card-accent': f.accent } as React.CSSProperties}>
                <span className="flag__index">({f.index})</span>
                <div>
                  <span className="flag__kicker">{f.kicker}</span>
                  <h3 className="flag__name">{f.name}</h3>
                  <p className="flag__tag">{f.tagline}</p>
                </div>
                <div className="flag__side">
                  {f.metrics.slice(0, 2).map((m) => <div className="flag__m" key={m.label}><b className="num">{m.value}</b><span>{m.label}</span></div>)}
                  <span className="flag__arrow">케이스 스터디 <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 10 10 2M4 2h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section wrap" aria-labelledby="index-h">
          <div className="sh" data-reveal=""><span className="mono" id="index-h">(02) 작업 색인</span><p>GraeEye의 다른 묶음과 회사 경력 전 1인 개발 프로젝트.</p></div>
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
          <div className="sh" data-reveal=""><span className="mono" id="about-h">(03) 일하는 방식</span><p>PR 1,114건이 같은 틀로 남아 있는 이유.</p></div>
          <div className="about">
            <Scrub className="statement" text={PROFILE.statement} />
            <div className="principles">
              {PRINCIPLES.map((p) => <div className="principle" key={p.title} data-reveal=""><h3>{p.title}</h3><p>{p.body}</p></div>)}
            </div>
          </div>
          <div style={{ marginTop: 'clamp(2.5rem, 6vw, 5rem)' }}>
            <Split as="h3" className="display" text="면접에서 설명할 수 있는 것만 적었습니다." />
            <div className="caps" style={{ marginTop: 22 }}>
              {CAPABILITIES.map((c) => (
                <div className="cap" key={c.title} data-reveal=""><h3>{c.title}</h3><ul role="list">{c.items.map((i) => <li key={i}>{i}</li>)}</ul></div>
              ))}
            </div>
          </div>
        </section>

        <section className="section wrap" id="path" aria-labelledby="path-h">
          <div className="sh" data-reveal=""><span className="mono" id="path-h">(04) 이력</span><p>회사 경력은 5개월, 코드는 5년.</p></div>
          <div className="path">
            {PATH.map((p) => <div className="path__row" key={p.when} data-reveal=""><span className="mono">{p.when}</span><b>{p.what}</b><p>{p.detail}</p></div>)}
          </div>
        </section>
      </main>
      <Contact />
    </div>
  );
}
