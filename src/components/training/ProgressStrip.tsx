import { Card, CardContent } from "@/components/ui/card";
import { useMyProgress, useTeamProgress } from "@/hooks/useQuiz";

const pct = (correct: number, total: number) => (total ? Math.round((correct / total) * 100) : 0);

export const ProgressStrip = ({ enabled, isCoach }: { enabled: boolean; isCoach: boolean }) => {
  const { data: mine } = useMyProgress(enabled);
  const { data: team } = useTeamProgress(enabled && isCoach);

  if (!mine || mine.total === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      <Card className="rounded-2xl shadow-md bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-heading text-lg font-semibold">My progress</h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{mine.total}</span> answered ·{" "}
              <span className="font-bold text-foreground">{pct(mine.correct, mine.total)}%</span> right
            </p>
          </div>
          <ul className="space-y-2">
            {mine.byPosition.map((row) => (
              <li key={row.position} className="flex items-center gap-3">
                <span className="w-9 shrink-0 text-xs font-bold">{row.position}</span>
                <span className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <span
                    className="block h-full bg-primary"
                    style={{ width: `${pct(row.correct, row.total)}%` }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                  {row.correct}/{row.total}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {isCoach && (team?.length ?? 0) > 0 && (
        <Card className="rounded-2xl shadow-md bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6 space-y-3">
            <h2 className="font-heading text-lg font-semibold">Team activity</h2>
            <ul className="divide-y">
              {team!.map((row) => (
                <li key={row.userId} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="truncate">{row.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {row.total} answered · {pct(row.correct, row.total)}%
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressStrip;
