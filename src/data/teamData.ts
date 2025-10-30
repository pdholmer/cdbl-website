export interface TeamOption {
  id: string;
  name: string;
  league: 'in-house' | 'travel';
  division?: string;
}

export const teamData: TeamOption[] = [
  // In-House League Teams
  { id: 'tball-rockets', name: 'T-Ball Rockets', league: 'in-house', division: 'T-Ball' },
  { id: 'tball-cubs', name: 'T-Ball Cubs', league: 'in-house', division: 'T-Ball' },
  { id: 'pinto-cardinals', name: 'Pinto Cardinals', league: 'in-house', division: 'Pinto' },
  { id: 'pinto-dodgers', name: 'Pinto Dodgers', league: 'in-house', division: 'Pinto' },
  { id: 'bronco-cubs', name: 'Bronco Cubs', league: 'in-house', division: 'Bronco' },
  { id: 'bronco-yankees', name: 'Bronco Yankees', league: 'in-house', division: 'Bronco' },
  { id: 'pony-sox', name: 'Pony Sox', league: 'in-house', division: 'Pony' },
  { id: 'pony-pirates', name: 'Pony Pirates', league: 'in-house', division: 'Pony' },
  
  // Travel League Teams
  { id: '10u-rockets', name: '10U Rockets', league: 'travel', division: '10U' },
  { id: '11u-rockets', name: '11U Rockets', league: 'travel', division: '11U' },
  { id: '12u-rockets', name: '12U Rockets', league: 'travel', division: '12U' },
  { id: '13u-rockets', name: '13U Rockets', league: 'travel', division: '13U' },
  { id: '14u-rockets', name: '14U Rockets', league: 'travel', division: '14U' },
  { id: '15u-rockets', name: '15U Rockets', league: 'travel', division: '15U' },
];

export const getTeamsByLeague = (league: 'in-house' | 'travel'): TeamOption[] => {
  return teamData.filter(team => team.league === league);
};

export const getTeamById = (id: string): TeamOption | undefined => {
  return teamData.find(team => team.id === id);
};
