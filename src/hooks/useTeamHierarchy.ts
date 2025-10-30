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
  program_id: string;
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
      // Fetch programs, divisions and teams separately to avoid ambiguous embedded relationships
      const [progRes, divRes, teamRes] = await Promise.all([
        supabase.from('programs').select('id, name, type').order('type'),
        supabase.from('divisions').select('id, name, age_range, program_id').order('name'),
        supabase.from('teams').select('id, name, status, program_id, division_id').order('name'),
      ]);

      if (progRes.error) throw progRes.error;
      if (divRes.error) throw divRes.error;
      if (teamRes.error) throw teamRes.error;

      const programs = (progRes.data || []) as Program[];
      const divisions = (divRes.data || []) as Division[];
      const teams = (teamRes.data || []) as Team[];

      // Attach divisions and teams
      const processedPrograms = programs.map((program) => {
        const programDivisions = divisions
          .filter((d) => d.program_id === program.id)
          .map((division) => ({
            ...division,
            teams: teams
              .filter((t) => t.division_id === division.id && t.status === 'active')
              .sort((a, b) => a.name.localeCompare(b.name)),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        return { ...program, divisions: programDivisions } as Program;
      });

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
