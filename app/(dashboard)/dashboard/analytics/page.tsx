"use client";

import { useState, useEffect } from "react";
import { Loader2, MessageSquare, Eye, TrendingUp, Calendar } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";

interface AnalyticsData {
  totalMessages: number;
  totalVisits: number;
  messagesThisWeek: number;
  messagesThisMonth: number;
  visitsThisWeek: number;
  visitsThisMonth: number;
  averageMessagesPerDay: number;
  peakDay: string;
  recentActivity: {
    date: string;
    messages: number;
    visits: number;
  }[];
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/analytics/overview");
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data);
      } else {
        toast.error(data.error || "Failed to load analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <AnimatedGradientText className="text-3xl font-bold mb-2">
          Analytics
        </AnimatedGradientText>
        <p className="text-gray-400">
          Track your profile performance and engagement
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Messages */}
        <MagicCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/10">
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Messages</p>
              <p className="text-2xl font-bold text-white">
                {analytics.totalMessages}
              </p>
            </div>
          </div>
        </MagicCard>

        {/* Total Visits */}
        <MagicCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Eye className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Visits</p>
              <p className="text-2xl font-bold text-white">
                {analytics.totalVisits}
              </p>
            </div>
          </div>
        </MagicCard>

        {/* Average Messages/Day */}
        <MagicCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-pink-500/10">
              <TrendingUp className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Avg Messages/Day</p>
              <p className="text-2xl font-bold text-white">
                {analytics.averageMessagesPerDay}
              </p>
            </div>
          </div>
        </MagicCard>

        {/* Peak Day */}
        <MagicCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-cyan-500/10">
              <Calendar className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Peak Day</p>
              <p className="text-lg font-bold text-white">
                {analytics.peakDay}
              </p>
            </div>
          </div>
        </MagicCard>
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* This Week */}
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">This Week</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <span className="text-gray-300">Messages</span>
              </div>
              <span className="text-xl font-bold text-white">
                {analytics.messagesThisWeek}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-gray-300">Visits</span>
              </div>
              <span className="text-xl font-bold text-white">
                {analytics.visitsThisWeek}
              </span>
            </div>
          </div>
        </MagicCard>

        {/* This Month */}
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">This Month</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <span className="text-gray-300">Messages</span>
              </div>
              <span className="text-xl font-bold text-white">
                {analytics.messagesThisMonth}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-gray-300">Visits</span>
              </div>
              <span className="text-xl font-bold text-white">
                {analytics.visitsThisMonth}
              </span>
            </div>
          </div>
        </MagicCard>
      </div>

      {/* Recent Activity */}
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity (Last 7 Days)</h3>
        <div className="space-y-3">
          {analytics.recentActivity.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No recent activity</p>
          ) : (
            analytics.recentActivity.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-gray-300">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-500" />
                    <span className="text-white font-medium">{day.messages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-white font-medium">{day.visits}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </MagicCard>
    </div>
  );
}
