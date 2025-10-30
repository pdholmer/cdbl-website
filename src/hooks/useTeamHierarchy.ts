import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Team {
  id: string;
  name: string;
  status: string;
  program_id: string;
  division_id: string;
}

export interface Division {
  id: string;
  name: string;
  age_range: string;
  teams?: Team[];
}

export interface Program {
  id: string;
  name: string;
  type: 'in_house' | 'travel';
  divisions?: Division[];
}

export const useTeamHierarchy = () => {
  const { data: programs, isLoading, error } = useQuery({
    queryKey: ['team-hierarchy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          id,
          name,
          type,
          divisions (
            id,
            name,
            age_range,
            teams (
              id,
              name,
              status,
              program_id,
              division_id
            )
          )
        `)
        .order('type');

      if (error) throw error;
      
      // Filter out inactive teams and sort
      const processedPrograms = data?.map(program => ({
        ...program,
        divisions: program.divisions?.map((division: any) => ({
          ...division,
          teams: division.teams
            ?.filter((team: Team) => team.status === 'active')
            .sort((a: Team, b: Team) => a.name.localeCompare(b.name))
        })).sort((a: Division, b: Division) => a.name.localeCompare(b.name))
      }));

      return processedPrograms as Program[];
    }
  });

  const getProgramsByType = (type: 'in_house' | 'travel') => 
    programs?.filter(p => p.type === type) || [];

  const getDivisionsByProgram = (programId: string) => {
    const program = programs?.find(p => p.id === programId);
    return program?.divisions || [];
  };

  const getTeamsByDivision = (divisionId: string) => {
    for (const program of programs || []) {
      const division = program.divisions?.find(d => d.id === divisionId);
      if (division) return division.teams || [];
    }
    return [];
  };

  const getAllTeams = () => {
    return programs?.flatMap(p => 
      p.divisions?.flatMap(d => d.teams || []) || []
    ) || [];
  };

  return {
    programs,
    isLoading,
    error,
    getProgramsByType,
    getDivisionsByProgram,
    getTeamsByDivision,
    getAllTeams,
  };
};
