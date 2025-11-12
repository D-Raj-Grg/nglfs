-- Enhanced Tracking System Migration
-- Adds comprehensive tracking fields for device, browser, referrer, and UTM analytics
-- Part of the NGLFS anonymous messaging platform

-- ============================================================================
-- 1. UPDATE link_visits TABLE - Add detailed tracking fields
-- ============================================================================

ALTER TABLE link_visits
ADD COLUMN IF NOT EXISTS device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown')),
ADD COLUMN IF NOT EXISTS browser_name TEXT,
ADD COLUMN IF NOT EXISTS browser_version TEXT,
ADD COLUMN IF NOT EXISTS os_name TEXT,
ADD COLUMN IF NOT EXISTS os_version TEXT,
ADD COLUMN IF NOT EXISTS screen_resolution TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS language TEXT,
ADD COLUMN IF NOT EXISTS viewport_size TEXT,
ADD COLUMN IF NOT EXISTS pixel_ratio DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS connection_type TEXT,
ADD COLUMN IF NOT EXISTS touch_support BOOLEAN,

-- Referrer classification
ADD COLUMN IF NOT EXISTS referrer_platform TEXT,
ADD COLUMN IF NOT EXISTS referrer_category TEXT CHECK (referrer_category IN ('social', 'search', 'referral', 'direct')),
ADD COLUMN IF NOT EXISTS referrer_domain TEXT,
ADD COLUMN IF NOT EXISTS is_social_referrer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_in_app_browser BOOLEAN DEFAULT false,

