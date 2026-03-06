import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { usePractices } from "@/hooks/usePractices";
import { format } from "date-fns";

export const PracticesTab = () => {
  const { data: practices = [], isLoading } = usePractices();

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
          ) : practices.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center">No practices found</TableCell></TableRow>
          ) : (
            practices.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{format(new Date(p.practice_date + "T00:00:00"), "MMM d, yyyy")}</div>
                    <div className="text-muted-foreground">{p.start_time} – {p.end_time}</div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{p.team?.name || "-"}</TableCell>
                <TableCell>{p.team?.division?.name || "-"}</TableCell>
                <TableCell>{p.venue?.name || "-"}</TableCell>
                <TableCell><Badge variant="outline">{p.practice_type || "Regular"}</Badge></TableCell>
                <TableCell><Badge variant={p.status === "cancelled" ? "destructive" : "default"}>{p.status || "scheduled"}</Badge></TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
