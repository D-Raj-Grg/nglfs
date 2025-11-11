-- ============================================================================
-- NGLFS Database Schema - Initial Migration
-- ============================================================================
-- Run this script in Supabase SQL Editor: Dashboard > SQL Editor > New Query
-- This creates all tables, indexes, RLS policies, and triggers
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: profiles
-- Extends auth.users with public profile information
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    message_count INTEGER DEFAULT 0 NOT NULL,
    total_visits INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at_hour TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]+$'),
    CONSTRAINT display_name_length CHECK (char_length(display_name) <= 100),
    CONSTRAINT bio_length CHECK (char_length(bio) <= 500),
    CONSTRAINT message_count_positive CHECK (message_count >= 0),
    CONSTRAINT total_visits_positive CHECK (total_visits >= 0)
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE public.profiles IS 'User profiles with public information and statistics';
COMMENT ON COLUMN public.profiles.username IS 'Unique username for public profile URL (lowercase, alphanumeric, dash, underscore)';
COMMENT ON COLUMN public.profiles.display_name IS 'Optional display name shown on profile';
COMMENT ON COLUMN public.profiles.bio IS 'Optional biography/description (max 500 chars)';
COMMENT ON COLUMN public.profiles.message_count IS 'Total number of messages received';
COMMENT ON COLUMN public.profiles.total_visits IS 'Total number of profile page visits';

-- ============================================================================
-- TABLE: messages
-- Anonymous messages sent to users
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_ip_hash TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    is_flagged BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at_hour TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0),
    CONSTRAINT content_length CHECK (char_length(content) <= 500),
    CONSTRAINT sender_ip_hash_length CHECK (char_length(sender_ip_hash) = 64)
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_ip_hash ON public.messages(sender_ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_flagged ON public.messages(is_flagged) WHERE is_flagged = true;

-- Comments
COMMENT ON TABLE public.messages IS 'Anonymous messages sent to user profiles';
COMMENT ON COLUMN public.messages.content IS 'Message content (max 500 characters)';
COMMENT ON COLUMN public.messages.sender_ip_hash IS 'SHA-256 hash of sender IP address for rate limiting';
COMMENT ON COLUMN public.messages.is_read IS 'Whether recipient has read the message';
COMMENT ON COLUMN public.messages.is_flagged IS 'Whether message has been flagged by recipient';

-- ============================================================================
-- TABLE: message_analytics
-- Event tracking for message interactions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.message_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at_hour TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT event_type_valid CHECK (event_type IN (
        'message_received',
        'message_read',
        'message_flagged',
        'message_deleted',
        'profile_viewed',
        'link_shared'
    ))
);

