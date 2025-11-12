"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  MessageSquare,
  Settings,
  LogOut,
  BarChart3,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { cn } from "@/lib/utils";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { Dock, DockIcon } from "@/components/ui/dock";
import { ProfileSheet } from "@/components/dashboard/profile-sheet";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    badge: true, // Will show unread count
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile } = useProfileStore();
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-64 bg-gray-950/95 backdrop-blur-xl border-r border-gray-800"
      >
        <div className="flex flex-col h-full">
          {/* Logo / Brand */}
          <div className="p-6 border-b border-gray-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <AnimatedGradientText className="text-2xl font-bold">
                NGLFS
              </AnimatedGradientText>
            </Link>
          </div>

          {/* Profile Section */}
          <div className="p-6 border-b border-gray-800">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.display_name || profile?.username}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  @{profile?.username}
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}

                  <Icon className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive ? "" : "group-hover:scale-110"
                  )} />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && profile?.message_count && profile.message_count > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-purple-500 text-white rounded-full animate-pulse">
                      {profile.message_count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 border-t border-gray-800 space-y-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 border-gray-800 hover:bg-gray-800/50"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>

            {/* Footer Links */}
            <div className="flex justify-center gap-3 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-gray-400">
                Privacy
              </Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-gray-400">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Dock - Hidden on desktop */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <Dock className="bg-gray-950/80 backdrop-blur-xl border border-gray-800/50 shadow-2xl">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <DockIcon key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  )}
                  aria-label={item.name}
                >
                  <Icon className="w-5 h-5" />
                </Link>
                {/* Badge for Messages */}
                {item.badge && profile?.message_count && profile.message_count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {profile.message_count > 9 ? "9+" : profile.message_count}
                  </span>
                )}
              </DockIcon>
            );
          })}

          {/* Profile Icon */}
          <DockIcon>
            <button
              onClick={() => setIsProfileSheetOpen(true)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
                isProfileSheetOpen
                  ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              )}
              aria-label="Profile"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/20"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>
          </DockIcon>
        </Dock>
      </div>

      {/* Profile Sheet Modal */}
      <ProfileSheet
        isOpen={isProfileSheetOpen}
        onOpenChange={setIsProfileSheetOpen}
      />
    </>
  );
}
