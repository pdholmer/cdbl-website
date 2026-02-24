import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Copy, Check, Trash2, Star, ExternalLink } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FeedbackTypeBadge } from './FeedbackTypeBadge';
import { FeedbackStatusBadge } from './FeedbackStatusBadge';
import { Feedback, useUpdateFeedback, useDeleteFeedback } from '@/hooks/useFeedback';
import { cn } from '@/lib/utils';

interface FeedbackDetailSliderProps {
  feedback: Feedback | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackDetailSlider({ feedback, isOpen, onClose }: FeedbackDetailSliderProps) {
  const updateFeedback = useUpdateFeedback();
  const deleteFeedback = useDeleteFeedback();
  const [copied, setCopied] = useState(false);
  
  const [status, setStatus] = useState(feedback?.status || 'pending');
  const [priority, setPriority] = useState(feedback?.priority || '');
  const [adminNotes, setAdminNotes] = useState(feedback?.admin_notes || '');

  useEffect(() => {
    if (feedback) {
      setStatus(feedback.status);
      setPriority(feedback.priority || '');
      setAdminNotes(feedback.admin_notes || '');
    }
  }, [feedback?.id]);

  const handleCopyPrompt = async () => {
    if (feedback?.recommended_prompt) {
      await navigator.clipboard.writeText(feedback.recommended_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!feedback) return;
    
    await updateFeedback.mutateAsync({
      id: feedback.id,
      updates: {
        status: status as Feedback['status'],
        priority: priority as Feedback['priority'] || null,
        admin_notes: adminNotes || null,
      },
    });
  };

  const handleDelete = async () => {
    if (!feedback) return;
    await deleteFeedback.mutateAsync(feedback.id);
    onClose();
  };

  if (!feedback) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="pr-8">{feedback.subject}</SheetTitle>
          <div className="flex gap-2 flex-wrap">
            <FeedbackTypeBadge type={feedback.feedback_type} />
            <FeedbackStatusBadge status={feedback.status} />
            {feedback.priority && (
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                feedback.priority === 'critical' && 'bg-red-100 text-red-800',
                feedback.priority === 'high' && 'bg-orange-100 text-orange-800',
                feedback.priority === 'medium' && 'bg-yellow-100 text-yellow-800',
                feedback.priority === 'low' && 'bg-gray-100 text-gray-800',
              )}>
                {feedback.priority.charAt(0).toUpperCase() + feedback.priority.slice(1)} Priority
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Description</Label>
            <p className="text-sm leading-relaxed">{feedback.description}</p>
          </div>

          {/* AI Recommended Prompt */}
          {feedback.recommended_prompt && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">AI Recommended Prompt</Label>
              <div className="relative rounded-lg bg-muted p-3">
                <p className="text-sm pr-8">{feedback.recommended_prompt}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={handleCopyPrompt}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground text-sm">Source Module</Label>
              <p>{feedback.source_module || '-'}</p>
            </div>
            {feedback.feature_module && (
              <div>
                <Label className="text-muted-foreground text-sm">Feature Module</Label>
                <p>{feedback.feature_module}</p>
              </div>
            )}
            {feedback.rating && (
              <div>
                <Label className="text-muted-foreground text-sm">Rating</Label>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= feedback.rating!
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label className="text-muted-foreground text-sm">Submitted</Label>
              <p>{format(new Date(feedback.created_at), 'MMM d, yyyy h:mm a')}</p>
            </div>
          </div>

          {/* Screenshot */}
          {feedback.screenshot_url && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Screenshot</Label>
              <a 
                href={feedback.screenshot_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={feedback.screenshot_url}
                  alt="Feedback screenshot"
                  className="rounded-lg border max-h-48 w-full object-cover hover:opacity-90 transition-opacity"
                />
              </a>
            </div>
          )}

          <Separator />

          {/* Admin Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Admin Actions</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Feedback['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Set priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                placeholder="Add internal notes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex justify-between pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this feedback? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button onClick={handleSave} disabled={updateFeedback.isPending}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
