'use client';

import { useEffect, useState } from 'react';

/**
 * Traffic source data structure
 */
interface TrafficSource {
  platform: string;
  category: string;
  visit_count: number;
  unique_visitors: number;
  percentage: number;
}

/**
 * Platform display names and colors
 */
const PLATFORM_CONFIG: Record<
  string,
  { name: string; color: string; icon: string }
> = {
  instagram: { name: 'Instagram', color: '#E4405F', icon: '📷' },
  tiktok: { name: 'TikTok', color: '#000000', icon: '🎵' },
  snapchat: { name: 'Snapchat', color: '#FFFC00', icon: '👻' },
  twitter: { name: 'X (Twitter)', color: '#1DA1F2', icon: '𝕏' },
  facebook: { name: 'Facebook', color: '#1877F2', icon: '📘' },
  google: { name: 'Google', color: '#4285F4', icon: '🔍' },
  direct: { name: 'Direct', color: '#6B7280', icon: '🔗' },
  other: { name: 'Other', color: '#9CA3AF', icon: '🌐' },
};

interface TrafficSourcesChartProps {
  userId: string;
  daysBack?: number;
}

/**
 * TrafficSourcesChart Component
 *
 * Displays a breakdown of where profile visitors are coming from
 * (Instagram, TikTok, Google, Direct, etc.)
 */
export function TrafficSourcesChart({ userId, daysBack = 30 }: TrafficSourcesChartProps) {
  const [sources, setSources] = useState<TrafficSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrafficSources() {
      try {
        const response = await fetch(
          `/api/analytics/traffic-sources?userId=${userId}&days=${daysBack}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch traffic sources');
        }

        const data = await response.json();
        setSources(data.sources || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchTrafficSources();
  }, [userId, daysBack]);

  if (loading) {
    return (
      <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Traffic Sources</h3>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Traffic Sources</h3>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  const totalVisits = sources.reduce((sum, source) => sum + source.visit_count, 0);

  return (
    <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Traffic Sources</h3>
        <span className="text-sm text-gray-400">Last {daysBack} days</span>
      </div>

      {sources.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No traffic data yet</p>
      ) : (
        <div className="space-y-4">
          {sources.map((source, index) => {
            const config = PLATFORM_CONFIG[source.platform] || PLATFORM_CONFIG.other;

            return (
              <div key={`${source.platform}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{config.icon}</span>
                    <span className="text-white font-medium">{config.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">
                      {source.percentage.toFixed(1)}%
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({source.visit_count} visits)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#0A0A0A] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${source.percentage}%`,
                      background: `linear-gradient(90deg, ${config.color}, ${config.color}CC)`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{source.unique_visitors} unique visitors</span>
                  <span className="capitalize">{source.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalVisits > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Total Visits</span>
            <span className="text-white font-semibold">{totalVisits.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
