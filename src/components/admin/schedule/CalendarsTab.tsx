import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useExternalCalendars,
  useExternalCalendarMutations,
  useSyncExternalCalendar,
} from "@/hooks/useExternalCalendars";
import { Plus, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const CalendarsTab = () => {
  const { data: calendars = [], isLoading } = useExternalCalendars();
  const { create, update, remove } = useExternalCalendarMutations();
  const sync = useSyncExternalCalendar();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    ical_url: "",
    color: "#8b5cf6",
  });

  const handleCreate = async () => {
    if (!form.name || !form.ical_url) return;
    await create.mutateAsync(form);
    setForm({ name: "", ical_url: "", color: "#8b5cf6" });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground max-w-2xl">
          Connect external iCal feeds (e.g. TeamApp, Google Calendar) to
          automatically display their events on the public schedule. Synced
          events are read-only here — manage them in the source calendar.
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => sync.mutate(undefined)}
            disabled={sync.isPending}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`}
            />
            Sync All
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Calendar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add External Calendar</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g. TeamApp Calendar"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>iCal URL (.ics)</Label>
                  <Input
                    placeholder="https://..."
                    value={form.ical_url}
                    onChange={(e) =>
                      setForm({ ...form, ical_url: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="h-10 w-20"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={create.isPending}
                  className="w-full"
                >
                  Add Calendar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Last Synced</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : calendars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No external calendars connected.
                </TableCell>
              </TableRow>
            ) : (
              calendars.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: c.color ?? "#8b5cf6" }}
                      />
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.source}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.last_synced_at
                      ? formatDistanceToNow(new Date(c.last_synced_at), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    {c.last_sync_status === "success" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Success
                      </Badge>
                    ) : c.last_sync_status === "error" ? (
                      <Badge variant="destructive" title={c.last_sync_message ?? ""}>
                        Error
                      </Badge>
                    ) : c.last_sync_status === "warning" ? (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        Warning
                      </Badge>
                    ) : (
                      <Badge variant="outline">—</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={c.is_active}
                      onCheckedChange={(v) =>
                        update.mutate({ id: c.id, updates: { is_active: v } })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sync.mutate(c.id)}
                        disabled={sync.isPending}
                        title="Sync now"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <a
                        href={c.ical_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" title="Open feed">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" title="Delete">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove this calendar?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              All synced events from "{c.name}" will be removed
                              from the schedule.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => remove.mutate(c.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
