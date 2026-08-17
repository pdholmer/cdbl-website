import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, LockKeyhole, Pause, Play, RotateCcw } from "lucide-react";
import SituationField from "@/components/training/SituationField";
import { useSituationDetail, useTrainingAccess, type SituationStep } from "@/hooks/useTraining";
import {
  BASE_STATE_LABELS,
  DEFAULT_POSITIONS,
  easeInOut,
  lerpPoint,
  type Point,
  type Runner,
} from "@/lib/situationsField";

const TRANSITION_MS = 1400;

const difficultyStyles: Record<string, string> = {
  easy: "bg-secondary text-secondary-foreground",
  medium: "bg-accent text-accent-foreground",
  hard: "bg-destructive text-destructive-foreground",
};

type Frame = {
  positions: Record<string, Point>;
  runners: Runner[];
  ball: Point | null;
};

const toFrame = (step: SituationStep | undefined): Frame => ({
  positions: (step?.positions && Object.keys(step.positions).length
    ? step.positions
    : (DEFAULT_POSITIONS as unknown as Record<string, Point>)),
  runners: step?.runners ?? [],
  ball: step?.ball ?? null,
});

const blendFrames = (a: Frame, b: Frame, t: number): Frame => {
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

const SituationDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { loading, isAuthenticated, canView } = useTrainingAccess();
  const { data: situation, isLoading } = useSituationDetail(slug, canView);

  const steps = useMemo(() => situation?.steps ?? [], [situation]);
  const frames = useMemo(() => steps.map((s) => toFrame(s)), [steps]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rendered, setRendered] = useState<Frame | null>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>();
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Playback loop — pure rAF interpolation between consecutive keyframes.
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
        setProgress(0);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const raw = Math.min(1, (now - start) / TRANSITION_MS);
        const t = easeInOut(raw);
        setRendered(blendFrames(from, to, t));
        setProgress(raw);
        if (raw < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          index += 1;
          setActiveIndex(index);
          setProgress(0);
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

  // Keep the active step visible in the scrollable list.
  useEffect(() => {
    stepRefs.current[activeIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const currentFrame = rendered ?? frames[activeIndex] ?? toFrame(undefined);
  const ghost = !playing && activeIndex > 0 ? frames[activeIndex - 1] : null;
  const activeStep = steps[activeIndex];
  const atEnd = !playing && frames.length > 1 && activeIndex === frames.length - 1;

  const jumpTo = (i: number) => {
    setPlaying(false);
    setRendered(null);
    setProgress(0);
    setActiveIndex(i);
  };

  const gate = (title: string, body: string, cta?: boolean) => (
    <Card className="rounded-2xl shadow-md">
      <CardContent className="p-6 text-center">
        <LockKeyhole className="h-8 w-8 mx-auto mb-3 text-primary" aria-hidden="true" />
        <h1 className="font-heading text-xl font-semibold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-5">{body}</p>
        {cta && (
          <Button asChild size="lg" className="w-full sm:w-auto min-h-12">
            <Link to="/login">Sign In</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container px-4 max-w-2xl py-4 md:py-8">
          <Link
            to="/training"
            className="inline-flex items-center gap-2 min-h-11 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All situations
          </Link>

          {loading || (canView && isLoading) ? (
            <div className="space-y-3 mt-4">
              <Skeleton className="h-8 w-2/3 rounded-xl" />
              <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
            </div>
          ) : !isAuthenticated ? (
            <div className="mt-4">
              {gate("Sign in to start training", "The Situations Trainer is for CDBL players, families and coaches.", true)}
            </div>
          ) : !canView ? (
            <div className="mt-4">
              {gate(
                "Not available on your account yet",
                "Training content is available to coaches and registered CDBL families. If that should be you, contact the league."
              )}
            </div>
          ) : !situation ? (
            <div className="mt-4">
              {gate("Situation not found", "This situation may have been unpublished or the link is out of date.")}
            </div>
          ) : (
            <>
              <header className="mt-3 mb-3">
                <h1 className="font-heading text-2xl md:text-3xl font-bold leading-tight">{situation.title}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{BASE_STATE_LABELS[situation.base_state] ?? situation.base_state}</Badge>
                  {situation.outs !== null && (
                    <Badge variant="outline">
                      {situation.outs} {situation.outs === 1 ? "out" : "outs"}
                    </Badge>
                  )}
                  <Badge className={difficultyStyles[situation.difficulty] ?? ""}>{situation.difficulty}</Badge>
                  <Badge variant="outline">{situation.age_band === "all" ? "All ages" : situation.age_band}</Badge>
                </div>
                {situation.description && (
                  <p className="text-sm text-muted-foreground mt-2">{situation.description}</p>
                )}
              </header>

              <div className="rounded-2xl overflow-hidden shadow-md bg-card/80 backdrop-blur-sm">
                <SituationField
                  positions={currentFrame.positions}
                  runners={currentFrame.runners}
                  ball={currentFrame.ball}
                  ghost={ghost}
                />
              </div>

              {/* Playback controls */}
              <div className="mt-3 flex items-center gap-3">
                <Button
                  size="lg"
                  className="flex-1 min-h-12 rounded-2xl"
                  onClick={() => setPlaying((p) => !p)}
                  disabled={frames.length < 2}
                  aria-label={playing ? "Pause playback" : atEnd ? "Replay situation" : "Play situation"}
                >
                  {playing ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" aria-hidden="true" /> Pause
                    </>
                  ) : atEnd ? (
                    <>
                      <RotateCcw className="h-5 w-5 mr-2" aria-hidden="true" /> Replay
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
                  onClick={() => jumpTo(0)}
                  aria-label="Reset to first step"
                >
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>

              {/* Step list */}
              <ol className="mt-4 space-y-2 max-h-[46vh] overflow-y-auto pb-2" aria-label="Situation steps">
                {steps.map((step, i) => {
                  const active = i === activeIndex;
                  return (
                    <li key={step.id}>
                      <button
                        ref={(el) => (stepRefs.current[i] = el)}
                        type="button"
                        onClick={() => jumpTo(i)}
                        aria-current={active ? "step" : undefined}
                        className={`w-full text-left min-h-[44px] rounded-2xl border p-3 transition-colors ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card/60 hover:bg-muted/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`shrink-0 h-7 w-7 rounded-full grid place-items-center text-xs font-bold ${
                              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="font-heading font-semibold text-sm block">
                              {step.label ?? `Step ${i + 1}`}
                            </span>
                            {active && step.note && (
                              <p className="text-sm text-muted-foreground mt-1">{step.note}</p>
                            )}
                          </div>
                        </div>
                        {active && playing && (
                          <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary transition-none"
                              style={{ width: `${Math.round(progress * 100)}%` }}
                            />
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>

              {!playing && activeIndex > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Dashed lines show movement from the previous step. The yellow line is the ball.
                </p>
              )}

              {activeStep?.note && !playing && (
                <p className="sr-only" aria-live="polite">
                  {activeStep.note}
                </p>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SituationDetail;
