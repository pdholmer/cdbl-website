
-- Create page_visibility table
CREATE TABLE public.page_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text UNIQUE NOT NULL,
  page_label text NOT NULL,
  is_visible boolean NOT NULL DEFAULT true,
  hidden_message text,
  hidden_by uuid,
  hidden_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_visibility ENABLE ROW LEVEL SECURITY;

-- Public SELECT
CREATE POLICY "Anyone can view page visibility"
  ON public.page_visibility FOR SELECT
  USING (true);

-- Board members (admin + board_member) can UPDATE
CREATE POLICY "Board members can update page visibility"
  ON public.page_visibility FOR UPDATE
  TO authenticated
  USING (public.has_admin_access(auth.uid()));

-- Admin-only INSERT
CREATE POLICY "Admins can insert page visibility"
  ON public.page_visibility FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin-only DELETE
CREATE POLICY "Admins can delete page visibility"
  ON public.page_visibility FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_page_visibility_updated_at
  BEFORE UPDATE ON public.page_visibility
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed all public pages
INSERT INTO public.page_visibility (page_slug, page_label) VALUES
  ('registration', 'Registration'),
  ('travel', 'Travel Program'),
  ('travel-registration', 'Travel Tryouts & Registration'),
  ('travel-faq', 'Travel FAQ'),
  ('in-house', 'In-House Program'),
  ('in-house-teams', 'In-House Teams'),
  ('in-house-schedule', 'In-House Schedule'),
  ('in-house-rules', 'In-House Rules'),
  ('schedule', 'Season Schedule'),
  ('fields', 'Fields & Facilities'),
  ('shop', 'Spirit Wear Shop'),
  ('volunteer', 'Volunteer'),
  ('donate', 'Donate'),
  ('sponsors', 'Sponsors'),
  ('contact', 'Contact Us'),
  ('about', 'About CDBL'),
  ('board', 'Board Info'),
  ('new-to-cdbl', 'New to CDBL'),
  ('rules', 'Rules & Policies');
