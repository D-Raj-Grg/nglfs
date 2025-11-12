'use client';

import { Monitor, Smartphone, Tablet, Globe, MapPin, Link, Users, Clock, Wifi, Eye } from 'lucide-react';
import {
  getCountryFromTimezone,
  formatTimezoneDisplay,
  getLocalTimeForTimezone,
} from '@/lib/utils/timezone-mapper';

/**
 * Message with tracking data
 */
export interface MessageWithTracking {
  id: string;
  content: string;
  is_read: boolean;
  is_flagged: boolean;
  created_at: string;
  read_at: string | null;
  sender_ip_hash: string;
  sender_ip_raw?: string | null;
  sender_device_type?: string | null;
  sender_browser?: string | null;
  sender_os?: string | null;
  sender_timezone?: string | null;
  sender_language?: string | null;
  sender_referrer_platform?: string | null;
  sender_utm_source?: string | null;
  sender_utm_campaign?: string | null;
  // New enhanced fields
  sender_screen_resolution?: string | null;
  sender_viewport_size?: string | null;
  sender_color_depth?: number | null;
  sender_pixel_ratio?: number | null;
  sender_touch_support?: boolean | null;
  sender_connection_type?: string | null;
}

export interface MessageMetadata {
  sender_message_count: number;
  is_sender_blocked: boolean;
  blocked_reason?: string | null;
  blocked_at?: string | null;
}

interface MessageTrackingCardsProps {
  message: MessageWithTracking;
  metadata: MessageMetadata;
}

/**
 * Get device icon based on device type
 */
function getDeviceIcon(deviceType?: string | null) {
  switch (deviceType?.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="w-5 h-5" />;
    case 'tablet':
      return <Tablet className="w-5 h-5" />;
    case 'desktop':
      return <Monitor className="w-5 h-5" />;
    default:
      return <Monitor className="w-5 h-5 opacity-50" />;
  }
}

/**
 * Get platform display name and emoji
 */
function getPlatformInfo(platform?: string | null): { name: string; emoji: string } {
  const platformMap: Record<string, { name: string; emoji: string }> = {
    instagram: { name: 'Instagram', emoji: '📷' },
    tiktok: { name: 'TikTok', emoji: '🎵' },
    snapchat: { name: 'Snapchat', emoji: '👻' },
    twitter: { name: 'X (Twitter)', emoji: '𝕏' },
    facebook: { name: 'Facebook', emoji: '📘' },
    google: { name: 'Google', emoji: '🔍' },
    direct: { name: 'Direct', emoji: '🔗' },
  };

  return platformMap[platform?.toLowerCase() || ''] || { name: platform || 'Unknown', emoji: '🌐' };
}

/**
 * Get screen size category
 */
function getScreenCategory(resolution?: string | null): string {
  if (!resolution) return '';

  const [width] = resolution.split('x').map(Number);
  if (!width) return '';

  if (width < 768) return 'Small';
  if (width < 1366) return 'Medium';
  if (width < 1920) return 'Large';
  if (width < 2560) return 'Full HD';
  return '4K+';
}

/**
 * Get connection quality icon and label
 */
function getConnectionInfo(connectionType?: string | null): { icon: string; label: string; quality: string } {
  const connectionMap: Record<string, { icon: string; label: string; quality: string }> = {
    '4g': { icon: '📶', label: '4G', quality: 'Excellent' },
    '3g': { icon: '📶', label: '3G', quality: 'Good' },
    '2g': { icon: '📶', label: '2G', quality: 'Fair' },
    'slow-2g': { icon: '📶', label: 'Slow 2G', quality: 'Poor' },
    'wifi': { icon: '📡', label: 'WiFi', quality: 'Excellent' },
  };

  return connectionMap[connectionType?.toLowerCase() || ''] || { icon: '🌐', label: connectionType || 'Unknown', quality: 'Unknown' };
}

/**
 * Calculate time to read
 */
