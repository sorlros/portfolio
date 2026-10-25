import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useRouter } from '../lib/router';
import { NAV, PROFILE } from '../content';
import { startScroll, stopScroll, gsap, prefersReducedMotion } from '../lib/smooth';

export function Nav() {
  const [open, setOpen] = useState(false);
  const { path } = useRouter();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (open) stopScroll(); else startScroll();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <>
      <a className="skip" href="#main">본문으로 건너뛰기</a>
      <header className="nav">
        <Link href="/" className="nav__brand" aria-label="홈"><i aria-hidden="true" />{PROFILE.nameLatin}</Link>
        <nav className="nav__links" aria-label="주 메뉴">
          {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
          <Link href={PROFILE.resume} download>이력서</Link>
        </nav>
        <button className="nav__menu" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>Menu</button>
      </header>
      <div className="menu" id="menu" data-open={open} aria-hidden={!open} style={{ transition: prefersReducedMotion ? 'none' : 'clip-path .7s cubic-bezier(.16,1,.3,1)' }}>
        <button className="menu__close" onClick={() => setOpen(false)}>닫기</button>
        {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
        <a href={PROFILE.resume} download>이력서 PDF</a>
      </div>
    </>
  );
}

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion || matchMedia('(pointer: coarse)').matches || !dot.current) return;
    const el = dot.current;
    const x = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
    const move = (e: PointerEvent) => { x(e.clientX); y(e.clientY); };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
      el.dataset.label = t?.dataset.cursor || '';
      el.classList.toggle('is-big', !!t);
    };
    addEventListener('pointermove', move); addEventListener('pointerover', over);
    return () => { removeEventListener('pointermove', move); removeEventListener('pointerover', over); };
  }, []);
  return <div ref={dot} className="cursor" aria-hidden="true" />;
}

export function Contact() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    setState('sending'); setMsg('보내는 중…');
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setState('sent'); setMsg('보냈습니다. 곧 답장드리겠습니다.'); (e.target as HTMLFormElement).reset(); }
      else { setState('error'); setMsg(j.message || `보내지 못했습니다. ${PROFILE.email} 로 직접 보내주세요.`); }
    } catch { setState('error'); setMsg(`보내지 못했습니다. ${PROFILE.email} 로 직접 보내주세요.`); }
  };
  return (
    <section className="contact wrap" id="contact" aria-labelledby="contact-h">
      <div className="contact__grid">
        <div>
          <p className="lbl" data-reveal="">Sheet 06 — Contact</p>
          <h2 className="contact__title" id="contact-h" data-reveal="">편하게 연락 주세요.</h2>
          <p className="contact__sub" data-reveal="">채용 제안, 협업, 작업에 대한 질문 모두 이메일로 받습니다.</p>
          <div className="contact__links" data-reveal="">
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
            <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">github.com/sorlros</a>
            <a href={PROFILE.resume} download>이력서 PDF 내려받기</a>
            <a href={PROFILE.career} download>경력기술서 PDF 내려받기</a>
          </div>
        </div>
        <form className="form" onSubmit={onSubmit} data-reveal="" aria-describedby="form-status">
          <div className="field"><label htmlFor="f-name">이름</label><input id="f-name" name="name" required maxLength={80} autoComplete="name" /></div>
          <div className="field"><label htmlFor="f-email">이메일</label><input id="f-email" name="email" type="email" required maxLength={120} autoComplete="email" /></div>
          <div className="field"><label htmlFor="f-msg">메시지</label><textarea id="f-msg" name="message" required minLength={10} maxLength={3000} /></div>
          <div className="hp" aria-hidden="true"><label htmlFor="f-web">website</label><input id="f-web" name="website" tabIndex={-1} autoComplete="off" /></div>
          <div><button className="pill pill--solid" type="submit" disabled={state === 'sending'}>메시지 보내기</button></div>
          <p className="form__status" id="form-status" aria-live="polite">{msg}</p>
        </form>
      </div>
      <footer className="footer">
        <span>© 2026 {PROFILE.name}</span>
        <span>{PROFILE.location} · {PROFILE.availability}</span>
        <span>Drawn, not rendered · Vite · React · GSAP</span>
      </footer>
    </section>
  );
}
