import { Link } from "react-router-dom";
import { Users, Calendar, MapPin, Mail } from "lucide-react";

const actions = [
  { label: "Teams", icon: Users, href: "/teams" },
  { label: "Schedule", icon: Calendar, href: "/schedule" },
  { label: "Fields", icon: MapPin, href: "/fields" },
  { label: "Contact", icon: Mail, href: "/contact" },
];

const QuickActions = () => {
  return (
    <section className="py-3 bg-background border-b border-border">
      <div className="container">
        <nav
          aria-label="Quick links"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:gap-x-10 text-sm"
        >
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <div key={action.label} className="flex items-center gap-x-6 md:gap-x-10">
                <Link
                  to={action.href}
                  className="inline-flex items-center gap-2 font-heading font-medium text-foreground hover:text-primary transition-colors"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span>{action.label}</span>
                </Link>
                {idx < actions.length - 1 && (
                  <span aria-hidden="true" className="hidden sm:inline-block h-3 w-px bg-border" />
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </section>
  );
};

export default QuickActions;
