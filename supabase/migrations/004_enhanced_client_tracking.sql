-- Enhanced Client Tracking Migration
-- Adds additional client-side tracking fields for comprehensive device analytics
-- Part of NGLFS anonymous messaging platform - Phase 2 tracking enhancements

-- ============================================================================
-- 1. ADD NEW TRACKING COLUMNS TO messages TABLE
-- ============================================================================

ALTER TABLE messages
-- Screen & Display Information
ADD COLUMN IF NOT EXISTS sender_screen_resolution TEXT,
ADD COLUMN IF NOT EXISTS sender_viewport_size TEXT,
ADD COLUMN IF NOT EXISTS sender_available_screen TEXT,
ADD COLUMN IF NOT EXISTS sender_color_depth INTEGER,
ADD COLUMN IF NOT EXISTS sender_pixel_ratio DECIMAL(3,2),

-- Device Capabilities
ADD COLUMN IF NOT EXISTS sender_touch_support BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sender_connection_type TEXT;

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_messages_pixel_ratio ON messages(sender_pixel_ratio) WHERE sender_pixel_ratio >= 2.0;
CREATE INDEX IF NOT EXISTS idx_messages_touch_support ON messages(sender_touch_support);
CREATE INDEX IF NOT EXISTS idx_messages_connection_type ON messages(sender_connection_type);

-- Add materialized hour column for time-based analytics (avoids IMMUTABLE function requirement)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS created_at_hour TIMESTAMPTZ;

-- Populate existing rows
UPDATE messages
SET created_at_hour = date_trunc('hour', created_at)
WHERE created_at IS NOT NULL AND created_at_hour IS NULL;

-- Create trigger function to maintain created_at_hour
CREATE OR REPLACE FUNCTION messages_set_created_at_hour()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.created_at IS NOT NULL THEN
    NEW.created_at_hour := date_trunc('hour', NEW.created_at);
  ELSE
    NEW.created_at_hour := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger (fires before insert or update)
DROP TRIGGER IF EXISTS trg_messages_set_created_at_hour ON messages;
CREATE TRIGGER trg_messages_set_created_at_hour
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION messages_set_created_at_hour();

-- Now we can safely index the materialized column
CREATE INDEX IF NOT EXISTS idx_messages_created_at_hour ON messages(created_at_hour);

-- Add computed columns for analytics
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS sender_is_retina_display BOOLEAN GENERATED ALWAYS AS (sender_pixel_ratio >= 2.0) STORED,
ADD COLUMN IF NOT EXISTS sender_has_touch BOOLEAN GENERATED ALWAYS AS (COALESCE(sender_touch_support, false)) STORED;

-- Add comments for documentation
COMMENT ON COLUMN messages.sender_screen_resolution IS 'Full screen resolution (e.g., "1920x1080")';
COMMENT ON COLUMN messages.sender_viewport_size IS 'Browser viewport dimensions (e.g., "1440x900")';
COMMENT ON COLUMN messages.sender_available_screen IS 'Available screen minus OS taskbars (e.g., "1920x1040")';
COMMENT ON COLUMN messages.sender_color_depth IS 'Color depth in bits (8, 16, 24, 32)';
COMMENT ON COLUMN messages.sender_pixel_ratio IS 'Device pixel ratio - 2.0+ indicates Retina/HiDPI display';
COMMENT ON COLUMN messages.sender_touch_support IS 'Whether device supports touch input';
COMMENT ON COLUMN messages.sender_connection_type IS 'Network connection type (4g, 3g, 2g, slow-2g, wifi)';
COMMENT ON COLUMN messages.sender_is_retina_display IS 'Computed: true if pixel_ratio >= 2.0';
COMMENT ON COLUMN messages.sender_has_touch IS 'Computed: normalized boolean for touch support';

-- ============================================================================
-- 2. CREATE ANALYTICS VIEWS FOR NEW DATA
-- ============================================================================

-- Screen Resolution Distribution
CREATE OR REPLACE VIEW analytics_screen_resolutions AS
SELECT
  sender_screen_resolution as resolution,
  COUNT(*) as message_count,
  COUNT(DISTINCT sender_ip_hash) as unique_senders,
  AVG(sender_pixel_ratio) as avg_pixel_ratio,
  COUNT(*) FILTER (WHERE sender_is_retina_display) as retina_count
FROM messages
WHERE sender_screen_resolution IS NOT NULL
GROUP BY sender_screen_resolution
ORDER BY message_count DESC;

-- Device Capabilities Distribution
CREATE OR REPLACE VIEW analytics_device_capabilities AS
SELECT
  sender_device_type as device_type,
  sender_touch_support as has_touch,
  sender_is_retina_display as is_retina,
  sender_connection_type as connection,
  COUNT(*) as message_count,
  COUNT(DISTINCT sender_ip_hash) as unique_senders
FROM messages
GROUP BY sender_device_type, sender_touch_support, sender_is_retina_display, sender_connection_type
ORDER BY message_count DESC;

-- Connection Quality Analytics
CREATE OR REPLACE VIEW analytics_connection_quality AS
SELECT
  sender_connection_type as connection_type,
  COUNT(*) as message_count,
  AVG(LENGTH(content)) as avg_message_length,
  COUNT(DISTINCT sender_ip_hash) as unique_senders,
  COUNT(*) FILTER (WHERE sender_device_type = 'mobile') as mobile_count,
  COUNT(*) FILTER (WHERE sender_device_type = 'desktop') as desktop_count
