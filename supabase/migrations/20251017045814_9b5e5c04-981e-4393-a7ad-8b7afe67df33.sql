-- Create venue_fields table for individual field management
CREATE TABLE public.venue_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  field_number TEXT NOT NULL,
  field_name TEXT,
  divisions TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'maintenance')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.venue_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view active venue fields"
ON public.venue_fields FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.venues 
    WHERE venues.id = venue_fields.venue_id 
    AND venues.status = 'active'
  )
);

CREATE POLICY "Admins have full access to venue fields"
ON public.venue_fields FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_venue_fields_updated_at
BEFORE UPDATE ON public.venue_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed venues
INSERT INTO public.venues (name, address, city, state, zip_code, field_count, has_lights, has_restrooms, has_concessions, status) VALUES
('Plato Fields', '41 Russell Road', 'Elgin', 'IL', '60124', 4, true, true, true, 'active'),
('Stonecrest Fields', '4W400 Stonecrest Drive', 'Elgin', 'IL', '60124', 3, true, true, false, 'active'),
('Burlington Fields', '12N475 Park St', 'Burlington', 'IL', '60109', 2, false, true, false, 'active');

-- Seed venue fields for Plato
INSERT INTO public.venue_fields (venue_id, field_number, field_name, divisions, status) VALUES
((SELECT id FROM public.venues WHERE name = 'Plato Fields'), '1', 'Field 1', ARRAY['Bronco'], 'open'),
((SELECT id FROM public.venues WHERE name = 'Plato Fields'), '2', 'Field 2', ARRAY['Mustang'], 'open'),
((SELECT id FROM public.venues WHERE name = 'Plato Fields'), '3', 'Field 3', ARRAY['Pinto'], 'open'),
((SELECT id FROM public.venues WHERE name = 'Plato Fields'), '4', 'Field 4', ARRAY['T-Ball'], 'open');

-- Seed venue fields for Stonecrest
INSERT INTO public.venue_fields (venue_id, field_number, field_name, divisions, status) VALUES
((SELECT id FROM public.venues WHERE name = 'Stonecrest Fields'), '1', 'Field 1', ARRAY['Bronco'], 'open'),
((SELECT id FROM public.venues WHERE name = 'Stonecrest Fields'), '2', 'Field 2', ARRAY['Mustang'], 'open'),
((SELECT id FROM public.venues WHERE name = 'Stonecrest Fields'), '4', 'Field 4', ARRAY['Pony', 'Colt'], 'open');

-- Seed venue fields for Burlington
INSERT INTO public.venue_fields (venue_id, field_number, field_name, divisions, status) VALUES
((SELECT id FROM public.venues WHERE name = 'Burlington Fields'), 'Upper', 'Burlington Upper', ARRAY['Mustang', 'Pinto'], 'open'),
((SELECT id FROM public.venues WHERE name = 'Burlington Fields'), 'Lower', 'Burlington Lower', ARRAY['Bronco'], 'open');