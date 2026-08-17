import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw } from "lucide-react";
import SituationField from "@/components/training/SituationField";
import type { SituationStep } from "@/hooks/useTraining";
import { DEFAULT_POSITIONS, easeInOut, lerpPoint, type Point, type Runner } from "@/lib/situationsField";

const TRANSITION_MS = 1400;

export type Frame = {
  positions: Record<string, Point>;
  runners: Runner[];
  ball: Point | null;
};

export const toFrame = (step: SituationStep | undefined): Frame => ({
  positions:
    step?.positions && Object.keys(step.positions).length
      ? step.positions
      : (DEFAULT_POSITIONS as unknown as Record<string, Point>),
  runners: step?.runners ?? [],
  ball: step?.ball ?? null,
});

export const blendFrames = (a: Frame, b: Frame, t: number): Frame => {
  const positions: Record<string, Point> = {};
  for (const key of Object.keys(b.positions)) {
    const from = a.positions[key] ?? b.positions[key];
    positions[key] = lerpPoint(from, b.positions[key], t);
  }
  const runners = b.runners.map((r) => {
    const from = a.runners.find((p) => p.id === r.id);
    const p = from ? lerpPoint(from, r, t) : { x: r.x, y: r.y };
    return { id: r.id, x: p.x, y: p.y };
  });
  let ball: Point | null = b.ball;
  if (a.ball && b.ball) ball = lerpPoint(a.ball, b.ball, t);
  return { positions, runners, ball };
};

interface SituationPlayerProps {
  steps: SituationStep[];
  /** Start playing as soon as the player mounts. */
  autoPlay?: boolean;
  /** Highlight one defender (usually the position being quizzed). */
  highlightPosition?: string | null;
}

/** Compact replay of a situation's keyframes — used after a quiz answer. */
export const SituationPlayer = ({ steps, autoPlay = false, highlightPosition }: SituationPlayerProps) => {
  const frames = useMemo(() => steps.map((s) => toFrame(s)), [steps]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [rendered, setRendered] = useState<Frame | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    let cancelled = false;
    let index = activeIndex >= frames.length - 1 ? 0 : activeIndex;
    if (activeIndex >= frames.length - 1) setActiveIndex(0);

    const runLeg = () => {
      if (cancelled) return;
      const from = frames[index];
      const to = frames[index + 1];
      if (!to) {
        setPlaying(false);
        setRendered(null);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const raw = Math.min(1, (now - start) / TRANSITION_MS);
        setRendered(blendFrames(from, to, easeInOut(raw)));
        if (raw < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          index += 1;
          setActiveIndex(index);
          if (index >= frames.length - 1) {
            setPlaying(false);
            setRendered(null);
          } else {
            rafRef.current = requestAnimationFrame(runLeg);
          }
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    runLeg();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, frames]);

  const currentFrame = rendered ?? frames[activeIndex] ?? toFrame(undefined);
  const ghost = !playing && activeIndex > 0 ? frames[activeIndex - 1] : null;
  const atEnd = !playing && frames.length > 1 && activeIndex === frames.length - 1;
  const activeStep = steps[activeIndex];

  return (
    <div>
      <div className="rounded-2xl overflow-hidden shadow-md bg-card/80 backdrop-blur-sm">
        <SituationField
          positions={currentFrame.positions}
          runners={currentFrame.runners}
          ball={currentFrame.ball}
          ghost={ghost}
          highlightPosition={highlightPosition ?? null}
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button
          size="lg"
          className="flex-1 min-h-12 rounded-2xl"
          onClick={() => setPlaying((p) => !p)}
          disabled={frames.length < 2}
          aria-label={playing ? "Pause playback" : atEnd ? "Replay the play" : "Play the play"}
        >
          {playing ? (
            <>
              <Pause className="h-5 w-5 mr-2" aria-hidden="true" /> Pause
            </>
          ) : atEnd ? (
            <>
              <RotateCcw className="h-5 w-5 mr-2" aria-hidden="true" /> Watch again
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" aria-hidden="true" /> Play
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="min-h-12 min-w-12 rounded-2xl"
          onClick={() => {
            setPlaying(false);
            setRendered(null);
            setActiveIndex(0);
          }}
          aria-label="Back to the first step"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
      {activeStep?.label && (
        <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-foreground">Step {activeIndex + 1}:</span>{" "}
          {activeStep.note ?? activeStep.label}
        </p>
      )}
    </div>
  );
};

export default SituationPlayer;