FROM messages
WHERE sender_connection_type IS NOT NULL
GROUP BY sender_connection_type
ORDER BY message_count DESC;

-- Hourly Message Distribution (for peak hours analysis)
CREATE OR REPLACE VIEW analytics_hourly_distribution AS
SELECT
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  COUNT(*) as message_count,
  COUNT(DISTINCT sender_ip_hash) as unique_senders,
  COUNT(DISTINCT recipient_id) as unique_recipients
FROM messages
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour_of_day;

-- Day of Week Distribution
CREATE OR REPLACE VIEW analytics_daily_distribution AS
SELECT
  EXTRACT(DOW FROM created_at) as day_of_week,
  CASE EXTRACT(DOW FROM created_at)
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END as day_name,
  COUNT(*) as message_count,
  COUNT(DISTINCT sender_ip_hash) as unique_senders
FROM messages
GROUP BY EXTRACT(DOW FROM created_at)
ORDER BY day_of_week;

-- ============================================================================
-- 3. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function: Calculate time to read message
CREATE OR REPLACE FUNCTION get_time_to_read(message_id UUID)
RETURNS INTERVAL AS $$
  SELECT
    CASE
      WHEN read_at IS NOT NULL AND created_at IS NOT NULL
      THEN read_at - created_at
      ELSE NULL
    END
  FROM messages
  WHERE id = message_id;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_time_to_read(UUID) IS 'Calculate time between message creation and first read';

-- Function: Get sender message history
CREATE OR REPLACE FUNCTION get_sender_message_count(ip_hash TEXT, recipient UUID)
RETURNS TABLE (
  total_messages BIGINT,
  first_message_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  days_since_first NUMERIC,
  days_since_last NUMERIC,
  is_returning_sender BOOLEAN
) AS $$
  SELECT
    COUNT(*) as total_messages,
    MIN(created_at) as first_message_at,
    MAX(created_at) as last_message_at,
    EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) / 86400 as days_since_first,
    EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) / 86400 as days_since_last,
    COUNT(*) > 1 as is_returning_sender
  FROM messages
  WHERE sender_ip_hash = ip_hash
    AND recipient_id = recipient;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_sender_message_count(TEXT, UUID) IS 'Get comprehensive sender history for behavioral analysis';

-- Function: Infer geographic region from timezone
CREATE OR REPLACE FUNCTION infer_region_from_timezone(tz TEXT)
RETURNS TEXT AS $$
  SELECT
    CASE
      -- Americas
      WHEN tz LIKE 'America/%' OR tz LIKE 'US/%' THEN 'Americas'
      WHEN tz LIKE 'Canada/%' THEN 'Americas'
      WHEN tz LIKE 'Brazil/%' THEN 'Americas'
      WHEN tz LIKE 'Chile/%' THEN 'Americas'
      WHEN tz LIKE 'Argentina/%' THEN 'Americas'
      WHEN tz LIKE 'Mexico/%' THEN 'Americas'

      -- Europe
      WHEN tz LIKE 'Europe/%' THEN 'Europe'
      WHEN tz = 'GMT' OR tz = 'UTC' THEN 'Europe'

      -- Asia
      WHEN tz LIKE 'Asia/%' THEN 'Asia'
      WHEN tz LIKE 'Indian/%' THEN 'Asia'

      -- Africa
      WHEN tz LIKE 'Africa/%' THEN 'Africa'

      -- Oceania
      WHEN tz LIKE 'Australia/%' THEN 'Oceania'
      WHEN tz LIKE 'Pacific/%' THEN 'Oceania'
      WHEN tz LIKE 'Antarctica/%' THEN 'Oceania'

      -- Unknown
      ELSE 'Unknown'
    END;
$$ LANGUAGE SQL IMMUTABLE;

COMMENT ON FUNCTION infer_region_from_timezone(TEXT) IS 'Privacy-safe region inference from IANA timezone string';

-- ============================================================================
-- 4. UPDATE RLS POLICIES (no changes needed, existing policies apply)
-- ============================================================================

-- Note: Existing RLS policies on messages table automatically apply to new columns
-- Users can only see messages where recipient_id = their profile.id

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

-- Grant access to analytics views
GRANT SELECT ON analytics_screen_resolutions TO authenticated;
GRANT SELECT ON analytics_device_capabilities TO authenticated;
GRANT SELECT ON analytics_connection_quality TO authenticated;
GRANT SELECT ON analytics_hourly_distribution TO authenticated;
GRANT SELECT ON analytics_daily_distribution TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_time_to_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sender_message_count(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION infer_region_from_timezone(TEXT) TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Enhanced Client Tracking Migration Complete!';
  RAISE NOTICE 'New columns added to messages table:';
  RAISE NOTICE '  - sender_screen_resolution, sender_viewport_size, sender_available_screen';
  RAISE NOTICE '  - sender_color_depth, sender_pixel_ratio';
  RAISE NOTICE '  - sender_touch_support, sender_connection_type';
  RAISE NOTICE 'Computed columns: sender_is_retina_display, sender_has_touch';
  RAISE NOTICE 'New analytics views: 5 views created';
  RAISE NOTICE 'New helper functions: 3 functions created';
END $$;
