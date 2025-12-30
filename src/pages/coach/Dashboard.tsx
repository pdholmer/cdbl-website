import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDrafts } from "@/hooks/useDrafts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Play, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

const CoachDashboard = () => {
  const [coachTeamIds, setCoachTeamIds] = useState<string[]>([]);
  const [isLoadingCoach, setIsLoadingCoach] = useState(true);
  const { data: allDrafts, isLoading: draftsLoading } = useDrafts();

  useEffect(() => {
    const loadCoachTeams = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get draft teams where this user is the coach
        const { data: draftTeams } = await supabase
          .from('draft_teams')
          .select('draft_id')
          .eq('coach_user_id', user.id);

        if (draftTeams) {
          setCoachTeamIds(draftTeams.map(dt => dt.draft_id));
        }
      } catch (error) {
        console.error("Error loading coach teams:", error);
      } finally {
        setIsLoadingCoach(false);
      }
    };

    loadCoachTeams();
  }, []);

  // Filter drafts to only show ones this coach participates in
  const myDrafts = allDrafts?.filter(draft => 
    coachTeamIds.includes(draft.id)
  ) || [];

  const activeDrafts = myDrafts.filter(d => d.status === 'in_progress');
  const upcomingDrafts = myDrafts.filter(d => d.status === 'setup' || d.status === 'ready');
  const completedDrafts = myDrafts.filter(d => d.status === 'completed');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-green-500 text-white">Live</Badge>;
      case 'setup':
        return <Badge variant="outline">Setup</Badge>;
      case 'ready':
        return <Badge variant="secondary">Ready</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isLoading = isLoadingCoach || draftsLoading;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Coach Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your draft management portal</p>
      </div>

      {/* Active Drafts */}
      {activeDrafts.length > 0 && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Play className="h-5 w-5" />
              Active Draft
            </CardTitle>
            <CardDescription>A draft is currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeDrafts.map(draft => (
                <div key={draft.id} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                  <div>
                    <h3 className="font-semibold">{draft.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {draft.program?.name} • {draft.division?.name}
                    </p>
                  </div>
                  <Link to={`/coach/drafts/${draft.id}`}>
                    <Button>
                      <Play className="h-4 w-4 mr-2" />
                      Join Draft
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Drafts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Drafts
          </CardTitle>
          <CardDescription>Drafts you're scheduled to participate in</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : upcomingDrafts.length > 0 ? (
            <div className="space-y-3">
              {upcomingDrafts.map(draft => (
                <div key={draft.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold">{draft.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {draft.program?.name} • {draft.division?.name}
                      </p>
                      {draft.scheduled_start && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Scheduled: {format(new Date(draft.scheduled_start), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(draft.status)}
                    <Link to={`/coach/drafts/${draft.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming drafts</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Drafts */}
      {completedDrafts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedDrafts.slice(0, 5).map(draft => (
                <div key={draft.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <h3 className="font-medium">{draft.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {draft.program?.name} • {draft.division?.name}
                    </p>
                  </div>
                  <Link to={`/coach/drafts/${draft.id}`}>
                    <Button variant="ghost" size="sm">View Results</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoachDashboard;
