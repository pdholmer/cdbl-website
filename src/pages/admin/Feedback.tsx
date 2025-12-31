import { useState } from 'react';
import { MessageSquare, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FeedbackTable, FeedbackDetailSlider } from '@/components/feedback';
import { useAllFeedback, useFeedbackStats, Feedback } from '@/hooks/useFeedback';

export default function FeedbackPage() {
  const { data: feedback = [], isLoading } = useAllFeedback();
  const { data: stats } = useFeedbackStats();
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredFeedback = feedback.filter((item) => {
    if (typeFilter !== 'all' && item.feedback_type !== typeFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const statCards = [
    { title: 'Total', value: stats?.total || 0, icon: MessageSquare, color: 'text-foreground' },
    { title: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'text-amber-600' },
    { title: 'Processing', value: stats?.processing || 0, icon: Loader2, color: 'text-blue-600' },
    { title: 'Complete', value: stats?.complete || 0, icon: CheckCircle, color: 'text-green-600' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
          <p className="text-muted-foreground">
            Review and manage user feedback submissions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="feature_rating">Rating</SelectItem>
              <SelectItem value="bug_report">Bug Report</SelectItem>
              <SelectItem value="feature_request">Feature Request</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <FeedbackTable
            feedback={filteredFeedback}
            onRowClick={(item) => setSelectedFeedback(item)}
          />
        )}

        {/* Detail Slider */}
        <FeedbackDetailSlider
          feedback={selectedFeedback}
          isOpen={!!selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      </div>
    </AdminLayout>
  );
}
