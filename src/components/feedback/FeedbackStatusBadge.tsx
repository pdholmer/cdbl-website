import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FeedbackStatusBadgeProps {
  status: 'pending' | 'processing' | 'complete' | 'closed';
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  complete: {
    label: 'Complete',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  closed: {
    label: 'Closed',
    className: 'bg-muted text-muted-foreground hover:bg-muted',
  },
};

export function FeedbackStatusBadge({ status }: FeedbackStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="secondary" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}
