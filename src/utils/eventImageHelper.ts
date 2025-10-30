import cdblInHouseLogo from "@/assets/cdbl-inhouse-logo.png";
import rocketsTravelLogo from "@/assets/rockets-travel-logo.png";
import cdblSeal from "@/assets/cdbl-seal.png";
import { CalendarEvent } from "@/data/calendarEvents";
import { getTeamById } from "@/data/teamData";

export const getEventCategoryImage = (event: CalendarEvent) => {
  // Board meetings and league-wide events use the seal
  if (event.type === 'board-meeting' || 
      event.league === 'both' || 
      !event.league) {
    return {
      src: cdblSeal,
      alt: "CDBL League Seal",
      bgClass: "bg-white border border-border"
    };
  }
  
  // Travel events use the white rockets on blue
  if (event.league === 'travel') {
    return {
      src: rocketsTravelLogo,
      alt: "CDBL Travel Rockets",
      bgClass: "bg-primary"
    };
  }
  
  // In-House events use the CDBL logo on black
  if (event.league === 'in-house') {
    return {
      src: cdblInHouseLogo,
      alt: "CDBL In-House",
      bgClass: "bg-black"
    };
  }
  
  // Default fallback
  return {
    src: cdblSeal,
    alt: "CDBL",
    bgClass: "bg-white border border-border"
  };
};

export const getGameMatchupDisplay = (event: CalendarEvent) => {
  if (event.category === 'game' && event.homeTeam && event.awayTeam) {
    const homeTeamData = getTeamById(event.homeTeam);
    const awayTeamData = getTeamById(event.awayTeam);
    
    if (!homeTeamData || !awayTeamData) {
      return { isMatchup: false };
    }
    
    return {
      isMatchup: true,
      homeTeam: homeTeamData,
      awayTeam: awayTeamData,
      homeImage: getEventCategoryImage({ ...event, league: homeTeamData.league }),
      awayImage: getEventCategoryImage({ ...event, league: awayTeamData.league })
    };
  }
  
  return { isMatchup: false };
};
