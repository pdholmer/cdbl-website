import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LockKeyhole, Target } from "lucide-react";
import { useTrainingAccess, usePublishedSituations, type SituationSummary } from "@/hooks/useTraining";
import { BASE_STATE_LABELS, BASE_STATE_ORDER } from "@/lib/situationsField";

const difficultyStyles: Record<string, string> = {
  easy: "bg-secondary text-secondary-foreground",
  medium: "bg-accent text-accent-foreground",
  hard: "bg-destructive text-destructive-foreground",
};

const Training = () => {
  const { loading, isAuthenticated, canView } = useTrainingAccess();
  const { data: situations, isLoading } = usePublishedSituations(canView);

  const grouped = (situations ?? []).reduce<Record<string, SituationSummary[]>>((acc, s) => {
    (acc[s.base_state] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-10 md:py-16 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
          <div className="container px-4">
            <div className="flex items-center gap-3 mb-3">
              <Target className="h-7 w-7" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-90">CDBL Training</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-3">Situations Trainer</h1>
            <p className="text-base md:text-lg max-w-2xl opacity-95">
              Know where to go before the ball is hit. Walk through defensive situations and test yourself position by position.
            </p>
          </div>
        </section>

        <section className="py-8 md:py-12 bg-background">
          <div className="container px-4 max-w-3xl">
            {loading || (canView && isLoading) ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            ) : !isAuthenticated ? (
              <Card className="rounded-2xl shadow-md">
                <CardContent className="p-6 text-center">
                  <LockKeyhole className="h-8 w-8 mx-auto mb-3 text-primary" aria-hidden="true" />
                  <h2 className="font-heading text-xl font-semibold mb-2">Sign in to start training</h2>
                  <p className="text-muted-foreground mb-5">
                    The Situations Trainer is for CDBL players, families and coaches. Sign in with your league account to get in.
                  </p>
                  <Button asChild size="lg" className="w-full sm:w-auto min-h-12">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : !canView ? (
              <Card className="rounded-2xl shadow-md">
                <CardContent className="p-6 text-center">
                  <LockKeyhole className="h-8 w-8 mx-auto mb-3 text-primary" aria-hidden="true" />
                  <h2 className="font-heading text-xl font-semibold mb-2">Not available on your account yet</h2>
                  <p className="text-muted-foreground">
                    Training content is available to coaches and registered CDBL families. If that should be you, contact the league.
                  </p>
                </CardContent>
              </Card>
            ) : (situations ?? []).length === 0 ? (
              <p className="text-muted-foreground">No published situations yet — check back soon.</p>
            ) : (
              <div className="space-y-8">
                {BASE_STATE_ORDER.filter((b) => grouped[b]?.length).map((base) => (
                  <div key={base}>
                    <h2 className="font-heading text-lg font-semibold mb-3">{BASE_STATE_LABELS[base] ?? base}</h2>
                    <ul className="space-y-3">
                      {grouped[base].map((s) => (
                        <li key={s.id}>
                          <Card className="rounded-2xl shadow-md bg-card/80 backdrop-blur-sm transition-colors hover:bg-card">
                            <CardContent className="p-0">
                              <Link to={`/training/${s.slug}`} className="block p-4 min-h-[44px]">
                              <h3 className="font-heading font-semibold text-base mb-1">{s.title}</h3>
                              {s.description && (
                                <p className="text-sm text-muted-foreground mb-3">{s.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                <Badge className={difficultyStyles[s.difficulty] ?? ""}>{s.difficulty}</Badge>
                                <Badge variant="outline">{s.age_band === "all" ? "All ages" : s.age_band}</Badge>
                              </div>
                              </Link>
                            </CardContent>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Training;
