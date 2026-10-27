import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { prefersReducedMotion, startScroll, stopScroll } from '../lib/smooth';

const Sources = ({ name }: { name: string }) => (
  <>
    <source src={`/videos/${name}.webm`} type="video/webm" />
    <source src={`/videos/${name}.mp4`} type="video/mp4" />
  </>
);

// 제품 시연 영상 — 카드 안에서는 소리 없이 반복 재생하고, 누르면 크게 보는 창으로 연다.
// 움직임 줄이기 설정이면 카드에서는 자동 재생하지 않는다(대표 이미지만 보이고, 크게 보기에서 재생 버튼).
export function Clip({ name, label, title }: { name: string; label: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [startAt, setStartAt] = useState(0);
  const inline = useRef<HTMLVideoElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const auto = !prefersReducedMotion;

  const show = () => {
    setStartAt(inline.current?.currentTime ?? 0);
    inline.current?.pause();
    setOpen(true);
  };
  const hide = () => {
    setOpen(false);
    if (auto) inline.current?.play().catch(() => {});
    opener.current?.focus();
  };

  return (
    <>
      <button ref={opener} type="button" className="clip__btn" onClick={show} aria-label={`${title} 영상 크게 보기`} data-cursor="크게">
        <video ref={inline} className="clip" poster={`/videos/${name}-poster.jpg`} autoPlay={auto} muted loop playsInline preload="metadata" aria-label={label}>
          <Sources name={name} />
        </video>
        <span className="clip__hint" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
          크게 보기
        </span>
      </button>
      {open && createPortal(<Lightbox name={name} label={label} title={title} startAt={startAt} onClose={hide} />, document.body)}
    </>
  );
}

function Lightbox({ name, label, title, startAt, onClose }: { name: string; label: string; title: string; startAt: number; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    stopScroll();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    return () => { removeEventListener('keydown', onKey); document.body.style.overflow = prev; startScroll(); };
  }, [onClose]);
  const onLoaded = () => {
    const v = video.current; if (!v) return;
    if (startAt > 0 && startAt < v.duration) v.currentTime = startAt;
    if (!prefersReducedMotion) v.play().catch(() => {});
  };
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} 영상`} onClick={onClose}>
      <figure className="lightbox__body" onClick={(e) => e.stopPropagation()}>
        <figcaption className="lightbox__bar">
          <span className="fig__t lightbox__t">{title}</span>
          <button ref={close} type="button" className="lightbox__close" onClick={onClose} aria-label="닫기">닫기 ✕</button>
        </figcaption>
        <video ref={video} className="lightbox__video" poster={`/videos/${name}-poster.jpg`} muted loop playsInline controls onLoadedMetadata={onLoaded} aria-label={label}>
          <Sources name={name} />
        </video>
      </figure>
    </div>
  );
}
