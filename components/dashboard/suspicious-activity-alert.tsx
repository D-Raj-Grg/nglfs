"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Shield, X } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { Button } from "@/components/ui/button";
import { BlockSenderDialog } from "@/components/messages/block-sender-dialog";
import { detectSuspiciousActivity, getSenderIdentifier } from "@/lib/utils/blocking";

interface SuspiciousActivity {
  ipHash: string;
  reason: string;
  severity: "low" | "medium" | "high";
  messageCount: number;
}

interface SuspiciousActivityAlertProps {
  messages: Array<{
    sender_ip_hash: string;
    created_at: string;
  }>;
}

export function SuspiciousActivityAlert({ messages }: SuspiciousActivityAlertProps) {
  const [suspicious, setSuspicious] = useState<SuspiciousActivity[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Analyze messages for suspicious activity
    const ipHashes = new Set(messages.map((m) => m.sender_ip_hash));
    const suspiciousActivities: SuspiciousActivity[] = [];

    ipHashes.forEach((ipHash) => {
      const analysis = detectSuspiciousActivity(messages, ipHash);

      if (analysis.isSuspicious) {
        const messagesFromSender = messages.filter(
          (m) => m.sender_ip_hash === ipHash
        );

        suspiciousActivities.push({
          ipHash,
          reason: analysis.reason || "Unusual activity detected",
          severity: analysis.severity,
          messageCount: messagesFromSender.length,
        });
      }
    });

    // Sort by severity (high > medium > low)
    suspiciousActivities.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    setSuspicious(suspiciousActivities);
  }, [messages]);

  const visibleSuspicious = suspicious.filter(
    (s) => !dismissed.has(s.ipHash)
  );

  if (visibleSuspicious.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visibleSuspicious.map((activity) => (
        <MagicCard
          key={activity.ipHash}
          className={`p-4 border-l-4 ${
            activity.severity === "high"
              ? "border-l-red-500 bg-red-500/5"
              : activity.severity === "medium"
              ? "border-l-orange-500 bg-orange-500/5"
              : "border-l-yellow-500 bg-yellow-500/5"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-2 rounded-full flex-shrink-0 ${
                activity.severity === "high"
                  ? "bg-red-500/10"
                  : activity.severity === "medium"
                  ? "bg-orange-500/10"
                  : "bg-yellow-500/10"
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 ${
                  activity.severity === "high"
                    ? "text-red-500"
                    : activity.severity === "medium"
                    ? "text-orange-500"
                    : "text-yellow-500"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-white font-medium">
                    Suspicious Activity Detected
                  </h4>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {getSenderIdentifier(activity.ipHash)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-500 hover:text-white"
                  onClick={() => {
                    setDismissed((prev) => new Set(prev).add(activity.ipHash));
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm text-gray-300 mb-3">{activity.reason}</p>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {activity.messageCount} message
                  {activity.messageCount !== 1 ? "s" : ""} from this sender
                </span>
                <BlockSenderDialog
                  messageId="" // Not tied to specific message
                  senderIpHash={activity.ipHash}
                  onBlocked={() => {
                    setDismissed((prev) => new Set(prev).add(activity.ipHash));
                  }}
                  trigger={
                    <Button
                      size="sm"
                      className="gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <Shield className="w-3 h-3" />
                      Block Sender
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </MagicCard>
      ))}
    </div>
  );
}
