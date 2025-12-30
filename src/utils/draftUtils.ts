export interface DraftState {
  currentRound: number;
  currentPick: number;
  totalRounds: number;
  totalTeams: number;
  draftType: 'snake' | 'linear';
  status: string;
}

/**
 * Calculate which team's turn it is based on the current pick number
 * Handles snake draft logic where even rounds go in reverse order
 */
export function calculateCurrentTeamOrder(
  currentPick: number,
  totalTeams: number,
  draftType: 'snake' | 'linear'
): number {
  if (totalTeams === 0) return 0;
  
  const round = Math.ceil(currentPick / totalTeams);
  const pickInRound = ((currentPick - 1) % totalTeams) + 1;
  
  if (draftType === 'snake' && round % 2 === 0) {
    // Reverse order for even rounds in snake draft
    return totalTeams - pickInRound + 1;
  }
  
  return pickInRound;
}

/**
 * Calculate the round and pick-in-round from an overall pick number
 */
export function calculateRoundAndPick(
  overallPick: number,
  totalTeams: number
): { round: number; pickInRound: number } {
  if (totalTeams === 0) return { round: 1, pickInRound: 1 };
  
  const round = Math.ceil(overallPick / totalTeams);
  const pickInRound = ((overallPick - 1) % totalTeams) + 1;
  
  return { round, pickInRound };
}

/**
 * Get the draft order for a specific round (handles snake draft reversal)
 */
export function getPickOrderForRound(
  round: number,
  teamOrders: number[],
  draftType: 'snake' | 'linear'
): number[] {
  if (draftType === 'snake' && round % 2 === 0) {
    return [...teamOrders].reverse();
  }
  return teamOrders;
}

/**
 * Check if it's a specific team's turn to pick
 */
export function isTeamTurn(
  draftTeamOrder: number,
  currentPick: number,
  totalTeams: number,
  draftType: 'snake' | 'linear'
): boolean {
  const currentTeamOrder = calculateCurrentTeamOrder(currentPick, totalTeams, draftType);
  return draftTeamOrder === currentTeamOrder;
}

/**
 * Calculate the next pick number after making a pick
 */
export function getNextPick(currentPick: number, totalPicks: number): number | null {
  if (currentPick >= totalPicks) return null;
  return currentPick + 1;
}

/**
 * Calculate total number of picks in the draft
 */
export function getTotalPicks(totalTeams: number, totalRounds: number): number {
  return totalTeams * totalRounds;
}

/**
 * Get display text for current pick status
 */
export function getPickDisplayText(
  round: number,
  pickInRound: number,
  totalRounds: number
): string {
  return `Round ${round} of ${totalRounds}, Pick ${pickInRound}`;
}

/**
 * Calculate remaining picks for a team
 */
export function getRemainingPicksForTeam(
  teamOrder: number,
  currentPick: number,
  totalTeams: number,
  totalRounds: number,
  draftType: 'snake' | 'linear'
): number {
  let remainingPicks = 0;
  const totalPicks = totalTeams * totalRounds;
  
  for (let pick = currentPick; pick <= totalPicks; pick++) {
    if (isTeamTurn(teamOrder, pick, totalTeams, draftType)) {
      remainingPicks++;
    }
  }
  
  return remainingPicks;
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get timer status color based on remaining time
 */
export function getTimerStatus(
  remainingSeconds: number,
  totalSeconds: number
): 'normal' | 'warning' | 'critical' {
  const percentRemaining = remainingSeconds / totalSeconds;
  
  if (percentRemaining <= 0.25 || remainingSeconds <= 15) {
    return 'critical';
  }
  if (percentRemaining <= 0.5 || remainingSeconds <= 30) {
    return 'warning';
  }
  return 'normal';
}
