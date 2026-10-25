export function Fig() {
  return (
    <div className="fig corner" aria-label="FIG.1 쿼리 관문 구조도" role="img">
      <span className="fig__t">Fig.1 — Query gate</span>
      <svg viewBox="0 0 520 300" aria-hidden="true">
        <rect className="box" x="20" y="40" width="120" height="56" rx="2" /><text x="32" y="63">BROWSER</text><text x="32" y="80">widget · chart</text>
        <rect className="box" x="200" y="40" width="130" height="56" rx="2" /><text x="212" y="63">EXPRESS</text><text x="212" y="80">/api/database/query</text>
        <rect className="box" x="390" y="40" width="110" height="56" rx="2" /><text x="402" y="63">PG · MySQL</text><text x="402" y="80">· Oracle</text>
        <path className="wire" d="M140 68 H200" /><path className="wire" d="M330 68 H390" />
        <rect className="box box--acc" x="200" y="150" width="130" height="90" rx="2" /><text x="212" y="172">GATE</text><text x="212" y="190">rows ≤ 30,000</text><text x="212" y="205">bytes ≤ 12MB</text><text x="212" y="220">timeout 60s</text>
        <path className="wire" d="M265 96 V150" /><path className="wire" d="M330 195 H420 V96" strokeDasharray="3 3" /><text x="340" y="188">cancel on disconnect</text>
        <path className="dim" d="M20 270 H140" /><path className="dim" d="M20 264 V276" /><path className="dim" d="M140 264 V276" /><text className="dimt" x="40" y="290">79MB → 12MB</text>
        <path className="dim" d="M390 270 H500" /><path className="dim" d="M390 264 V276" /><path className="dim" d="M500 264 V276" /><text className="dimt" x="400" y="290">176s → 2.3s</text>
        <text x="20" y="130">NOTE: limits derived from 4c·16GB field server, 5×3 concurrent load test</text>
      </svg>
    </div>
  );
}

export function FigAgents() {
  return (
    <div className="fig corner" aria-label="FIG.2 사람과 에이전트의 역할 분담 구조도" role="img">
      <span className="fig__t">Fig.2 — Human-in-the-loop</span>
      <svg viewBox="0 0 520 330" aria-hidden="true">
        <rect className="box box--acc" x="180" y="18" width="160" height="58" rx="2" /><text x="194" y="41">ME · 결정</text><text x="194" y="58">결정표 · 목업 · 계획 파일</text>
        <rect className="box" x="20" y="140" width="170" height="64" rx="2" /><text x="32" y="164">IMPLEMENT AGENT</text><text x="32" y="181">Claude Code · 워크트리 A</text><text x="32" y="195">red → green → PR</text>
        <rect className="box" x="330" y="140" width="170" height="64" rx="2" /><text x="342" y="164">REVIEW AGENT</text><text x="342" y="181">Codex · 워크트리 B</text><text x="342" y="195">의뢰서 8절 → 지적</text>
        <rect className="box box--acc" x="180" y="252" width="160" height="58" rx="2" /><text x="194" y="275">ME · 검증</text><text x="194" y="292">재실행 · 뮤턴트 · 실측</text>
        <path className="wire" d="M220 76 L120 140" /><text x="96" y="110">plan.md</text>
        <path className="wire" d="M190 172 H330" /><text x="214" y="164">PR + 의뢰서</text>
        <path className="wire" d="M330 186 H190" strokeDasharray="3 3" /><text x="208" y="200">확인 / 반증 / 불확실</text>
        <path className="wire" d="M120 204 L220 252" /><path className="wire" d="M410 204 L300 252" />
        <path className="dim" d="M350 290 H500 V40 H340" /><text className="dimt" x="404" y="232">merge</text><text className="dimt" x="404" y="246">or 재계획</text>
      </svg>
    </div>
  );
}
