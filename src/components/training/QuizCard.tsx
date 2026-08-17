import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Eye, X } from "lucide-react";
import SituationPlayer from "@/components/training/SituationPlayer";
import { useRecordAttempt, useSituationSteps, type QuizQuestion } from "@/hooks/useQuiz";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  question: QuizQuestion;
  /** Rendered above the prompt — e.g. a mini field or situation title. */
  header?: React.ReactNode;
  onAnswered?: (isCorrect: boolean) => void;
  /** Buttons shown once the player has answered and closed the replay. */
  footer?: React.ReactNode;
}

export const QuizCard = ({ question, header, onAnswered, footer }: QuizCardProps) => {
  const [picked, setPicked] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const recordAttempt = useRecordAttempt();
  const steps = useSituationSteps(question.situation_id, watching);

  const answered = picked !== null;
  const isCorrect = answered && picked === question.correct_option;

  const choose = (optionId: string) => {
    if (answered) return;
    setPicked(optionId);
    const correct = optionId === question.correct_option;
    recordAttempt.mutate({ questionId: question.id, selectedOption: optionId, isCorrect: correct });
    onAnswered?.(correct);
  };

  return (
    <Card className="rounded-2xl shadow-md bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 md:p-6 space-y-4">
        {header}
        <div>
          {question.position_key && (
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              You're playing {question.position_key}
            </p>
          )}
          <h3 className="mt-1 text-lg md:text-xl font-bold leading-snug">{question.prompt}</h3>
        </div>

        <div className="space-y-3">
          {question.options.map((option) => {
            const isPicked = picked === option.id;
            const isRight = option.id === question.correct_option;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option.id)}
                disabled={answered}
                aria-pressed={isPicked}
                className={cn(
                  "w-full min-h-[44px] text-left rounded-2xl border-2 px-4 py-3 transition-colors",
                  "text-base leading-snug disabled:cursor-default",
                  !answered && "border-border hover:border-primary hover:bg-accent/40",
                  answered && isRight && "border-green-600 bg-green-600/10",
                  answered && isPicked && !isRight && "border-destructive bg-destructive/10",
                  answered && !isPicked && !isRight && "border-border opacity-60",
                )}
              >
                <span className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">
                    {answered && isRight && <Check className="h-5 w-5 text-green-700" aria-hidden="true" />}
                    {answered && isPicked && !isRight && (
                      <X className="h-5 w-5 text-destructive" aria-hidden="true" />
                    )}
                  </span>
                  <span>{option.text}</span>
                </span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={cn(
              "rounded-2xl p-4 space-y-2",
              isCorrect ? "bg-green-600/10 border border-green-600/40" : "bg-destructive/10 border border-destructive/40",
            )}
            aria-live="polite"
          >
            <p className="font-bold">
              {isCorrect ? "Nice read! That's the play. 🎉" : "Close — here's the coaching point."}
            </p>
            {!isCorrect && question.why_wrong?.[picked!] && (
              <p className="text-sm">{question.why_wrong[picked!]}</p>
            )}
            {question.explanation && (
              <p className="text-sm">
                {!isCorrect && <span className="font-semibold">The right move: </span>}
                {question.explanation}
              </p>
            )}
          </div>
        )}

        {answered && (
          <div className="space-y-3">
            {!watching ? (
              <Button
                variant="secondary"
                size="lg"
                className="w-full min-h-12 rounded-2xl"
                onClick={() => setWatching(true)}
              >
                <Eye className="h-5 w-5 mr-2" aria-hidden="true" /> Watch the play
              </Button>
            ) : (
              <div className="space-y-3">
                {steps.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading the play…</p>
                ) : (
                  <SituationPlayer
                    steps={steps.data ?? []}
                    autoPlay
                    highlightPosition={question.position_key}
                  />
                )}
              </div>
            )}
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizCard;