function getTimeToRead(createdAt: string, readAt: string | null): string | null {
  if (!readAt) return null;

  const created = new Date(createdAt);
  const read = new Date(readAt);
  const diffMs = read.getTime() - created.getTime();

  if (diffMs < 0) return null;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''}`;
  return `${seconds} sec${seconds > 1 ? 's' : ''}`;
}

/**
 * Message Tracking Cards Component
 *
 * Displays comprehensive sender tracking information in organized cards
 */
export function MessageTrackingCards({ message, metadata }: MessageTrackingCardsProps) {
  const platformInfo = getPlatformInfo(message.sender_referrer_platform);
  const countryInfo = getCountryFromTimezone(message.sender_timezone);
  const connectionInfo = getConnectionInfo(message.sender_connection_type);
  const timeToRead = getTimeToRead(message.created_at, message.read_at);
  const isRetinaDisplay = (message.sender_pixel_ratio || 0) >= 2.0;
  const screenCategory = getScreenCategory(message.sender_screen_resolution);
  const senderLocalTime = message.sender_timezone
    ? getLocalTimeForTimezone(message.created_at, message.sender_timezone)
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Device Information Card - ENHANCED */}
      <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          {getDeviceIcon(message.sender_device_type)}
          <h3 className="text-lg font-semibold text-white">Device Info</h3>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-400">Device Type</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-medium capitalize">
                {message.sender_device_type || 'Unknown'}
              </p>
              {message.sender_touch_support && (
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                  👆 Touch
                </span>
              )}
            </div>
          </div>

          {message.sender_screen_resolution && (
            <div>
              <p className="text-sm text-gray-400">Screen</p>
              <div className="flex items-center gap-2">
                <p className="text-white font-medium">{message.sender_screen_resolution}</p>
                {screenCategory && (
                  <span className="text-xs bg-gray-500/10 text-gray-400 px-2 py-0.5 rounded-full">
                    {screenCategory}
                  </span>
                )}
                {isRetinaDisplay && (
                  <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                    ✨ Retina
                  </span>
                )}
              </div>
            </div>
          )}

          {message.sender_browser && (
            <div>
              <p className="text-sm text-gray-400">Browser</p>
              <p className="text-white font-medium">{message.sender_browser}</p>
            </div>
          )}

          {message.sender_os && (
            <div>
              <p className="text-sm text-gray-400">Operating System</p>
              <p className="text-white font-medium">{message.sender_os}</p>
            </div>
          )}

          {message.sender_connection_type && (
            <div>
              <p className="text-sm text-gray-400">Connection</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">{connectionInfo.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-medium">{connectionInfo.label}</p>
                  <p className="text-xs text-gray-500">{connectionInfo.quality} quality</p>
                </div>
              </div>
            </div>
          )}

          {!message.sender_browser && !message.sender_os && (
            <p className="text-sm text-gray-500 italic">Limited device data available</p>
          )}
        </div>
      </div>

      {/* Location Information Card - ENHANCED */}
      <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5" />
          <h3 className="text-lg font-semibold text-white">Location</h3>
        </div>

        <div className="space-y-3">
          {message.sender_ip_raw && (
            <div>
              <p className="text-sm text-gray-400">IP Address</p>
              <p className="text-white font-medium font-mono">{message.sender_ip_raw}</p>
            </div>
          )}

          {message.sender_timezone && countryInfo && (
            <div>
              <p className="text-sm text-gray-400">Country/Region</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{countryInfo.flag}</span>
                <div>
                  <p className="text-white font-medium">{countryInfo.country}</p>
                  <p className="text-xs text-gray-500">{countryInfo.region}</p>
                </div>
              </div>
            </div>
          )}

          {message.sender_timezone && (
            <div>
              <p className="text-sm text-gray-400">Timezone</p>
              <p className="text-white font-medium">{message.sender_timezone}</p>
              {senderLocalTime && (
                <p className="text-xs text-gray-500 mt-1">
                  Sent at {senderLocalTime} (their local time)
                </p>
              )}
            </div>
          )}

          {message.sender_language && (
            <div>
              <p className="text-sm text-gray-400">Language</p>
              <p className="text-white font-medium">{message.sender_language}</p>
            </div>
          )}

          {!message.sender_ip_raw && !message.sender_timezone && !message.sender_language && (
            <p className="text-sm text-gray-500 italic">No location data available</p>
          )}
        </div>
      </div>

      {/* Traffic Source Card */}
      <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Link className="w-5 h-5" />
          <h3 className="text-lg font-semibold text-white">Traffic Source</h3>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-400">Platform</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">{platformInfo.emoji}</span>
              <p className="text-white font-medium">{platformInfo.name}</p>
            </div>
          </div>

          {message.sender_utm_source && (
            <div>
              <p className="text-sm text-gray-400">UTM Source</p>
              <p className="text-white font-medium">{message.sender_utm_source}</p>
            </div>
          )}

          {message.sender_utm_campaign && (
            <div>
              <p className="text-sm text-gray-400">Campaign</p>
              <p className="text-white font-medium">{message.sender_utm_campaign}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sender Context Card - ENHANCED */}
      <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h3 className="text-lg font-semibold text-white">Sender Context</h3>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-gray-400">Messages from this sender</p>
              {metadata.sender_message_count > 1 && (
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                  🔄 Returning
                </span>
              )}
              {metadata.sender_message_count === 1 && (
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                  ✨ New
                </span>
              )}
            </div>
            <p className="text-white font-medium text-2xl">{metadata.sender_message_count}</p>
          </div>

          {timeToRead && message.is_read && (
            <div>
              <p className="text-sm text-gray-400">Time to Read</p>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <p className="text-white font-medium">{timeToRead}</p>
              </div>
            </div>
          )}

          {metadata.is_sender_blocked && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm font-medium text-red-400">🚫 Sender is blocked</p>
              {metadata.blocked_reason && (
                <p className="text-xs text-red-300 mt-1">Reason: {metadata.blocked_reason}</p>
              )}
            </div>
          )}

          {!metadata.is_sender_blocked && metadata.sender_message_count > 5 && (
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400">⚠️ Frequent sender</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
