import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useLeagueEvents, useLeagueEventMutations, type LeagueEventInsert } from "@/hooks/useLeagueEvents";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

const EVENT_TYPES = [
  "board-meeting", "field-maintenance", "tournament", "registration",
  "clinic", "ceremony", "pictures", "fundraiser", "special-event",
  "tryouts", "uniform-event", "draft", "training",
];

const emptyForm: LeagueEventInsert = {
  title: "", event_date: "", end_date: null, event_time: null,
  location: null, event_type: "special-event", description: null,
  category: "event", created_by: null,
};

export const EventsTab = () => {
  const { data: events = [], isLoading } = useLeagueEvents();
  const { createEvent, updateEvent, deleteEvent } = useLeagueEventMutations();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<LeagueEventInsert>(emptyForm);

  const handleOpen = (event?: typeof events[0]) => {
    if (event) {
      setEditId(event.id);
      setForm({
        title: event.title, event_date: event.event_date,
        end_date: event.end_date, event_time: event.event_time,
        location: event.location, event_type: event.event_type,
        description: event.description, category: event.category,
        created_by: event.created_by,
      });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.event_date) return;
    if (editId) {
      await updateEvent.mutateAsync({ id: editId, updates: form });
    } else {
      await createEvent.mutateAsync(form);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpen()}><Plus className="mr-2 h-4 w-4" />Add Event</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editId ? "Edit Event" : "Add Event"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input type="date" value={form.end_date || ""} onChange={(e) => setForm({ ...form, end_date: e.target.value || null })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Time (e.g. 7:00 PM)" value={form.event_time || ""} onChange={(e) => setForm({ ...form, event_time: e.target.value || null })} />
                <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/-/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Location" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value || null })} />
              <Textarea placeholder="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value || null })} />
              <Button onClick={handleSubmit} disabled={createEvent.isPending || updateEvent.isPending} className="w-full">
                {editId ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : events.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">No events found. Add your first event above.</TableCell></TableRow>
            ) : (
              events.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell>
                    <div className="text-sm font-medium">{format(new Date(ev.event_date + "T00:00:00"), "MMM d, yyyy")}</div>
                    {ev.end_date && <div className="text-xs text-muted-foreground">– {format(new Date(ev.end_date + "T00:00:00"), "MMM d")}</div>}
                  </TableCell>
                  <TableCell className="font-medium">{ev.title}</TableCell>
                  <TableCell>{ev.event_time || "-"}</TableCell>
                  <TableCell>{ev.location || "-"}</TableCell>
                  <TableCell><Badge variant="outline">{ev.event_type.replace(/-/g, " ")}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleOpen(ev)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm" onClick={() => deleteEvent.mutate(ev.id)}><Trash2 className="h-3 w-3" /></Button>
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
