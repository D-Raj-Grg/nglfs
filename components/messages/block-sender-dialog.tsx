"use client";

import { useState } from "react";
import { Loader2, Shield } from "lucide-react";
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
import { toast } from "sonner";
import { BLOCK_REASONS, type BlockReason } from "@/lib/utils/blocking";

interface BlockSenderDialogProps {
  messageId: string;
  senderIpHash: string;
  onBlocked?: () => void;
  trigger?: React.ReactNode;
}

export function BlockSenderDialog({
  messageId,
  senderIpHash,
  onBlocked,
  trigger,
}: BlockSenderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [reason, setReason] = useState<BlockReason>(BLOCK_REASONS.OTHER);

  const handleBlock = async () => {
    setIsBlocking(true);

    try {
      const response = await fetch("/api/block/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip_hash: senderIpHash,
          reason,
          message_id: messageId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Sender blocked successfully");
        setIsOpen(false);
        onBlocked?.();
      } else {
        toast.error(data.error || "Failed to block sender");
      }
    } catch (error) {
      console.error("Error blocking sender:", error);
      toast.error("Failed to block sender");
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Shield className="w-4 h-4" />
            Block Sender
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block this sender?</AlertDialogTitle>
          <AlertDialogDescription>
            This will prevent this sender from sending you any more messages in
            the future. You can unblock them later from your privacy settings.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="block-reason" className="text-white mb-2 block">
            Reason for blocking
          </Label>
          <Select
            value={reason}
            onValueChange={(value) => setReason(value as BlockReason)}
          >
            <SelectTrigger id="block-reason">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={BLOCK_REASONS.SPAM}>Spam</SelectItem>
              <SelectItem value={BLOCK_REASONS.HARASSMENT}>
                Harassment
              </SelectItem>
              <SelectItem value={BLOCK_REASONS.INAPPROPRIATE_CONTENT}>
                Inappropriate Content
              </SelectItem>
              <SelectItem value={BLOCK_REASONS.SUSPICIOUS_ACTIVITY}>
                Suspicious Activity
              </SelectItem>
              <SelectItem value={BLOCK_REASONS.OTHER}>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBlocking}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBlock}
            disabled={isBlocking}
            className="bg-red-600 hover:bg-red-700"
          >
            {isBlocking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Blocking...
              </>
            ) : (
              "Block Sender"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
