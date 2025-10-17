-- Players table (comprehensive player database)
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age_at_registration INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  
  -- Program Assignment
  division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Parent/Guardian Contact
  parent_guardian_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT DEFAULT 'OH',
  zip_code TEXT,
  
  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  
  -- Registration Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'waitlist', 'withdrawn', 'transferred')),
  
  -- Payment Tracking
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded', 'scholarship')),
  amount_due NUMERIC(10,2),
  amount_paid NUMERIC(10,2) DEFAULT 0,
  payment_method TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_notes TEXT,
  
  -- Player Details
  jersey_size TEXT,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'not_sure')),
  previous_experience BOOLEAN DEFAULT false,
  previous_divisions_played TEXT,
  special_requests TEXT,
  medical_notes TEXT,
  allergies TEXT,
  
  -- Team Assignment (populated later in Phase 2)
  team_id UUID,
  assigned_date TIMESTAMP WITH TIME ZONE,
  jersey_number TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Registration Submissions (captures all form data)
CREATE TABLE public.registration_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.programs(id),
  
  -- Form Data
  form_data JSONB,
  
  -- Waivers & Legal
  waivers_signed BOOLEAN DEFAULT false,
  waiver_signature TEXT,
  waiver_signed_by TEXT,
  waiver_date TIMESTAMP WITH TIME ZONE,
  
  -- Documents
  birth_certificate_uploaded BOOLEAN DEFAULT false,
  birth_certificate_url TEXT,
  proof_of_residency_uploaded BOOLEAN DEFAULT false,
  proof_of_residency_url TEXT,
  
  -- Submission Details
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'pending_documents')),
  
  -- Admin Notes
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_players_division ON public.players(division_id);
CREATE INDEX idx_players_program ON public.players(program_id);
CREATE INDEX idx_players_status ON public.players(status);
CREATE INDEX idx_players_payment_status ON public.players(payment_status);
CREATE INDEX idx_players_parent_email ON public.players(parent_email);
CREATE INDEX idx_players_last_name ON public.players(last_name);
CREATE INDEX idx_players_team ON public.players(team_id);

CREATE INDEX idx_registration_submissions_player ON public.registration_submissions(player_id);
CREATE INDEX idx_registration_submissions_program ON public.registration_submissions(program_id);
CREATE INDEX idx_registration_submissions_status ON public.registration_submissions(status);

-- Trigger for updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registration_submissions_updated_at
  BEFORE UPDATE ON public.registration_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_submissions ENABLE ROW LEVEL SECURITY;

-- Players: Admins can do everything
CREATE POLICY "Admins have full access to players"
  ON public.players
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Players: Parents can view their own children (for future parent portal)
CREATE POLICY "Parents can view their own children"
  ON public.players
  FOR SELECT
  USING (parent_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Registration Submissions: Admins can do everything
CREATE POLICY "Admins have full access to registration submissions"
  ON public.registration_submissions
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Registration Submissions: Allow public insert for registration form
CREATE POLICY "Public can submit registrations"
  ON public.registration_submissions
  FOR INSERT
  WITH CHECK (true);