-- Message Templates table
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('registration', 'team', 'game', 'general', 'payment', 'announcement')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- ["player_name", "team_name", "game_date"]
  
  -- Status
  active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Messages Sent Log table
CREATE TABLE public.messages_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  
  -- Recipients
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('player', 'coach', 'team', 'division', 'all', 'custom')),
  recipient_ids JSONB DEFAULT '[]'::jsonb, -- Array of IDs
  recipient_emails JSONB DEFAULT '[]'::jsonb, -- Array of email addresses
  
  -- Message Content
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Delivery
  delivery_method TEXT DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms', 'both')),
  
  -- Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_by UUID REFERENCES auth.users(id),
  
  -- Metrics
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  
  -- Error tracking
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automated Notifications Config table
CREATE TABLE public.notification_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'registration_approved',
    'team_assigned',
    'game_reminder_24h',
    'game_reminder_1h',
    'game_cancelled',
    'game_rescheduled',
    'payment_due',
    'payment_received'
  )),
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  
  -- Timing
  timing_offset_hours INTEGER, -- e.g., -24 for 24h before
  
  -- Status
  active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_message_templates_category ON public.message_templates(category);
CREATE INDEX idx_message_templates_active ON public.message_templates(active);

CREATE INDEX idx_messages_sent_status ON public.messages_sent(status);
CREATE INDEX idx_messages_sent_sent_at ON public.messages_sent(sent_at);
CREATE INDEX idx_messages_sent_recipient_type ON public.messages_sent(recipient_type);

CREATE INDEX idx_notification_configs_event_type ON public.notification_configs(event_type);
CREATE INDEX idx_notification_configs_active ON public.notification_configs(active);

-- Triggers
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_configs_updated_at
  BEFORE UPDATE ON public.notification_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_configs ENABLE ROW LEVEL SECURITY;

-- Message Templates: Admins have full access
CREATE POLICY "Admins have full access to message templates"
  ON public.message_templates
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Messages Sent: Admins have full access
CREATE POLICY "Admins have full access to messages sent"
  ON public.messages_sent
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Notification Configs: Admins have full access
CREATE POLICY "Admins have full access to notification configs"
  ON public.notification_configs
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert default message templates
INSERT INTO public.message_templates (name, category, subject, body, variables) VALUES
('Registration Approved', 'registration', 'Welcome to CDBL - Registration Approved!', 
'Hi {{player_name}},

Congratulations! Your registration for {{program_name}} has been approved. We''re excited to have you join us for the {{season_year}} season!

Next Steps:
1. Complete payment if not already done
2. Wait for team assignment notification
3. Mark your calendar for the season start date

For questions, please contact us at the CDBL office.

Welcome to the CDBL family!

Best regards,
The CDBL Team', 
'["player_name", "program_name", "season_year"]'),

('Team Assignment', 'team', 'You''ve Been Assigned to a Team!', 
'Hi {{player_name}},

Great news! You''ve been assigned to {{team_name}} in the {{division_name}} division.

Your coach is {{coach_name}} and can be reached at {{coach_email}}.

Practice starts soon - your coach will be in touch with more details!

Go {{team_name}}!

Best regards,
The CDBL Team',
'["player_name", "team_name", "division_name", "coach_name", "coach_email"]'),

('Game Reminder 24H', 'game', 'Game Tomorrow - {{home_team}} vs {{away_team}}', 
'Hi Team,

This is a reminder that you have a game tomorrow:

Date: {{game_date}}
Time: {{game_time}}
Location: {{venue_name}}, {{venue_address}}
Field: {{field_number}}

Opponent: {{opponent_team}}

Please arrive 15 minutes early for warm-up.

See you on the field!

Best regards,
The CDBL Team',
'["home_team", "away_team", "game_date", "game_time", "venue_name", "venue_address", "field_number", "opponent_team"]'),

('Game Cancelled', 'game', 'Game Cancelled - {{home_team}} vs {{away_team}}', 
'Hi Team,

Unfortunately, the following game has been cancelled:

Date: {{game_date}}
Time: {{game_time}}
Teams: {{home_team}} vs {{away_team}}

Reason: {{cancellation_reason}}

We will notify you when this game is rescheduled.

Best regards,
The CDBL Team',
'["home_team", "away_team", "game_date", "game_time", "cancellation_reason"]');