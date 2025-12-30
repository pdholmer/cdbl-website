import { useState } from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeams } from "@/hooks/useTeams";
import { useGames } from "@/hooks/useGames";
import { useCommissionerAssignments } from "@/hooks/useCommissionerAssignments";
import { usePrograms } from "@/hooks/usePrograms";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamStanding {
  id: string;
  name: string;
  division: string;
  wins: number;
  losses: number;
  ties: number;
  runsFor: number;
  runsAgainst: number;
  winPct: number;
  streak: string;
}

export default function CommissionerStandings() {
  const { data: assignments } = useCommissionerAssignments();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: games, isLoading: gamesLoading } = useGames();
  const { programs } = usePrograms();
  
  const [selectedDivision, setSelectedDivision] = useState<string>("all");

  const programIds = assignments?.map(a => a.program_id) || [];
  const assignedPrograms = programs?.filter(p => programIds.includes(p.id)) || [];

  // Get all divisions from assigned programs
  const allDivisions = assignedPrograms.flatMap(p => p.divisions || []);

  // Filter teams and calculate standings
  const filteredTeams = teams?.filter(t => {
    if (!programIds.includes(t.program_id)) return false;
    if (selectedDivision !== "all" && t.division_id !== selectedDivision) return false;
    return true;
  }) || [];

  // Calculate standings for each team
  const standings: TeamStanding[] = filteredTeams.map(team => {
    const teamGames = games?.filter(g => 
      g.status === 'completed' && 
      (g.home_team_id === team.id || g.away_team_id === team.id)
    ) || [];

    let wins = 0;
    let losses = 0;
    let ties = 0;
    let runsFor = 0;
    let runsAgainst = 0;

    teamGames.forEach(game => {
      const isHome = game.home_team_id === team.id;
      const teamScore = isHome ? (game.home_score || 0) : (game.away_score || 0);
      const oppScore = isHome ? (game.away_score || 0) : (game.home_score || 0);

      runsFor += teamScore;
      runsAgainst += oppScore;

      if (teamScore > oppScore) {
        wins++;
      } else if (teamScore < oppScore) {
        losses++;
      } else {
        ties++;
      }
    });

    const totalGames = wins + losses + ties;
    const winPct = totalGames > 0 ? wins / totalGames : 0;

    // Calculate streak (simplified - just last 5 games)
    const recentGames = teamGames.slice(-5);
    let streak = "";
    if (recentGames.length > 0) {
      const lastGame = recentGames[recentGames.length - 1];
      const isHome = lastGame.home_team_id === team.id;
      const teamScore = isHome ? (lastGame.home_score || 0) : (lastGame.away_score || 0);
      const oppScore = isHome ? (lastGame.away_score || 0) : (lastGame.home_score || 0);
      
      let streakCount = 1;
      let streakType = teamScore > oppScore ? 'W' : teamScore < oppScore ? 'L' : 'T';
      
      for (let i = recentGames.length - 2; i >= 0; i--) {
        const game = recentGames[i];
        const isH = game.home_team_id === team.id;
        const tScore = isH ? (game.home_score || 0) : (game.away_score || 0);
        const oScore = isH ? (game.away_score || 0) : (game.home_score || 0);
        const result = tScore > oScore ? 'W' : tScore < oScore ? 'L' : 'T';
        
        if (result === streakType) {
          streakCount++;
        } else {
          break;
        }
      }
      
      streak = `${streakType}${streakCount}`;
    }

    return {
      id: team.id,
      name: team.name,
      division: team.division?.name || 'N/A',
      wins,
      losses,
      ties,
      runsFor,
      runsAgainst,
      winPct,
      streak,
    };
  }).sort((a, b) => {
    // Sort by win percentage, then wins, then run differential
    if (b.winPct !== a.winPct) return b.winPct - a.winPct;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return (b.runsFor - b.runsAgainst) - (a.runsFor - a.runsAgainst);
  });

  const isLoading = teamsLoading || gamesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Standings</h1>
          <p className="text-muted-foreground">
            League standings and team records
          </p>
        </div>
      </div>

      {/* Division Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Division:</span>
            <Select value={selectedDivision} onValueChange={setSelectedDivision}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                {allDivisions.map((division: any) => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Standings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            League Standings
          </CardTitle>
          <CardDescription>
            {standings.length} team(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Division</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">T</TableHead>
                <TableHead className="text-center">PCT</TableHead>
                <TableHead className="text-center">RF</TableHead>
                <TableHead className="text-center">RA</TableHead>
                <TableHead className="text-center">DIFF</TableHead>
                <TableHead className="text-center">STRK</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    No standings data available
                  </TableCell>
                </TableRow>
              ) : (
                standings.map((team, index) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      {index === 0 && standings.length > 1 ? (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      ) : (
                        index + 1
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>{team.division}</TableCell>
                    <TableCell className="text-center font-medium">{team.wins}</TableCell>
                    <TableCell className="text-center">{team.losses}</TableCell>
                    <TableCell className="text-center">{team.ties}</TableCell>
                    <TableCell className="text-center">
                      {team.winPct.toFixed(3).replace(/^0/, '')}
                    </TableCell>
                    <TableCell className="text-center">{team.runsFor}</TableCell>
                    <TableCell className="text-center">{team.runsAgainst}</TableCell>
                    <TableCell className="text-center">
                      <span className={team.runsFor - team.runsAgainst >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {team.runsFor - team.runsAgainst >= 0 ? '+' : ''}{team.runsFor - team.runsAgainst}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {team.streak ? (
                        <Badge 
                          variant="outline" 
                          className={
                            team.streak.startsWith('W') 
                              ? 'bg-green-50 text-green-700' 
                              : team.streak.startsWith('L')
                              ? 'bg-red-50 text-red-700'
                              : ''
                          }
                        >
                          {team.streak}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span><strong>W</strong> = Wins</span>
            <span><strong>L</strong> = Losses</span>
            <span><strong>T</strong> = Ties</span>
            <span><strong>PCT</strong> = Win Percentage</span>
            <span><strong>RF</strong> = Runs For</span>
            <span><strong>RA</strong> = Runs Against</span>
            <span><strong>DIFF</strong> = Run Differential</span>
            <span><strong>STRK</strong> = Current Streak</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
