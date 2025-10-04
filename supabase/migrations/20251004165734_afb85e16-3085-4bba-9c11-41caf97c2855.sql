-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Products table for affiliate monetization
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10, 2),
  affiliate_link TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- App settings table for dynamic configuration
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Quotes table for motivational content
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_text TEXT NOT NULL,
  author TEXT,
  category TEXT DEFAULT 'confidence',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Face analysis reports table
CREATE TABLE public.face_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_data JSONB NOT NULL,
  face_shape TEXT,
  skin_tone TEXT,
  confidence_score DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.face_reports ENABLE ROW LEVEL SECURITY;

-- Feature flags table for A/B testing and gradual rollouts
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Product clicks tracking for analytics
CREATE TABLE public.product_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.product_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies for products
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies for app_settings
CREATE POLICY "Anyone can view app settings"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage app settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies for quotes
CREATE POLICY "Anyone can view active quotes"
  ON public.quotes FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage quotes"
  ON public.quotes FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies for face_reports
CREATE POLICY "Users can view their own face reports"
  ON public.face_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own face reports"
  ON public.face_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all face reports"
  ON public.face_reports FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- RLS Policies for feature_flags
CREATE POLICY "Anyone can view feature flags"
  ON public.feature_flags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage feature flags"
  ON public.feature_flags FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies for product_clicks
CREATE POLICY "Users can create their own click events"
  ON public.product_clicks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all click analytics"
  ON public.product_clicks FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Trigger for updating products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default feature flags
INSERT INTO public.feature_flags (flag_key, is_enabled, description) VALUES
  ('ai_assistant_enabled', true, 'Enable Sofie AI assistant'),
  ('face_analysis_enabled', true, 'Enable face analysis feature'),
  ('affiliate_products_enabled', true, 'Show affiliate products'),
  ('trending_styles_enabled', true, 'Show trending styles feed');

-- Insert sample motivational quotes
INSERT INTO public.quotes (quote_text, author, category, is_active) VALUES
  ('Beauty begins the moment you decide to be yourself.', 'Coco Chanel', 'confidence', true),
  ('You are beautiful just the way you are.', 'Anonymous', 'confidence', true),
  ('Confidence is the best outfit. Rock it and own it.', 'Anonymous', 'confidence', true),
  ('Beauty is power; a smile is its sword.', 'John Ray', 'confidence', true),
  ('True beauty comes from within.', 'Anonymous', 'confidence', true);