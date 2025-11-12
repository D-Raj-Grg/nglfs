"use client";

import { useState, useEffect } from "react";
import { Loader2, Shield, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { toast } from "sonner";
import { getBlockReasonText, getSenderIdentifier } from "@/lib/utils/blocking";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BlockedSender {
  id: string;
  blocked_ip_hash: string;
  blocked_identifier: string | null;
  reason: string;
  created_at: string;
}

export function PrivacySettings() {
  const [blocks, setBlocks] = useState<BlockedSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [confirmUnblock, setConfirmUnblock] = useState<string | null>(null);

  // Fetch blocked senders
  const fetchBlocks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/block/list");
      const data = await response.json();

      if (response.ok) {
        setBlocks(data.blocks || []);
      } else {
        toast.error(data.error || "Failed to load blocked senders");
      }
    } catch (error) {
      console.error("Error fetching blocks:", error);
      toast.error("Failed to load blocked senders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  // Unblock sender
  const handleUnblock = async (blockId: string) => {
    setUnblockingId(blockId);
    try {
      const response = await fetch("/api/block/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ block_id: blockId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Sender unblocked successfully");
        setBlocks((prev) => prev.filter((block) => block.id !== blockId));
      } else {
        toast.error(data.error || "Failed to unblock sender");
      }
    } catch (error) {
      console.error("Error unblocking sender:", error);
      toast.error("Failed to unblock sender");
    } finally {
      setUnblockingId(null);
      setConfirmUnblock(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Privacy & Safety
        </h3>
        <p className="text-gray-400">
          Manage blocked senders and protect yourself from unwanted messages
        </p>
      </div>

      {/* Info Card */}
      <MagicCard className="p-6 border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-medium mb-1">How Blocking Works</h4>
            <p className="text-sm text-gray-400">
              When you block a sender, they won't be able to send you any more
              messages. Blocked senders are identified by their unique
              fingerprint, not personal information.
            </p>
          </div>
        </div>
      </MagicCard>

      {/* Blocked Senders List */}
      <div>
        <h4 className="text-lg font-medium text-white mb-4">
          Blocked Senders ({blocks.length})
        </h4>

        {blocks.length === 0 ? (
          <MagicCard className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">No blocked senders yet</p>
            <p className="text-sm text-gray-500 mt-1">
              You can block senders from the messages page
            </p>
          </MagicCard>
        ) : (
          <div className="space-y-3">
            {blocks.map((block) => (
              <MagicCard key={block.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium">
                        {block.blocked_identifier ||
                          getSenderIdentifier(block.blocked_ip_hash)}
                      </p>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/10 text-red-500">
                        {getBlockReasonText(block.reason as any)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Blocked on{" "}
                      {new Date(block.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmUnblock(block.id)}
                    disabled={unblockingId === block.id}
                    className="flex items-center gap-2"
                  >
                    {unblockingId === block.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Unblocking...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Unblock
                      </>
                    )}
                  </Button>
                </div>
              </MagicCard>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmUnblock}
        onOpenChange={(open) => !open && setConfirmUnblock(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock this sender?</AlertDialogTitle>
            <AlertDialogDescription>
              This sender will be able to send you messages again. You can
              always block them again later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmUnblock && handleUnblock(confirmUnblock)}
              className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
