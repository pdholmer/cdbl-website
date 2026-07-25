import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function client(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_upcoming_games",
  title: "List upcoming games",
  description:
    "List upcoming CDBL games ordered by date. Optionally filter by division name (e.g. 'Pinto', 'Mustang', '10U'), team name, or limit.",
  inputSchema: {
    division: z.string().optional().describe("Division name substring to filter by."),
    team: z.string().optional().describe("Team name substring to filter by."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ division, team, limit }, ctx) => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await client(ctx)
      .from("games")
      .select(
        "id, game_date, game_time, status, home_team:home_team_id(name), away_team:away_team_id(name), venue:venue_id(name), division:division_id(name)"
      )
      .gte("game_date", today)
      .neq("status", "cancelled")
      .order("game_date", { ascending: true })
      .order("game_time", { ascending: true })
      .limit(limit ?? 25);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    let rows = data ?? [];
    if (division) {
      const q = division.toLowerCase();
      rows = rows.filter((r: any) => r.division?.name?.toLowerCase().includes(q));
    }
    if (team) {
      const q = team.toLowerCase();
      rows = rows.filter(
        (r: any) =>
          r.home_team?.name?.toLowerCase().includes(q) || r.away_team?.name?.toLowerCase().includes(q)
      );
    }

    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { games: rows },
    };
  },
});
