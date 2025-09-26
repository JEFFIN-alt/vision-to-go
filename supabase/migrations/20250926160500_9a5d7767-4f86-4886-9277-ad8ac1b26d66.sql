-- Create trending_styles table for storing fetched trends
CREATE TABLE public.trending_styles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  style_name TEXT NOT NULL,
  category TEXT NOT NULL,
  trend_score INTEGER DEFAULT 0,
  source TEXT NOT NULL, -- 'google_trends', 'instagram', 'tiktok', etc.
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs_log table for tracking cron job executions
CREATE TABLE public.jobs_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- Create user_data_requests table for GDPR compliance
CREATE TABLE public.user_data_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL, -- 'export', 'delete'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on new tables
ALTER TABLE public.trending_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for trending_styles (public read access)
CREATE POLICY "Anyone can view trending styles" 
ON public.trending_styles 
FOR SELECT 
USING (true);

-- RLS policies for user_data_requests (users can only see their own)
CREATE POLICY "Users can view their own data requests" 
ON public.user_data_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data requests" 
ON public.user_data_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to clean up expired trending styles
CREATE OR REPLACE FUNCTION public.cleanup_expired_trends()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.trending_styles 
  WHERE expires_at < now();
$$;

-- Create function to clean up expired transformations (30 days TTL)
CREATE OR REPLACE FUNCTION public.cleanup_expired_transformations()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.transformations 
  WHERE created_at < (now() - INTERVAL '30 days');
$$;

-- Add TTL column to transformations if not exists
ALTER TABLE public.transformations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days');

-- Create trigger for automatic timestamp updates on trending_styles
CREATE TRIGGER update_trending_styles_updated_at
BEFORE UPDATE ON public.trending_styles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_trending_styles_category ON public.trending_styles(category);
CREATE INDEX idx_trending_styles_expires_at ON public.trending_styles(expires_at);
CREATE INDEX idx_jobs_log_job_name ON public.jobs_log(job_name);
CREATE INDEX idx_jobs_log_status ON public.jobs_log(status);
CREATE INDEX idx_transformations_expires_at ON public.transformations(expires_at);
CREATE INDEX idx_user_data_requests_user_id ON public.user_data_requests(user_id);

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;