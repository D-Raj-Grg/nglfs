"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, MessageSquare, Trash2, Eye, Search, Shield, AlertTriangle, ExternalLink } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlockSenderDialog } from "@/components/messages/block-sender-dialog";
import { ReportMessageDialog } from "@/components/messages/report-message-dialog";
import { SuspiciousActivityAlert } from "@/components/dashboard/suspicious-activity-alert";
import { MessageListSkeleton } from "@/components/skeletons/message-skeleton";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  is_read: boolean;
  is_flagged?: boolean;
  created_at: string;
  sender_ip_hash: string;
  sender_device_type?: string | null;
  sender_browser?: string | null;
  sender_os?: string | null;
  sender_referrer_platform?: string | null;
  sender_utm_source?: string | null;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { updateProfile } = useProfileStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch messages
  const fetchMessages = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/messages/list");
      const data = await response.json();

      if (response.ok) {
        const fetchedMessages = data.messages || [];
        setMessages(fetchedMessages);

        // Update profile store with unread count
        const unreadCount = fetchedMessages.filter((msg: Message) => !msg.is_read).length;
        updateProfile({ message_count: unreadCount });
      } else {
        toast.error(data.error || "Failed to load messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: "PUT",
      });

      if (response.ok) {
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === messageId ? { ...msg, is_read: true } : msg
          );

          // Update unread count in profile store
          const unreadCount = updated.filter((msg) => !msg.is_read).length;
          updateProfile({ message_count: unreadCount });

          return updated;
        });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages((prev) => {
          const updated = prev.filter((msg) => msg.id !== messageId);

          // Update unread count in profile store
          const unreadCount = updated.filter((msg) => !msg.is_read).length;
          updateProfile({ message_count: unreadCount });

          return updated;
        });
        toast.success("Message deleted");
      } else {
        toast.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !msg.is_read) ||
      (filter === "read" && msg.is_read);

    const matchesSearch =
      searchQuery === "" ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = messages.filter((msg) => !msg.is_read).length;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <AnimatedGradientText className="text-3xl font-bold mb-2">
            Messages
          </AnimatedGradientText>
          <p className="text-gray-400">Loading messages...</p>
        </div>
        <MessageListSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <AnimatedGradientText className="text-3xl font-bold mb-2">
          Messages
        </AnimatedGradientText>
        <p className="text-gray-400">
          {messages.length} total messages
          {unreadCount > 0 && ` • ${unreadCount} unread`}
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Filter buttons */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-linear-to-r from-purple-600 to-pink-600" : ""}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
            className={filter === "unread" ? "bg-linear-to-r from-purple-600 to-pink-600" : ""}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === "read" ? "default" : "outline"}
            onClick={() => setFilter("read")}
            className={filter === "read" ? "bg-linear-to-r from-purple-600 to-pink-600" : ""}
          >
            Read
          </Button>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Suspicious Activity Alerts */}
      {messages.length > 0 && (
        <SuspiciousActivityAlert messages={messages} />
      )}

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <MagicCard className="p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {messages.length === 0
              ? "No messages yet"
              : "No messages match your filters"}
          </h3>
          <p className="text-gray-400">
            {messages.length === 0
              ? "Share your profile link to start receiving anonymous messages"
              : "Try adjusting your filters or search query"}
          </p>
        </MagicCard>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <MagicCard
              key={message.id}
              className={cn(
                "p-6 transition-all",
                !message.is_read && "border-l-4 border-l-purple-500"
              )}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-lg mb-2">{message.content}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      {/* Quick tracking info badges */}
                      {message.sender_device_type && (
                        <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full capitalize">
                          📱 {message.sender_device_type}
                        </span>
                      )}
                      {message.sender_referrer_platform && message.sender_referrer_platform !== 'direct' && (
                        <span className="text-xs text-gray-400 bg-purple-500/10 px-2 py-1 rounded-full capitalize">
                          🔗 {message.sender_referrer_platform}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/messages/${message.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View details & tracking"
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    {!message.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(message.id)}
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMessage(message.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Block and Report Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                  <ReportMessageDialog
                    messageId={message.id}
                    trigger={
                      <Button variant="ghost" size="sm" className="gap-2 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10">
                        <AlertTriangle className="w-4 h-4" />
                        Report
                      </Button>
                    }
                  />
                  <BlockSenderDialog
                    messageId={message.id}
                    senderIpHash={message.sender_ip_hash}
                    onBlocked={() => {
                      // Optionally remove messages from this sender
                      fetchMessages();
                    }}
                    trigger={
                      <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white hover:bg-gray-800">
                        <Shield className="w-4 h-4" />
                        Block Sender
                      </Button>
                    }
                  />
                </div>
              </div>
            </MagicCard>
          ))}
        </div>
      )}
    </div>
  );
}
