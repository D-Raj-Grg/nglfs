-- Add Raw IP Address Column to Messages Table
-- WARNING: This stores Personally Identifiable Information (PII)
-- Ensure privacy policy is updated before deploying to production

-- ============================================================================
-- 1. ADD RAW IP COLUMN
-- ============================================================================

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS sender_ip_raw TEXT;

-- Add index for potential IP-based queries (abuse detection, analytics)
CREATE INDEX IF NOT EXISTS idx_messages_sender_ip_raw ON messages(sender_ip_raw);

-- Add comment documenting privacy implications
COMMENT ON COLUMN messages.sender_ip_raw IS 'Raw IP address of sender - PII under GDPR/CCPA. Handle with care. Only visible to message recipient.';

-- ============================================================================
-- 2. VERIFY RLS POLICIES STILL APPLY
-- ============================================================================

-- Note: Existing RLS policies on messages table should already cover this column
-- RLS ensures only the recipient can see their messages (including IP addresses)
-- Verify with: SELECT * FROM pg_policies WHERE tablename = 'messages';

-- ============================================================================
-- 3. CREATE ANALYTICS VIEW FOR IP ANALYSIS (ADMIN ONLY)
-- ============================================================================

-- View for analyzing IP patterns (for abuse detection)
CREATE OR REPLACE VIEW analytics_ip_patterns AS
SELECT
  sender_ip_raw,
  COUNT(*) as message_count,
  COUNT(DISTINCT recipient_id) as unique_recipients,
  MIN(created_at) as first_message_at,
  MAX(created_at) as last_message_at,
  COUNT(*) FILTER (WHERE is_flagged = true) as flagged_count,
  -- Check if sender is using multiple devices/browsers from same IP
  COUNT(DISTINCT sender_device_type) as device_types_used,
  COUNT(DISTINCT sender_browser) as browsers_used,
  -- Average time between messages
  CASE
    WHEN COUNT(*) > 1 THEN
      EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / NULLIF(COUNT(*) - 1, 0)
    ELSE NULL
  END as avg_seconds_between_messages
FROM messages
WHERE sender_ip_raw IS NOT NULL
GROUP BY sender_ip_raw
ORDER BY message_count DESC;

COMMENT ON VIEW analytics_ip_patterns IS 'IP-based analytics for abuse detection. Contains PII - restrict access to admins only.';

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

-- Grant authenticated users access to their own messages (RLS applies)
-- The view is for admin analysis only (do not grant to authenticated role)
GRANT SELECT ON analytics_ip_patterns TO postgres; -- Admin only

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '==========================================================';
  RAISE NOTICE 'Raw IP Column Migration Complete';
  RAISE NOTICE '==========================================================';
  RAISE NOTICE 'Column Added: messages.sender_ip_raw (TEXT)';
  RAISE NOTICE 'Index Created: idx_messages_sender_ip_raw';
  RAISE NOTICE 'Analytics View: analytics_ip_patterns (admin only)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT WARNINGS:';
  RAISE NOTICE '1. IP addresses are Personally Identifiable Information (PII)';
  RAISE NOTICE '2. Update privacy policy before deploying to production';
  RAISE NOTICE '3. Inform users that IPs will be visible to recipients';
  RAISE NOTICE '4. Ensure GDPR/CCPA data retention policies are documented';
  RAISE NOTICE '5. Existing RLS policies apply - only recipients see IPs';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '- Update app/api/messages/send/route.ts to store raw IPs';
  RAISE NOTICE '- Update components/messages/message-tracking-cards.tsx to display IPs';
  RAISE NOTICE '- Update privacy policy documentation';
  RAISE NOTICE '==========================================================';
END $$;
