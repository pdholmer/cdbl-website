import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, Users, DollarSign, Calendar } from "lucide-react";
import { exportToCSV } from "@/utils/csvExport";
import { useToast } from "@/hooks/use-toast";
import { useTeamRosterCounts } from "@/hooks/useTeamRosterCounts";

export default function Reports() {
  const { toast } = useToast();
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>(new Date().getFullYear().toString());
  const { data: rosterCounts } = useTeamRosterCounts();

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: registrationStats } = useQuery({
    queryKey: ['registration-stats', selectedProgram, selectedSeason],
    queryFn: async () => {
      let query = supabase
        .from('players')
        .select('*, programs(name), divisions(name)');
      
      if (selectedProgram !== 'all') {
        query = query.eq('program_id', selectedProgram);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return {
        total: data?.length || 0,
        pending: data?.filter(p => p.status === 'pending').length || 0,
        active: data?.filter(p => p.status === 'active').length || 0,
        paid: data?.filter(p => p.payment_status === 'paid').length || 0,
        unpaid: data?.filter(p => p.payment_status === 'unpaid').length || 0,
        totalRevenue: data?.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0) || 0,
        players: data || [],
      };
    },
  });

  const { data: teamStats } = useQuery({
    queryKey: ['team-stats', selectedProgram, selectedSeason],
    queryFn: async () => {
      let query = supabase
        .from('teams')
        .select('*, programs(name), divisions(name)');
      
      if (selectedProgram !== 'all') {
        query = query.eq('program_id', selectedProgram);
      }
      
      query = query.eq('season_year', parseInt(selectedSeason));
      
      const { data, error } = await query;
      if (error) throw error;
      
      return {
        total: data?.length || 0,
        active: data?.filter(t => t.status === 'active').length || 0,
        forming: data?.filter(t => t.status === 'forming').length || 0,
        teams: data || [],
      };
    },
  });

  const exportRegistrations = () => {
    if (!registrationStats?.players) return;
    
    const exportData = registrationStats.players.map(p => ({
      'First Name': p.first_name,
      'Last Name': p.last_name,
      'Date of Birth': p.date_of_birth,
      'Age': p.age_at_registration,
      'Parent/Guardian': p.parent_guardian_name,
      'Email': p.parent_email,
      'Phone': p.parent_phone,
      'Status': p.status,
      'Payment Status': p.payment_status,
      'Amount Paid': p.amount_paid,
      'Amount Due': p.amount_due,
      'Registration Date': new Date(p.registration_date).toLocaleDateString(),
    }));
    
    exportToCSV(exportData, `registrations-${selectedSeason}.csv`);
    toast({
      title: "Export Complete",
      description: "Registration data has been exported.",
    });
  };

  const exportTeamRosters = () => {
    if (!teamStats?.teams) return;
    
    const exportData = teamStats.teams.map(t => ({
      'Team Name': t.name,
      'Nickname': t.nickname || '',
      'Program': t.programs?.name || '',
      'Division': t.divisions?.name || '',
      'Season': t.season_year,
      'Status': t.status,
      'Current Roster': rosterCounts?.get(t.id)?.active_count ?? 0,
      'Max Roster': rosterCounts?.get(t.id)?.effective_max ?? '',
    }));
    
    exportToCSV(exportData, `team-rosters-${selectedSeason}.csv`);
    toast({
      title: "Export Complete",
      description: "Team roster data has been exported.",
    });
  };

  const exportFinancials = () => {
    if (!registrationStats?.players) return;
    
    const exportData = registrationStats.players.map(p => ({
      'Player Name': `${p.first_name} ${p.last_name}`,
      'Parent/Guardian': p.parent_guardian_name,
      'Email': p.parent_email,
      'Payment Status': p.payment_status,
      'Amount Paid': p.amount_paid || 0,
      'Amount Due': p.amount_due || 0,
      'Payment Method': p.payment_method || '',
      'Payment Date': p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '',
      'Registration Date': new Date(p.registration_date).toLocaleDateString(),
    }));
    
    exportToCSV(exportData, `financials-${selectedSeason}.csv`);
    toast({
      title: "Export Complete",
      description: "Financial data has been exported.",
    });
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground mb-8">Generate and export league reports</p>

        <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {Array.isArray(programs) ? programs.map((program: any) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year} Season
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrationStats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {registrationStats?.pending || 0} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {teamStats?.forming || 0} forming
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${registrationStats?.totalRevenue.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                {registrationStats?.paid || 0} paid / {registrationStats?.total || 0} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registrationStats?.total 
                  ? ((registrationStats.paid / registrationStats.total) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {registrationStats?.unpaid || 0} unpaid
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Export Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Export Reports</CardTitle>
            <CardDescription>Download data as CSV files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Registration Report</h4>
                <p className="text-sm text-muted-foreground">
                  Complete player registration data with contact information
                </p>
              </div>
              <Button onClick={exportRegistrations}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Team Roster Report</h4>
                <p className="text-sm text-muted-foreground">
                  Team information and roster counts by division
                </p>
              </div>
              <Button onClick={exportTeamRosters}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Financial Report</h4>
                <p className="text-sm text-muted-foreground">
                  Payment status and revenue tracking
                </p>
              </div>
              <Button onClick={exportFinancials}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
