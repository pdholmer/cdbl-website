DROP POLICY "Public can submit registrations" ON public.registration_submissions;
DROP POLICY "Users can create own role requests" ON public.role_requests;
CREATE POLICY "Users can create own role requests" ON public.role_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');