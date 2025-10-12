-- Create enums for structured data
CREATE TYPE public.program_type AS ENUM ('in_house', 'travel');
CREATE TYPE public.support_type AS ENUM ('donation', 'sponsorship', 'volunteer', 'merchandise');
CREATE TYPE public.resource_category AS ENUM ('drill', 'practice_plan', 'safety_guide', 'administrative');

-- Programs table (In-House and Travel)
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type program_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  overview TEXT,
  season_start DATE,
  season_end DATE,
  registration_open BOOLEAN DEFAULT false,
  registration_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Programs are publicly readable"
  ON public.programs FOR SELECT
  USING (true);

-- Divisions table (age groups for both programs)
CREATE TABLE public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age_range TEXT NOT NULL,
  cost DECIMAL(10,2),
  season_length TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  schedule_notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Divisions are publicly readable"
  ON public.divisions FOR SELECT
  USING (true);

-- Rules and Policies table (consolidated rules)
CREATE TABLE public.rules_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id UUID REFERENCES public.divisions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  game_length TEXT,
  pitching_rules TEXT,
  batting_rules TEXT,
  safety_rules TEXT,
  equipment_requirements TEXT,
  additional_rules JSONB DEFAULT '{}'::jsonb,
  applies_to_all BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rules_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rules are publicly readable"
  ON public.rules_policies FOR SELECT
  USING (true);

-- Support Options table (donations, sponsors, volunteers, shop)
CREATE TABLE public.support_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type support_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tiers JSONB DEFAULT '[]'::jsonb,
  cta_text TEXT,
  cta_link TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.support_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Support options are publicly readable"
  ON public.support_options FOR SELECT
  USING (active = true);

-- Resources table (coach portal)
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category resource_category NOT NULL,
  description TEXT,
  file_url TEXT,
  age_group TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources are readable by authenticated users"
  ON public.resources FOR SELECT
  TO authenticated
  USING (true);

-- FAQ table for program-specific questions
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FAQs are publicly readable"
  ON public.faqs FOR SELECT
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_divisions_updated_at
  BEFORE UPDATE ON public.divisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rules_policies_updated_at
  BEFORE UPDATE ON public.rules_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_options_updated_at
  BEFORE UPDATE ON public.support_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_divisions_program_id ON public.divisions(program_id);
CREATE INDEX idx_rules_policies_division_id ON public.rules_policies(division_id);
CREATE INDEX idx_faqs_program_id ON public.faqs(program_id);
CREATE INDEX idx_support_options_type ON public.support_options(type);
CREATE INDEX idx_resources_category ON public.resources(category);