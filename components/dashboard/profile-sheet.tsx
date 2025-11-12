"use client";

import { User, LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ProfileSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSheet({ isOpen, onOpenChange }: ProfileSheetProps) {
  const [copied, setCopied] = useState(false);

  // TODO: Replace with actual user data from Supabase
  const user = {
    displayName: "Anonymous User",
    username: "demo_user",
    avatarUrl: null,
  };

  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${user.username}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleSignOut = () => {
    // TODO: Implement Supabase sign-out
    console.log("Sign out clicked");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-gray-950/95 backdrop-blur-xl border-t border-gray-800">
        <SheetHeader className="text-left">
          <SheetTitle className="text-white">Profile</SheetTitle>
          <SheetDescription className="text-gray-400">
            Your profile information and settings
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{user.displayName}</h3>
              <p className="text-sm text-gray-400">@{user.username}</p>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Profile Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Your Profile Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={profileUrl}
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0 bg-gray-900 border-gray-800 hover:bg-gray-800"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Sign Out Button */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
