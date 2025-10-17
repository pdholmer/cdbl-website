import type { Database } from "@/integrations/supabase/types";

type Game = Database["public"]["Tables"]["games"]["Row"] & {
  home_team?: { name: string };
  away_team?: { name: string };
  venue?: { name: string; city: string };
};

export const exportScheduleToCSV = (games: Game[], filename: string = "schedule.csv") => {
  const headers = [
    "Date",
    "Time",
    "Home Team",
    "Away Team",
    "Venue",
    "City",
    "Field",
    "Game Type",
    "Status",
  ];

  const rows = games.map((game) => [
    game.game_date,
    game.game_time,
    game.home_team?.name || "",
    game.away_team?.name || "",
    game.venue?.name || "",
    game.venue?.city || "",
    game.field_number || "",
    game.game_type,
    game.status,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportForGameChangerSchedule = (games: Game[], filename: string = "gamechanger_schedule.csv") => {
  const headers = ["Date", "Time", "Home Team", "Away Team", "Location"];

  const rows = games.map((game) => [
    game.game_date,
    game.game_time,
    game.home_team?.name || "",
    game.away_team?.name || "",
    `${game.venue?.name || ""}, ${game.venue?.city || ""}`,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
