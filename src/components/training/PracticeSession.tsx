import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell } from "lucide-react";
import SituationField from "@/components/training/SituationField";
import QuizCard from "@/components/training/QuizCard";
import { shuffle, useFirstFrames, usePracticePool, type QuizQuestion } from "@/hooks/useQuiz";
import { BASE_STATE_LABELS, DEFAULT_POSITIONS, type Point } from "@/lib/situationsField";

const POSITIONS = ["P", "C", "1B", "2B", "SS", "3B", "LF", "CF", "RF"];
const SESSION_LENGTH = 5;

const cheer = (score: number) => {
  if (score === 5) return "Perfect session! You're reading the play like a veteran. 🔥";
  if (score === 4) return "Four out of five — that's real baseball IQ. One more rep and you've got it.";
  if (score === 3) return "Solid work. You're getting the big ones right — keep stacking reps.";
  if (score === 2) return "Good hustle! Every rep makes the next one easier. Run it again?";
  return "That's how everybody starts. Watch the plays, then try again — you'll see it click.";
};

export const PracticeSession = ({ enabled }: { enabled: boolean }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredThis, setAnsweredThis] = useState(false);

  const pool = usePracticePool(enabled && open);
  const situationIds = useMemo(() => [...new Set(questions.map((q) => q.situation_id))], [questions]);
  const frames = useFirstFrames(situationIds, questions.length > 0);

  const start = (pos: string) => {
    const filtered = (pool.data ?? []).filter((q) => pos === "all" || q.position_key === pos);
    // One question per situation keeps a session varied.
    const bySituation = new Map<string, QuizQuestion[]>();
    for (const q of shuffle(filtered)) {
      const list = bySituation.get(q.situation_id) ?? [];
      list.push(q);
      bySituation.set(q.situation_id, list);
    }
    const picks = shuffle([...bySituation.values()].map((list) => list[0])).slice(0, SESSION_LENGTH);
    setPosition(pos);
    setQuestions(picks);
    setIndex(0);
    setScore(0);
    setAnsweredThis(false);
  };

  const reset = () => {
    setPosition(null);
    setQuestions([]);
    setIndex(0);
    setScore(0);
    setAnsweredThis(false);
  };

  if (!open) {
    return (
      <Card className="rounded-2xl shadow-md bg-card/80 backdrop-blur-sm mb-6">
        <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-heading text-lg font-semibold">Practice Mode</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Five quick plays. Pick your position and see how you read the field.
            </p>
          </div>
          <Button size="lg" className="min-h-12 rounded-2xl w-full sm:w-auto" onClick={() => setOpen(true)}>
            Start practice
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Position picker
  if (!position) {
    return (
      <Card className="rounded-2xl shadow-md bg-card/80 backdrop-blur-sm mb-6">
        <CardContent className="p-4 md:p-6 space-y-4">
          <div>
            <h2 className="font-heading text-lg font-semibold">Where do you play?</h2>
            <p className="text-sm text-muted-foreground">We'll pull five plays from around the league.</p>
          </div>
          {pool.isLoading ? (
            <p className="text-sm text-muted-foreground">Warming up…</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {POSITIONS.map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="lg"
                  className="min-h-12 rounded-2xl font-bold"
                  onClick={() => start(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                size="lg"
                className="min-h-12 rounded-2xl col-span-3"
                onClick={() => start("all")}
              >
                All positions
              </Button>
            </div>
          )}
          <Button variant="ghost" size="lg" className="w-full min-h-12" onClick={() => setOpen(false)}>
            Not right now
          </Button>
        </CardContent>
      </Card>
    );
  }

  // End screen
  if (index >= questions.length) {
    return (
      <Card className="rounded-2xl shadow-md bg-card/80 backdrop-blur-sm mb-6">
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-4xl font-bold">
            {score}/{questions.length}
          </p>
          <p className="text-base">{cheer(score)}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="lg" className="min-h-12 rounded-2xl" onClick={reset}>
              Play again
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-h-12 rounded-2xl"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Done for now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[index];
  if (!question) {
    return (
      <Card className="rounded-2xl shadow-md mb-6">
        <CardContent className="p-6 space-y-4">
          <p>No questions available for that position yet.</p>
          <Button size="lg" className="w-full min-h-12 rounded-2xl" onClick={reset}>
            Pick another position
          </Button>
        </CardContent>
      </Card>
    );
  }

  const frame = frames.data?.[question.situation_id];
  const positions: Record<string, Point> =
    frame?.positions && Object.keys(frame.positions).length
      ? frame.positions
      : (DEFAULT_POSITIONS as unknown as Record<string, Point>);

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground">
          Play {index + 1} of {questions.length}
        </p>
        <p className="text-sm font-semibold">{score} correct</p>
      </div>
      <QuizCard
        key={question.id}
        question={question}
        onAnswered={(correct) => {
          setAnsweredThis(true);
          if (correct) setScore((s) => s + 1);
        }}
        header={
          <div className="space-y-2">
            <div className="rounded-2xl overflow-hidden shadow-md">
              <SituationField positions={positions} runners={frame?.runners ?? []} ball={frame?.ball ?? null} />
            </div>
            <div className="flex flex-wrap gap-2">
              {question.situation?.base_state && (
                <Badge variant="outline">
                  {BASE_STATE_LABELS[question.situation.base_state] ?? question.situation.base_state}
                </Badge>
              )}
              {question.situation?.outs !== null && question.situation?.outs !== undefined && (
                <Badge variant="outline">
                  {question.situation.outs} {question.situation.outs === 1 ? "out" : "outs"}
                </Badge>
              )}
            </div>
          </div>
        }
        footer={
          answeredThis ? (
            <Button
              size="lg"
              className="w-full min-h-12 rounded-2xl"
              onClick={() => {
                setAnsweredThis(false);
                setIndex((i) => i + 1);
              }}
            >
              {index + 1 >= questions.length ? "See my score" : "Next play"}
            </Button>
          ) : null
        }
      />
    </div>
  );
};

export default PracticeSession;
