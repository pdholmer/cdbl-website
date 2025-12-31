import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FeedbackTypeBadgeProps {
  type: 'general' | 'feature_rating' | 'bug_report' | 'feature_request';
}

const typeConfig = {
  general: {
    label: 'General',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  feature_rating: {
    label: 'Rating',
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  },
  bug_report: {
    label: 'Bug',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  feature_request: {
    label: 'Request',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
};

export function FeedbackTypeBadge({ type }: FeedbackTypeBadgeProps) {
  const config = typeConfig[type];
  
  return (
    <Badge variant="secondary" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}
