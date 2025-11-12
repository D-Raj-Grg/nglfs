/**
 * Report reasons - shared between client and server
 */

export const REPORT_REASONS = {
  SPAM: "spam",
  HARASSMENT: "harassment",
  INAPPROPRIATE: "inappropriate_content",
  THREATS: "threats",
  HATE_SPEECH: "hate_speech",
  OTHER: "other",
} as const;

export type ReportReason = (typeof REPORT_REASONS)[keyof typeof REPORT_REASONS];

export function getReportReasonText(reason: ReportReason): string {
  switch (reason) {
    case REPORT_REASONS.SPAM:
      return "Spam";
    case REPORT_REASONS.HARASSMENT:
      return "Harassment";
    case REPORT_REASONS.INAPPROPRIATE:
      return "Inappropriate Content";
    case REPORT_REASONS.THREATS:
      return "Threats or Violence";
    case REPORT_REASONS.HATE_SPEECH:
      return "Hate Speech";
    case REPORT_REASONS.OTHER:
      return "Other";
    default:
      return "Unknown";
  }
}
