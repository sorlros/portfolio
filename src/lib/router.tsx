import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { gsap, prefersReducedMotion, scrollToTop, scrollToTarget, ScrollTrigger } from './smooth';

export const normalizePath = (p: string) => { const n = p.replace(/\/+$/, '').toLowerCase(); return n === '' ? '/' : n; };
type Ctx = { path: string; navigate: (to: string, label?: string, color?: string) => void };
const RouterCtx = createContext<Ctx>({ path: '/', navigate: () => {} });
export const useRouter = () => useContext(RouterCtx);

export function Router({ children }: { children: (path: string) => ReactNode }) {
  const [path, setPath] = useState(() => normalizePath(location.pathname));
  const busy = useRef(false);
  const curtain = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLElement>(null);
  const pendingHash = useRef<string | null>(null);

  const swap = (to: string) => { setPath(normalizePath(to)); scrollToTop(); requestAnimationFrame(() => ScrollTrigger.refresh()); };

  const navigate = (to: string, name = '', color = '') => {
    const url = new URL(to, location.origin);
    const target = normalizePath(url.pathname);
    if (target === path) { if (url.hash) scrollToTarget(url.hash); else scrollToTop(); history.replaceState(null, '', url.pathname + url.hash); return; }
    if (busy.current) return;
    pendingHash.current = url.hash || null;
    history.pushState(null, '', url.pathname + url.hash);
    if (prefersReducedMotion || !curtain.current) { swap(target); return; }
    busy.current = true;
    const c = curtain.current; const l = label.current;
    c.style.setProperty('--curtain', color || 'var(--fg)');
    if (l) l.textContent = name;
    gsap.timeline({ onComplete: () => { busy.current = false; } })
      .set(c, { clipPath: 'inset(100% 0 0 0)', pointerEvents: 'auto' })
      .to(c, { clipPath: 'inset(0% 0 0 0)', duration: 0.75, ease: 'expo.inOut' })
      .from(l, { yPercent: 110, duration: 0.6, ease: 'expo.out' }, '-=0.35')
      .add(() => swap(target))
      .to(c, { clipPath: 'inset(0 0 100% 0)', duration: 0.75, ease: 'expo.inOut', delay: 0.15 })
      .set(c, { pointerEvents: 'none', clipPath: 'inset(100% 0 0 0)' });
  };

  useEffect(() => {
    const onPop = () => { setPath(normalizePath(location.pathname)); pendingHash.current = location.hash || null; scrollToTop(); requestAnimationFrame(() => ScrollTrigger.refresh()); };
    addEventListener('popstate', onPop); return () => removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    if (pendingHash.current) { const h = pendingHash.current; pendingHash.current = null; setTimeout(() => scrollToTarget(h), 120); }
    else if (location.hash) { const h = location.hash; setTimeout(() => scrollToTarget(h), 200); }
  }, [path]);

  return (
    <RouterCtx.Provider value={{ path, navigate }}>
      {children(path)}
      <div className="curtain" ref={curtain} aria-hidden="true"><span><em ref={label} /></span></div>
    </RouterCtx.Provider>
  );
}

export function Link({ href, children, className, label, color, ...rest }: { href: string; children: ReactNode; className?: string; label?: string; color?: string; [k: string]: unknown }) {
  const { navigate } = useRouter();
  const external = /^(https?:|mailto:|tel:)/.test(href) || href.endsWith('.pdf');
  if (external) return <a href={href} className={className} target={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : '_blank'} rel="noopener noreferrer" {...rest}>{children}</a>;
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault(); navigate(href, label, color);
  };
  return <a href={href} className={className} onClick={onClick} {...rest}>{children}</a>;
}
