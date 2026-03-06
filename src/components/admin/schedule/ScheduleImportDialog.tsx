import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useGameMutations } from "@/hooks/useGameMutations";
import { useLeagueEventMutations } from "@/hooks/useLeagueEvents";
import { useTeams } from "@/hooks/useTeams";
import { useVenues } from "@/hooks/useVenues";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

type ImportMode = "games" | "events";

interface ParsedRow {
  [key: string]: string;
}

export const ScheduleImportDialog = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ImportMode>("games");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { createGame } = useGameMutations();
  const { createEvent } = useLeagueEventMutations();
  const { data: teams = [] } = useTeams();
  const { data: venues = [] } = useVenues();
  const { toast } = useToast();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<ParsedRow>(ws, { defval: "" });
        if (data.length > 0) {
          setHeaders(Object.keys(data[0]));
          setRows(data.slice(0, 100)); // preview up to 100
        }
      } catch {
        toast({ title: "Error parsing file", variant: "destructive" });
      }
    };
    reader.readAsBinaryString(file);
  };

  const findTeamId = (name: string) => {
    if (!name) return null;
    const lower = name.toLowerCase().trim();
    return teams.find((t) => t.name.toLowerCase() === lower)?.id || null;
  };

  const findVenueId = (name: string) => {
    if (!name) return null;
    const lower = name.toLowerCase().trim();
    return venues.find((v) => v.name.toLowerCase() === lower)?.id || null;
  };

  const guessColumn = (keywords: string[]) =>
    headers.find((h) => keywords.some((k) => h.toLowerCase().includes(k))) || "";

  const handleImport = async () => {
    setImporting(true);
    try {
      if (mode === "games") {
        const dateCol = guessColumn(["date"]);
        const timeCol = guessColumn(["time"]);
        const homeCol = guessColumn(["home"]);
        const awayCol = guessColumn(["away", "visitor"]);
        const venueCol = guessColumn(["venue", "field", "location"]);

        for (const row of rows) {
          const gameDate = row[dateCol];
          const gameTime = row[timeCol] || "TBD";
          if (!gameDate) continue;

          await createGame.mutateAsync({
            game_date: gameDate,
            game_time: gameTime,
            game_type: "regular_season",
            home_team_id: findTeamId(row[homeCol]),
            away_team_id: findTeamId(row[awayCol]),
            venue_id: findVenueId(row[venueCol]),
          });
        }
        toast({ title: "Import complete", description: `${rows.length} games imported.` });
      } else {
        const titleCol = guessColumn(["title", "name", "event"]);
        const dateCol = guessColumn(["date"]);
        const timeCol = guessColumn(["time"]);
        const locCol = guessColumn(["location", "venue"]);
        const descCol = guessColumn(["description", "desc", "notes"]);

        for (const row of rows) {
          if (!row[titleCol] || !row[dateCol]) continue;
          await createEvent.mutateAsync({
            title: row[titleCol],
            event_date: row[dateCol],
            end_date: null,
            event_time: row[timeCol] || null,
            location: row[locCol] || null,
            event_type: "special-event",
            description: row[descCol] || null,
            category: "event",
            created_by: null,
          });
        }
        toast({ title: "Import complete", description: `${rows.length} events imported.` });
      }
      setOpen(false);
      setRows([]);
      setHeaders([]);
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setRows([]); setHeaders([]); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />Import Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Import Schedule from File</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={mode} onValueChange={(v) => setMode(v as ImportMode)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="games">Games</SelectItem>
                <SelectItem value="events">Events</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />Choose File (.csv / .xlsx)
            </Button>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
          </div>

          {rows.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground">{rows.length} rows found. Preview below (max 100):</p>
              <Card className="overflow-auto max-h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((h) => <TableHead key={h}>{h}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 10).map((row, i) => (
                      <TableRow key={i}>
                        {headers.map((h) => <TableCell key={h} className="text-xs">{row[h]}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
              <Button onClick={handleImport} disabled={importing} className="w-full">
                {importing ? "Importing..." : `Import ${rows.length} ${mode}`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
