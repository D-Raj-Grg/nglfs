'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Flag, Ban, Clock, Check } from 'lucide-react';
import { MessageTrackingCards, MessageWithTracking, MessageMetadata } from '@/components/messages/message-tracking-cards';
import { toast } from 'sonner';

interface MessageDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Message Detail Page
 *
 * Displays a single message with comprehensive sender tracking analytics
 * Route: /dashboard/messages/{uuid}
 */
export default function MessageDetailPage({ params }: MessageDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [message, setMessage] = useState<MessageWithTracking | null>(null);
  const [metadata, setMetadata] = useState<MessageMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch message data
  useEffect(() => {
    async function fetchMessage() {
      try {
        const response = await fetch(`/api/messages/${resolvedParams.id}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch message');
        }

        const data = await response.json();
        setMessage(data.message);
        setMetadata(data.metadata);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        toast.error('Failed to load message');
      } finally {
        setLoading(false);
      }
    }

    fetchMessage();
  }, [resolvedParams.id]);

  // Delete message
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/messages/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      toast.success('Message deleted');
      router.push('/dashboard/messages');
    } catch (err) {
      toast.error('Failed to delete message');
      setDeleting(false);
    }
  }

  // Report message
  async function handleReport() {
    try {
      const response = await fetch('/api/messages/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: resolvedParams.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to report message');
      }

      toast.success('Message reported');
    } catch (err) {
      toast.error('Failed to report message');
    }
  }

  // Block sender
  async function handleBlock() {
    if (!message || !confirm('Block this sender? They will no longer be able to send you messages.')) {
      return;
    }

    try {
      const response = await fetch('/api/messages/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipHash: message.sender_ip_hash }),
      });

      if (!response.ok) {
        throw new Error('Failed to block sender');
      }

      toast.success('Sender blocked');
      // Refresh to show blocked status
      window.location.reload();
    } catch (err) {
      toast.error('Failed to block sender');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading message...</p>
        </div>
      </div>
    );
  }

  if (error || !message || !metadata) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard/messages"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Messages
          </Link>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 sm:p-6 md:p-8 text-center">
            <p className="text-red-400 text-base sm:text-lg font-medium">
              {error || 'Message not found'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              This message may have been deleted or you don't have permission to view it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link
            href="/dashboard/messages"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">Back to Messages</span>
          </Link>

          <div className="flex items-center gap-2">
            {message.is_read ? (
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-green-400">
                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                Read
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-400">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                Unread
              </span>
            )}
          </div>
        </div>

        {/* Message Content Card */}
        <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-xl p-4 sm:p-6 md:p-8 border border-white/10">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Anonymous Message</h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Received {new Date(message.created_at).toLocaleString()}
              </p>
            </div>

            {message.is_flagged && (
              <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs text-yellow-400 shrink-0">
                Flagged
              </span>
            )}
          </div>

          <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-[#0A0A0A]/50 rounded-lg border border-white/5">
            <p className="text-white text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-white/10">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <button
              onClick={handleReport}
              className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors text-sm"
            >
              <Flag className="w-4 h-4" />
              <span>Report</span>
            </button>

            {!metadata.is_sender_blocked && (
              <button
                onClick={handleBlock}
                className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 rounded-lg transition-colors text-sm"
              >
                <Ban className="w-4 h-4" />
                <span>Block Sender</span>
              </button>
            )}

            {metadata.is_sender_blocked && (
              <span className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm">
                <Ban className="w-4 h-4" />
                <span>Sender Blocked</span>
              </span>
            )}
          </div>
        </div>

        {/* Sender Tracking Analytics */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Sender Analytics</h2>
          <MessageTrackingCards message={message} metadata={metadata} />
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-300 leading-relaxed">
            🔒 <strong>Privacy Notice:</strong> This tracking data helps you understand your
            audience better. IP addresses are hashed and cannot be used to identify individuals.
            All data is GDPR & CCPA compliant.
          </p>
        </div>
      </div>
    </div>
  );
}
