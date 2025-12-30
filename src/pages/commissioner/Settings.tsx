import { useState } from "react";
import { Save, Clock, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useCommissionerAssignments } from "@/hooks/useCommissionerAssignments";
import { usePrograms } from "@/hooks/usePrograms";
import { toast } from "sonner";

export default function CommissionerSettings() {
  const { data: assignments } = useCommissionerAssignments();
  const { programs } = usePrograms();
  
  const [isSaving, setIsSaving] = useState(false);
  
  // League Settings State
  const [settings, setSettings] = useState({
    defaultGameDuration: 90,
    defaultRosterSize: 12,
    minRosterSize: 8,
    maxRosterSize: 15,
    allowWaitlist: true,
    autoApproveRegistrations: false,
    sendGameReminders: true,
    reminderHoursBefore: 24,
    allowCoachSelfSchedule: false,
    requireBackgroundCheck: true,
  });

  const programIds = assignments?.map(a => a.program_id) || [];
  const assignedPrograms = programs?.filter(p => programIds.includes(p.id)) || [];

  const handleSave = async () => {
    setIsSaving(true);
    
    // In a real implementation, this would save to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Settings saved successfully");
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure league settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Program Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Programs</CardTitle>
          <CardDescription>
            Programs you are assigned to manage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignedPrograms.map((program) => (
              <div key={program.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{program.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">{program.type.replace('_', ' ')}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {program.divisions?.length || 0} division(s)
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Game Settings
          </CardTitle>
          <CardDescription>
            Configure default game settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="gameDuration">Default Game Duration (minutes)</Label>
              <Input
                id="gameDuration"
                type="number"
                value={settings.defaultGameDuration}
                onChange={(e) => setSettings({ ...settings, defaultGameDuration: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gameReminders">Send Game Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send reminders before scheduled games
              </p>
            </div>
            <Switch
              id="gameReminders"
              checked={settings.sendGameReminders}
              onCheckedChange={(checked) => setSettings({ ...settings, sendGameReminders: checked })}
            />
          </div>

          {settings.sendGameReminders && (
            <div className="grid gap-2">
              <Label htmlFor="reminderHours">Hours Before Game</Label>
              <Input
                id="reminderHours"
                type="number"
                value={settings.reminderHoursBefore}
                onChange={(e) => setSettings({ ...settings, reminderHoursBefore: parseInt(e.target.value) })}
                className="w-32"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roster Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Roster Settings
          </CardTitle>
          <CardDescription>
            Configure team roster limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="defaultRoster">Default Roster Size</Label>
              <Input
                id="defaultRoster"
                type="number"
                value={settings.defaultRosterSize}
                onChange={(e) => setSettings({ ...settings, defaultRosterSize: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minRoster">Minimum Players</Label>
              <Input
                id="minRoster"
                type="number"
                value={settings.minRosterSize}
                onChange={(e) => setSettings({ ...settings, minRosterSize: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxRoster">Maximum Players</Label>
              <Input
                id="maxRoster"
                type="number"
                value={settings.maxRosterSize}
                onChange={(e) => setSettings({ ...settings, maxRosterSize: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Registration Settings
          </CardTitle>
          <CardDescription>
            Configure player registration options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="waitlist">Allow Waitlist</Label>
              <p className="text-sm text-muted-foreground">
                Allow players to join a waitlist when divisions are full
              </p>
            </div>
            <Switch
              id="waitlist"
              checked={settings.allowWaitlist}
              onCheckedChange={(checked) => setSettings({ ...settings, allowWaitlist: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoApprove">Auto-Approve Registrations</Label>
              <p className="text-sm text-muted-foreground">
                Automatically approve new registrations without manual review
              </p>
            </div>
            <Switch
              id="autoApprove"
              checked={settings.autoApproveRegistrations}
              onCheckedChange={(checked) => setSettings({ ...settings, autoApproveRegistrations: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Coach Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Coach Settings</CardTitle>
          <CardDescription>
            Configure coach requirements and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="bgCheck">Require Background Check</Label>
              <p className="text-sm text-muted-foreground">
                Coaches must have an approved background check before being assigned
              </p>
            </div>
            <Switch
              id="bgCheck"
              checked={settings.requireBackgroundCheck}
              onCheckedChange={(checked) => setSettings({ ...settings, requireBackgroundCheck: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="coachSchedule">Allow Coach Self-Scheduling</Label>
              <p className="text-sm text-muted-foreground">
                Allow coaches to schedule their own practices
              </p>
            </div>
            <Switch
              id="coachSchedule"
              checked={settings.allowCoachSelfSchedule}
              onCheckedChange={(checked) => setSettings({ ...settings, allowCoachSelfSchedule: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
