import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Database, Users, HelpCircle, Heart, BookOpen, Shield, 
  Calendar, MapPin, BarChart3, RefreshCw, MessageSquare,
  ChevronDown, ChevronUp, UserCog, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: "people" | "schedule" | "content" | "system";
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { title: "Players", description: "Manage registrations", icon: Users, path: "/admin/players", category: "people" },
  { title: "Teams", description: "Manage team rosters", icon: Shield, path: "/admin/teams", category: "people" },
  { title: "Coaches", description: "Manage coaches", icon: UserCog, path: "/admin/coaches", category: "people" },
  { title: "Users", description: "Manage user accounts", icon: Users, path: "/admin/users", category: "people" },
  { title: "Schedule", description: "Games & calendar", icon: Calendar, path: "/admin/schedule", category: "schedule" },
  { title: "Facilities", description: "Fields & locations", icon: MapPin, path: "/admin/facilities", category: "schedule" },
  { title: "Drafts", description: "Manage drafts", icon: Database, path: "/admin/drafts", category: "schedule", adminOnly: true },
  { title: "Committee Tasks", description: "Board tasks", icon: Calendar, path: "/admin/committee-tasks", category: "schedule", adminOnly: true },
  { title: "Concessions", description: "Inventory & staff", icon: Database, path: "/admin/concessions", category: "schedule", adminOnly: true },
  { title: "Site Content", description: "Website text", icon: BookOpen, path: "/admin/site-content", category: "content", adminOnly: true },
  { title: "Programs", description: "In-House & Travel", icon: Database, path: "/admin/programs", category: "content", adminOnly: true },
  { title: "Divisions", description: "Age groups", icon: Users, path: "/admin/divisions", category: "content", adminOnly: true },
  { title: "FAQs", description: "Help articles", icon: HelpCircle, path: "/admin/faqs", category: "content" },
  { title: "Support", description: "Donations & sponsors", icon: Heart, path: "/admin/support", category: "content" },
  { title: "Reports", description: "Analytics", icon: BarChart3, path: "/admin/reports", category: "system", adminOnly: true },
  { title: "Feedback", description: "User feedback", icon: MessageSquare, path: "/admin/feedback", category: "system" },
  { title: "GameChanger", description: "Sync data", icon: RefreshCw, path: "/admin/gamechanger", category: "system", adminOnly: true },
];

const categories = [
  { key: "people", label: "People" },
  { key: "schedule", label: "Schedule & Events" },
  { key: "content", label: "Content" },
  { key: "system", label: "System" },
] as const;

export function AdminNavGrid() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: hasAdminRole } = await supabase
          .rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin'
          });
        setIsAdmin(!!hasAdminRole);
      }
    };

    checkAdminRole();
  }, []);

  // Filter items based on admin status
  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);
  const visibleCount = visibleItems.length;

  return (
    <div className="rounded-2xl border bg-card overflow-hidden backdrop-blur-sm bg-card/80">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">All Admin Tools</h3>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-xs">{visibleCount} tools</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 border-t">
          {categories.map((category) => {
            const items = visibleItems.filter((item) => item.category === category.key);
            if (items.length === 0) return null;
            
            return (
              <div key={category.key} className="mb-4 last:mb-0">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {category.label}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl",
                        "hover:bg-muted transition-colors group"
                      )}
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </span>
                      {item.adminOnly && (
                        <Lock className="h-3 w-3 text-muted-foreground/50" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
