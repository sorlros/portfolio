import { Fragment, useEffect, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, prefersReducedMotion, intro } from './smooth';

export function useReveals(scope: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    if (prefersReducedMotion) return;
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) =>
      gsap.from(el, { y: 36, autoAlpha: 0, duration: 1.1, ease: 'expo.out',
        delay: parseFloat(el.dataset.delay || '0'),
        scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
    gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) =>
      gsap.from(el.querySelectorAll('.w > span'), { yPercent: 118, duration: 1.1, ease: 'expo.out', stagger: 0.04,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
    gsap.utils.toArray<HTMLElement>('[data-scrub]').forEach((el) =>
      gsap.to(el.querySelectorAll('.wd'), { opacity: 1, stagger: 0.03, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } }));
  }, { scope });
}

export function useHeroIntro(scope: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    if (prefersReducedMotion) return;
    gsap.timeline({ delay: intro.delay })
      .from('[data-hero-line] > span', { yPercent: 120, duration: 1.3, ease: 'expo.out', stagger: 0.08 })
      .from('[data-hero-fade]', { autoAlpha: 0, y: 20, duration: 1, ease: 'expo.out', stagger: 0.06 }, '-=0.9');
    intro.delay = 0.1;
  }, { scope });
}

export function Split({ text, as: Tag = 'h2', className }: { text: string; as?: 'h1' | 'h2' | 'h3' | 'p'; className?: string }) {
  const words = text.split(' ');
  return (
    <Tag className={className} data-split="" aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}><span className="w" aria-hidden="true"><span>{w}</span></span>{i < words.length - 1 ? ' ' : null}</Fragment>
      ))}
    </Tag>
  );
}

export function Scrub({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <p className={className} data-scrub="" aria-label={text}>
      {words.map((w, i) => (<Fragment key={i}><span className="wd" aria-hidden="true">{w}</span>{i < words.length - 1 ? ' ' : null}</Fragment>))}
    </p>
  );
}

const SITE = 'https://portfolio-woad-zeta-55.vercel.app';
export function useMeta(title: string, description: string, themeColor = '#F3EFE6', path = '/') {
  useEffect(() => {
    document.title = title;
    const set = (sel: string, attr: string, val: string) => {
      let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(sel);
      if (!el) { el = document.createElement(sel.startsWith('link') ? 'link' : 'meta'); const m = sel.match(/\[(\w+(?::\w+)?)="([^"]+)"\]/); if (m) el.setAttribute(m[1], m[2]); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };
    set('meta[name="description"]', 'content', description);
    set('meta[property="og:title"]', 'content', title);
    set('meta[property="og:description"]', 'content', description);
    set('meta[name="twitter:title"]', 'content', title);
    set('meta[name="twitter:description"]', 'content', description);
    set('meta[name="theme-color"]', 'content', themeColor);
    set('link[rel="canonical"]', 'href', SITE + path);
  }, [title, description, themeColor, path]);
}
