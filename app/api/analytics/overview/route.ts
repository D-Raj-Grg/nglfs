import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/analytics/overview
 * Get analytics overview for the authenticated user
 *
 * Response: { totalMessages, totalVisits, messagesThisWeek, etc. } or { error: string }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, message_count, total_visits, created_at")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get messages this week
    const { count: messagesThisWeek } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .gte("created_at", oneWeekAgo.toISOString());

    // Get messages this month
    const { count: messagesThisMonth } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .gte("created_at", oneMonthAgo.toISOString());

    // Get visits this week
    const { count: visitsThisWeek } = await supabase
      .from("link_visits")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .gte("created_at", oneWeekAgo.toISOString());

    // Get visits this month
    const { count: visitsThisMonth } = await supabase
      .from("link_visits")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .gte("created_at", oneMonthAgo.toISOString());

    // Calculate average messages per day (since account creation)
    const accountAgeDays = Math.max(
      1,
      Math.floor((now.getTime() - new Date(profile.created_at).getTime()) / (24 * 60 * 60 * 1000))
    );
    const averageMessagesPerDay = profile.message_count / accountAgeDays;

    // Get recent activity (last 7 days)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const { count: dayMessages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .gte("created_at", dayStart.toISOString())
        .lte("created_at", dayEnd.toISOString());

      const { count: dayVisits } = await supabase
        .from("link_visits")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .gte("created_at", dayStart.toISOString())
        .lte("created_at", dayEnd.toISOString());

      recentActivity.push({
        date: dayStart.toISOString(),
        messages: dayMessages || 0,
        visits: dayVisits || 0,
      });
    }

    // Find peak day
    const peakActivity = recentActivity.reduce(
      (max, day) => (day.messages > max.messages ? day : max),
      recentActivity[0]
    );

    const peakDay = new Date(peakActivity.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    return NextResponse.json(
      {
        totalMessages: profile.message_count || 0,
        totalVisits: profile.total_visits || 0,
        messagesThisWeek: messagesThisWeek || 0,
        messagesThisMonth: messagesThisMonth || 0,
        visitsThisWeek: visitsThisWeek || 0,
        visitsThisMonth: visitsThisMonth || 0,
        averageMessagesPerDay: Math.round(averageMessagesPerDay * 10) / 10,
        peakDay,
        recentActivity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in analytics/overview API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
