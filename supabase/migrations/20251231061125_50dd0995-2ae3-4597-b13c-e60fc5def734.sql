-- Create platform_feedback table
CREATE TABLE public.platform_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_type text NOT NULL CHECK (feedback_type IN ('general', 'feature_rating', 'bug_report', 'feature_request')),
  subject text NOT NULL,
  description text NOT NULL,
  feature_module text,
  rating integer CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  priority text CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'closed')),
  admin_notes text,
  source_page text,
  source_module text,
  recommended_prompt text,
  prompt_generated_at timestamptz,
  screenshot_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_feedback ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_platform_feedback_updated_at
  BEFORE UPDATE ON public.platform_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
ON public.platform_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.platform_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON public.platform_feedback
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all feedback
CREATE POLICY "Admins can update all feedback"
ON public.platform_feedback
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete all feedback
CREATE POLICY "Admins can delete all feedback"
ON public.platform_feedback
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_feedback;

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-screenshots', 'feedback-screenshots', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload feedback screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'feedback-screenshots' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view feedback screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'feedback-screenshots');

CREATE POLICY "Admins can delete feedback screenshots"
ON storage.objects
FOR DELETE
USING (bucket_id = 'feedback-screenshots' AND has_role(auth.uid(), 'admin'::app_role));