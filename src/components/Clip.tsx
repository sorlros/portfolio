import { prefersReducedMotion } from '../lib/smooth';

// 제품 시연 영상 — 소리 없이 반복 재생. 움직임 줄이기 설정이면 자동 재생하지 않고 재생 버튼을 둔다.
export function Clip({ name, label }: { name: string; label: string }) {
  const auto = !prefersReducedMotion;
  return (
    <video
      className="clip"
      poster={`/videos/${name}-poster.jpg`}
      autoPlay={auto}
      muted
      loop
      playsInline
      controls={!auto}
      preload="metadata"
      aria-label={label}
    >
      <source src={`/videos/${name}.webm`} type="video/webm" />
      <source src={`/videos/${name}.mp4`} type="video/mp4" />
    </video>
  );
}