-- Indexes for message_analytics
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.message_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_message_id ON public.message_analytics(message_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.message_analytics(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.message_analytics(created_at DESC);

-- GIN index for JSONB metadata queries
CREATE INDEX IF NOT EXISTS idx_analytics_metadata ON public.message_analytics USING GIN (metadata);

-- Comments
COMMENT ON TABLE public.message_analytics IS 'Event tracking for user and message analytics';
COMMENT ON COLUMN public.message_analytics.event_type IS 'Type of analytics event (message_received, message_read, etc.)';
COMMENT ON COLUMN public.message_analytics.metadata IS 'Additional event data stored as JSON';

-- ============================================================================
-- TABLE: link_visits
-- Track visits to user profile pages
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.link_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    visitor_ip_hash TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at_hour TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT visitor_ip_hash_length CHECK (char_length(visitor_ip_hash) = 64),
    CONSTRAINT referrer_length CHECK (char_length(referrer) <= 500)
);

-- Indexes for link_visits
CREATE INDEX IF NOT EXISTS idx_visits_profile_id ON public.link_visits(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_ip_hash ON public.link_visits(visitor_ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON public.link_visits(created_at DESC);

-- Unique constraint to prevent duplicate visit tracking within 1 hour
-- This will be created AFTER the trigger function (see below)

-- Comments
COMMENT ON TABLE public.link_visits IS 'Track visits to user profile pages for analytics';
COMMENT ON COLUMN public.link_visits.visitor_ip_hash IS 'SHA-256 hash of visitor IP address';
COMMENT ON COLUMN public.link_visits.referrer IS 'HTTP referrer URL if available';

-- ============================================================================
-- TABLE: blocked_senders
-- IP addresses blocked by users
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.blocked_senders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_ip_hash TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at_hour TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT blocked_ip_hash_length CHECK (char_length(blocked_ip_hash) = 64),
    CONSTRAINT reason_length CHECK (char_length(reason) <= 500),

    -- Unique constraint: user can only block same IP once
    UNIQUE(user_id, blocked_ip_hash)
);

-- Indexes for blocked_senders
CREATE INDEX IF NOT EXISTS idx_blocked_user_id ON public.blocked_senders(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_ip_hash ON public.blocked_senders(blocked_ip_hash);
CREATE INDEX IF NOT EXISTS idx_blocked_created_at ON public.blocked_senders(created_at DESC);

-- Comments
COMMENT ON TABLE public.blocked_senders IS 'IP addresses blocked by users to prevent abuse';
COMMENT ON COLUMN public.blocked_senders.blocked_ip_hash IS 'SHA-256 hash of blocked IP address';
COMMENT ON COLUMN public.blocked_senders.reason IS 'Optional reason for blocking';

-- ============================================================================
-- FUNCTIONS: Helper functions
-- ============================================================================

-- Function to set created_at_hour on link_visits (materialized hourly timestamp)
CREATE OR REPLACE FUNCTION link_visits_set_hour()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure created_at has a value (use current timestamp if missing)
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;

  -- Materialize the truncated hour for indexing
  NEW.created_at_hour := date_trunc('hour', NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION link_visits_set_hour()
IS 'Trigger function to materialize created_at_hour for hourly deduplication index';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment message count on profile
CREATE OR REPLACE FUNCTION increment_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET message_count = message_count + 1
    WHERE id = NEW.recipient_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement message count on profile
CREATE OR REPLACE FUNCTION decrement_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET message_count = GREATEST(message_count - 1, 0)
    WHERE id = OLD.recipient_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to increment message count when message is created
DROP TRIGGER IF EXISTS increment_profile_message_count ON public.messages;
CREATE TRIGGER increment_profile_message_count
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION increment_message_count();

-- Trigger to decrement message count when message is deleted
DROP TRIGGER IF EXISTS decrement_profile_message_count ON public.messages;
CREATE TRIGGER decrement_profile_message_count
    AFTER DELETE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION decrement_message_count();

-- Trigger to set created_at_hour on link_visits (for hourly deduplication)
DROP TRIGGER IF EXISTS set_link_visits_hour ON public.link_visits;
CREATE TRIGGER set_link_visits_hour
    BEFORE INSERT OR UPDATE ON public.link_visits
    FOR EACH ROW
    EXECUTE FUNCTION link_visits_set_hour();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_senders ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: profiles
-- ============================================================================

-- Allow public read access to active profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles
    FOR SELECT
    USING (is_active = true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
    ON public.profiles
    FOR DELETE
    USING (auth.uid() = id);

-- ============================================================================
-- RLS POLICIES: messages
-- ============================================================================

-- Users can view their own messages
CREATE POLICY "Users can view their own messages"
    ON public.messages
    FOR SELECT
    USING (auth.uid() = recipient_id);

-- Allow anonymous message insertion (anyone can send)
-- In production, add rate limiting via middleware
CREATE POLICY "Anyone can insert messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (true);

-- Users can update their own messages (mark as read, flag)
CREATE POLICY "Users can update their own messages"
    ON public.messages
    FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
    ON public.messages
    FOR DELETE
    USING (auth.uid() = recipient_id);

-- ============================================================================
-- RLS POLICIES: message_analytics
-- ============================================================================

-- Users can view their own analytics
CREATE POLICY "Users can view their own analytics"
    ON public.message_analytics
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own analytics
CREATE POLICY "Users can insert their own analytics"
    ON public.message_analytics
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- No update or delete allowed (analytics are immutable)

-- ============================================================================
-- RLS POLICIES: link_visits
-- ============================================================================

-- Users can view their own visit data
CREATE POLICY "Users can view their own visits"
    ON public.link_visits
    FOR SELECT
    USING (auth.uid() = profile_id);

-- Allow anonymous visit tracking (anyone can insert)
CREATE POLICY "Anyone can insert visits"
    ON public.link_visits
    FOR INSERT
    WITH CHECK (true);

-- No update or delete allowed (visits are immutable)

-- ============================================================================
-- RLS POLICIES: blocked_senders
-- ============================================================================

-- Users can view their own blocked list
CREATE POLICY "Users can view their own blocked list"
    ON public.blocked_senders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert to their own blocked list
CREATE POLICY "Users can insert to their own blocked list"
    ON public.blocked_senders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own blocked list
CREATE POLICY "Users can delete from their own blocked list"
    ON public.blocked_senders
    FOR DELETE
    USING (auth.uid() = user_id);

-- No update allowed (blocks are immutable, delete and re-add if needed)

-- ============================================================================
-- INDEXES: Created after triggers are set up
-- ============================================================================

-- Unique index on link_visits using materialized created_at_hour column
-- This prevents duplicate visit tracking within the same hour
CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_unique_hourly
    ON public.link_visits(profile_id, visitor_ip_hash, created_at_hour);

-- ============================================================================
-- SEED DATA (Optional - for development/testing)
-- ============================================================================

-- Uncomment to create a test profile after user signup
-- INSERT INTO public.profiles (id, username, display_name, bio)
-- VALUES (
--     'YOUR_USER_UUID_HERE',
--     'testuser',
--     'Test User',
--     'This is a test profile for development'
-- );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables were created
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
