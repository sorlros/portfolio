import { useRef } from 'react';
import { Nav } from '../components/Chrome';
import { Link } from '../lib/router';
import { useHeroIntro, useMeta } from '../lib/motion';
export function NotFound() {
  const scope = useRef<HTMLDivElement>(null);
  useMeta('404 — 최규철', '페이지를 찾지 못했습니다.', '#070D1A', '/404');
  useHeroIntro(scope);
  return (
    <div ref={scope}><Nav /><main id="main" className="nf wrap">
      <h1><span data-hero-line=""><span>없는</span></span><span data-hero-line=""><span><em>페이지입니다.</em></span></span></h1>
      <p data-hero-fade="">404 — 이 주소에는 도면이 없습니다. 숫자가 틀린 건 아니고, 페이지가 없는 겁니다.</p>
      <p data-hero-fade="" style={{ marginTop: 26 }}><Link href="/" className="pill pill--solid">처음으로</Link></p>
    </main></div>
  );
}
