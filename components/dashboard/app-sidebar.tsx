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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
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

export function AppSidebar() {
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
      {/* Desktop Shadcn Sidebar - Hidden on mobile */}
      <Sidebar
        collapsible="icon"
        className="hidden lg:flex border-r border-gray-800 bg-gray-950/95 backdrop-blur-xl"
      >
        {/* Header: Logo + Profile + Collapse Button */}
        <SidebarHeader className="border-b border-gray-800">
          {/* Logo / Brand with Collapse Button */}
          <div className="flex items-center justify-between gap-2 px-4 py-6 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
            <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <AnimatedGradientText className="text-2xl font-bold">
                NGLFS
              </AnimatedGradientText>
            </Link>

            {/* Collapsed Logo */}
            <Link href="/dashboard" className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full">
              <AnimatedGradientText className="text-2xl font-bold">
                N
              </AnimatedGradientText>
            </Link>

            {/* Collapse/Expand Toggle */}
            <SidebarTrigger className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg p-2 transition-colors group-data-[collapsible=icon]:hidden">
              <PanelLeftClose className="w-5 h-5" />
            </SidebarTrigger>
          </div>

          {/* Profile Section */}
          <div className="px-4 pb-6 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pb-4">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-0"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile?.username || "User avatar"}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/20 shrink-0 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10">
                  <User className="w-6 h-6 text-white group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.display_name || profile?.username}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  @{profile?.username}
                </p>
              </div>
            </Link>
          </div>

          {/* Expand Button (only visible when collapsed) */}
          <div className="hidden group-data-[collapsible=icon]:flex justify-center pb-4">
            <SidebarTrigger className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg p-2 transition-colors">
              <PanelLeft className="w-5 h-5" />
            </SidebarTrigger>
          </div>
        </SidebarHeader>

        {/* Content: Navigation */}
        <SidebarContent className="px-2 py-4">
          <SidebarMenu>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      "group relative px-4 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                      )}

                      <Icon
                        className={cn(
                          "w-5 h-5 transition-transform duration-200",
                          isActive ? "" : "group-hover:scale-110"
                        )}
                      />
                      <span className="font-medium">{item.name}</span>

                      {/* Badge for unread messages */}
                      {item.badge &&
                        profile?.message_count &&
                        profile.message_count > 0 && (
                          <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-purple-500 text-white rounded-full animate-pulse">
                            {profile.message_count}
                          </span>
                        )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* Footer: Sign Out + Links */}
        <SidebarFooter className="border-t border-gray-800 p-4 space-y-4">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full justify-start gap-3 border-gray-800 hover:bg-gray-800/50 group-data-[collapsible=icon]:justify-center"
          >
            <LogOut className="w-5 h-5" />
            <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
          </Button>

          {/* Footer Links */}
          <div className="flex justify-center gap-3 text-xs text-gray-500 group-data-[collapsible=icon]:hidden">
            <Link href="/privacy" className="hover:text-gray-400">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-gray-400">
              Terms
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>

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
                {item.badge &&
                  profile?.message_count &&
                  profile.message_count > 0 && (
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
