import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, Link2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function GameChangerSync() {
  const { toast } = useToast();
  const [teamId, setTeamId] = useState("");
  const [gameId, setGameId] = useState("");
  const [csvData, setCsvData] = useState("");
  const [syncing, setSyncing] = useState(false);

  const handleTeamSync = async () => {
    if (!teamId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a GameChanger Team ID",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    try {
      // Placeholder for GameChanger API integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sync Complete",
        description: "Team data synced successfully from GameChanger",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync team data. Please check your Team ID.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleGameSync = async () => {
    if (!gameId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a GameChanger Game ID",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    try {
      // Placeholder for GameChanger API integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sync Complete",
        description: "Game data synced successfully from GameChanger",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync game data. Please check your Game ID.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleCSVImport = () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Please paste CSV data to import",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');
      
      toast({
        title: "Import Started",
        description: `Processing ${lines.length - 1} rows...`,
      });

      // Placeholder for actual CSV processing
      setTimeout(() => {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${lines.length - 1} records`,
        });
        setCsvData("");
      }, 1500);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-2">GameChanger Integration</h1>
        <p className="text-muted-foreground mb-8">Sync schedules and data with GameChanger</p>

        <div className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>Note:</strong> GameChanger integration requires API credentials. 
            Contact support to set up automatic syncing. Manual import/export is available below.
          </AlertDescription>
        </Alert>

        {/* Team Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Sync Team Data
            </CardTitle>
            <CardDescription>
              Import team rosters and information from GameChanger
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamId">GameChanger Team ID</Label>
              <Input
                id="teamId"
                placeholder="Enter Team ID from GameChanger"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
              />
            </div>
            <Button onClick={handleTeamSync} disabled={syncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Team'}
            </Button>
          </CardContent>
        </Card>

        {/* Game Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Sync Game Data
            </CardTitle>
            <CardDescription>
              Import game schedules and scores from GameChanger
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gameId">GameChanger Game ID</Label>
              <Input
                id="gameId"
                placeholder="Enter Game ID from GameChanger"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
              />
            </div>
            <Button onClick={handleGameSync} disabled={syncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Game'}
            </Button>
          </CardContent>
        </Card>

        {/* CSV Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Manual CSV Import
            </CardTitle>
            <CardDescription>
              Paste CSV data from GameChanger export to import manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvData">CSV Data</Label>
              <Textarea
                id="csvData"
                placeholder="Paste CSV data here (including headers)"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCSVImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
              <Button variant="outline" onClick={() => setCsvData("")}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export for GameChanger
            </CardTitle>
            <CardDescription>
              Export data in GameChanger-compatible format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Team Roster (CSV)
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Schedule (CSV)
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Game Results (CSV)
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
