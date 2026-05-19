INSERT INTO public.page_visibility (page_slug, page_label, is_visible, hidden_message)
VALUES ('teams', 'Teams & Rosters', false, 'The Teams & Rosters page is temporarily unavailable while we update roster information.')
ON CONFLICT (page_slug) DO UPDATE SET is_visible = false, hidden_message = EXCLUDED.hidden_message;