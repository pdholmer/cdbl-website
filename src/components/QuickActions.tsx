import { Link } from "react-router-dom";
import { Users, Calendar, MapPin, Mail } from "lucide-react";

const actions = [
  {
    label: "View Teams",
    description: "Rosters & divisions",
    icon: Users,
    href: "/teams",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "View Schedule",
    description: "Games & events",
    icon: Calendar,
    href: "/schedule",
    color: "text-carolina",
    bg: "bg-carolina/10",
  },
  {
    label: "Find a Field",
    description: "Locations & directions",
    icon: MapPin,
    href: "/fields",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Contact Us",
    description: "Get in touch",
    icon: Mail,
    href: "/contact",
    color: "text-carolina",
    bg: "bg-carolina/10",
  },
];

const QuickActions = () => {
  return (
    <section className="py-4 md:py-6 bg-background border-b border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.href}
                className="flex flex-col items-center justify-center gap-2 min-h-[88px] p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div className={`w-11 h-11 rounded-full ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold leading-tight">{action.label}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickActions;
