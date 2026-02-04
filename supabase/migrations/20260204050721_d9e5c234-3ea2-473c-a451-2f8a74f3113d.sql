-- Create contact_messages table for form submissions
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view messages
CREATE POLICY "Admins can view contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (public.has_admin_access(auth.uid()));

-- Only admins can update messages (mark as read, change status)
CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (public.has_admin_access(auth.uid()));

-- Create volunteer_signups table
CREATE TABLE public.volunteer_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest_areas TEXT[] NOT NULL DEFAULT '{}',
  experience TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.volunteer_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit volunteer signups" 
ON public.volunteer_signups 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view signups
CREATE POLICY "Admins can view volunteer signups" 
ON public.volunteer_signups 
FOR SELECT 
USING (public.has_admin_access(auth.uid()));

-- Only admins can update signups (change status)
CREATE POLICY "Admins can update volunteer signups" 
ON public.volunteer_signups 
FOR UPDATE 
USING (public.has_admin_access(auth.uid()));