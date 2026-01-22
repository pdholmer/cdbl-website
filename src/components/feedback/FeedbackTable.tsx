import { useState } from 'react';
import { format } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FeedbackTypeBadge } from './FeedbackTypeBadge';
import { FeedbackStatusBadge } from './FeedbackStatusBadge';
import { Feedback } from '@/hooks/useFeedback';

interface FeedbackTableProps {
  feedback: Feedback[];
  onRowClick: (feedback: Feedback) => void;
}

type SortField = 'subject' | 'submitter' | 'feedback_type' | 'status' | 'created_at' | 'source_module';
type SortDirection = 'asc' | 'desc';

export function FeedbackTable({ feedback, onRowClick }: FeedbackTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedFeedback = [...feedback].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortField === 'submitter') {
      aValue = a.profiles?.display_name || a.profiles?.email || '';
      bValue = b.profiles?.display_name || b.profiles?.email || '';
    } else if (sortField === 'created_at') {
      aValue = new Date(a.created_at).getTime();
      bValue = new Date(b.created_at).getTime();
    } else {
      aValue = String(a[sortField] ?? '');
      bValue = String(b[sortField] ?? '');
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 hover:bg-transparent font-medium"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortableHeader field="subject">Subject</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="submitter">Submitted By</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="feedback_type">Type</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="source_module">Module</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="status">Status</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="created_at">Submitted</SortableHeader>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFeedback.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No feedback found.
              </TableCell>
            </TableRow>
          ) : (
            sortedFeedback.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => onRowClick(item)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium max-w-[200px] truncate">
                  {item.subject}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[180px] truncate">
                  {item.profiles?.display_name || item.profiles?.email || 'Unknown'}
                </TableCell>
                <TableCell>
                  <FeedbackTypeBadge type={item.feedback_type} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.source_module || '-'}
                </TableCell>
                <TableCell>
                  <FeedbackStatusBadge status={item.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(item.created_at), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
