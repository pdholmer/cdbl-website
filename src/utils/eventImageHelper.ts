import cdblInHouseLogo from "@/assets/cdbl-inhouse-logo.png";
import rocketsTravelLogo from "@/assets/rockets-travel-logo.png";
import cdblSeal from "@/assets/cdbl-seal.png";
import { CalendarEvent } from "@/data/calendarEvents";
import { Program, Team } from "@/hooks/useTeamHierarchy";

export const getEventCategoryImage = (event: CalendarEvent, programs?: Program[]) => {
  // If programId is specified, use it to determine the image
  if (event.programId && programs) {
    const program = programs.find(p => p.id === event.programId);
    
    if (program?.type === 'travel') {
      return {
        src: rocketsTravelLogo,
        alt: "CDBL Travel Rockets",
        bgClass: "bg-primary"
      };
    }
    
    if (program?.type === 'in_house') {
      return {
        src: cdblInHouseLogo,
        alt: "CDBL In-House",
        bgClass: "bg-black"
      };
    }
  }
  
  // Board meetings and league-wide events use the seal (no programId)
  if (event.type === 'board-meeting' || !event.programId) {
    return {
      src: cdblSeal,
      alt: "CDBL League Seal",
      bgClass: "bg-white border border-border"
    };
  }
  
  // Default fallback
  return {
    src: cdblSeal,
    alt: "CDBL",
    bgClass: "bg-white border border-border"
  };
};

export const getGameMatchupDisplay = (event: CalendarEvent, teams?: Team[], programs?: Program[]) => {
  if (event.category === 'game' && event.homeTeamId && event.awayTeamId && teams) {
    const homeTeam = teams.find(t => t.id === event.homeTeamId);
    const awayTeam = teams.find(t => t.id === event.awayTeamId);
    
    if (!homeTeam || !awayTeam) {
      return { isMatchup: false };
    }
    
    return {
      isMatchup: true,
      homeTeam,
      awayTeam,
      homeImage: getEventCategoryImage({ ...event, programId: homeTeam.program_id }, programs),
      awayImage: getEventCategoryImage({ ...event, programId: awayTeam.program_id }, programs)
    };
  }
  
  return { isMatchup: false };
};
