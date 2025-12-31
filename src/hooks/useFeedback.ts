import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Feedback {
  id: string;
  user_id: string;
  feedback_type: 'general' | 'feature_rating' | 'bug_report' | 'feature_request';
  subject: string;
  description: string;
  feature_module: string | null;
  rating: number | null;
  priority: 'low' | 'medium' | 'high' | 'critical' | null;
  status: 'pending' | 'processing' | 'complete' | 'closed';
  admin_notes: string | null;
  source_page: string | null;
  source_module: string | null;
  recommended_prompt: string | null;
  prompt_generated_at: string | null;
  screenshot_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackInsert {
  feedback_type: Feedback['feedback_type'];
  subject: string;
  description: string;
  feature_module?: string;
  rating?: number;
  priority?: Feedback['priority'];
  source_page?: string;
  source_module?: string;
}

// Fetch current user's feedback
export function useUserFeedback() {
  return useQuery({
    queryKey: ['user-feedback'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('platform_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    },
  });
}

// Fetch all feedback (admin only)
export function useAllFeedback() {
  return useQuery({
    queryKey: ['all-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    },
  });
}

// Submit new feedback
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      feedback, 
      screenshot 
    }: { 
      feedback: FeedbackInsert; 
      screenshot: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Insert feedback record
      const { data: feedbackData, error: insertError } = await supabase
        .from('platform_feedback')
        .insert({
          ...feedback,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Upload screenshot if present
      if (screenshot && feedbackData) {
        try {
          // Convert base64 to blob
          const response = await fetch(screenshot);
          const blob = await response.blob();
          
          const fileName = `${feedbackData.id}-${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('feedback-screenshots')
            .upload(fileName, blob, {
              contentType: 'image/jpeg',
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('feedback-screenshots')
              .getPublicUrl(fileName);

            // Update feedback with screenshot URL
            await supabase
              .from('platform_feedback')
              .update({ screenshot_url: publicUrl })
              .eq('id', feedbackData.id);
          }
        } catch (error) {
          console.error('Failed to upload screenshot:', error);
        }
      }

      // Generate AI prompt
      if (feedbackData) {
        try {
          const { error: promptError } = await supabase.functions.invoke('generate-feedback-prompt', {
            body: {
              feedbackId: feedbackData.id,
              feedbackType: feedback.feedback_type,
              subject: feedback.subject,
              description: feedback.description,
              module: feedback.source_module,
              priority: feedback.priority,
            },
          });

          if (promptError) {
            console.error('Failed to generate AI prompt:', promptError);
          }
        } catch (error) {
          console.error('Failed to call AI prompt function:', error);
        }
      }

      return feedbackData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['all-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
      console.error('Feedback submission error:', error);
    },
  });
}

// Update feedback (admin)
export function useUpdateFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Pick<Feedback, 'status' | 'priority' | 'admin_notes'>>;
    }) => {
      const { data, error } = await supabase
        .from('platform_feedback')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
      toast({
        title: 'Feedback updated',
        description: 'Changes saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update feedback.',
        variant: 'destructive',
      });
      console.error('Feedback update error:', error);
    },
  });
}

// Delete feedback (admin)
export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
      toast({
        title: 'Feedback deleted',
        description: 'Feedback has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete feedback.',
        variant: 'destructive',
      });
      console.error('Feedback delete error:', error);
    },
  });
}

// Get feedback stats
export function useFeedbackStats() {
  return useQuery({
    queryKey: ['feedback-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_feedback')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(f => f.status === 'pending').length,
        processing: data.filter(f => f.status === 'processing').length,
        complete: data.filter(f => f.status === 'complete').length,
        closed: data.filter(f => f.status === 'closed').length,
      };

      return stats;
    },
  });
}
