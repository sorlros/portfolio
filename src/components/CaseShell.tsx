import { useEffect, useRef, type ReactNode } from 'react';
import { FLAGSHIPS, type Flagship } from '../content';
import { useMeta, useReveals, useHeroIntro } from '../lib/motion';
import { Link } from '../lib/router';
import { Nav, Contact } from './Chrome';

export function CaseShell({ f, children }: { f: Flagship; children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  useMeta(`${f.name} — 최규철`, f.tagline, '#070D1A', f.path);
  useHeroIntro(scope); useReveals(scope);
  useEffect(() => { document.documentElement.style.setProperty('--case-accent', f.accent); return () => { document.documentElement.style.removeProperty('--case-accent'); }; }, [f.accent]);
  const i = FLAGSHIPS.findIndex((x) => x.slug === f.slug);
  const next = FLAGSHIPS[(i + 1) % FLAGSHIPS.length];
  return (
    <div ref={scope} className="case" style={{ '--case-accent': f.accent, '--case-bg': f.bg, '--case-fg': f.fg } as React.CSSProperties}>
      <Nav />
      <main id="main">
        <section className="case__hero" aria-labelledby="case-h" data-index={f.index}>
          <div className="wrap">
            <p className="lbl" data-hero-fade="">Plate {f.index} — {f.kicker}</p>
            <h1 id="case-h"><span data-hero-line=""><span>{f.name}</span></span></h1>
            <p className="tag" data-hero-fade="">{f.tagline}</p>
            <div className="case__facts" data-hero-fade="">
              <div><b>역할</b><span>{f.role}</span></div>
              <div><b>기간</b><span>{f.period}</span></div>
              <div><b>스택</b><span>{f.stack.join(' · ')}</span></div>
              <div><b>근거</b><span>{f.evidence.slice(0, 3).join(' · ')}</span></div>
            </div>
          </div>
        </section>
        <section className="wrap" aria-label="핵심 지표">
          <div className="case__metrics" data-reveal="">
            {f.metrics.map((m, i) => <div className="stat" key={m.label} data-n={`${f.index}-${i + 1}`}><b className="num">{m.value}</b><span>{m.label}</span></div>)}
          </div>
        </section>
        {children}
        <section className="wrap">
          <div className="next" data-reveal="">
            <span className="lbl">Next plate</span>
            <Link href={next.path} label={next.name} color={next.accent} data-cursor="Open"><span className="mono" style={{ fontSize: "1rem" }}>{next.index}</span> <span>{next.name}</span> →</Link>
          </div>
        </section>
      </main>
      <Contact />
    </div>
  );
}

export function Block({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="wrap" aria-labelledby={`b-${n}`}>
      <div className="case__body" data-reveal="">
        <span className="lbl">{n}</span>
        <div><h2 id={`b-${n}`}>{title}</h2>{children}</div>
      </div>
    </section>
  );
}
