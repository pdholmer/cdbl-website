import { FIELD_VIEWBOX, BASES, type Point, type Runner } from "@/lib/situationsField";

export interface SituationFieldProps {
  positions: Record<string, Point>;
  runners?: Runner[];
  ball?: Point | null;
  /** Previous keyframe, used to draw trajectory lines + ghosts in scrub mode. */
  ghost?: {
    positions: Record<string, Point>;
    runners?: Runner[];
    ball?: Point | null;
  } | null;
  className?: string;
}

const MOVE_EPSILON = 2;

const moved = (a?: Point | null, b?: Point | null) =>
  !!a && !!b && Math.hypot(a.x - b.x, a.y - b.y) > MOVE_EPSILON;

const Bag = ({ x, y, size = 9 }: { x: number; y: number; size?: number }) => (
  <rect
    x={x - size / 2}
    y={y - size / 2}
    width={size}
    height={size}
    transform={`rotate(45 ${x} ${y})`}
    fill="hsl(0 0% 100%)"
    stroke="hsl(30 25% 55%)"
    strokeWidth={1}
  />
);

/**
 * SVG baseball field for the Situations Trainer.
 * All coordinates are in the canonical 400x500 space (see src/lib/situationsField.ts).
 */
export const SituationField = ({
  positions,
  runners = [],
  ball,
  ghost,
  className,
}: SituationFieldProps) => {
  const grass = "hsl(140 38% 24%)";
  const grassDark = "hsl(140 40% 19%)";
  const dirt = "hsl(28 42% 58%)";

  return (
    <svg
      viewBox={FIELD_VIEWBOX}
      className={className}
      role="img"
      aria-label="Baseball field diagram showing defensive positions"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <radialGradient id="sf-grass" cx="50%" cy="70%" r="80%">
          <stop offset="0%" stopColor={grass} />
          <stop offset="100%" stopColor={grassDark} />
        </radialGradient>
        <filter id="sf-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.35" />
        </filter>
      </defs>

      <rect x={0} y={0} width={400} height={500} rx={16} fill="url(#sf-grass)" />

      {/* Outfield warning track arc */}
      <path
        d="M 200 478 L -40 238 A 340 340 0 0 1 440 238 L 200 478 Z"
        fill="none"
      />
      <path
        d="M 8 300 A 300 300 0 0 1 392 300"
        fill="none"
        stroke={dirt}
        strokeWidth={10}
        opacity={0.55}
      />

      {/* Infield dirt */}
      <path
        d="M 200 478 L 40 318 A 226 226 0 0 1 360 318 Z"
        fill={dirt}
        opacity={0.95}
      />
      {/* Infield grass diamond */}
      <path
        d="M 200 440 L 316 334 L 200 224 L 84 334 Z"
        fill="url(#sf-grass)"
        opacity={0.92}
      />

      {/* Basepaths */}
      <path
        d={`M ${BASES.home.x} ${BASES.home.y} L ${BASES.first.x} ${BASES.first.y} L ${BASES.second.x} ${BASES.second.y} L ${BASES.third.x} ${BASES.third.y} Z`}
        fill="none"
        stroke={dirt}
        strokeWidth={9}
        strokeLinejoin="round"
      />

      {/* Pitcher's mound */}
      <circle cx={200} cy={334} r={26} fill={dirt} opacity={0.9} />
      <rect x={195} y={330} width={10} height={4} rx={1} fill="hsl(0 0% 100%)" opacity={0.9} />

      {/* Foul lines */}
      <line x1={200} y1={478} x2={-20} y2={258} stroke="hsl(0 0% 100%)" strokeWidth={2.5} opacity={0.85} />
      <line x1={200} y1={478} x2={420} y2={258} stroke="hsl(0 0% 100%)" strokeWidth={2.5} opacity={0.85} />

      {/* Bags */}
      <Bag x={BASES.first.x} y={BASES.first.y} />
      <Bag x={BASES.second.x} y={BASES.second.y} />
      <Bag x={BASES.third.x} y={BASES.third.y} />
      <path
        d={`M ${BASES.home.x - 7} ${BASES.home.y - 6} L ${BASES.home.x + 7} ${BASES.home.y - 6} L ${BASES.home.x + 7} ${BASES.home.y + 2} L ${BASES.home.x} ${BASES.home.y + 9} L ${BASES.home.x - 7} ${BASES.home.y + 2} Z`}
        fill="hsl(0 0% 100%)"
        stroke="hsl(30 25% 55%)"
        strokeWidth={1}
      />

      {/* --- Ghost layer (scrub mode) --- */}
      {ghost && (
        <g>
          {Object.entries(positions).map(([key, p]) => {
            const prev = ghost.positions?.[key];
            if (!moved(prev, p)) return null;
            return (
              <g key={`g-${key}`}>
                <circle cx={prev!.x} cy={prev!.y} r={13} fill="hsl(0 0% 100%)" opacity={0.22} />
                <line
                  x1={prev!.x}
                  y1={prev!.y}
                  x2={p.x}
                  y2={p.y}
                  stroke="hsl(0 0% 100%)"
                  strokeWidth={2.5}
                  strokeDasharray="7 6"
                  strokeLinecap="round"
                  opacity={0.8}
                />
              </g>
            );
          })}

          {runners.map((r) => {
            const prev = ghost.runners?.find((g) => g.id === r.id);
            if (!moved(prev, r)) return null;
            return (
              <g key={`gr-${r.id}`}>
                <circle cx={prev!.x} cy={prev!.y} r={10} fill="hsl(0 72% 51%)" opacity={0.25} />
                <line
                  x1={prev!.x}
                  y1={prev!.y}
                  x2={r.x}
                  y2={r.y}
                  stroke="hsl(0 80% 62%)"
                  strokeWidth={2.5}
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  opacity={0.85}
                />
              </g>
            );
          })}

          {/* Ball path — deliberately the most prominent line */}
          {moved(ghost.ball, ball) && (
            <g>
              <circle cx={ghost.ball!.x} cy={ghost.ball!.y} r={6} fill="hsl(48 100% 60%)" opacity={0.3} />
              <line
                x1={ghost.ball!.x}
                y1={ghost.ball!.y}
                x2={ball!.x}
                y2={ball!.y}
                stroke="hsl(0 0% 8%)"
                strokeWidth={6}
                strokeDasharray="10 7"
                strokeLinecap="round"
                opacity={0.35}
              />
              <line
                x1={ghost.ball!.x}
                y1={ghost.ball!.y}
                x2={ball!.x}
                y2={ball!.y}
                stroke="hsl(48 100% 60%)"
                strokeWidth={4}
                strokeDasharray="10 7"
                strokeLinecap="round"
              />
            </g>
          )}
        </g>
      )}

      {/* --- Runners --- */}
      {runners.map((r) => (
        <g key={r.id} filter="url(#sf-shadow)">
          <circle cx={r.x} cy={r.y} r={11.5} fill="hsl(0 72% 46%)" stroke="hsl(0 0% 100%)" strokeWidth={2} />
          <text
            x={r.x}
            y={r.y + 3.6}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            fill="hsl(0 0% 100%)"
          >
            R
          </text>
        </g>
      ))}

      {/* --- Defenders --- */}
      {Object.entries(positions).map(([key, p]) => (
        <g key={key} filter="url(#sf-shadow)">
          <circle cx={p.x} cy={p.y} r={15} fill="hsl(0 0% 100%)" stroke="hsl(215 30% 22%)" strokeWidth={1.75} />
          <text
            x={p.x}
            y={p.y + 4}
            textAnchor="middle"
            fontSize={key.length > 1 ? 9.5 : 11}
            fontWeight={800}
            fill="hsl(215 35% 18%)"
          >
            {key}
          </text>
        </g>
      ))}

      {/* --- Ball --- */}
      {ball && (
        <g filter="url(#sf-shadow)">
          <circle cx={ball.x} cy={ball.y} r={7} fill="hsl(0 0% 100%)" stroke="hsl(215 30% 25%)" strokeWidth={1} />
          <path
            d={`M ${ball.x - 3.5} ${ball.y - 4.5} Q ${ball.x - 1} ${ball.y} ${ball.x - 3.5} ${ball.y + 4.5}`}
            fill="none"
            stroke="hsl(0 72% 46%)"
            strokeWidth={1.2}
          />
          <path
            d={`M ${ball.x + 3.5} ${ball.y - 4.5} Q ${ball.x + 1} ${ball.y} ${ball.x + 3.5} ${ball.y + 4.5}`}
            fill="none"
            stroke="hsl(0 72% 46%)"
            strokeWidth={1.2}
          />
        </g>
      )}
    </svg>
  );
};

export default SituationField;
