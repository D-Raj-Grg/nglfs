/**
 * Blocking utilities for abuse prevention
 */

import { createHash } from "crypto";

/**
 * Hash an IP address for privacy
 */
export function hashIP(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

/**
 * Detect suspicious activity patterns
 */
export interface SuspiciousActivityResult {
  isSuspicious: boolean;
  reason?: string;
  severity: "low" | "medium" | "high";
  suggestBlock?: boolean;
}

/**
 * Analyze message patterns to detect suspicious activity
 */
export function detectSuspiciousActivity(
  messages: Array<{
    sender_ip_hash: string;
    created_at: string;
  }>,
  ipHash: string
): SuspiciousActivityResult {
  // Get messages from this IP in the last hour
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentMessages = messages.filter(
    (msg) =>
      msg.sender_ip_hash === ipHash &&
      new Date(msg.created_at).getTime() > oneHourAgo
  );

  // Check for rapid messaging (>5 messages in 1 hour)
  if (recentMessages.length > 5) {
    return {
      isSuspicious: true,
      reason: "Multiple messages in short time period",
      severity: "high",
      suggestBlock: true,
    };
  }

  // Check for very rapid messaging (>3 messages in 10 minutes)
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  const veryRecentMessages = messages.filter(
    (msg) =>
      msg.sender_ip_hash === ipHash &&
      new Date(msg.created_at).getTime() > tenMinutesAgo
  );

  if (veryRecentMessages.length > 3) {
    return {
      isSuspicious: true,
      reason: "Rapid message flooding detected",
      severity: "high",
      suggestBlock: true,
    };
  }

  // Check for moderate activity (3-5 messages in 1 hour)
  if (recentMessages.length >= 3) {
    return {
      isSuspicious: true,
      reason: "High message frequency",
      severity: "medium",
      suggestBlock: false,
    };
  }

  return {
    isSuspicious: false,
    severity: "low",
  };
}

/**
 * Get a user-friendly identifier for blocked sender
 * (Since we only have IP hash, we'll use a truncated version)
 */
export function getSenderIdentifier(ipHash: string): string {
  return `Sender-${ipHash.substring(0, 8)}`;
}

/**
 * Block reasons enum
 */
export const BLOCK_REASONS = {
  SPAM: "spam",
  HARASSMENT: "harassment",
  INAPPROPRIATE_CONTENT: "inappropriate_content",
  SUSPICIOUS_ACTIVITY: "suspicious_activity",
  OTHER: "other",
} as const;

export type BlockReason = (typeof BLOCK_REASONS)[keyof typeof BLOCK_REASONS];

/**
 * Get user-friendly block reason text
 */
export function getBlockReasonText(reason: BlockReason): string {
  switch (reason) {
    case BLOCK_REASONS.SPAM:
      return "Spam";
    case BLOCK_REASONS.HARASSMENT:
      return "Harassment";
    case BLOCK_REASONS.INAPPROPRIATE_CONTENT:
      return "Inappropriate Content";
    case BLOCK_REASONS.SUSPICIOUS_ACTIVITY:
      return "Suspicious Activity";
    case BLOCK_REASONS.OTHER:
      return "Other";
    default:
      return "Unknown";
  }
}
