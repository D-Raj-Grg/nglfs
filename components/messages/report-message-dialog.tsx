"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { REPORT_REASONS, type ReportReason } from "@/lib/constants/report-reasons";

interface ReportMessageDialogProps {
  messageId: string;
  onReported?: (senderIpHash: string) => void;
  trigger?: React.ReactNode;
}

export function ReportMessageDialog({
  messageId,
  onReported,
  trigger,
}: ReportMessageDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reason, setReason] = useState<ReportReason>(REPORT_REASONS.OTHER);
  const [details, setDetails] = useState("");

  const handleReport = async () => {
    setIsReporting(true);

    try {
      const response = await fetch("/api/messages/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_id: messageId,
          reason,
          details: details.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Message reported successfully");
        setIsOpen(false);
        setDetails("");

        // Optionally pass sender IP hash for blocking
        if (data.sender_ip_hash) {
          onReported?.(data.sender_ip_hash);
        }
      } else {
        toast.error(data.error || "Failed to report message");
      }
    } catch (error) {
      console.error("Error reporting message:", error);
      toast.error("Failed to report message");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10">
            <AlertTriangle className="w-4 h-4" />
            Report
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Report this message</AlertDialogTitle>
          <AlertDialogDescription>
            Help us keep NGLFS safe by reporting messages that violate our
            community guidelines.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="report-reason" className="text-white mb-2 block">
              Reason for reporting *
            </Label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as ReportReason)}
            >
              <SelectTrigger id="report-reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={REPORT_REASONS.SPAM}>Spam</SelectItem>
                <SelectItem value={REPORT_REASONS.HARASSMENT}>
                  Harassment
                </SelectItem>
                <SelectItem value={REPORT_REASONS.INAPPROPRIATE}>
                  Inappropriate Content
                </SelectItem>
                <SelectItem value={REPORT_REASONS.THREATS}>
                  Threats or Violence
                </SelectItem>
                <SelectItem value={REPORT_REASONS.HATE_SPEECH}>
                  Hate Speech
                </SelectItem>
                <SelectItem value={REPORT_REASONS.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="report-details" className="text-white mb-2 block">
              Additional details (optional)
            </Label>
            <Textarea
              id="report-details"
              placeholder="Provide more context about why you're reporting this message..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="resize-none h-24"
              maxLength={500}
            />
            <p className="text-sm text-gray-500 text-right mt-1">
              {details.length}/500
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isReporting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReport}
            disabled={isReporting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isReporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reporting...
              </>
            ) : (
              "Submit Report"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