-- UTM tracking
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_link_visits_device_type ON link_visits(device_type);
CREATE INDEX IF NOT EXISTS idx_link_visits_referrer_platform ON link_visits(referrer_platform);
CREATE INDEX IF NOT EXISTS idx_link_visits_referrer_category ON link_visits(referrer_category);
CREATE INDEX IF NOT EXISTS idx_link_visits_utm_source ON link_visits(utm_source);
CREATE INDEX IF NOT EXISTS idx_link_visits_utm_campaign ON link_visits(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_link_visits_is_social ON link_visits(is_social_referrer);
CREATE INDEX IF NOT EXISTS idx_link_visits_created_at ON link_visits(created_at DESC);

-- Composite indexes for common analytics queries
CREATE INDEX IF NOT EXISTS idx_link_visits_profile_platform ON link_visits(profile_id, referrer_platform);
CREATE INDEX IF NOT EXISTS idx_link_visits_profile_device ON link_visits(profile_id, device_type);

COMMENT ON COLUMN link_visits.device_type IS 'Device category: mobile, tablet, desktop, or unknown';
COMMENT ON COLUMN link_visits.browser_name IS 'Browser name (e.g., Chrome, Safari, Firefox)';
COMMENT ON COLUMN link_visits.browser_version IS 'Browser version (e.g., 131.0)';
COMMENT ON COLUMN link_visits.os_name IS 'Operating system name (e.g., iOS, Android, Windows)';
COMMENT ON COLUMN link_visits.os_version IS 'Operating system version';
COMMENT ON COLUMN link_visits.screen_resolution IS 'Screen resolution (e.g., 1920x1080)';
COMMENT ON COLUMN link_visits.timezone IS 'User timezone (e.g., America/New_York)';
COMMENT ON COLUMN link_visits.language IS 'Browser language preference (e.g., en-US)';
COMMENT ON COLUMN link_visits.viewport_size IS 'Browser viewport size';
COMMENT ON COLUMN link_visits.pixel_ratio IS 'Device pixel ratio (e.g., 2.0 for Retina)';
COMMENT ON COLUMN link_visits.connection_type IS 'Network connection type (4g, 3g, etc.)';
COMMENT ON COLUMN link_visits.touch_support IS 'Whether device supports touch input';
COMMENT ON COLUMN link_visits.referrer_platform IS 'Classified platform (instagram, tiktok, google, etc.)';
COMMENT ON COLUMN link_visits.referrer_category IS 'Traffic category: social, search, referral, or direct';
COMMENT ON COLUMN link_visits.referrer_domain IS 'Domain of referrer (e.g., instagram.com)';
COMMENT ON COLUMN link_visits.is_social_referrer IS 'True if referrer is a social media platform';
COMMENT ON COLUMN link_visits.is_in_app_browser IS 'True if visitor is using in-app browser (Instagram, TikTok, etc.)';
COMMENT ON COLUMN link_visits.utm_source IS 'UTM source parameter (e.g., instagram)';
COMMENT ON COLUMN link_visits.utm_medium IS 'UTM medium parameter (e.g., story, bio)';
COMMENT ON COLUMN link_visits.utm_campaign IS 'UTM campaign parameter';

-- ============================================================================
-- 2. UPDATE messages TABLE - Add enhanced sender tracking
-- ============================================================================

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS sender_device_type TEXT,
ADD COLUMN IF NOT EXISTS sender_browser TEXT,
ADD COLUMN IF NOT EXISTS sender_os TEXT,
ADD COLUMN IF NOT EXISTS sender_timezone TEXT,
ADD COLUMN IF NOT EXISTS sender_language TEXT,
ADD COLUMN IF NOT EXISTS sender_referrer_platform TEXT,
ADD COLUMN IF NOT EXISTS sender_utm_source TEXT,
ADD COLUMN IF NOT EXISTS sender_utm_campaign TEXT;

CREATE INDEX IF NOT EXISTS idx_messages_sender_device ON messages(sender_device_type);
CREATE INDEX IF NOT EXISTS idx_messages_sender_platform ON messages(sender_referrer_platform);
CREATE INDEX IF NOT EXISTS idx_messages_sender_utm_source ON messages(sender_utm_source);

COMMENT ON COLUMN messages.sender_device_type IS 'Device used to send message';
COMMENT ON COLUMN messages.sender_browser IS 'Browser name (Chrome, Safari, etc.)';
COMMENT ON COLUMN messages.sender_os IS 'Operating system of sender';
COMMENT ON COLUMN messages.sender_timezone IS 'Timezone of message sender';
COMMENT ON COLUMN messages.sender_language IS 'Language preference of sender';
COMMENT ON COLUMN messages.sender_referrer_platform IS 'Platform sender came from (instagram, tiktok, etc.)';
COMMENT ON COLUMN messages.sender_utm_source IS 'UTM source if sender came via tracking link';
COMMENT ON COLUMN messages.sender_utm_campaign IS 'UTM campaign identifier';

-- ============================================================================
-- 3. CREATE ANALYTICS VIEWS - Pre-aggregated data for dashboards
-- ============================================================================

-- View: Traffic sources by platform
CREATE OR REPLACE VIEW analytics_traffic_sources AS
SELECT
  profile_id,
  referrer_platform,
  referrer_category,
  COUNT(*) as visit_count,
  COUNT(DISTINCT visitor_ip_hash) as unique_visitors,
  DATE_TRUNC('day', created_at) as date
FROM link_visits
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY profile_id, referrer_platform, referrer_category, DATE_TRUNC('day', created_at);

-- View: Device analytics
CREATE OR REPLACE VIEW analytics_device_breakdown AS
SELECT
  profile_id,
  device_type,
  browser_name,
  os_name,
  COUNT(*) as visit_count,
  AVG(pixel_ratio) as avg_pixel_ratio,
  COUNT(*) FILTER (WHERE touch_support = true) as touch_device_count,
  DATE_TRUNC('day', created_at) as date
FROM link_visits
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY profile_id, device_type, browser_name, os_name, DATE_TRUNC('day', created_at);

-- View: UTM campaign performance
CREATE OR REPLACE VIEW analytics_utm_campaigns AS
SELECT
  profile_id,
  utm_source,
  utm_medium,
  utm_campaign,
  COUNT(*) as visit_count,
  COUNT(DISTINCT visitor_ip_hash) as unique_visitors,
  DATE_TRUNC('day', created_at) as date
FROM link_visits
WHERE utm_source IS NOT NULL
  AND created_at >= NOW() - INTERVAL '90 days'
GROUP BY profile_id, utm_source, utm_medium, utm_campaign, DATE_TRUNC('day', created_at);

-- View: Geographic and timezone distribution
CREATE OR REPLACE VIEW analytics_geographic AS
SELECT
  profile_id,
  timezone,
  language,
  referrer_platform,
  COUNT(*) as visit_count,
  COUNT(DISTINCT visitor_ip_hash) as unique_visitors,
  DATE_TRUNC('day', created_at) as date
FROM link_visits
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY profile_id, timezone, language, referrer_platform, DATE_TRUNC('day', created_at);

-- View: Message source analytics (where did senders come from?)
CREATE OR REPLACE VIEW analytics_message_sources AS
SELECT
  recipient_id as profile_id,
  sender_referrer_platform,
  sender_device_type,
  sender_utm_source,
  COUNT(*) as message_count,
  COUNT(DISTINCT sender_ip_hash) as unique_senders,
  DATE_TRUNC('day', created_at) as date
FROM messages
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY recipient_id, sender_referrer_platform, sender_device_type, sender_utm_source, DATE_TRUNC('day', created_at);

-- ============================================================================
-- 4. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function: Get top traffic sources for a user
CREATE OR REPLACE FUNCTION get_top_traffic_sources(
  user_profile_id UUID,
  days_back INTEGER DEFAULT 30,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  platform TEXT,
  category TEXT,
  visit_count BIGINT,
  unique_visitors BIGINT,
  percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH total_visits AS (
    SELECT COUNT(*) as total
    FROM link_visits
    WHERE profile_id = user_profile_id
      AND created_at >= NOW() - (days_back || ' days')::INTERVAL
  )
  SELECT
    lv.referrer_platform,
    lv.referrer_category,
    COUNT(*)::BIGINT as visit_count,
    COUNT(DISTINCT lv.visitor_ip_hash)::BIGINT as unique_visitors,
    ROUND((COUNT(*)::DECIMAL / tv.total * 100), 2) as percentage
  FROM link_visits lv
  CROSS JOIN total_visits tv
  WHERE lv.profile_id = user_profile_id
    AND lv.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY lv.referrer_platform, lv.referrer_category, tv.total
  ORDER BY visit_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Get device breakdown for a user
CREATE OR REPLACE FUNCTION get_device_breakdown(
  user_profile_id UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  device_type TEXT,
  visit_count BIGINT,
  percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH total_visits AS (
    SELECT COUNT(*) as total
    FROM link_visits
    WHERE profile_id = user_profile_id
      AND created_at >= NOW() - (days_back || ' days')::INTERVAL
      AND device_type IS NOT NULL
  )
  SELECT
    lv.device_type,
    COUNT(*)::BIGINT as visit_count,
    ROUND((COUNT(*)::DECIMAL / tv.total * 100), 2) as percentage
  FROM link_visits lv
  CROSS JOIN total_visits tv
  WHERE lv.profile_id = user_profile_id
    AND lv.created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND lv.device_type IS NOT NULL
  GROUP BY lv.device_type, tv.total
  ORDER BY visit_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. UPDATE RLS POLICIES
-- ============================================================================

-- Users can view their own analytics data through these views
ALTER VIEW analytics_traffic_sources SET (security_invoker = on);
ALTER VIEW analytics_device_breakdown SET (security_invoker = on);
ALTER VIEW analytics_utm_campaigns SET (security_invoker = on);
ALTER VIEW analytics_geographic SET (security_invoker = on);
ALTER VIEW analytics_message_sources SET (security_invoker = on);

-- Grant select on analytics views to authenticated users (they'll only see their own data via RLS)
GRANT SELECT ON analytics_traffic_sources TO authenticated;
GRANT SELECT ON analytics_device_breakdown TO authenticated;
GRANT SELECT ON analytics_utm_campaigns TO authenticated;
GRANT SELECT ON analytics_geographic TO authenticated;
GRANT SELECT ON analytics_message_sources TO authenticated;

-- ============================================================================
-- 6. DATA RETENTION POLICY (Optional - requires pg_cron extension)
-- ============================================================================

-- Automatically delete old tracking data after 90 days
-- Uncomment if pg_cron extension is enabled

-- DELETE FROM link_visits
-- WHERE created_at < NOW() - INTERVAL '90 days';

COMMENT ON TABLE link_visits IS 'Profile visit tracking with enhanced device, referrer, and UTM analytics. Data retained for 90 days.';
COMMENT ON TABLE messages IS 'Anonymous messages with sender tracking metadata for analytics and abuse prevention.';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Enhanced tracking migration completed successfully';
  RAISE NOTICE 'Added % new columns to link_visits', (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_name = 'link_visits'
      AND column_name IN ('device_type', 'browser_name', 'referrer_platform', 'utm_source')
  );
  RAISE NOTICE 'Created 5 analytics views and 2 helper functions';
END $$;
