-- Enhanced Dopamind Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255),
  full_name VARCHAR(100),
  avatar_url TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'pro', 'elite'
  subscription_status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  onboarding_completed BOOLEAN DEFAULT false,
  preferred_session_duration INTEGER DEFAULT 25, -- minutes
  notifications_enabled BOOLEAN DEFAULT true,
  theme_preference VARCHAR(20) DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create focus_sessions table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  session_duration INTEGER NOT NULL, -- planned duration in minutes
  actual_duration INTEGER, -- actual completed duration
  session_type VARCHAR(20) DEFAULT 'focus', -- 'focus', 'break', 'meditation'
  soundscape_used VARCHAR(50),
  completed BOOLEAN DEFAULT false,
  interruption_count INTEGER DEFAULT 0,
  emergency_unlocks INTEGER DEFAULT 0,
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.focus_sessions(id) ON DELETE SET NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_emoji VARCHAR(10), -- '😫', '😐', '😊', etc.
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  streak_type VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly'
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_freeze_count INTEGER DEFAULT 0, -- premium feature
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL, -- 'first_session', '7_day_streak', '30_day_streak'
  achievement_name VARCHAR(100),
  achievement_description TEXT,
  badge_icon VARCHAR(50),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_premium BOOLEAN DEFAULT false
);

-- Create app_analytics table
CREATE TABLE IF NOT EXISTS public.app_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50), -- 'session_start', 'session_complete', 'mood_logged', 'upgrade_viewed'
  event_data JSONB,
  screen_name VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_tips table
CREATE TABLE IF NOT EXISTS public.daily_tips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tip_text TEXT NOT NULL,
  tip_category VARCHAR(30), -- 'dopamine', 'mindfulness', 'productivity'
  is_premium BOOLEAN DEFAULT false,
  display_order INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON public.focus_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON public.mood_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_app_analytics_user_id ON public.app_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_app_analytics_event_type ON public.app_analytics(event_type);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own sessions" ON public.focus_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own mood data" ON public.mood_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own streaks" ON public.user_streaks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own analytics" ON public.app_analytics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view tips" ON public.daily_tips
  FOR SELECT USING (true);

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at 
  BEFORE UPDATE ON public.user_streaks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Streak calculation function
CREATE OR REPLACE FUNCTION calculate_user_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  last_session_date DATE;
BEGIN
  SELECT DATE(MAX(started_at)) INTO last_session_date
  FROM public.focus_sessions 
  WHERE user_id = user_uuid AND completed = true;
  
  IF last_session_date = CURRENT_DATE OR last_session_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Calculate consecutive days with sessions
    WITH consecutive_days AS (
      SELECT DATE(started_at) as session_date,
             LAG(DATE(started_at)) OVER (ORDER BY DATE(started_at) DESC) as prev_date
      FROM public.focus_sessions 
      WHERE user_id = user_uuid AND completed = true
      ORDER BY DATE(started_at) DESC
    )
    SELECT COUNT(*) INTO current_streak
    FROM consecutive_days 
    WHERE prev_date IS NULL OR session_date = prev_date + INTERVAL '1 day';
  END IF;
  
  RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO public.user_streaks (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();

-- Insert sample tips
INSERT INTO public.daily_tips (tip_text, tip_category, is_premium, display_order)
VALUES
  ('Dopamine fasting isn''t about complete deprivation - it''s about intentional consumption', 'dopamine', false, 1),
  ('Your brain needs 90 minutes to reset dopamine levels after overstimulation', 'dopamine', false, 2),
  ('Natural rewards like sunlight and exercise create sustainable dopamine', 'mindfulness', false, 3),
  ('Every small win builds momentum - celebrate completing sessions', 'productivity', false, 4),
  ('Boredom is your brain''s way of encouraging creativity and reflection', 'mindfulness', false, 5),
  ('Try the ''Pomodoro Technique'' - 25 minutes of focus followed by a 5-minute break', 'productivity', false, 6),
  ('Advanced: Create a ''dopamine schedule'' to balance digital stimulation throughout your day', 'dopamine', true, 7),
  ('Premium: Use the ''dopamine detox'' technique - 24 hours without digital stimulation', 'dopamine', true, 8),
  ('Premium: Implement ''tech boundaries'' in different areas of your home', 'productivity', true, 9),
  ('Premium: Practice ''mindful scrolling'' - set intentions before using social media', 'mindfulness', true, 10);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Dopamind enhanced database schema created successfully! 🎉' as message;
