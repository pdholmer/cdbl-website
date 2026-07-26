import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Send } from "lucide-react";

type Scope = "league" | "division" | "team" | "household" | "admins";
type Priority = "urgent" | "normal" | "digest";

type Option = { id: string; label: string };

export const ComposeTab = () => {
  const [scope, setScope] = useState<Scope>("league");
  const [scopeId, setScopeId] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [eventKey, setEventKey] = useState("league.announcement");

  const [divisions, setDivisions] = useState<Option[]>([]);
  const [teams, setTeams] = useState<Option[]>([]);
  const [households, setHouseholds] = useState<Option[]>([]);

  const [count, setCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: dv }, { data: tm }, { data: hh }] = await Promise.all([
        supabase.from("divisions").select("id, name").order("name"),
        supabase.from("teams").select("id, team_name").order("team_name"),
        supabase.from("households").select("id, name").order("name"),
      ]);
      setDivisions((dv ?? []).map((r: any) => ({ id: r.id, label: r.name })));
      setTeams(
        (tm ?? []).map((r: any) => ({ id: r.id, label: r.team_name ?? "Team" })),
      );
      setHouseholds(
        (hh ?? []).map((r: any) => ({ id: r.id, label: r.name ?? "Household" })),
      );
    })();
  }, []);

  const payload = useMemo(() => {
    switch (scope) {
      case "league":
        return { scope: "league" };
      case "admins":
        return { scope: "admins" };
      case "division":
        return { scope: "division", division_id: scopeId };
      case "team":
        return { scope: "team", team_id: scopeId };
      case "household":
        return { scope: "household", household_id: scopeId };
    }
  }, [scope, scopeId]);

  const audienceDescription = useMemo(() => {
    switch (scope) {
      case "league":
        return "All league households";
      case "admins":
        return "Admins and board members";
      case "division": {
        const d = divisions.find((x) => x.id === scopeId);
        return d ? `${d.label} division` : "A division";
      }
      case "team": {
        const t = teams.find((x) => x.id === scopeId);
        return t ? `${t.label}` : "A team";
      }
      case "household": {
        const h = households.find((x) => x.id === scopeId);
        return h ? `${h.label}` : "A household";
      }
    }
  }, [scope, scopeId, divisions, teams, households]);

  // Live recipient count — counts households (unique guardians per household).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCounting(true);
      setCount(null);
      try {
        const n = await estimateRecipients(scope, scopeId);
        if (!cancelled) setCount(n);
      } finally {
        if (!cancelled) setCounting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope, scopeId]);

  const canSave =
    subject.trim().length > 0 &&
    body.trim().length > 0 &&
    (scope === "league" ||
      scope === "admins" ||
      (!!scopeId && scopeId.length > 0));

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id ?? null;
    const { error } = await supabase.from("notification_queue").insert({
      event_key: eventKey,
      priority,
      subject: subject.trim(),
      body_markdown: body,
      payload,
      audience_description: audienceDescription,
      requires_approval: true,
      status: "pending",
      created_by: uid,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved to queue for approval");
    setSubject("");
    setBody("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="rounded-2xl shadow-md lg:col-span-2">
        <CardHeader>
          <CardTitle>Compose message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Audience</Label>
              <Select value={scope} onValueChange={(v) => { setScope(v as Scope); setScopeId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="league">Entire league</SelectItem>
                  <SelectItem value="division">Division</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="household">Single household</SelectItem>
                  <SelectItem value="admins">Admins &amp; board</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent (bypasses opt-outs)</SelectItem>
                  <SelectItem value="digest">Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {scope === "division" && (
            <div>
              <Label>Which division</Label>
              <Select value={scopeId} onValueChange={setScopeId}>
                <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
                <SelectContent>
                  {divisions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {scope === "team" && (
            <div>
              <Label>Which team</Label>
              <Select value={scopeId} onValueChange={setScopeId}>
                <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {scope === "household" && (
            <div>
              <Label>Which household</Label>
              <Select value={scopeId} onValueChange={setScopeId}>
                <SelectTrigger><SelectValue placeholder="Select household" /></SelectTrigger>
                <SelectContent>
                  {households.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Event key</Label>
            <Input
              value={eventKey}
              onChange={(e) => setEventKey(e.target.value)}
              placeholder="league.announcement"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used as the category for opt-outs. Segment before the dot (e.g.{" "}
              <code>fundraising</code>) is what parents can mute.
            </p>
          </div>

          <div>
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Rainout for tonight"
            />
          </div>

          <div>
            <Label>Body</Label>
            <Textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Markdown supported. **Bold**, *italic*, [links](https://...)."
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={!canSave || saving}>
              <Send className="mr-2 h-4 w-4" />
              Save to queue
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Live reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading">
              {counting
                ? "…"
                : count === null
                ? "—"
                : count.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This will reach{" "}
              <span className="font-medium">
                {count ?? 0} household{count === 1 ? "" : "s"}
              </span>
              . One digest per family — never one message per child.
            </p>
            <Badge variant="outline" className="mt-3">
              {audienceDescription}
            </Badge>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-dashed">
          <CardContent className="p-4 text-xs text-muted-foreground">
            Saving queues the message with <code>requires_approval=true</code>. An
            admin drains the queue by invoking the <code>send-notifications</code>{" "}
            function.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

async function estimateRecipients(
  scope: Scope,
  scopeId: string,
): Promise<number> {
  if (scope === "league") {
    const { count } = await supabase
      .from("guardian_households")
      .select("household_id", { count: "exact", head: true });
    return count ?? 0;
  }
  if (scope === "admins") {
    const { count } = await supabase
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .in("role", ["admin", "board_member"]);
    return count ?? 0;
  }
  if (scope === "household") {
    if (!scopeId) return 0;
    const { count } = await supabase
      .from("guardian_households")
      .select("guardian_id", { count: "exact", head: true })
      .eq("household_id", scopeId);
    return count ?? 0;
  }
  if (scope === "team") {
    if (!scopeId) return 0;
    const { data: roster } = await supabase
      .from("team_rosters")
      .select("player_id")
      .eq("team_id", scopeId)
      .eq("status", "active");
    return await countHouseholdsForPlayers((roster ?? []).map((r: any) => r.player_id));
  }
  if (scope === "division") {
    if (!scopeId) return 0;
    const { data: teams } = await supabase
      .from("teams")
      .select("id")
      .eq("division_id", scopeId);
    const teamIds = (teams ?? []).map((t: any) => t.id);
    if (teamIds.length === 0) return 0;
    const { data: roster } = await supabase
      .from("team_rosters")
      .select("player_id")
      .in("team_id", teamIds)
      .eq("status", "active");
    return await countHouseholdsForPlayers((roster ?? []).map((r: any) => r.player_id));
  }
  return 0;
}

async function countHouseholdsForPlayers(playerIds: string[]): Promise<number> {
  if (playerIds.length === 0) return 0;
  const { data: hp } = await supabase
    .from("household_players")
    .select("household_id")
    .in("player_id", playerIds);
  return new Set((hp ?? []).map((r: any) => r.household_id)).size;
}
