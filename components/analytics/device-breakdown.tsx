'use client';

import { useEffect, useState } from 'react';

interface DeviceStats {
  device_type: string;
  visit_count: number;
  percentage: number;
}

interface DeviceBreakdownProps {
  userId: string;
  daysBack?: number;
}

const DEVICE_CONFIG: Record<string, { name: string; icon: string; color: string }> = {
  mobile: { name: 'Mobile', icon: '📱', color: '#8B5CF6' },
  tablet: { name: 'Tablet', icon: '📱', color: '#EC4899' },
  desktop: { name: 'Desktop', icon: '💻', color: '#3B82F6' },
  unknown: { name: 'Unknown', icon: '❓', color: '#6B7280' },
};

/**
 * DeviceBreakdown Component
 *
 * Shows distribution of visitors by device type (Mobile, Desktop, Tablet)
 */
export function DeviceBreakdown({ userId, daysBack = 30 }: DeviceBreakdownProps) {
  const [devices, setDevices] = useState<DeviceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeviceStats() {
      try {
        const response = await fetch(
          `/api/analytics/device-breakdown?userId=${userId}&days=${daysBack}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch device stats');
        }

        const data = await response.json();
        setDevices(data.devices || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchDeviceStats();
  }, [userId, daysBack]);

  if (loading) {
    return (
      <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Device Breakdown</h3>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Device Breakdown</h3>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  const totalVisits = devices.reduce((sum, device) => sum + device.visit_count, 0);

  return (
    <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Device Breakdown</h3>
        <span className="text-sm text-gray-400">Last {daysBack} days</span>
      </div>

      {devices.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No device data yet</p>
      ) : (
        <>
          {/* Donut chart visualization */}
          <div className="relative w-48 h-48 mx-auto mb-8">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {devices.reduce(
                (acc, device, index) => {
                  const config = DEVICE_CONFIG[device.device_type] || DEVICE_CONFIG.unknown;
                  const circumference = 2 * Math.PI * 30; // radius = 30
                  const strokeLength = (device.percentage / 100) * circumference;
                  const strokeOffset = acc.offset;

                  acc.elements.push(
                    <circle
                      key={device.device_type}
                      cx="50"
                      cy="50"
                      r="30"
                      fill="none"
                      stroke={config.color}
                      strokeWidth="20"
                      strokeDasharray={`${strokeLength} ${circumference}`}
                      strokeDashoffset={-strokeOffset}
                      className="transition-all duration-500"
                    />
                  );

                  acc.offset += strokeLength;
                  return acc;
                },
                { offset: 0, elements: [] as React.ReactElement[] }
              ).elements}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{devices.length}</div>
                <div className="text-xs text-gray-400">devices</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {devices.map((device) => {
              const config = DEVICE_CONFIG[device.device_type] || DEVICE_CONFIG.unknown;

              return (
                <div
                  key={device.device_type}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A]/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-white font-medium">{config.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {device.percentage.toFixed(1)}%
                    </div>
                    <div className="text-gray-400 text-sm">
                      {device.visit_count.toLocaleString()} visits
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {totalVisits > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalVisits.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Visits</div>
          </div>
        </div>
      )}
    </div>
  );
}
