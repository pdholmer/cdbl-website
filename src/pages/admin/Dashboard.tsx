import { 
  Users, Shield, Calendar, MessageSquare, 
  UserPlus, CalendarPlus, MapPin, FileText,
  UserCog, ClipboardList
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboardStats";
import {
  HeroAlertCard,
  StatCard,
  StatCardSkeleton,
  QuickActionCard,
  UpcomingGamesCard,
  AdminNavGrid,
} from "@/components/admin/dashboard";

const Dashboard = () => {
  const { data: stats, isLoading } = useAdminDashboardStats();

  const showCriticalFeedback = stats && (stats.criticalFeedback > 0 || stats.highPriorityFeedback > 0);
  const showLiveDraft = stats?.liveDraft;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what needs your attention.
          </p>
        </div>

        {/* Hero Alert Cards - Only show when there's urgent action needed */}
        {(showCriticalFeedback || showLiveDraft) && (
          <div className="grid gap-4">
            {showLiveDraft && stats.liveDraft && (
              <HeroAlertCard
                type="live-draft"
                title="Draft in Progress"
                description={stats.liveDraft.name}
                href={`/admin/drafts/${stats.liveDraft.id}/live`}
                meta={`Round ${stats.liveDraft.currentRound} of ${stats.liveDraft.totalRounds}`}
              />
            )}
            {showCriticalFeedback && (
              <HeroAlertCard
                type="critical-feedback"
                title="Critical Feedback Needs Review"
                description={`${stats.criticalFeedback} critical and ${stats.highPriorityFeedback} high priority items require attention`}
                href="/admin/feedback"
              />
            )}
          </div>
        )}

        {/* Primary Stat Cards - 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : stats ? (
            <>
              <StatCard
                title="Players"
                value={stats.pendingRegistrations}
                subtitle={stats.unpaidRegistrations > 0 
                  ? `${stats.unpaidRegistrations} awaiting payment` 
                  : "All payments received"
                }
                icon={Users}
                href="/admin/players?status=pending"
                accentColor={stats.pendingRegistrations > 0 ? "warning" : "success"}
              />
              <StatCard
                title="Teams"
                value={stats.activeTeams}
                subtitle={stats.teamsNeedingCoaches > 0 
                  ? `${stats.teamsNeedingCoaches} need coaches` 
                  : "All teams staffed"
                }
                icon={Shield}
                href="/admin/teams"
                accentColor={stats.teamsNeedingCoaches > 0 ? "warning" : "default"}
              />
              <StatCard
                title="Today's Games"
                value={stats.todayGames}
                subtitle={stats.upcomingGames.length > 0 
                  ? `${stats.upcomingGames.length} games this week` 
                  : "No games scheduled"
                }
                icon={Calendar}
                href="/admin/schedule"
                accentColor="default"
              />
              <StatCard
                title="Open Feedback"
                value={stats.pendingFeedback + stats.processingFeedback}
                subtitle={stats.criticalFeedback > 0 
                  ? `${stats.criticalFeedback} critical priority` 
                  : "No critical items"
                }
                icon={MessageSquare}
                href="/admin/feedback"
                accentColor={stats.criticalFeedback > 0 ? "destructive" : "default"}
              />
            </>
          ) : null}
        </div>

        {/* Quick Actions Row */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <QuickActionCard
              title="Add Player"
              description="Register new player"
              icon={UserPlus}
              href="/admin/players/new"
            />
            <QuickActionCard
              title="Schedule Game"
              description="Create new game"
              icon={CalendarPlus}
              href="/admin/schedule/new"
            />
            <QuickActionCard
              title="Add Facility"
              description="Register new location"
              icon={MapPin}
              href="/admin/facilities/new"
            />
            <QuickActionCard
              title="Invite Coach"
              description="Send invitation"
              icon={UserCog}
              href="/admin/coaches"
            />
            <QuickActionCard
              title="Run Draft"
              description="Start or manage drafts"
              icon={ClipboardList}
              href="/admin/drafts"
            />
            <QuickActionCard
              title="Generate Report"
              description="Analytics & exports"
              icon={FileText}
              href="/admin/reports"
            />
          </div>
        </div>

        {/* Activity & Upcoming Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingGamesCard 
            games={stats?.upcomingGames || []} 
            isLoading={isLoading} 
          />
          
          {/* Stats Summary Card */}
          <div className="rounded-2xl border bg-card overflow-hidden backdrop-blur-sm bg-card/80">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-foreground">At a Glance</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Total Players</span>
                <span className="font-semibold">{isLoading ? "..." : stats?.totalPlayers || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm text-muted-foreground">Total Teams</span>
                <span className="font-semibold">{isLoading ? "..." : stats?.totalTeams || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm text-muted-foreground">Active Drafts</span>
                <span className="font-semibold">{isLoading ? "..." : stats?.activeDrafts || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm text-muted-foreground">Pending Invitations</span>
                <span className="font-semibold">{isLoading ? "..." : stats?.pendingInvitations || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Navigation Grid - Collapsible */}
        <AdminNavGrid />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
