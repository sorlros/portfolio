import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion =
  typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const scrollState = { velocity: 0, scroll: 0 };
export const intro = { delay: 0.15 };

let lenis: Lenis | null = null;
export function initSmoothScroll() {
  if (lenis || prefersReducedMotion) return;
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
  lenis.on('scroll', (l: Lenis) => { scrollState.velocity = l.velocity; scrollState.scroll = l.scroll; ScrollTrigger.update(); });
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
export const scrollToTop = () => (lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0));
export function scrollToTarget(target: string | HTMLElement) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4), offset: -70 });
  else el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}
export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();
export { gsap, ScrollTrigger };
