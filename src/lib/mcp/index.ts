import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listUpcomingGames from "./tools/list-upcoming-games";
import listFacilities from "./tools/list-facilities";
import searchFaqs from "./tools/search-faqs";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "cdbl-mcp",
  title: "CDBL Baseball",
  version: "0.1.0",
  instructions:
    "Tools for the Central District Baseball League (CDBL) website. Use `list_upcoming_games` for the schedule, `list_facilities` for field/facility status, and `search_faqs` for parent/coach questions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listUpcomingGames, listFacilities, searchFaqs],
});
