import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Star, Bug, Lightbulb, Check, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFeedbackContext } from '@/contexts/FeedbackContext';
import { useSubmitFeedback, FeedbackInsert } from '@/hooks/useFeedback';
import { cn } from '@/lib/utils';

const feedbackSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
  feedback_type: z.enum(['general', 'feature_rating', 'bug_report', 'feature_request']),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be less than 2000 characters'),
  feature_module: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const feedbackTypes = [
  { value: 'general', label: 'General', icon: MessageSquare, description: 'General feedback or suggestions' },
  { value: 'feature_rating', label: 'Rate Feature', icon: Star, description: 'Rate an existing feature' },
  { value: 'bug_report', label: 'Bug Report', icon: Bug, description: 'Report a problem or issue' },
  { value: 'feature_request', label: 'Feature Request', icon: Lightbulb, description: 'Suggest a new feature' },
] as const;

const featureModules = [
  'Home',
  'Registration',
  'Teams',
  'Schedule',
  'In-House',
  'Travel',
  'Fields',
  'Shop',
  'Admin Dashboard',
  'Coach Dashboard',
  'Other',
];

export function FeedbackSlider() {
  const { isSliderOpen, closeSlider, sourcePage, sourceModule, screenshot } = useFeedbackContext();
  const submitFeedback = useSubmitFeedback();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      email: '',
      feedback_type: 'general',
      subject: '',
      description: '',
    },
  });

  const feedbackType = form.watch('feedback_type');

  const handleSubmit = async (data: FeedbackFormData) => {
    const feedbackData: FeedbackInsert = {
      feedback_type: data.feedback_type,
      subject: data.subject,
      description: data.description,
      submitter_email: data.email,
      feature_module: data.feature_module,
      priority: data.priority,
      source_page: sourcePage,
      source_module: sourceModule,
      rating: data.feedback_type === 'feature_rating' ? selectedRating : undefined,
    };

    await submitFeedback.mutateAsync({
      feedback: feedbackData,
      screenshot,
    });

    setIsSubmitted(true);
  };

  const handleReset = () => {
    form.reset();
    setSelectedRating(0);
    setIsSubmitted(false);
  };

  const handleClose = () => {
    closeSlider();
    setTimeout(() => {
      handleReset();
    }, 300);
  };

  // Success state after submission
  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold">Thank you!</h3>
      <p className="text-muted-foreground text-center">
        Your feedback has been submitted successfully.
      </p>
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
        <Button onClick={handleReset}>
          Submit Another
        </Button>
      </div>
    </div>
  );

  // Feedback form
  const renderForm = () => (
    <div className="space-y-6">
      {/* Source Info */}
      <div className="rounded-lg bg-muted p-3 space-y-2">
        <p className="text-sm text-muted-foreground">Submitting from:</p>
        <Badge variant="secondary">{sourceModule || 'Unknown Page'}</Badge>
      </div>

      {/* Screenshot Preview */}
      {screenshot && (
        <div className="space-y-2">
          <Label>Screenshot Captured</Label>
          <img 
            src={screenshot} 
            alt="Screenshot" 
            className="w-full rounded-lg border object-cover max-h-40"
          />
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Feedback Type Selection */}
          <div className="space-y-2">
            <Label>What type of feedback?</Label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = feedbackType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => form.setValue('feedback_type', type.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Module (for rating) */}
          {feedbackType === 'feature_rating' && (
            <FormField
              control={form.control}
              name="feature_module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Which feature?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a feature" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {featureModules.map((module) => (
                        <SelectItem key={module} value={module}>
                          {module}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Rating (for feature_rating) */}
          {feedbackType === 'feature_rating' && (
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={cn(
                        'h-8 w-8 transition-colors',
                        star <= selectedRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Priority (for bug_report and feature_request) */}
          {(feedbackType === 'bug_report' || feedbackType === 'feature_request') && (
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {feedbackType === 'bug_report' ? 'Severity' : 'Importance'}
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">
                        {feedbackType === 'bug_report' ? 'Low' : 'Nice to have'}
                      </SelectItem>
                      <SelectItem value="medium">
                        {feedbackType === 'bug_report' ? 'Medium' : 'Important'}
                      </SelectItem>
                      <SelectItem value="high">
                        {feedbackType === 'bug_report' ? 'High' : 'Very Important'}
                      </SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Subject */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Brief summary of your feedback" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please provide as much detail as possible..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={submitFeedback.isPending} className="flex-1">
              {submitFeedback.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );

  return (
    <Sheet open={isSliderOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent id="feedback-slider" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Send Feedback</SheetTitle>
        </SheetHeader>

        {isSubmitted ? renderSuccess() : renderForm()}
      </SheetContent>
    </Sheet>
  );
}
