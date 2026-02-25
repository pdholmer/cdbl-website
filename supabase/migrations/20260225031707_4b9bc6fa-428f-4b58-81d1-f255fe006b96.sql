
-- Make user_id nullable
ALTER TABLE public.platform_feedback ALTER COLUMN user_id DROP NOT NULL;

-- Add submitter_email column
ALTER TABLE public.platform_feedback ADD COLUMN submitter_email text;

-- Drop the old INSERT policy
DROP POLICY "Users can insert their own feedback" ON public.platform_feedback;

-- Create new INSERT policy allowing anyone
CREATE POLICY "Anyone can insert feedback"
ON public.platform_feedback
FOR INSERT
WITH CHECK (true);
