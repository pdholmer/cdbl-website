-- Add foreign key constraints that were missing
ALTER TABLE public.divisions
  ADD CONSTRAINT fk_divisions_program 
  FOREIGN KEY (program_id) 
  REFERENCES public.programs(id) 
  ON DELETE CASCADE;

ALTER TABLE public.rules_policies
  ADD CONSTRAINT fk_rules_division 
  FOREIGN KEY (division_id) 
  REFERENCES public.divisions(id) 
  ON DELETE CASCADE;

ALTER TABLE public.faqs
  ADD CONSTRAINT fk_faqs_program 
  FOREIGN KEY (program_id) 
  REFERENCES public.programs(id) 
  ON DELETE CASCADE;

ALTER TABLE public.resources
  ADD CONSTRAINT fk_resources_user 
  FOREIGN KEY (created_by) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;