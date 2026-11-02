REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.registration_forms, public.form_documents FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.placement_reviews FROM authenticated;
GRANT UPDATE ON public.placement_reviews TO authenticated;