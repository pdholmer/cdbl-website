import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SituationField from "@/components/training/SituationField";
import QuizCard from "@/components/training/QuizCard";
import { useSituationAttempts, useSituationQuestions } from "@/hooks/useQuiz";
import type { SituationStep } from "@/hooks/useTraining";
import { DEFAULT_POSITIONS, type Point } from "@/lib/situationsField";

interface SituationQuizProps {
  situationId: string;
  firstStep?: SituationStep;
  onClose: () => void;
}

export const SituationQuiz = ({ situationId, firstStep, onClose }: SituationQuizProps) => {
  const [position, setPosition] = useState<string | null>(null);
  const [sessionMarks, setSessionMarks] = useState<Record<string, boolean>>({});
  const questions = useSituationQuestions(situationId, true);
  const priorAttempts = useSituationAttempts(situationId, true);

  const positions: Record<string, Point> =
    firstStep?.positions && Object.keys(firstStep.positions).length
      ? firstStep.positions
      : (DEFAULT_POSITIONS as unknown as Record<string, Point>);

  const marks = { ...(priorAttempts.data ?? {}), ...sessionMarks };
  const question = position ? questions.data?.find((q) => q.position_key === position) : undefined;

  if (!position) {
    return (
      <Card className="rounded-2xl shadow-md bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4 md:p-6 space-y-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold">Pick your position</h3>
            <p className="text-sm text-muted-foreground">
              Tap the player you want to be on this play. Green check means you nailed it last time.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-md">
            <SituationField
              positions={positions}
              runners={firstStep?.runners ?? []}
              ball={firstStep?.ball ?? null}
              onSelectPosition={setPosition}
              positionStatus={marks}
            />
          </div>
          <Button variant="outline" size="lg" className="w-full min-h-12 rounded-2xl" onClick={onClose}>
            Back to the play
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (questions.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading your question…</p>;
  }

  if (!question) {
    return (
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6 space-y-4">
          <p>No question written for {position} on this play yet — try another spot.</p>
          <Button size="lg" className="w-full min-h-12 rounded-2xl" onClick={() => setPosition(null)}>
            Pick another position
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <QuizCard
      key={question.id}
      question={question}
      onAnswered={(correct) => setSessionMarks((m) => ({ ...m, [position]: correct }))}
      footer={
        <div className="grid gap-3 sm:grid-cols-2">
          <Button size="lg" className="min-h-12 rounded-2xl" onClick={() => setPosition(null)}>
            Try another position
          </Button>
          <Button asChild variant="outline" size="lg" className="min-h-12 rounded-2xl">
            <Link to="/training">Back to situations</Link>
          </Button>
        </div>
      }
    />
  );
};

export default SituationQuiz;
